/** Signature film: Jamal Musiala, "the slalom through tight spaces" (lib/town/iconicPlays.json, kind "signature"). The signature is shown
 * through ONE real, well-documented goal: Germany 5–1 Scotland, the opening match of UEFA Euro 2024, Munich Football Arena (Allianz Arena),
 * 14 June 2024, Germany's second goal (19th minute). WHY THIS MOMENT: Musiala (Player of the Match) scored it by taking the lay-off in a
 * crowded penalty area, "chopped past McGregor" / "sidesteps to open up space" with small quick touches, and smashed it into the roof of
 * the net: close control and a change of direction in a tight space, exactly the lesson of his entry ("Use small, quick touches and change
 * direction to squeeze between defenders"). It is one chop past one named defender, not a long slalom, and the narration says only that.
 * A RisoStory (chapters mode) played unchanged by the card window and StoryFilmPlayer; narration mirrors
 * public/plays/narration/musiala-signature/script.json. Every action time is read from cue onsets and chapter seconds, so once the lead
 * voices the film (scripts/plays/kokoro-narrate.py musiala-signature → timing.json) `withTiming` re-times it with no scene changes.
 *
 * SOURCES (fetched Sept 2026 with curl, cached in scratchpad/films/src-cache; the footage itself was not reviewed):
 *  - The Guardian, Barney Ronay, "Germany 5-1 Scotland" match report (14 June 2024): "It was 2-0 on 19 minutes, made by another quick-slow
 *    passing move. Kroos slipped the ball to Ilkay Gündogan, who whipped around then threaded the perfect pass to Kai Havertz. He laid it
 *    back to Musiala, who chopped past McGregor and didn't just shoot, but smashed the ball into the top corner"; photo caption "Jamal
 *    Musiala fires home Germany's second goal". https://www.theguardian.com/football/article/2024/jun/14/germany-scotland-euro-2024-match-report
 *  - The Guardian live blog, Niall McVeigh (14 June 2024): "GOAL! Germany 2-0 Scotland (Musiala 19')"; "Gundogan turns his man and strolls
 *    forward, before slicing through the back line with a pass to Havertz. Instead of shooting from an angle, he turns and plays it back to
 *    Musiala, who sidesteps to open up space, then blasts the ball into the roof of the net"; "Musiala (number 10) celebrates"; "nobody in
 *    white", "a navy shirt"; Musiala "darts in from the left". https://www.theguardian.com/football/live/2024/jun/14/germany-v-scotland-euro-2024-opening-game-live
 *  - The Guardian, Nick Ames, player ratings (14 June 2024): line-ups (Germany 4-2-3-1: Neuer; Kimmich, Rüdiger, Tah, Mittelstädt; Andrich,
 *    Kroos; Musiala, Gündogan, Wirtz; Havertz. Scotland 3-4-2-1: Gunn; Porteous, Hendry, Tierney; Ralston, McTominay, McGregor, Robertson;
 *    Christie, McGinn; Adams); Musiala "Smart footwork and thumping finish", Gündogan "Turn and slide-rule ball to Havertz before second
 *    goal", Havertz "Composed assist for Musiala". https://www.theguardian.com/football/article/2024/jun/14/germany-5-1-scotland-player-ratings-from-the-euro-2024-opener
 *  - Wikipedia, "Jamal Musiala": Player of the Match v Scotland, 14 June 2024; known for close-control dribbling. https://en.wikipedia.org/wiki/Jamal_Musiala
 * CONFIRMED by those accounts: 14 June 2024, Munich, Euro 2024 opening game, Germany won 5–1; Musiala scored the second goal on 19 minutes;
 *  the move Kroos → Gündogan (turns) → through pass to Havertz → Havertz lays it back → Musiala chops/sidesteps past Callum McGregor and
 *  blasts it high into the roof of the net past Angus Gunn; Musiala wore 10 and played on the left of the attacking three; Germany in white
 *  shirts, Scotland in navy shirts; kick-off in the evening (21:00 local).
 * INFERRED / ILLUSTRATIVE: every position and timing in metres and seconds; Havertz receiving right of centre in the box; where Musiala took
 *  the lay-off (≈ 14 m out, left of centre); the chop taken with the inside of his RIGHT foot, to his left, and the finish with his RIGHT
 *  foot (he is right-footed; the foot is not named in the narration); the exact spot in the roof of the net; Gunn's late dive; McGregor's
 *  lunge; which other Scotland players stood nearby (Porteous, Hendry, Tierney, McTominay) and where; Germany attacking left-to-right on
 *  the main camera; Germany's black shorts, white socks and dark trim and numbers; Scotland's white shorts and navy socks; Gunn's yellow
 *  goalkeeper kit; hair; the Euro 2024 ball drawn white with navy swoops and a red accent; the arena drawn as three steep tiers under a
 *  closed roof ring at dusk; the Tartan Army massed behind the far goal; crowd colours; camera placements and lenses; no referee drawn.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (seconds,
 * τ = 0 Musiala's first touch of Havertz's lay-off). ch1 = the high main-stand camera, live (Kroos → Gündogan's turn → Havertz → the lay-off
 * → the chop → the finish); ch2 = the TV slow-motion replay, low behind Musiala (touch ticks, the chop arrow, McGregor's lunge on air);
 * ch3 = the replay from behind the goal (the gap opens, the ball flies into the roof, the net shakes, then he wheels away); ch4 = a duotone
 * lesson from over his shoulder (small quick touches, change direction, squeeze between the defenders). Figures: lib/plays/riso/athlete.ts
 * through ONE adapter, drawPlayer(). Framing: the full sheet centred on the canvas (card window 1.45:1 … square), never sheet.safe, a lens
 * that widens for a square window. Inks: yellow (light, grass with blue, cue marks), red (skin, Germany fans), blue (sky, grass, Scotland
 * fans), navy (key line, Scotland, shorts). Poses on twos, cameras on ones, all randomness seeded. Budget ≈ 150–260 plate ops per frame
 * (small wide-shot figures print at 'low', passages cap detail). */
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
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), never sheet.safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`musiala film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py musiala-signature (writes timing.json next to
 * script.json). Then replace the null with `import timingJson from '../../../public/plays/narration/musiala-signature/timing.json'`
 * and pass `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/musiala-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Munich, live','Munich, 2024: the Euros begin! Germany, in white, play Scotland. Gündogan finds Havertz, who lays it back to Jamal Musiala. A quick chop past a defender... and bang, into the roof of the net!',
  ['Munich','Euros begin','Germany, in white','Scotland','Gündogan finds','Havertz','lays it back','Jamal Musiala','A quick chop','past a defender','and bang','roof of the net']),
 prov('Watch again','Watch again, slowly. Small, quick touches: one to control, one chop sideways, away from the defender.',
  ['Watch again','slowly','Small, quick touches','one to control','one chop sideways','away from','the defender']),
 prov('From behind','From behind the goal: the chop makes a gap, and the net shakes! What a finish!',
  ['From behind','the goal','the chop','makes a gap','the net shakes','What a finish']),
 prov('Your turn','Your turn: use small, quick touches, and change direction to squeeze between defenders.',
  ['Your turn','small, quick touches','change direction','squeeze','between defenders']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`musiala film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
/** projected points of a ground polyline (skips points behind the camera) */
function groundPts(c:Camera,pts:[number,number][]):Pt[]{const o:Pt[]=[];for(const[x,z] of pts){const p:V3=[x,.03,z];if(depthOf(c,p)>NEAR)o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*clamp(u);};
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** an arrow head at the end of a projected polyline */
function head(pts:Pt[],w:number):Path2D{const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true);}

// ================= Munich: the arena bowl — three steep tiers on four sides under a closed roof ring, a dusk sky over the opening =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-118,.9,-37.5],[14,.9,-37.5],[14,33,-66],[-118,33,-66]],// far side (across from the TV camera)
 [[8.5,.9,46],[8.5,.9,-46],[37,33,-46],[37,33,46]],// behind the goal Germany attack (the Tartan Army end, inferred)
 [[14,.9,37.5],[-118,.9,37.5],[-118,33,66],[14,33,66]],// the main stand under the camera
 [[-113.5,.9,-46],[-113.5,.9,46],[-142,33,46],[-142,33,-46]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 red / 2 yellow / 3 blue / 4 navy, phase] — Germany's white, black-red-gold; Scotland's navy and blue */
const CROWD=(()=>{const r=rng(1406),out:[number,number,number,number,number][]=[];[760,380,620,340].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.03+r()*.93;if(Math.abs(v-.34)<.035||Math.abs(v-.67)<.035)continue;
 const ink=st===1?(c<.12?0:c<.55?3:c<.95?4:2):(c<.34?0:c<.52?1:c<.66?2:c<.78?3:4);out.push([st,r(),v,ink,r()*TAU]);}});return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;noGoal?:boolean};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a June evening in Munich (kick-off 21:00): a deep blue sky with a warm band low down
 s.field(B,.5,.6);s.tone(K,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true),.2);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];s.tone(R,polyPath([[-Bnd,hz-160],[Bnd,hz-160],[Bnd,hz+400],[-Bnd,hz+400]],true),.2);
 // three tiers: knocked out, a navy-grey screen, rows; two light fascia bands; the roof ring (navy) with the floodlight line under its edge
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),leds=new Path2D(),lamps=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<18;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/18),bil(q,1,k/18),bil(q,1,(k+1)/18),bil(q,0,(k+1)/18)]));
  const lift:V3=[0,3,0],ov=(si===0?[0,0,-26]:si===2?[0,0,26]:si===1?[24,0,0]:[-24,0,0]) as V3;
  addPoly(roof,clipPoly(c,[add(q[3],lift),add(q[2],lift),add(add(q[2],lift),ov),add(add(q[3],lift),ov)]));
  for(const v of[.34,.67]){addPoly(fascia,clipPoly(c,[bil(q,0,v-.03),bil(q,1,v-.03),bil(q,1,v+.03),bil(q,0,v+.03)]));addPoly(leds,clipPoly(c,[bil(q,0,v-.012),bil(q,1,v-.012),bil(q,1,v+.012),bil(q,0,v+.012)]));}
  for(let k=0;k<22;k++){const u=(k+.5)/22,p=add(bil(q,u,1),lift);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(x-sz,y-sz*.35,sz*2,sz*.7);}});
 s.knockout(stands);s.tone(K,stands,.42);s.tone(B,stands,.2);s.tone(K,rows,.18);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0&&st!==1?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);if(seen[4])s.fill(K,heads[4],.9);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=[0,2,3][Math.floor(r()*3)],p=bil(STANDS[st],r(),.05+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(fascia);s.tone(K,fascia,.5);s.fill(Y,leds,.7);s.fill(K,roof,.92);s.knockout(lamps,.95);
 // LED boards along the touchlines and behind the goal
 const bB=new Path2D(),bP=new Path2D();for(const z of[-35.4,35.4])for(let x=-104;x<4;x+=8){addPoly((Math.round(x/8)&1)?bB:bP,clipPoly(c,[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]]));}
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bP,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bB);s.knockout(bP);s.fill(B,bB,.9);s.fill(R,bP,.8);
 // grass: yellow × blue = green, mowing stripes, paper lines (the box, the D, the six-yard box, the spot, halfway, the centre circle)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-35],[5,0,-35],[5,0,35],[-110,0,35]]));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 if(!o.noGoal)goal(s,c,o.net);
}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
/** the roof of the net bellies up and back where the shot hits it */
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[0]-hit[0],p[2]-hit[2])+Math.abs(p[1]-hit[1])*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.6,p[1]+w*.7,p[2]];};

// ================= the ball (Euro 2024: white with navy swoops and a red accent — design illustrative) =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3;pan.addPath(ribbon([[Math.cos(a)*r*.15,Math.sin(a)*r*.15],[Math.cos(a+.7)*r*.6,Math.sin(a+.7)*r*.6],[Math.cos(a+1.3)*r*1.05,Math.sin(a+1.3)*r*1.05]],Math.max(2,r*.2),{taper:.4,wobble:0}));}
 const aa=spin*.8+1;acc.addPath(ribbon([[Math.cos(aa)*r*.2,Math.sin(aa)*r*.2],[Math.cos(aa+.9)*r*.5,Math.sin(aa+.9)*r*.5]],Math.max(2,r*.14),{taper:.6,wobble:0}));
 s.fill(K,pan,.9);if(!duo)s.fill(R,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (14 June 2024) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** Germany: white shirts (confirmed); black shorts, white socks, dark trim and numbers (inferred) */
const GER=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:[K,.95],socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:40+n,...o});
/** Scotland: navy shirts (confirmed); white shorts, navy socks, paper trim (inferred); no numbers drawn */
const SCO=(seed:number,o:Partial<Kit>={}):Kit=>({shirt:K,shorts:'paper',socks:K,trim:'paper',boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed,...o});
/** Jamal Musiala, number 10 (confirmed): slim, 1.84 m, close-cropped dark hair */
const MUSIALA:Kit=GER(10,{skin:SKIN_D,hair:[K,.95],hairStyle:'short',build:{height:1.84,bulk:.88,thighs:.95,head:1},seed:10});
/** Angus Gunn (Scotland goalkeeper): kit colour inferred (drawn yellow; not named in the narration) */
const GUNN:Kit={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],trim:K,boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',gloves:[B,.8],line:K,sleeves:'long',shade:[K,.26],build:{height:1.96},seed:1};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?'paper':[K,.7],shorts:lead?[K,.45]:[K,.32],socks:lead?'paper':[K,.6],trim:lead?K:'paper',skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:K});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Musiala's first touch of the lay-off) =================
const MB:Build=MUSIALA.build!;
/** beats: Kroos's pass, Gündogan receives and whips round, his through ball, Havertz receives, the lay-off; Musiala's touch, chop, shot */
const KROOS_PASS=-5.8,GUN_REC=-4.9,GUN_PASS=-3.4,HAV_REC=-2.3,LAY=-1.1;
const T_CHOP=.62,CONTACT=1.4,TF=.42,T_GOAL=CONTACT+TF;
/** the shot: from B3 (left of centre, ≈ 12 m out) high into the roof of the net, just right of centre (inferred) */
const B3:[number,number]=[-12.35,-1.5],HIT:V3=[0,2.2,.9],NET_HIT:V3=[1.2,2.36,1.0],D1:V3=[1.75,1.95,1.05],D2:V3=[1.75,.11,1.1];
const YS=YAW(HIT[0]-B3[0],HIT[2]-B3[1]);
const SHOT_SK=solve(strike(STRIKE_CONTACT,{power:.95}),MB,{yaw:YS});
const YP:[number,number]=[B3[0]-SHOT_SK.rToe[0],B3[1]-SHOT_SK.rToe[2]];
const [sfx,sfz]=dirOf(YS);

type Role='hero'|'ger'|'sco'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Musiala',role:'hero',style:MUSIALA,key:true,keys:[[-10,-31,-15],[-6,-27.5,-11.5],[-3.5,-22.5,-7],[-1.6,-18.2,-3],[-.5,-15.6,-.6],[0,-14.75,-.05],[.35,-14.2,.12],[T_CHOP,-13.85,.1],[.95,-13.35,-.55],[1.2,YP[0]-.25,YP[1]+.05],[CONTACT,YP[0],YP[1]],[CONTACT+.45,YP[0]+sfx*.5,YP[1]+sfz*.5],
  [T_GOAL+.7,-10.4,-.9],[T_GOAL+1.8,-9.4,2.8],[T_GOAL+3.3,-7.6,8],[T_GOAL+5.5,-5.8,13.5],[T_GOAL+8,-5,16]]},
 {name:'McGregor',role:'sco',style:SCO(4,{hair:[K,.85]}),key:true,keys:[[-10,-18,6],[-4,-15,5.6],[-2,-12.6,5],[-1,-11.8,4],[0,-12.3,2.3],[.45,-12.75,1.35],[.8,-12.95,.95],[1.2,-12.9,.6],[CONTACT,-12.7,.45],[3,-12,.2],[8,-11.5,0]]},
 {name:'Porteous',role:'sco',style:SCO(5,{build:{height:1.88,bulk:1.05}}),key:true,keys:[[-10,-8.5,-1.5],[-3,-8.6,-1],[-1,-9.2,-2],[0,-9.7,-2.8],[1,-10.25,-3.3],[CONTACT,-10.4,-3.2],[3,-9.5,-2.6],[8,-9,-2.4]]},
 {name:'Gunn',role:'gk',style:GUNN,key:true,keys:[[-10,-3.4,.5],[-2.3,-2.4,1.8],[-1,-2.2,1.1],[0,-2.05,.6],[CONTACT,-1.95,.3],[8,-1.95,.3]]},
 {name:'Havertz',role:'ger',style:GER(7,{hair:[K,.7],build:{height:1.93}}),key:true,keys:[[-10,-20,12],[-4.5,-15,10.2],[-3,-12.4,9],[HAV_REC,-10.1,7.9],[-1.6,-9.55,7.45],[LAY,-9.45,7.35],[-.3,-9.3,7],[1,-8.4,5.8],[3,-7,4.5],[8,-8,5]]},
 {name:'Gündogan',role:'ger',style:GER(21,{skin:SKIN_M,hair:[K,.9]}),key:true,keys:[[-10,-23,5],[-6.5,-25.5,3],[GUN_REC,-27,1.9],[-4.5,-27.1,1.7],[-4,-26.8,1.7],[GUN_PASS,-26.1,2],[-2.5,-23.8,2.8],[0,-19,3.6],[3,-15.5,3.6],[8,-14,3]]},
 {name:'Kroos',role:'ger',style:GER(8,{hair:[K,.55]}),keys:[[-10,-44,-4.5],[-7.2,-41.8,-3.4],[KROOS_PASS,-40.4,-2.9],[-4.5,-39.4,-2.4],[0,-36,-1.6],[8,-33,-1]]},
 {name:'Wirtz',role:'ger',style:GER(17,{hair:[K,.7]}),keys:[[-10,-24,18],[-3,-16,14],[0,-12.5,11.5],[3,-11,10],[8,-10,9]]},
 {name:'Kimmich',role:'ger',style:GER(6,{hair:[K,.6]}),keys:[[-10,-36,27],[0,-27,23],[8,-24,21]]},
 {name:'Mittelstädt',role:'ger',style:GER(18,{hair:[K,.7]}),keys:[[-10,-38,-24],[0,-30,-22],[8,-27,-21]]},
 {name:'Andrich',role:'ger',style:GER(23,{hair:[K,.5]}),keys:[[-10,-48,5],[0,-42,4],[8,-40,4]]},
 {name:'Hendry',role:'sco',style:SCO(13,{hair:[K,.7]}),keys:[[-10,-7,4.5],[-2,-7.4,4.2],[0,-7.6,3.2],[CONTACT,-7.2,2.4],[8,-7,2]]},
 {name:'Tierney',role:'sco',style:SCO(6,{hair:[K,.9]}),keys:[[-10,-9,-8],[-2,-9.2,-7.2],[0,-9.6,-6.6],[CONTACT,-9.2,-5.6],[8,-9,-5]]},
 {name:'McTominay',role:'sco',style:SCO(7,{hair:[K,.75]}),keys:[[-10,-26,-5],[-4,-23,-4.6],[-1.5,-19.2,-3.2],[0,-16.9,-2.2],[CONTACT,-15,-2.2],[3,-14,-2],[8,-13.5,-2]]},
 {name:'Ralston',role:'sco',style:SCO(2,{hair:[K,.7]}),keys:[[-10,-21,-21],[0,-14.5,-14.5],[3,-12.5,-12.5],[8,-12,-12]]},
 {name:'Robertson',role:'sco',style:SCO(3,{hair:[K,.8]}),keys:[[-10,-19,20],[0,-12.6,14.8],[3,-10.8,13],[8,-10.5,12.5]]},
 {name:'Christie',role:'sco',style:SCO(11,{hair:[K,.6]}),keys:[[-10,-29,-9],[0,-23,-7],[8,-20,-6]]},
 {name:'McGinn',role:'sco',style:SCO(8,{hair:[K,.6]}),keys:[[-10,-31,10],[0,-25,8.5],[8,-22,8]]},
 {name:'Adams',role:'sco',style:SCO(10,{skin:SKIN_M,hair:[K,.95]}),keys:[[-10,-46,2],[0,-44,2],[8,-42,2]]},
];
const MUS=0,MCG=1,POR=2,GK=3,HAV=4,GUN=5,KRO=6,MCT=13;
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
const toward=(k:number,tau:number,p:[number,number])=>{const m=posOf(k,tau);return YAW(p[0]-m[0],p[1]-m[1]);};

// ---- poses (angles in degrees via posed; the athlete clamps to a real range of motion) ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
/** the first touch: the right foot cushions the lay-off, toes out, knees soft, eyes down */
const RECEIVE:Partial<Pose>={rHipF:24,rHipR:30,rKnee:32,rAnk:-10,lHipF:18,lKnee:44,lean:16,lShA:42,rShA:34,lElb:40,rElb:40,neckP:32,squash:-.03};
/** the chop: the inside of the right foot sweeps across the body and drags the ball to his left; body drops and tips left, far arm out */
const CHOP:Partial<Pose>={rHipF:26,rHipA:-18,rHipR:36,rKnee:34,rAnk:-10,lHipF:30,lKnee:56,lHipA:10,lean:24,bend:-12,roll:-7,twist:-10,lShA:66,rShA:30,lElb:34,rElb:44,neckP:36,neckY:8,squash:-.06};
const SD=.9,S_START=CONTACT-STRIKE_CONTACT*SD;
/** Musiala's whole pose + place (never reads the ball, so the touch spots can be solved from it) */
function heroPose(tau:number):{pose:Pose;place:Place}{
 const v=velOf(MUS,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(MUS,tau);
 let yaw=sp>.5?YAW(v[0],v[1]):YS,p:Pose;
 if(tau<-.5){p=blendPose(idle(tau,1),runCycle(distOf(MUS,tau)/3.2,{speed:clamp(sp/7.5)}),clamp(sp/1.1));}
 else if(tau<T_GOAL+.15){
  const dr=dribble(distOf(MUS,tau)/1.55,{foot:'r',speed:.45+.3*clamp(sp/4)});p=blendPose(READY,dr,clamp(sp/.9));
  yaw=lerpAng(yaw,YS,sm(T_CHOP+.15,CONTACT-.25,tau));
  p=over(p,RECEIVE,bump(-.45,.32,tau));p=over(p,CHOP,bump(T_CHOP-.3,T_CHOP+.3,tau));
  const u=(tau-S_START)/SD;if(u>-.2){yaw=lerpAng(yaw,YS,sm(-.2,.25,u));p=blendPose(p,strike(clamp(u),{power:.95}),Math.min(sm(-.15,.12,u),1-sm(1.05,1.5,u)));}
 }else{p=blendPose(READY,celebrate(distOf(MUS,tau)/3.4,{kind:'run'}),sm(T_GOAL+.15,T_GOAL+.7,tau));}
 return{pose:p,place:{x,z,yaw}};
}
/** the touch spots on his right boot (solved from the real skeleton so ball and boot meet): the first touch and the chop */
const toeAt=(tau:number):[number,number]=>{const h=heroPose(tau),sk=solve(h.pose,MB,h.place);return[sk.rToe[0],sk.rToe[2]];};
const TP0=toeAt(0),TP1=toeAt(T_CHOP);
/** the three touches (control, chop, shot): shared by the replay's ticks and the lesson */
const TOUCHES:[number,[number,number]][]=[[0,TP0],[T_CHOP,TP1],[CONTACT,B3]];

// ---- the ball: Kroos → Gündogan (whips round) → through ball → Havertz (turns back) → lay-off → touch, chop → the shot → the roof of the net ----
const fwdOf=(k:number,tau:number,yaw:number,d=.5):[number,number]=>{const p=posOf(k,tau),[fx,fz]=dirOf(yaw);return[p[0]+fx*d,p[1]+fz*d];};
/** Gündogan faces Kroos to receive, then whips round toward Havertz */
const gunYaw=(tau:number)=>lerpAng(toward(GUN,tau,posOf(KRO,KROOS_PASS)),toward(GUN,tau,posOf(HAV,HAV_REC)),sm(GUN_REC-.05,GUN_REC+.6,tau,easeInOutSine));
/** Havertz runs on to it, then turns back toward Musiala to lay it off */
const havYaw=(tau:number)=>{const v=velOf(HAV,tau),run=Math.hypot(v[0],v[1])>.6?YAW(v[0],v[1]):YAW(1,0);return lerpAng(run,toward(HAV,tau,TP0),sm(HAV_REC,LAY-.25,tau,easeInOutSine));};
const kroYaw=(tau:number)=>toward(KRO,tau,G0());
function G0():[number,number]{return fwdOf(GUN,GUN_REC,gunYaw(GUN_REC),.5);}
const GB=fwdOf(GUN,GUN_PASS,gunYaw(GUN_PASS),.5),HV=fwdOf(HAV,HAV_REC,havYaw(HAV_REC),.5),HL=fwdOf(HAV,LAY,havYaw(LAY),.5),KB=fwdOf(KRO,KROOS_PASS,kroYaw(KROOS_PASS),.5);
const roll=(a:[number,number],b:[number,number],u:number):V3=>{const e=1.4*u-.4*u*u;return[lerp(a[0],b[0],e),BALL_R,lerp(a[1],b[1],e)];};
function ballAt(tau:number):V3{
 if(tau<KROOS_PASS){const f=fwdOf(KRO,tau,kroYaw(tau),.45+.1*Math.sin(tau*5));return[f[0],BALL_R,f[1]];}
 if(tau<GUN_REC)return roll(KB,G0(),(tau-KROOS_PASS)/(GUN_REC-KROOS_PASS));
 if(tau<GUN_PASS){const f=fwdOf(GUN,tau,gunYaw(tau),.5);return[f[0],BALL_R,f[1]];}
 if(tau<HAV_REC)return roll(GB,HV,(tau-GUN_PASS)/(HAV_REC-GUN_PASS));
 if(tau<LAY){const f=fwdOf(HAV,tau,havYaw(tau),.5);return[f[0],BALL_R,f[1]];}
 if(tau<0)return roll(HL,TP0,(tau-LAY)/-LAY);
 if(tau<T_CHOP){const u=tau/T_CHOP,e=1-(1-u)*(1-u);return[lerp(TP0[0],TP1[0],e),BALL_R,lerp(TP0[1],TP1[1],e)];}
 if(tau<CONTACT){const u=(tau-T_CHOP)/(CONTACT-T_CHOP),e=1-(1-u)*(1-u)*(1-u);return[lerp(TP1[0],B3[0],e),BALL_R,lerp(TP1[1],B3[1],e)];}
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return[lerp(B3[0],HIT[0],u),lerp(BALL_R,HIT[1],u)+.45*Math.sin(Math.PI*u)*(1-u*.3),lerp(B3[1],HIT[2],u)];}
 const e=s-TF;if(e<.1)return mix3(HIT,D1,easeOut(e/.1));
 const d=clamp((e-.1)/.5),h=D1[1]*(1-d*d)+BALL_R*d*d;return[lerp(D1[0],D2[0],d),Math.max(BALL_R,h)+(d>=1?.08*Math.abs(Math.sin((e-.6)*8))*Math.exp(-(e-.6)*3):0),lerp(D1[2],D2[2],d)];
}

function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 if(k===MUS)return heroPose(tau);
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 const pass=(at:number,dur:number,power:number)=>{const u=(tau-(at-STRIKE_CONTACT*dur))/dur;if(u>0&&u<1.3)p=blendPose(p,strike(Math.min(1,u),{power}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));};
 if(a.role==='gk'){
  yaw=toBall;const dd=.85,t0=T_GOAL+.04-.55*dd,u=(tau-t0)/dd;
  p=u>0?keeperDive(Math.min(1,u),{side:'l',height:1}):keeperSet(tau*1.5);if(u>0)yaw=Math.PI;
 }else{
  const sco=a.role==='sco',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(sco&&sp>.4&&sp<4&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(sco?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  if(k===MCG){const m=posOf(MUS,tau);if(tau<CONTACT+.2)yaw=YAW(m[0]-x,m[1]-z);
   const lu=(tau-(T_CHOP+.12-.6*.8))/.8;if(lu>0&&lu<1.6)p=blendPose(p,lunge(Math.min(1,lu),{side:'r'}),Math.min(sm(0,.15,lu),1-sm(1,1.6,lu)));}
  if(k===POR&&tau>-.5&&tau<CONTACT+.3){const m=posOf(MUS,tau);yaw=YAW(m[0]-x,m[1]-z);}
  if(k===KRO){yaw=tau<KROOS_PASS+.3?kroYaw(tau):yaw;pass(KROOS_PASS,.8,.45);}
  if(k===GUN&&tau>GUN_REC-.6&&tau<GUN_PASS+.4){yaw=gunYaw(tau);p=over(p,{twist:-14,lean:18,lKnee:50,rKnee:40,lShA:56,rShA:40,neckP:24,squash:-.04},bump(GUN_REC-.2,GUN_REC+.8,tau));pass(GUN_PASS,.8,.55);}
  if(k===HAV&&tau>HAV_REC-.5&&tau<LAY+.4){yaw=havYaw(tau);p=over(p,{lean:16,rKnee:40,lKnee:36,neckP:30,lShA:40,rShA:36},bump(HAV_REC-.3,LAY,tau));pass(LAY,.7,.3);}
  if(a.role==='ger'&&tau>T_GOAL+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.5,T_GOAL+1,tau)*(k===HAV||k===GUN?1:.6));
  if(sco&&tau>T_GOAL+.6)p=over(p,{lean:28,neckP:30,lShA:20,rShA:20},sm(T_GOAL+.6,T_GOAL+1.4,tau)*.8);
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Musiala with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. `style` swaps kits (the duotone lesson). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;only?:number[];style?:(k:number)=>Kit;duoBall?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===MUS?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==MUS&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==MUS&&hPx<150)?'low':o.cap?'mid':undefined;
  const style=o.style?o.style(k):a.style,hero=k===MUS&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02){const pts:Pt[]=Array.from({length:24},(_,i)=>[q[0]+Math.cos(i/24*TAU)*r*1.6,q[1]+Math.sin(i/24*TAU)*r*1.6] as Pt);yInk(s,ribbon(pts,Math.max(3,r*.3*o.glow),{close:true,taper:0,wobble:.6}),.95);}
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx),duo:o.duoBall});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}

// ================= teaching marks shared by the replays and the lesson =================
/** touch ticks: a yellow spark at each touch as it happens and the touch spots left on the grass (fading) */
function touchTicks(s:Sheet,c:Camera,tau:number,w:number,span=2.4,upTo=3){if(w<=.02)return;const dots=new Path2D();let any=false;
 TOUCHES.forEach(([T0t,p],i)=>{if(i>=upTo)return;const age=tau-T0t;if(age<0||age>span)return;const q:V3=[p[0],.02,p[1]];if(depthOf(c,q)<NEAR+.3)return;const g=P(c,q),r=Math.max(6,.16*kAt(c,q))*(1-.45*age/span);
  dots.addPath(polyPath(Array.from({length:12},(_,j)=>{const a=j/12*TAU;return[g[0]+Math.cos(a)*r,g[1]+Math.sin(a)*r*.45] as Pt;}),true));any=true;
  if(age<.3){const b=P(c,[p[0],.14,p[1]]);sparkBurst(s,Y,b[0],b[1],Math.max(40,.5*kAt(c,q)),{n:7,seed:i+9,g:easeOutBack(clamp(age/.1))*(1-clamp((age-.18)/.12)),width:Math.max(4,.035*kAt(c,q)),cov:.95*w});}});
 if(any)yInk(s,dots,.9*w);}
/** the chop: a yellow curved arrow on the grass along the ball's real path from the chop spot to the shooting spot (the change of direction) */
function chopArrow(s:Sheet,c:Camera,w:number){if(w<=.02)return;const pts:[number,number][]=[];
 for(let i=0;i<=14;i++){const u=i/14*w,t=lerp(-.35,CONTACT,u),b=t<T_CHOP?[lerp(TP0[0],TP1[0],(t+.35)/(T_CHOP+.35)),lerp(TP0[1],TP1[1],(t+.35)/(T_CHOP+.35))]:[ballAt(t)[0],ballAt(t)[2]];pts.push([b[0],b[1]] as [number,number]);}
 const g=groundPts(c,pts);if(g.length<3)return;const wd=Math.max(6,.1*kAt(c,[B3[0],0,B3[1]]));yInk(s,ribbon(g,wd,{taper:.1,wobble:.8}),.95);yInk(s,head(g,wd),.95);}
/** "squeeze between": two orange posts on the defenders and a yellow lane through the gap toward goal */
function gapGate(s:Sheet,c:Camera,tp:number,w:number,lane=1){if(w<=.02)return;
 const a=posOf(MCG,tp),b=posOf(POR,tp),pa=new Path2D();for(const q of[a,b]){const g=groundRing(c,q[0],q[1],.8*w,24);if(g.length>2)pa.addPath(ribbon(g,Math.max(5,.1*kAt(c,[q[0],0,q[1]])),{close:true,taper:0,wobble:.6}));}
 s.fill(R,pa,.95);
 if(lane>.02){const L=clamp(lane),to:[number,number]=[lerp(B3[0],-.5,L),lerp(B3[1],HIT[2]*.8,L)],gaps:[number,number][]=[];for(let x=.06;x<1;x+=.14)gaps.push([x,x+.05]);
  const g=groundPts(c,[B3,[lerp(B3[0],to[0],.5),lerp(B3[1],to[1],.5)],to]);if(g.length>1){const wd=Math.max(6,.16*kAt(c,[B3[0]+3,0,B3[1]]));yInk(s,ribbon(g,wd,{taper:0,wobble:.6,gaps}),.9*w);if(g.length>2)yInk(s,head(g,wd*.8),.9*w);}}}
/** a spark where McGregor's lunge lands on air, just after the chop */
function missSpark(s:Sheet,c:Camera,tp:number,size=1){const age=tp-(T_CHOP+.15);if(age<-.05||age>.45)return;const m=posOf(MCG,T_CHOP+.2),q:V3=[m[0]-.55,.25,m[1]-.35];if(depthOf(c,q)<NEAR+.5)return;const p=P(c,q);
 sparkBurst(s,R,p[0],p[1],Math.max(50,.55*kAt(c,q))*size,{n:8,seed:83,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.25)/.2)),width:Math.max(6,.05*kAt(c,q))});}
function strikeSpark(s:Sheet,c:Camera,tp:number,size=1){if(tp<CONTACT||tp>CONTACT+.25)return;const q:V3=[B3[0],.2,B3[1]];if(depthOf(c,q)<NEAR+.3)return;const p=P(c,q);sparkBurst(s,Y,p[0],p[1],(70+.6*kAt(c,q))*size*sm(CONTACT-.02,CONTACT+.08,tp,easeOut),{n:9,seed:11,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:9*size});}

// ================= chapter 1 (live): the high main-stand camera — Kroos → Gündogan whips round → Havertz → lay-off → chop → roof of the net =================
const ch1q=()=>({mu:T(0,'Munich'),fg:T(0,'Euros begin'),gw:T(0,'Germany, in white'),sc:T(0,'Scotland'),gf:T(0,'Gündogan finds'),hv:T(0,'Havertz'),lb:T(0,'lays it back'),jm:T(0,'Jamal Musiala'),qc:T(0,'A quick chop'),pd:T(0,'past a defender'),bg:T(0,'and bang'),rf:T(0,'roof of the net'),end:SEC(0)});
/** τ keyed to the words: Kroos's pre-roll, then the move runs at ≈0.6–1.4× real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-8.6],[q.gf,GUN_REC+.1],[q.hv,HAV_REC-.1],[q.lb,LAY],[q.jm,-.55],[q.qc,.25],[q.pd,T_CHOP+.2],[q.bg,CONTACT],[q.rf,T_GOAL+.2],[q.end,T_GOAL+.2+(q.end-q.rf)*.95]]),x=>x);};
const BCAM:V3=[-26,21,54];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.1)),m=posOf(MUS,tau);
 if(tau<CONTACT)return[b[0]+2.5,1,b[2]];
 if(tau<T_GOAL+.5)return mix3([b[0],1.2,b[2]],[-3,1.3,.5],sm(CONTACT,T_GOAL,tau)*.6);
 return mix3([-3,1.3,.5],[m[0],1.2,m[1]],sm(T_GOAL+.5,T_GOAL+2,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-30,6,-24],look=mix3(wide,av(ch1Look),sm(q.fg-.4,q.gw+.4,t,easeInOutSine));
 const F=key(t,mono([[0,1500],[q.gw,2300],[q.gf,3000],[q.hv,3300],[q.jm,4800],[q.qc,6000],[q.pd,6400],[q.bg,5600],[q.rf,4600],[q.rf+.8,4400],[q.end,5000]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // team rings: navy under Germany on "Germany, in white", red under Scotland on "Scotland", yellow on Musiala and on the defender
  const rg=sm(q.gw,q.gw+.3,tt,easeOutBack)*(1-sm(q.sc+.1,q.sc+.7,tt)),rs=sm(q.sc,q.sc+.3,tt,easeOutBack)*(1-sm(q.gf,q.gf+.6,tt)),ry=sm(q.jm,q.jm+.3,tt,easeOutBack)*(1-sm(q.qc+.3,q.qc+.9,tt)),rd=sm(q.pd,q.pd+.3,tt,easeOutBack)*(1-sm(q.bg+.1,q.bg+.6,tt));
  if(rg>.02||rs>.02||ry>.02||rd>.02){const pg=new Path2D(),ps=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if((a.role==='ger'||a.role==='hero')&&rg>.02)ringAt(pg,c,k,tp,rg);if((a.role==='sco'||a.role==='gk')&&rs>.02)ringAt(ps,c,k,tp,rs);});
   if(ry>.02)ringAt(py,c,MUS,tp,ry*1.2);if(rd>.02)ringAt(py,c,MCG,tp,rd*1.2);
   s.fill(K,pg,.9);s.fill(R,ps,.95);yInk(s,py,.95);}
  // "Gündogan finds Havertz": the pass line draws itself along the grass as the ball travels
  const pl=sm(q.gf-.1,q.gf+.3,tt)*(1-sm(q.lb,q.lb+.5,tt));if(pl>.02){const u=clamp((tp-GUN_PASS)/(HAV_REC-GUN_PASS)),g=groundPts(c,[GB,[lerp(GB[0],HV[0],Math.max(.02,u)),lerp(GB[1],HV[1],Math.max(.02,u))]]);
   if(g.length>1&&u>0){const w=Math.max(5,.1*kAt(c,[HV[0],0,HV[1]]));yInk(s,ribbon(g,w,{taper:.1,wobble:.6,gaps:[[.2,.28],[.45,.53],[.7,.78]]}),.9*pl);}}
  // "A quick chop": the chop arrow on the grass
  chopArrow(s,c,sm(q.qc-.1,q.qc+.6,tt,easeOut)*(1-sm(q.bg+.2,q.bg+.7,tt)));
  drawWorld(s,c,tau,tp,{ballMin:11,cap:t>q.end-.7});
  missSpark(s,c,tp,.8);strikeSpark(s,c,tp,1);},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low behind Musiala): the touch, the chop sideways, McGregor's lunge on air =================
const ch2q=()=>({wa:T(1,'Watch again'),sl:T(1,'slowly'),sq:T(1,'Small, quick touches'),oc:T(1,'one to control'),ch:T(1,'one chop sideways'),af:T(1,'away from'),de:T(1,'the defender'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-1.5],[q.sl,-.95],[q.sq,-.25],[q.oc,.05],[q.ch,T_CHOP-.05],[q.af,T_CHOP+.2],[q.de,T_CHOP+.4],[q.end,1.2]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),m=posOf(MUS,tau),m2=posOf(MUS,tau-.35),mx=(m[0]+m2[0])/2,mz=(m[1]+m2[1])/2,push=sm(q.sq-.3,q.oc+.3,t,easeInOutSine),back=sm(q.de,q.end,t,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const pos:V3=[mx-4.6-1.4*open+.8*push-.8*back,1.25+.35*open+.4*back,mz+1.2+1.8*open-.3*push];
 const look:V3=[mx+2.6+1.2*back,.55+.2*open,mz-.4+1.6*open];
 return cam(pos,look,key(t,mono([[0,1500],[q.sq,1700],[q.oc,2000],[q.ch,2050],[q.de,1850],[q.end,1700]]),easeInOutSine));}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "Small, quick touches": ticks on each touch; "one chop sideways": the chop arrow
  touchTicks(s,c,tp,sm(q.sq-.2,q.sq+.2,tt)*(1-sm(q.end-.9,q.end-.5,tt)),2.2,2);
  chopArrow(s,c,sm(q.ch-.15,q.ch+.55,tt,easeOut)*(1-sm(q.end-.9,q.end-.5,tt)));
  // "the defender": a red ring on McGregor as his lunge meets only air
  const rd=sm(q.af-.1,q.af+.3,tt,easeOutBack)*(1-sm(q.end-.8,q.end-.4,tt));if(rd>.02){const pr=new Path2D();ringAt(pr,c,MCG,tp,rd,1);s.fill(R,pr,.95);}
  drawWorld(s,c,tau,tp,{ballMin:18,hero:true,glow:sm(q.wa,q.wa+.4,tt)*(1-sm(q.sq-.2,q.sq+.2,tt)),cap:t>q.end-.7||t<.6});
  // "one to control": a yellow ring round his right boot at the first touch
  const oc=sm(q.oc-.1,q.oc+.25,tt,easeOutBack)*(1-sm(q.ch-.3,q.ch,tt));if(oc>.02){const h=heroPose(tp),sk=solve(h.pose,MB,h.place),toe:V3=[sk.rToe[0],.08,sk.rToe[2]];if(depthOf(c,toe)>NEAR+.3){const p=P(c,toe),r=.3*kAt(c,toe)*oc,pts:Pt[]=Array.from({length:24},(_,i)=>[p[0]+Math.cos(i/24*TAU)*r,p[1]+Math.sin(i/24*TAU)*r*.7] as Pt);yInk(s,ribbon(pts,Math.max(4,.035*kAt(c,toe)),{close:true,taper:0,wobble:.6}),.95);}}
  missSpark(s,c,tp,1.2);},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:4,
};

// ================= chapter 3 (replay from behind the goal): the gap opens, the shot into the roof, the net shakes, he wheels away =================
const ch3q=()=>({fb:T(2,'From behind'),tg:T(2,'the goal'),tc:T(2,'the chop'),mg:T(2,'makes a gap'),ns:T(2,'the net shakes'),wf:T(2,'What a finish'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,.15],[q.tc,T_CHOP],[q.mg,1.05],[q.ns,T_GOAL+.05],[q.wf,T_GOAL+1.2],[q.end,T_GOAL+1.2+(q.end-q.wf)*.9]]),x=>x);};
const GCAM:V3=[5.4,2.1,-5.6];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),m=posOf(MUS,tau);
 const toBall=sm(q.mg,q.ns-.2,t,easeInOutSine),toHero=sm(q.wf-.4,q.wf+1.1,t,easeInOutSine);
 const look0:V3=[B3[0]+1.5,1,B3[1]+.6],look1:V3=[b[0],clamp(b[1],.9,2.6),b[2]],look2:V3=[m[0],1.1,m[1]];
 const look=mix3(mix3(look0,look1,toBall*.7),look2,toHero);
 const pos:V3=add(GCAM,[-8*toHero,3.2*toHero,14*toHero]),F=key(t,mono([[0,3900],[q.tc,4200],[q.mg,3700],[q.ns,2000],[q.ns+.7,1900],[q.wf,1900],[q.wf+1.1,3600],[q.end,3900]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,shake=t>=q.ns?8*settle(t,q.ns,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  const net=goalIn>0?netRipple(goalIn,NET_HIT):undefined;
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),noGoal:true});
  touchTicks(s,c,tp,sm(q.tc-.2,q.tc+.2,tt)*(1-sm(q.ns,q.ns+.5,tt)),1.4);
  // "makes a gap": red rings on the two defenders and a yellow lane through the gap to goal
  gapGate(s,c,tp,sm(q.mg-.1,q.mg+.3,tt,easeOutBack)*(1-sm(q.ns+.3,q.ns+.9,tt)),sm(q.mg,q.mg+.7,tt,easeOut));
  // the ball's path: dotted ink in the air from the boot to the roof of the net
  if(tp>CONTACT&&tp<T_GOAL+.3){const dots=new Path2D();for(let i=0;i<=16;i++){const t2=CONTACT+(Math.min(tp,T_GOAL)-CONTACT)*i/16,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.045*kAt(c,p),3,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}s.fill(K,dots,.6);}
  const w=drawWorld(s,c,tau,tp,{ballMin:13,hero:t>q.wf,cap:t>q.end-.7||t<.6});
  // the net is between this camera and the play: printed over the players
  goal(s,c,net);
  strikeSpark(s,c,tp,1.2);
  if(tp>CONTACT+.1&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:160,width:7,cov:.8});}
  // "the net shakes": a yellow burst where the ball hits the roof of the net
  const age=tp-T_GOAL;if(age>0&&age<.45&&depthOf(c,NET_HIT)>NEAR+.3){const p=P(c,NET_HIT);sparkBurst(s,Y,p[0],p[1],(80+.9*kAt(c,NET_HIT))*easeOutBack(clamp(age/.12)),{n:10,seed:31,g:1-clamp((age-.2)/.25),width:11});}
  // "What a finish": a yellow ring round him as he wheels away
  const wf=sm(q.wf,q.wf+.35,tt,easeOutBack);if(wf>.02){const pr=new Path2D();ringAt(pr,c,MUS,tp,wf,1.3);yInk(s,pr,.95);}},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(MUS,tau),p:V3=[x,1.1,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:5,
};

// ================= chapter 4 (duotone lesson, over his shoulder): small quick touches, change direction, squeeze between defenders =================
const ch4q=()=>({yt:T(3,'Your turn'),sq:T(3,'small, quick touches'),cd:T(3,'change direction'),sz:T(3,'squeeze'),bd:T(3,'between defenders'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,-.5],[q.sq,-.05],[q.cd,T_CHOP-.05],[q.sz,1.05],[q.bd,CONTACT-.05],[q.end,CONTACT+.35]]),x=>x);};
function ch4Cam(t:number){const q=ch4q(),tau=tau4(t),m=posOf(MUS,Math.min(tau,CONTACT)),rise=sm(q.cd,q.sz,t,easeInOutSine),back=sm(q.bd-.3,q.end,t,easeInOutSine);
 const pos:V3=[m[0]-4.4-1.2*back,1.75+.9*rise+.5*back,m[1]+2.1-.6*rise];
 const look:V3=[lerp(m[0]+2.4,-7,rise*.6+back*.2),.5,lerp(m[1]-.3,-.6,rise*.5)];
 return cam(pos,look,key(t,mono([[0,1650],[q.sq,1900],[q.cd,1800],[q.sz,1500],[q.end,1450]]),easeInOutSine));}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=ch4Cam(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round Musiala, the goal in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-30],[4,0,-30],[4,0,30],[-60,0,30]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(B3[0]-.4,B3[1]+.6,6),.2);s.tone(Y,pool(B3[0]-.6,B3[1]+.8,3),.2);s.tone(Y,pool(-1,0,4.5),.15);
  goal(s,c);
  // "Your turn": a ring round the ball at his feet
  const yt=sm(q.yt,q.yt+.4,tt,easeOutBack)*(1-sm(q.sq,q.sq+.4,tt));if(yt>.02){const b=ballAt(tp),g=groundRing(c,b[0],b[2],.55*yt,24);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.07*kAt(c,b)),{close:true,taper:0,wobble:.6}),.95);}
  touchTicks(s,c,tp,sm(q.sq-.2,q.sq+.2,tt)*(1-sm(q.end-.8,q.end-.4,tt)),2.2);
  chopArrow(s,c,sm(q.cd-.15,q.cd+.6,tt,easeOut)*(1-sm(q.end-.8,q.end-.4,tt)));
  gapGate(s,c,tp,sm(q.sz-.1,q.sz+.3,tt,easeOutBack)*(1-sm(q.end-.6,q.end-.2,tt)),sm(q.bd-.2,q.bd+.5,tt,easeOut));
  const styleOf=(k:number)=>k===MUS?duo(MUSIALA,true):duo(ACTORS[k].style);
  drawWorld(s,c,tau,tp,{ballMin:14,hero:true,only:[MUS,MCG,POR,GK,MCT],style:styleOf,duoBall:true});
  missSpark(s,c,tp,1);strikeSpark(s,c,tp,1.1);},
 still:4,
};

const story:RisoStory={
 id:'musiala-signature',format:'11v11',title:"Musiala's quick chop",
 theme:'Use small, quick touches and change direction to squeeze between defenders.',
 ageNote:'UEFA Euro 2024 opening game, Germany 5–1 Scotland, Munich, 14 June 2024. Musiala scored the second goal and was Player of the Match.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: three quick touches — the ball ticks right, chops left, and a yellow arrow shows the change of direction. Reduced motion: still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:clamp(age/.7),pts:Pt[]=[[x-120,y+20],[x-40,y+10],[x+30,y-10],[x-30,y-90],[x+40,y-170]];
  const n=Math.max(2,Math.round(pts.length*u)),seg=pts.slice(0,n);
  s.fill(Y,ribbon(seg,14,{taper:.4,wobble:1}),.9);
  for(let i=0;i<Math.min(3,n);i++){const a=age-i*.18;if(age<=0||(a>0&&a<.3))sparkBurst(s,Y,seg[i][0],seg[i][1],70,{n:7,seed:seed+i,g:age<=0?1:1-clamp(a/.3),width:9});}
  const b=seg[seg.length-1];whiteBall(s,b[0],b[1],40,age*12+hash(seed,3)*TAU);
 },
};
export default story;
