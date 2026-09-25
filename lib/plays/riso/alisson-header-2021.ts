/** Alisson's stoppage-time header — West Bromwich Albion 1–2 Liverpool, Premier League, The Hawthorns, West Bromwich, 16 May 2021 (played
 * behind closed doors). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts and two published match photographs (the video was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Peter Lansley, "Alisson scores incredible last-minute winner for Liverpool to stun West Brom" (16 May 2021)
 *    https://www.theguardian.com/football/2021/may/16/west-brom-liverpool-premier-league-match-report — and its two photographs:
 *    "Alisson heads home an extraordinary winner" (Adam Fradgley, AMA/West Bromwich Albion FC/Getty Images) and "Alisson points to the sky"
 *    (Rui Vieira/Reuters), looked at for the kits, the empty seats and the direction of the header
 *  - BBC Sport, Phil Dawkes, "West Brom 1-2 Liverpool: Alisson stunner keeps Liverpool in top-four hunt" (16 May 2021)
 *    https://www.bbc.co.uk/sport/football/57044633
 *  - Wikipedia, "Alisson Becker" (raw wikitext, 2020–21 section) https://en.wikipedia.org/wiki/Alisson_Becker
 * CONFIRMED by those accounts: 16 May 2021, the Hawthorns, 1–1 (Robson-Kanu 15', Salah 33'); the last seconds of stoppage time ("three minutes
 * into stoppage time" — Guardian; "the 95th minute" — Wikipedia); Liverpool needed the win for the top-four race; goalkeeper Alisson came up for
 * a corner taken by Trent Alexander-Arnold; he "rose at the near post to glance on a powerful header into the far top corner" (Guardian; BBC:
 * "rose to glance Trent Alexander-Arnold's delivery into the far corner"); Alisson: "I just tried to run into a good place ... to bring a
 * defender, but no one followed me"; the whole Liverpool team surrounded him; the first competitive goal by a Liverpool goalkeeper; the final
 * whistle within a minute. From the photographs: Liverpool all red (Trent long-sleeved, 66; Thiago 6; Nat Phillips 47); Alisson all black,
 * long sleeves, number 1 ("A. BECKER"), coral-red gloves, white boots; West Brom navy-and-white stripes, white shorts, navy socks, red numbers
 * (Ajayi 6 beside Alisson as he heads); Sam Johnstone in mint green; empty navy seats behind the goal (no fans); a grey afternoon.
 * INFERRED (illustrative reconstruction): WHICH corner — drawn from Liverpool's LEFT (the −z flag): in the Getty photograph, shot from the pitch
 * side facing the goal, Alisson rises left of centre and the ball flies into the top corner on the RIGHT of the frame, the "far" corner, so the
 * corner came from the left (never narrated); Trent's RIGHT foot (his stronger foot) and so an in-swinger; every position, run and timing in
 * metres and seconds (a whipped corner ≈ 31 m in ≈ 1.45 s, apex ≈ 4 m; Alisson waiting near the penalty spot, then a ≈ 6 m run to the near
 * post; his flick ≈ 9 m into the far top corner in ≈ 0.42 s); where the other players stood (drawn: seven West Brom defenders, five Liverpool
 * attackers, unnamed except the numbers in the photos); Johnstone rooted, then a late, hopeless dive; Johnstone's mint drawn as a pale blue
 * screen (one ink per kit part); the referee, the benches and Alisson's beard (not drawn); the celebration mob by the goal; the Hawthorns'
 * stands, roofs and boards; the camera side and positions, lenses. The narration names none of the inferred details, and — as asked —
 * keeps to the football (it does not mention his family).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Alisson runs up from his half, the corner, the
 * flick, the net); ch2 = the TV slow-motion REPLAY from low behind the goal line at the near post, looking back at his run and leap, with a
 * ring of empty grass round him ("nobody follows him") and a replay trail on the corner; ch3 = a second REPLAY angle, high behind the goal:
 * the header comes at the camera into the far top corner, then the whole team runs to hug him; ch4 = the lesson, a slow replay with teaching
 * marks (a last-minute clock, the long dashed route of the keeper's run up from his half, his yellow ring, the header's arrow into the top
 * corner). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card
 * window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hair and hems, motionSmear on the corner, the header, the dive). Handedness: the world is right-handed (x toward West
 * Brom's goal, y up, +z = Liverpool's right), exactly athlete.ts's convention, so Trent's strike({foot:'r'}) is his RIGHT foot and the corner
 * from Liverpool's left is the −z corner; header() is symmetric, and Alisson's flick is a snap of the head and shoulders to his RIGHT (+z,
 * toward the far post). Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on
 * twos, cameras on ones; all randomness seeded. Heat: no crowd to print (behind closed doors); small figures print at 'low', at most 4 non-hero
 * figures at full detail, every figure inside a passage is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'One last corner',text:"The Hawthorns, 2021. Liverpool must win, but it's one-all and time is up. So goalkeeper Alisson runs up for one last corner! Trent Alexander-Arnold swings it in... Alisson heads it! Goal!",tail:2.4,
  cues:['The Hawthorns','Liverpool must','time is up','goalkeeper','runs up','Trent','swings it in','Alisson heads','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. Alisson finds space at the near post, and nobody follows him. He jumps and flicks it on with his head.',tail:1.8,
  cues:['Watch again','finds space','near post','nobody follows','jumps','flicks']},
 {label:'Behind the goal',text:'From behind the goal: it flies into the far top corner. The whole team runs to hug him!',tail:2.4,
  cues:['From behind','far top corner','whole team','hug him']},
 {label:'Never give up',text:'Never give up! In the last seconds, even the goalkeeper can go up and help the team.',tail:2.2,
  cues:['Never give up','last seconds','goalkeeper','help the team']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/alisson-header-2021/timing.json, add
 *   import timingJson from '../../../public/plays/narration/alisson-header-2021/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/alisson-header-2021/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('alisson: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('alisson: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: West Brom's goal line is x = 0 (Liverpool attack +x), goal centre z = 0, +z = Liverpool's right; touchlines z = ±34, halfway x = −52.5. */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Hawthorns behind closed doors: a grey afternoon, rows of empty navy seats
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind West Brom's goal (+x), 2 the main stand (−z), 3 the other end.
 * The corners are left open (grey sky). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,10,a),1.4+20*b,41+26*b],
 (a,b)=>[9+26*b,1.4+17*b,lerp(-42,42,a)],
 (a,b)=>[lerp(10,-116,a),1.4+24*b,-41-30*b],
 (a,b)=>[-114-24*b,1.4+16*b,lerp(40,-40,a)],
];
const ROWS=[16,13,18,12],AISLES=[9,6,9,6];
function stadium(s:Sheet,c:Cam){
 const which=[0,1,2,3];
 // an overcast May afternoon: a pale grey-blue sky, a light haze low down
 s.field(B,.2,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(K,polyPath([[-1e4,hz[1]-380],[1e4,hz[1]-380],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.08);
 const planes=new Path2D(),rows=new Path2D(),roof=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  // empty seats: the step of every row prints as a thin paper line, the aisles as paper stairs
  for(let j=1;j<ROWS[i];j++){const b=j/ROWS[i];seg3(c,S(0,b),S(1,b),.14,rows,.6);}
  for(let k=1;k<AISLES[i];k++){const a=k/AISLES[i];seg3(c,S(a,0),S(a,1),.9,rows,.8);}
  // the roof: a dark overhang over the top rows, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,9,0]),add3(S(0,.74),[0,9,0])]));
  seg3(c,add3(S(0,.74),[0,8.8,0]),add3(S(1,.74),[0,8.8,0]),.4,rows);}
 // navy-blue seats (from the photographs), nobody in them
 s.knockout(planes);s.tone(B,planes,.72);s.tone(K,planes,.42);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(rows,.6);
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: navy with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** West Brom's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz, high) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2))*y;
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0,.2),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1,.2),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z,.2),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z,.2),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6,w=y/1.9;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],w),y,zs[i]],[back(zs[i+1],w),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,w),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,w),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Liverpool: all red (photographs), paper trim and numbers */
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** West Brom: navy-and-white stripes, white shorts, navy socks, red numbers (photographs) */
const wba=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:'paper',shorts:'paper',socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:R,hairStyle:'short',build:{height:1.83,bulk:1},...o});
const B_AL:Build={height:1.93,bulk:1.04,thighs:1.04},B_TAA:Build={height:1.8,bulk:.95},B_JOH:Build={height:1.93,bulk:1.06},B_AJA:Build={height:1.93,bulk:1.06,thighs:1.05};
/** Alisson: all black (drawn navy), long sleeves, number 1, coral-red gloves, white boots */
const AL_ST:AthleteStyle={shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:'paper',skin:SKIN_L,hair:K,line:K,trim:[R,.8],gloves:[R,.95],sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:B_AL,seed:1};
/** Trent exactly as in trent-corner-2019.ts (66), long sleeves as in the photograph */
const TAA_ST=lfc({number:66,skin:SKIN_M,build:B_TAA,sleeves:'long',seed:66});
/** Sam Johnstone: mint green, printed as a pale blue screen; paper gloves */
const JOH_ST:AthleteStyle={shirt:[B,.5],shorts:[B,.5],socks:[B,.6],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],gloves:'paper',sleeves:'long',hairStyle:'bald',number:1,numberInk:K,build:B_JOH,seed:31};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Trent's corner)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to Alisson's forehead; his flick reaches the goal line at TG */
const TF=1.45,TG=TF+.42;
/** Alisson's header spot (his pelvis) at the near post, ≈ 7.5 m out; he faces the goal, turned a little toward the incoming ball */
const HP:[number,number]=[-7.5,-2.5],YAW_H=yawTo(.94,-.36);
/** his flick: header() with a big goalkeeper's spring and the head + shoulders snapping to his RIGHT (+z, toward the far post) */
function alHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.3;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(.2,-.34,sn)*w;p.twist+=lerp(.1,-.2,sn)*w;p.bend+=.08*w;return p;}
/** contact on the header clock: mid-snap */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(alHeader(CU),B_AL,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at the −z corner flag, Liverpool's left) */
const P0:V3=[-.45,BALL_R,-33.55];
/** the in-swinger off a right foot from the left: a steady sideways pull TOWARD goal (+x) on top of gravity */
const SWING:V3=[2.6,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Trent strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_T=yawTo(DC[0],DC[1]);
/** where Trent's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),B_TAA,{x:0,z:0,yaw:YAW_T});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_T:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCT[0]-DC[0]*3.2+LEFT_T[0]*1.5,PCT[1]-DC[1]*3.2+LEFT_T[1]*1.5];
/** where the flick crosses the goal line: high in the FAR top corner (+z), out of Johnstone's reach */
const GOAL_PT:V3=[0,2.12,3.1],NET_HIT:V3=[1.5,1.85,3.3],REST:V3=[1.05,BALL_R,2.85];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='al'|'taa'|'gk'|'mark'|'lfc'|'wba';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=12,DT=.02;
const tp=(u:number):[number,number]=>[PCT[0]+DC[0]*u,PCT[1]+DC[1]*u];
/** after the goal Alisson lands and turns; the team mobs him by the six-yard box */
const MOB:[number,number]=[-6.2,-1.6];
const toMob=(x:number,z:number,k:number,ox:number,oz:number):number[][]=>[[TG+.5+k*.12,x,z],[TG+2.4+k*.35,MOB[0]+ox,MOB[1]+oz],[T1,MOB[0]+ox*.8,MOB[1]+oz*.8]];
const ACTORS:Actor[]=[
 {name:'Alisson',role:'al',hero:true,style:AL_ST,keys:[[T0,-47,6.5],[-7,-29,4],[-4,-17,1.6],[-2.2,-13.6,.7],[-.8,-12.9,.4],[-.1,-12.4,.1],[TJ-.35,HP[0]-.35,HP[1]+.2],[TJ+.1,HP[0],HP[1]],[TF+.55,HP[0]+.25,HP[1]+.25],[TF+1.4,-6.5,-2],[TG+2.2,MOB[0],MOB[1]],[T1,MOB[0],MOB[1]]]},
 {name:'Trent Alexander-Arnold',role:'taa',hero:true,style:TAA_ST,keys:[[T0,-1.4,-36.4],[-6.4,-.8,-35.2],[-5.2,...tp(-.8)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...tp(-1.6)],[0,...tp(0)],[.7,...tp(.9)],[TG+.6,...tp(2.2)],[TG+3,-3.8,-20],[TG+5.2,-5.2,-6.5],[T1,MOB[0]-.4,MOB[1]-1.4]]},
 {name:'Sam Johnstone',role:'gk',hero:true,style:JOH_ST,keys:[[T0,-.7,.4],[-2,-.8,.1],[0,-.9,-.4],[TF-.5,-1.1,-.9],[TF,-1.15,-.95],[T1,-1.1,-.9]]},
 {name:'Semi Ajayi (6)',role:'mark',style:wba({number:6,skin:SKIN_D,build:B_AJA,seed:6}),keys:[[T0,-10.8,1.2],[-2,-10.6,.6],[0,-10.4,.2],[TF-.7,-9.4,-1.1],[TF,-9.1,-1.5],[T1,-8.8,-1.2]]},
 {name:'West Brom near post',role:'mark',style:wba({seed:41,build:{height:1.86}}),keys:[[T0,-4.2,-3],[0,-4.4,-3.2],[TF-.5,-5.2,-3.1],[TF,-5.5,-3],[T1,-5,-2.4]]},
 {name:'West Brom post',role:'wba',style:wba({seed:42,skin:SKIN_M}),keys:[[T0,-.7,-3.3],[0,-.7,-3.4],[TF,-.8,-3.2],[T1,-.8,-3]]},
 {name:'West Brom six-yard 1',role:'wba',style:wba({seed:43}),keys:[[T0,-5,.8],[-2,-5.2,.4],[0,-5.3,.2],[TF,-5.6,.6],[T1,-5.2,1]]},
 {name:'West Brom six-yard 2',role:'wba',style:wba({seed:44,build:{height:1.9}}),keys:[[T0,-5.6,3.6],[0,-5.8,3.2],[TF,-6,2.6],[T1,-5.6,2.4]]},
 {name:'West Brom spot',role:'wba',style:wba({seed:45,skin:SKIN_M}),keys:[[T0,-11.4,4],[-2,-11,3.4],[0,-11,3.1],[TF,-10.2,2.4],[T1,-9.6,2]]},
 {name:'West Brom edge',role:'wba',style:wba({seed:46,build:{height:1.78}}),keys:[[T0,-16,-4.2],[-2,-15.6,-4],[0,-15.4,-3.8],[TF,-13.6,-2.8],[T1,-12.4,-2]]},
 {name:'Nat Phillips (47)',role:'lfc',style:lfc({number:47,build:{height:1.9,bulk:1.05},seed:47}),keys:[[T0,-6.8,1.8],[-2,-6.6,1.4],[0,-6.4,1.2],[TF,-5.4,1.6],...toMob(-5,1.4,0,.9,.4)]},
 {name:'Thiago (6)',role:'lfc',style:lfc({number:6,build:{height:1.74,bulk:.98},seed:61}),keys:[[T0,-17.5,-7.5],[-2,-17.2,-7],[0,-17,-6.8],[TF,-15.6,-5.8],...toMob(-14,-4.4,1,.4,-.9)]},
 {name:'Liverpool 3',role:'lfc',style:lfc({skin:SKIN_D,seed:62}),keys:[[T0,-9.8,5.4],[-2,-9.6,5],[0,-9.4,4.8],[TF,-8.2,4],...toMob(-7.6,3.6,2,-.8,.6)]},
 {name:'Liverpool 4',role:'lfc',style:lfc({skin:SKIN_M,seed:63}),keys:[[T0,-4.8,-.8],[0,-4.6,-1.2],[TF,-4.2,-.6],...toMob(-4.4,-.6,3,.9,-.5)]},
];
const AL=0,TAA=1,GK=2,MARK=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 // a held key (same spot twice) keeps zero speed at its ends
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** placed in the quadrant (Trent sets it down early) → the corner → the flick → the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4-(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // set-piece jostling: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a hug: arms round a teammate's shoulders, head in */
const HUG=posed({lHipF:22,rHipF:16,lKnee:26,rKnee:22,lean:22,pitch:6,neckP:14,lShF:96,rShF:92,lShA:30,rShA:34,lElb:70,rElb:74,lShR:-20,rShR:-20});
/** Johnstone: set on his line near the near post; rooted as it is flicked on, then a late, hopeless dive to his left (+z; 'l' for a keeper facing −x) */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.3}),T_DIVE=TF+.3,DIVE_L=1.1;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'al':{
   // up from his half, eyes on the corner; the run to the near post, the spring, the flick to his right, the landing; then arms up and the mob
   if(tau<-.4)yaw=faceYaw(k,tau,tau<-3?[-10,0,0]:P0);
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=alHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   const w=sm(TJ-.7,TJ-.2,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);
   if(tau>TJ+HD){const j=celebrate((tau-TG)*1.1,{kind:'arms'});pose=blendPose(pose,j,sm(TJ+HD+.1,TJ+HD+.7,tau)*(1-sm(TG+2.4,TG+3,tau)));
    if(tau>TG+2.4)pose=blendPose(pose,HUG,sm(TG+2.4,TG+3,tau)*.8);yaw=lerpAng(yaw,yawTo(-1,-.4),sm(TF+.8,TF+1.6,tau));}
   break;}
  case 'taa':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r',power:.8}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   // at the top of his run-up: one arm raised for the signal, a look into the box
   if(tau>-3.6&&tau<-.8){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_T,sm(-2,-1.1,tau));pose=blendPose(pose,posed({rShF:30,rShA:150,rElb:20,lShA:20,lElb:30,lean:6,neckP:-8,lKnee:14,rKnee:14}),win(tau,-3.3,-1.5,.5));}
   yaw=lerpAng(yaw,YAW_T,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4&&tau<TG+.6)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.3){const j=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.3,TG+.9,tau)*.8);}
   if(tau>TG+5)pose=blendPose(pose,HUG,sm(TG+5,TG+5.8,tau));
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,clamp((Math.hypot(...velOf(k,tau))-.3)/.8));
   yaw=faceYaw(k,Math.min(tau,TF),tau<-.5?[-10,0,-10]:undefined);
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));yaw=lerpAng(yaw,Math.PI,sm(TF,TF+.1,tau));}
   if(tau>TG+1.6)pose=blendPose(pose,DEJECT,sm(TG+1.9,TG+2.6,tau)*.5);
   break;}
  case 'mark':{// too late: a lower jump just after him, then hands on hips
   if(tau>TF-.6&&tau<TF+1.1){const hp=header(clamp((tau-(TF-.3))/1.0));hp.air*=.55;pose=blendPose(pose,hp,sm(TF-.6,TF-.35,tau)*(1-sm(TF+.7,TF+1.1,tau)));}
   yaw=faceYaw(k,Math.min(tau,TF));if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));break;}
  case 'wba':yaw=faceYaw(k,Math.min(tau,TF+.2));if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;
  case 'lfc':yaw=faceYaw(k,Math.min(tau,TF+.1));
   if(tau>TG+.2){const j=celebrate(distOf(k,tau)/4.2+k*.3,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.3,TG+.9,tau)*.8*(1-sm(TG+2.2+k*.3,TG+2.8+k*.3,tau)));
    if(tau>TG+2.2+k*.3){pose=blendPose(pose,HUG,sm(TG+2.2+k*.3,TG+2.8+k*.3,tau));const[mx,mz]=posOf(AL,tau);yaw=yawTo(mx-x,mz-z);}}
   break;
 }
 return{pose,place:{x,z,yaw}};
}

/** a yellow spark that reads on grass: the rays knocked out to paper, printed yellow, a navy key line */
function spark(s:Sheet,x:number,y:number,r:number,o:{n?:number;seed?:number;g?:number;width?:number}={}){
 const{n=9,seed=1,g=1,width=r*.12}=o;if(g<=.01)return;const rr=rng(seed),p=new Path2D();
 for(let i=0;i<n;i++){const a=i/n*TAU+(rr()-.5)*.3,r0=r*.45,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],width*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}
 s.stroke(K,p,Math.max(2.5,width*.35),.85);s.knockout(p);s.fill(Y,p,.95);
}
// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the header, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05&&P[2]>-34.5)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;lead?:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest of a crowded box prints 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 // cull against the real device rect too (inside a passage the outgoing camera is zoomed far into its aperture)
 const DW=s.width*s.dpr,DH=s.height*s.dpr,offDev=(g:Pt,pad:number)=>{const x=m.a*g[0]+m.c*g[1]+m.e,y=m.b*g[0]+m.d*g[1]+m.f;return x<-pad||y<-pad||x>DW+pad||y>DH+pad;};
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu;if(offDev(g,px*s.dpr*.8))continue;
  const style:AthleteStyle=passing?{...f.style,detail:f.lead?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,lead:k===AL,
  smear:o.smear&&((k===AL&&tau>TJ&&tau<TF+.3)||(k===TAA&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const HP3:V3=[HP[0],1.4,HP[1]];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: the keeper's run up under the opening words, then real time (×≈1) from the corner ("swings it in") to his head ("Alisson heads") */
function tau1(t:number){const tX=CUE(0,'swings it in')-.05,tH=CUE(0,'Alisson heads')+.35,k=clamp(TF/Math.max(.5,tH-tX),.85,1.15);
 if(t>=tX)return(t-tX)*k;
 return key(t,mono([[0,-9.6],[CUE(0,'goalkeeper'),-6.8],[CUE(0,'runs up'),-5.6],[CUE(0,'Trent'),-2.4],[tX,0]]),linear);}
const P1:V3=[-26,21,66];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau),al=at(AL,tau,1);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-12,0,-4],fov:22})],
  [CUE(0,'goalkeeper')-.5,1.4,()=>({P:P1,T:mix3(al,[-12,1,-2],.15),fov:9.5})],
  [CUE(0,'Trent')-.3,1.1,()=>({P:P1,T:mix3(at(TAA,tau,.9),P0,.4),fov:5})],
  [CUE(0,'swings it in')+.05,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),HP3,.25+.55*sm(0,TF,tau)),fov:lerp(10,9,sm(-.1,.8,tau))})],
  [CUE(0,'Alisson heads')-1.05,.7,()=>({P:P1,T:[HP[0]+2.2,1.5,HP[1]+1.4],fov:5.6})],
  [CUE(0,'Goal')+.3,1.5,()=>({P:P1,T:mix3(al,[-4,1.2,-1],.3),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp1=tau1(tt-1/12),tG=CUE(0,'Goal');
  stadium(s,c);
  ground(s,c);
  const r=play(s,c,tau,tp1,{min:15,lines:true,prevBall:tau1(t-.06)});
  // the net ripples and the moment bursts: a yellow spark on the ball as it hits the net
  const hit=(tau-TG)/.3;if(hit>0&&hit<1&&r.ball)spark(s,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:10,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:10});
  const gl=sm(tG-.1,tG+.3,t)*(1-sm(tG+1.2,tG+1.8,t));if(gl>0){const q=pr(c,at(AL,tau,3));if(q)spark(s,q[0],q[1],Math.max(90,kAt(c,HP3)*1.6)*gl,{n:12,seed:11,g:easeOutBack(gl),width:12});}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Alisson heads')+.35;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind the goal line at the near post, looking back at his run and leap
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'finds space'),-.7],[CUE(1,'near post'),TJ-.55],[CUE(1,'nobody follows'),TJ-.3],[CUE(1,'jumps'),TJ+.12],[CUE(1,'flicks'),TF-.03],[SECS(1)-.2,TG+.6]]),linear);
const E2:V3=[3.5,2.2,-13];
function cam2(t:number):Cam{
 const tau=tau2(t),a=at(AL,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-10.5,1.2,-.5],fov:24})],
  [CUE(1,'finds space')-.2,1.1,()=>({P:E2,T:mix3(a,[-10,1.2,0],.25),fov:14})],
  [CUE(1,'near post')-.2,1,()=>({P:E2,T:mix3(a,HP3,.4),fov:13})],
  [CUE(1,'nobody follows')-.1,1,()=>({P:add3(E2,[0,.3,-.4]),T:[HP[0]-.6,1.1,HP[1]+.4],fov:19})],
  [CUE(1,'jumps')-.3,.9,()=>({P:add3(E2,[0,.2,.4]),T:[HP[0],2.1,HP[1]],fov:10.5})],
  [CUE(1,'flicks')-.3,.8,()=>({P:add3(E2,[0,.3,.6]),T:[HEAD_PT[0]+.4,HEAD_PT[1]-.1,HEAD_PT[2]+.5],fov:7.5})],
  [CUE(1,'flicks')+.4,1.2,()=>({P:add3(E2,[0,.3,.6]),T:mix3(HEAD_PT,GOAL_PT,.6),fov:30})],
 ]);
}
/** the replay trail: the corner's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a flat dashed ring on the grass (navy band, paper core, ink on top) */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const w=Math.max(5,kAt(c,P)*.07),band=ribbon(pts,w*1.5,{close:true,seed:5,taper:0,wobble:.6}),core=ribbon(pts,w,{close:true,seed:5,taper:0,wobble:.6});s.fill(K,band,.7*a);s.knockout(core,a);s.fill(ink,core,.95*a);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tpv=tau2(tt-1/12),tN=CUE(1,'nobody follows'),tJ=CUE(1,'jumps');
  stadium(s,c);
  ground(s,c);
  // "nobody follows him": a ring of empty grass round him as he arrives
  groundRing(s,c,at(AL,tau,0),1.6,Y,sm(tN-.15,tN+.3,t)*(1-sm(tJ+.1,tJ+.5,t)));
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tpv,{smear:true,min:10});
  // the touch: a spark on his forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)spark(s,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'flicks')+.05;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, the flick comes at the camera, then the mob
const tau3=(t:number)=>key(t,mono([[0,TJ-.4],[CUE(2,'far top corner'),TG-.05],[CUE(2,'whole team'),TG+1.3],[CUE(2,'hug him'),TG+2.7],[SECS(2),TG+5.4]]),linear);
const E3:V3=[9.5,4.4,6.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),a=at(AL,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-6,1.5,-1.6],fov:27})],
  [CUE(2,'far top corner')-.5,.8,()=>({P:E3,T:[-2.8,1.7,.4],fov:25})],
  [CUE(2,'whole team')-.2,1.6,()=>({P:[9,4.6,3],T:mix3(a,[-8,1,-2],.2),fov:22})],
  [CUE(2,'hug him')-.2,1.4,()=>({P:[7,7.2,2.5],T:add3(a,[0,.3,0]),fov:16})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tpv=tau3(tt-1/12),tH=CUE(2,'hug him');
  stadium(s,c);
  ground(s,c);
  const r=play(s,c,tau,tpv,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the flick's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TG)/.3;if(hit>0&&hit<1&&r.ball)spark(s,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "hug him": a warm burst over the huddle
  const hg=sm(tH-.1,tH+.35,t)*(1-sm(tH+1.3,tH+1.9,t));if(hg>0){const q=pr(c,at(AL,tau,2.9));if(q)spark(s,q[0],q[1],Math.max(90,kAt(c,HP3)*1.2)*hg,{n:12,seed:37,g:easeOutBack(hg),width:12});}
 },
 aperture(t){const c=cam3v(t),p=stateOf(AL,tau3(twos(t))),sk=solve(p.pose,B_AL,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'far top corner')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: a slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-8.4],[CUE(3,'last seconds'),-7],[CUE(3,'goalkeeper'),-3.8],[CUE(3,'help the team'),TJ-.25],[SECS(3)-.3,TG+.5]]),linear);
/** a tracking shot alongside his run up from his half (from the +z side), then the header from the side of the box */
function cam4v(t:number):Cam{
 const tau=tau4(t),a=at(AL,tau,1);
 return plan(t,[
  [0,0,()=>({P:add3(a,[1,4.4,15]),T:add3(a,[2.5,0,-.5]),fov:27})],
  [CUE(3,'goalkeeper')-.3,1.2,()=>({P:add3(a,[-.5,3.6,12]),T:add3(a,[3,.1,-1]),fov:29})],
  [CUE(3,'help the team')-.5,1.1,()=>({P:[-11,4,11],T:[-4.8,1.8,-.4],fov:31})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85*cov);
}
/** "the last seconds": a stadium clock face (no numbers) printed in the top corner of the frame, its red hand sweeping up to the top */
function clockFace(s:Sheet,g:number,sweep:number){
 if(g<=0)return;const x=-lerp(270,330,1-g)-120,y=-300,r=120*easeOutBack(clamp(g)),face=polyPath(blob(x,y,r,r,5,{amp:.03,n:32}),true);
 s.knockout(face);s.stroke(K,face,6,.9);s.tone(Y,face,.3);
 const ticks=new Path2D();for(let i=0;i<12;i++){const a=i/12*TAU-Math.PI/2,a0:Pt=[x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78],a1:Pt=[x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92];ticks.addPath(ribbon([a0,a1],i%3?5:9,{seed:i,taper:0,wobble:0}));}s.fill(K,ticks,.9);
 // the last slice before the top (the last minute) printed red; the hand sweeps into it
 const sl=new Path2D();sl.moveTo(x,y);for(let i=0;i<=8;i++){const a=-Math.PI/2-TAU/12+i/8*TAU/12;sl.lineTo(x+Math.cos(a)*r*.74,y+Math.sin(a)*r*.74);}sl.closePath();s.fill(R,sl,.7);
 const ha=-Math.PI/2-TAU/12*(1-sweep)-.9*(1-g);s.fill(K,ribbon([[x,y],[x+Math.cos(ha)*r*.8,y+Math.sin(ha)*r*.8]],10,{seed:3,taper:.6,wobble:0}),.95);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp4=tau4(tt-1/12);
  const tN=CUE(3,'Never give'),tL=CUE(3,'last seconds'),tK=CUE(3,'goalkeeper'),tH=CUE(3,'help the team'),E=SECS(3);
  stadium(s,c);
  ground(s,c);
  // "the goalkeeper can go up": his route up from his own half, a dashed yellow ribbon on the grass that grows behind him, ending in an arrow
  const rt=sm(.1,.6,t)*(1-sm(tH-.2,tH+.4,t));
  if(rt>0){const pts:V3[]=[],t1=Math.min(tau,TJ)-.12,n=16;for(let i=0;i<=n;i++){const u=1-Math.pow(1-i/n,2),[x,z]=posOf(AL,lerp(Math.max(T0,t1-4),t1,u));pts.push([x,.02,z]);}arrow3(s,c,pts,Math.max(12,kAt(c,at(AL,tau,0))*.3),Y,rt);}
  // "the goalkeeper": his yellow ring, following him in
  groundRing(s,c,at(AL,tau,0),1.3,Y,sm(tK-.1,tK+.35,t)*(1-sm(tH+.2,tH+.7,t)));
  const r=play(s,c,tau,tp4,{smear:true,min:11,lines:true,prevBall:tau4(t-.06)});
  // "help the team": the flick's arrow into the far top corner, printed over the net
  const hp=clamp((tau-TF)/(TG-TF))*(1-sm(E-.4,E-.1,t));
  if(hp>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*hp*i/8));arrow3(s,c,pts,Math.max(16,kAt(c,HEAD_PT)*.12),Y,.95);}
  // "Never give up": a burst over him; "the last seconds": the clock
  const ng=sm(tN,tN+.35,t)*(1-sm(tN+1.1,tN+1.6,t));if(ng>0){const q=pr(c,at(AL,tau,3));if(q)spark(s,q[0],q[1],170*ng,{n:12,seed:9,g:easeOutBack(ng),width:15});}
  clockFace(s,sm(tL-.25,tL+.25,t)*(1-sm(tK+.4,tK+.9,t)),sm(tL,tL+1.1,t,easeInOutSine));
  // the contact: a spark on the ball as he flicks it on
  const hit=(tau-TF)/.2;if(hit>0&&hit<1&&r.ball)spark(s,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:19,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:9});
 },
 get still(){return CUE(3,'help the team')+.4;},
};

const film:RisoStory={
 id:'alisson-header-2021',format:'11v11',title:"Alisson's last-second header",
 theme:'Never give up: in the last seconds even the goalkeeper can go up for a corner, find space and help the team',
 ageNote:'West Brom 1–2 Liverpool, Premier League, the Hawthorns, 16 May 2021. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little flick-on — a ball drops in on an arc, a yellow spark where it is met, and it skims on and up. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){spark(s,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x-170*(1-u):x+230*easeOut(out),by=age<.35?y-130*(1-u)*(1-u)-10:y-70*out;
  if(age>.3&&age<.65)spark(s,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0){if(age>.4)speedLines(s,K,bx,by,Math.atan2(-70,230),{n:3,seed:seed+2,len:100*fade,spread:24,width:5,cov:.8*fade});footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});}
 },
};
export default film;
/** Solved contact points (pitch metres; West Brom's goal line x = 0, +z = Liverpool's right) — checked by tests/play-film-alisson-header-2021.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,TJ,T0,ballAt,cornerFoot:'r' as const,
 trentContact:()=>{const st=stateOf(TAA,0),sk=solve(st.pose,B_TAA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 alissonAt:(tau:number)=>{const st=stateOf(AL,tau),sk=solve(st.pose,B_AL,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis,x:st.place.x??0,z:st.place.z??0};},
 johnstoneAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_JOH,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 /** the nearest West Brom player to Alisson (ground distance, m) — "nobody follows him" */
 nearestDefender:(tau:number)=>{const[ax,az]=posOf(AL,tau);let d=1e9;ACTORS.forEach((a,k)=>{if(a.role==='wba'||a.role==='mark'){const[x,z]=posOf(k,tau);d=Math.min(d,Math.hypot(x-ax,z-az));}});return d;}};
