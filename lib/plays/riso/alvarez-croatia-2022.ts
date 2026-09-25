/** Julián Álvarez v Croatia — World Cup semi-final, Argentina 3–0 Croatia, Lusail Stadium, Qatar, 13 December 2022: his first goal of
 * the night, Argentina's second (39'), the charging run from near halfway on a counter-attack, helped on by two lucky bounces off Croatian
 * defenders. An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (we cannot watch the footage),
 * printed as a riso sheet.
 *
 * SOURCES (what the choreography and kit follow; cached under scratchpad/films/src-cache, read 23 Sep 2026):
 *  - FIFA Training Centre, "Post Match Summary Report — Semi-final — Argentina v Croatia" (official event data)
 *    https://www.fifatrainingcentre.com/media/native/world-cup-2022/report_128080.pdf
 *  - BBC Sport, Phil McNulty, "Argentina 3–0 Croatia: Messi and Alvarez put their side into World Cup final" (13 Dec 2022)
 *    https://www.bbc.com/sport/football/63868610
 *  - The Guardian, match report "Argentina v Croatia, World Cup semi-final" (13 Dec 2022)
 *    https://www.theguardian.com/football/2022/dec/13/argentina-croatia-world-cup-semi-final-match-report
 *  - Wikipedia, "2022 FIFA World Cup knockout stage" (raw wikitext: result, time, venue, line-ups and numbers, the match kit template)
 *    https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_knockout_stage
 *  - Wikipedia (es), "Final de la Copa Mundial de Fútbol de 2022" (Argentina's black shorts with this kit, for the final)
 * CONFIRMED by those accounts: 13 December 2022, Lusail Stadium, attendance 88,966, a 22:00 local kick-off (night, under the lights);
 * referee Daniele Orsato; Messi had scored a penalty (34') for 1–0; the goal came in the 39th minute (FIFA event data: 38', Álvarez,
 * "On Target – Goal", RIGHT FOOT, from a "Loose Ball") for 2–0; Croatia were caught on a quick transition after Argentina cleared a Croatia
 * corner; Messi got to the ball before Marcelo Brozović and HEADED it on to Álvarez (BBC); Álvarez "picked up possession just before
 * halfway" (Guardian; the BBC says just inside Croatia territory) and "bulldozed through" on a "slaloming run", "aided by fortunate bounces
 * off Josip Juranović and Borna Sosa" (BBC); decoy runs by Rodrigo De Paul and Nahuel Molina helped (Guardian); he dropped his shoulder on
 * the edge of the area and got a break off Juranović; Sosa could not adjust his feet and missed the attempted clearance; a close-range
 * finish past goalkeeper Dominik Livaković. Numbers: Álvarez 9, Messi 10, De Paul 7, Molina 26, Enzo Fernández 24, Mac Allister 20;
 * Croatia: Livaković 1, Juranović 22, Lovren 6, Gvardiol 20, Sosa 19, Brozović 11, Modrić 10, Kovačić 8, Kramarić 9. Álvarez is 1.70 m.
 * KIT: Argentina in the sky-blue and white striped home shirt; Croatia in their NAVY away kit (Wikipedia kit template: navy shirt, shorts
 * and socks).
 * INFERRED (illustrative, kept out of the narration): Argentina's shorts (drawn black = navy, as in the final film; the English Wikipedia
 * template shows white for both the semi and the final and is contradicted for the final, so it is not trusted here) and white socks;
 * Livaković's keeper kit (drawn yellow) and the referee's (drawn black); the corner and clearance are only the pre-roll; every position and
 * timing between the beats; that the centre-backs Lovren and Gvardiol were still upfield from the corner and chase back (it explains the
 * space the accounts describe, but no account says so); which way the shoulder dropped; exactly how each bounce went (drawn: Juranović's
 * lunging boot knocks it on, then it bounces off Sosa's missed clearance back into Álvarez's path); the shot spot (drawn about 9 m out),
 * which side it went in and Livaković's dive; the celebration; the other players' positions; the direction of play on screen; the Lusail
 * bowl (two tiers, roof ring, floodlight band), crowd colours, LED boards; the Al Hilm ball print (the semi-final/final ball); cameras.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; NEVER top-down): 1 = live, the high main-stand
 * camera, near real time, panning with the ball from Messi's header to the net; 2 = slow-motion replay from a low touchline camera just
 * ahead of the play: Juranović's lunge and the first bounce, Sosa's missed clearance and the second bounce (a spark on each bounce, the
 * ball's path printed on the grass); 3 = replay from behind the goal: the right-foot finish past Livaković, then up to the roaring crowd;
 * 4 = the lesson from a low front camera on the run (drive forward arrow, a strong base and chest over the ball, the tackle meeting
 * nothing, keep going). All figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer().
 * Scenes read only (t); every action keys off cue times, so the recorded voice (withTiming) re-times the film; every random value is
 * seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it) and its cue words. `tail` = silence after the last word (the action finishes and the .65 s passage
 * plays in it). Cue words must stay substrings, in order; withTiming matches a cue by its FIRST word, in order. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The run, live',text:"Qatar, 2022, the World Cup semi-final. Messi heads it on, and Julián Álvarez is off, from near halfway! He charges at Croatia's defenders... and he scores!",tail:2.6,
  cues:['Qatar','the World Cup semi-final','Messi heads','Julián Álvarez','from near halfway','He charges','he scores']},
 {label:'Lucky bounces',text:'Watch again, slowly. Juranović tackles, but the ball bounces off him and runs on. Sosa tries to clear it, and it bounces back to Álvarez!',tail:1.4,
  cues:['Watch again','slowly','Juranović tackles','bounces off him','Sosa tries','bounces back']},
 {label:'The finish',text:'Right foot, close range, past Livaković. Two-nil to Argentina! They went on to reach the final.',tail:2,
  cues:['Right foot','close range','past Livaković','Two-nil','They went on']},
 {label:'Your turn',text:'Your turn: when you have space, drive forward with the ball. Stay strong when tackles come in, and keep going until the end!',tail:1.9,
  cues:['Your turn','drive forward','Stay strong','tackles come in','keep going']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py alvarez-croatia-2022 writes timing.json next to script.json).
 * Then add `import timingJson from '../../../public/plays/narration/alvarez-croatia-2022/timing.json'` and set VOICE to
 * `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * (tests/play-film-alvarez-croatia-2022.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/alvarez-croatia-2022/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the voiced films, ≈ 2.4 words/s incl. pauses): .19 s + .021 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.19+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.18;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('alvarez: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('alvarez: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced to increase in time (a real voice can crowd authored offsets; a camera can never reorder) */
function mono(K0:[number,number][]):[number,number][]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,k[1]];});}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Argentina attack +X, Croatia's goal line at X = 105, the right of the
 * main camera), Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right at
 * +Z, so Álvarez's right boot is on the near side as he runs. */
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
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
function quadP(c:Cam,q:V3[],minDepth=18):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Lusail at night: a round bowl, two tiers, the roof ring and its floodlight band
const CX=52.5,NS=64;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.55),y,(43+d)*Math.sign(s)*Math.pow(Math.abs(s),.55)];}
const LOW=(b:number):[number,number]=>[2+22*b,1.6+12*b],UP=(b:number):[number,number]=>[25+22*b,16.5+17*b];
type Bowl={low:V3[][];up:V3[][];roof:V3[][];band:V3[][];seats:{P:V3;h:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],roof:[],band:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(f:(u:number)=>[number,number],u0:number,u1:number):V3[]=>{const[d0,y0]=f(u0),[d1,y1]=f(u1);return[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];};
  o.low.push(Q(LOW,0,1));o.up.push(Q(UP,0,1));
  o.roof.push([rim(a,44,36),rim(b,44,36),rim(b,70,40),rim(a,70,40)]);
  o.band.push([rim(a,44,34.4),rim(b,44,34.4),rim(b,44,36.2),rim(a,44,36.2)]);
  o.lamps.push(rim(a+.5/NS*TAU,44,35.3));
  for(const [f,rows] of [[LOW,9],[UP,8]] as [(u:number)=>[number,number],number][])for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+rows*500,17);if(h<.12)continue;
   const[d,y]=f((r+.5)/rows);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** the night sky, the bowl, the crowd (roar lifts the marks; flash = phone lights and camera flashes) */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 s.fill(K,rectPath(-1e4,-1e4,2e4,2e4),.92);s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.3);
 const low=new Path2D(),up=new Path2D(),roof=new Path2D(),band=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(BOWL.low[i],low);add(BOWL.up[i],up);add(BOWL.roof[i],roof);add(BOWL.band[i],band);}
 s.knockout(low,.8);s.tone(B,low,.5);s.tone(K,low,.3);
 s.knockout(up,.8);s.tone(B,up,.45);s.tone(K,up,.45);
 // the crowd: Argentina's sky blue and white fill most of the bowl, some gold, Croatia's red-and-white checks in a corner of red marks
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<18)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.4*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.42?0:q.h<.72?1:q.h<.8?2:q.h<.91?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.8);s.fill(B,inks[1],.6);s.fill(Y,inks[2],.85);s.fill(R,inks[3],.8);s.fill(K,inks[4],.7);
 s.knockout(roof);s.tone(K,roof,.7);s.tone(B,roof,.5);
 s.knockout(band);s.fill(Y,band,.55);
 const lamps=new Path2D();for(const L of BOWL.lamps){const d=toCam(c,L);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=clamp(c.F*.9/d[2],3,16);lamps.addPath(polyPath(blob(g[0],g[1],z,z*.55,3,{amp:.05,n:10}),true));}
 s.knockout(lamps);
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<16;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<18)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** grass under floodlights (yellow × blue, a navy night screen) with mowing stripes, LED boards, paper lines, both goals (the Croatia goal at
 * X = 105 is drawn later when the camera sits behind it) */
function ground(s:Sheet,c:Cam,o:{goalLater?:boolean;bulge?:number}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(B,p,.5);s.tone(K,p,.35);}
 const g=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.84);s.tone(K,gp,.1);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-38],[(k+1)*5.25,0,-38],[(k+1)*5.25,0,38],[k*5.25,0,38]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D();
 for(const q of [polyP(c,[[-4,0,-37],[109,0,-37],[109,.9,-37],[-4,.9,-37]]),polyP(c,[[108.5,0,-36],[108.5,0,36],[108.5,.9,36],[108.5,.9,-36]]),polyP(c,[[-3.5,0,36],[-3.5,0,-36],[-3.5,.9,-36],[-3.5,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.95],[x+3.4,.25,-36.95],[x+3.4,.65,-36.95],[x,.65,-36.95]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[108.45,.25,z],[108.45,.25,z+3.4],[108.45,.65,z+3.4],[108.45,.65,z]]);if(q.length>2)pn.addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(R,bd,.9);s.tone(K,bd,.2);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,NET[2]);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around bz */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z),1.9,z] as V3),[back(z0),1.9,z0]],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.32);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z),1.9,z],.025,mesh);seg3(c,[back(z),1.9,z],[back(z),0,z],.025,mesh);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za),y,za],[back(zb),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.3]];
/** Argentina: sky-blue (blue screen) and white stripes (confirmed); black shorts (navy) and white socks (inferred, as in the final film) */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_M,hair:K,hairStyle:'short',line:K,numberInk:K,seed:3,...o});
/** Croatia: the navy away kit — shirt, shorts and socks (confirmed by the kit template); a sky-blue trim and white numbers (inferred) */
const CRO=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:K,trim:[B,.7],skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:5,...o});
/** Julián Álvarez, 1.70 m, No. 9, dark short hair */
const JA:AthleteStyle=ARG({number:9,skin:SKIN_M,hair:[K,.95],build:{height:1.7,bulk:1.02,thighs:1.08},seed:9});
/** Dominik Livaković, No. 1 — keeper kit colours INFERRED (drawn yellow), paper gloves */
const LIVA:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,trim:K,skin:SKIN_L,hair:[K,.9],hairStyle:'short',line:K,shade:[R,.3],gloves:'paper',sleeves:'long',number:1,numberInk:K,build:{height:1.88},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.9],hairStyle:'bald',line:K,seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds from Álvarez's first touch)
type Role='ja'|'arg'|'cro'|'gk'|'ref';
type Move={kind:'lunge'|'clear'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** the beats: Messi's header, Álvarez's first touch (τ 0), Juranović's lunge (first bounce), Sosa's missed clearance (second bounce), the shot */
const T_HEAD=-1.35,R1=5.02,R2=5.58,SHOT=6.22,IN_NET=SHOT+.3;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. Juranović and Sosa get the beats the accounts give them; the spots are inferred. */
const ACTORS:Actor[]=[
 {name:'Álvarez',role:'ja',style:JA,key:true,keys:[[-3.5,46.2,6.4],[-2,47.4,4.6],[-1,48.4,3.4],[0,49.2,2.8],[.6,51.9,2.6],[1.5,58.2,2.4],[2.5,65.6,2.2],[3.5,73,1.9],[4.3,78.9,1.6],[4.8,82.5,1.9],[5.1,84.6,1.5],[5.5,87.4,1.1],[5.9,90.8,.9],[6.22,93.3,.6],[6.6,95.4,.8],[7.3,97.4,2.6],[8.5,99.3,8],[10,100.6,15],[12,101.2,22]]},
 {name:'Messi',role:'arg',style:ARG({number:10,build:{height:1.7},seed:30}),key:true,keys:[[-3.5,41.4,-1.8],[T_HEAD,43.7,-1.4],[0,45.4,-.6],[3,57,-3.2],[7,75,-4],[12,88,2]]},
 {name:'Juranović',role:'cro',style:CRO({number:22,seed:22}),key:true,engage:[3.6,5.3],moves:[{kind:'lunge',at:R1,dur:.8,side:'r'}],keys:[[-3.5,71,-10],[1,76.5,-7],[3,80.8,-4.2],[4.3,83.4,-2],[4.8,84.8,-1],[5.1,85.6,-.4],[5.5,86.2,-.1],[7,88.5,.4],[12,93,1.5]]},
 {name:'Sosa',role:'cro',style:CRO({number:19,hair:[K,.8],build:{height:1.86},seed:19}),key:true,engage:[3.8,5.9],moves:[{kind:'clear',at:R2,dur:1,side:'l'}],keys:[[-3.5,77,9],[2,83,6.4],[4,87.6,4],[5,90.3,2.6],[5.58,91.9,2],[6,92.3,1.9],[7,93.2,2.4],[12,96,4]]},
 {name:'Livaković',role:'gk',style:LIVA,key:true,moves:[{kind:'dive',at:SHOT+.18,dur:.85,side:'r'}],keys:[[-3.5,103.2,0],[3,102.4,.6],[5.4,101.2,.8],[6.1,100.6,.8],[12,100.6,.8]]},
 {name:'Brozović',role:'cro',style:CRO({number:11,seed:11}),keys:[[-3.5,46.8,-3.4],[T_HEAD,44.8,-2.2],[0,45.8,-1.5],[3,53,.2],[7,63,1],[12,72,2]]},
 {name:'De Paul',role:'arg',style:ARG({number:7,hairStyle:'long',seed:7}),keys:[[-3.5,43,11],[0,49,11.5],[3,68,10.5],[5,82,9.2],[6.5,90,8.4],[12,97,12]]},
 {name:'Molina',role:'arg',style:ARG({number:26,hairStyle:'long',seed:26}),keys:[[-3.5,36,22],[0,44,22.5],[3,63,21],[5,79,19],[7,89,17],[12,95,16]]},
 {name:'Modrić',role:'cro',style:CRO({number:10,hairStyle:'long',hair:[Y,.55],seed:10}),keys:[[-3.5,54,7],[2,60,5],[7,75,4],[12,85,3]]},
 {name:'Lovren',role:'cro',style:CRO({number:6,build:{height:1.88},seed:6}),keys:[[-3.5,24,1],[0,31,1],[6,62,0],[12,80,1]]},
 {name:'Gvardiol',role:'cro',style:CRO({number:20,build:{height:1.85},seed:20}),keys:[[-3.5,21,-5],[0,29,-4],[6,59,-2.5],[12,78,-1]]},
 {name:'Kovačić',role:'cro',style:CRO({number:8,seed:8}),keys:[[-3.5,51,-10],[3,60,-7],[12,78,-4]]},
 {name:'Enzo',role:'arg',style:ARG({number:24,hairStyle:'long',seed:24}),keys:[[-3.5,37,-6],[6,58,-5],[12,70,-3]]},
 {name:'Mac Allister',role:'arg',style:ARG({number:20,seed:20}),keys:[[-3.5,39,-15],[6,62,-12],[12,74,-9]]},
 {name:'Kramarić',role:'cro',style:CRO({number:9,seed:31}),keys:[[-3.5,30,-9],[6,50,-7],[12,66,-5]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3.5,40,-12],[6,68,-10],[12,82,-8]]},
];
const JA_I=0,MESSI=1,JUR=2,SOSA=3,LIV=4;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3.5,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: the clearance, Messi's header, right-foot touches, two bounces, the finish
/** his carrying stride: one right-foot touch per cycle of CYC metres (a long, driving carry at full speed) */
const CYC=3.6;
const yawJA=(tau:number)=>{const v=velOf(JA_I,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):yawOf(1,-.3);};
/** ball spot for his right foot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(JA_I,tau),y=yawJA(tau),f:Pt=[Math.cos(y),-Math.sin(y)],r:Pt=[Math.sin(y),Math.cos(y)];return[p[0]+f[0]*.55+r[0]*.12,p[1]+f[1]*.55+r[1]*.12];};
/** the touches: every stride from the first touch until the shoulder drop (the last one, pushed a little further, runs into Juranović) */
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=distOf(JA_I,0)/CYC-touchPhase;
 for(let tau=DT;tau<R1-.45;tau+=DT){const ph=distOf(JA_I,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3)out.push(tau);prev=ph;}
 return out;})();
const TP=TOUCHES.map(footAt);
const CLEAR:V3=[27,.4,-3.5];
const HEAD1:V3=(()=>{const[x,z]=posOf(MESSI,T_HEAD);return[x+.25,1.78,z];})();
/** the first bounce: where Juranović's lunging boot meets the ball; the second: off Sosa's missed clearance; the shot spot */
const HIT1:V3=(()=>{const[x,z]=posOf(JUR,R1);return[x+.1,.11,z+.95];})();
const HIT2:V3=(()=>{const[x,z]=posOf(SOSA,R2);return[x-.2,.16,z-.62];})();
const SHOT_FROM:V3=[94.1,.11,.72];
const NET:V3=[105.35,.42,-1.9],REST:V3=[106.2,.11,-1.7];
const hop=(a:V3,b:V3,u:number,h:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*h*u*(1-u),lerp(a[2],b[2],u)];
function ballAt(tau:number):V3{
 if(tau<T_HEAD)return hop(CLEAR,HEAD1,sm(T0,T_HEAD,tau,linear),7.5);
 const f0=footAt(0);
 if(tau<0)return hop(HEAD1,[f0[0],.11,f0[1]],sm(T_HEAD,0,tau,linear),.9);
 const last=TOUCHES[TOUCHES.length-1];
 if(tau<last){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const tl=TP[TP.length-1];
 if(tau<R1){const u=(tau-last)/(R1-last),e=1-(1-u)*(1-u)*.6;return[lerp(tl[0],HIT1[0],e),.11,lerp(tl[1],HIT1[2],e)];}
 if(tau<R2)return hop(HIT1,HIT2,sm(R1,R2,tau,linear),.38);
 if(tau<SHOT)return hop(HIT2,SHOT_FROM,sm(R2,SHOT,tau,linear),.55);
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(SHOT_FROM[0],NET[0],u),lerp(.11,NET[1],u)+.25*Math.sin(Math.PI*u),lerp(SHOT_FROM[2],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.45),e=1-(1-u)*(1-u);return lerp3(NET,REST,e);
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (degrees via posed; athlete.ts clamps to real range of motion)
const RAD=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:30,rHipF:28,lKnee:40,rKnee:38,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lShF:12,rShF:12,lElb:44,rElb:44,neckP:-6});
/** the drive: chest over the ball, head up, arms working wide for balance (a strong carrying posture) */
const DRIVE:Partial<Pose>={lean:22,pitch:10,neckP:6,lShA:34,rShA:30};
/** the shoulder drop on the edge of the area: body dipped and tilted to his left, the far arm out (direction inferred) */
const DROP:Partial<Pose>={roll:-12,bend:-12,lean:26,lKnee:62,rKnee:56,lShA:30,rShA:78,neckY:-12,squash:-.06};
/** receiving Messi's header: open, eyes up on the dropping ball */
const RECEIVE:Partial<Pose>={lean:6,neckP:-24,lShA:40,rShA:40,lElb:40,rElb:40};
/** Sosa's missed clearance: the swing whips through, the standing leg buckles */
const MISS:Partial<Pose>={roll:14,bend:10,lean:4,rKnee:74,rShA:76,lShA:40,neckP:24};
/** Álvarez's right boot meets the ball at the shot: his body is nudged so the solved toe lands on SHOT_FROM */
const SHOT_D=.78;
let _shift:[number,number]|null=null;
function jaShift():[number,number]{if(_shift)return _shift;const[x,z]=posOf(JA_I,SHOT),yaw=yawOf(NET[0]-SHOT_FROM[0],NET[2]-SHOT_FROM[2])+.12,sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),JA.build,{x,z,yaw});
 return _shift=[SHOT_FROM[0]-lerp(sk.rToe[0],sk.rAn[0],.35),SHOT_FROM[2]-lerp(sk.rToe[2],sk.rAn[2],.35)];}
function placeOf(k:number,tau:number,yaw:number):Place{const[x,z]=posOf(k,tau);if(k===JA_I){const d=jaShift(),w=sm(SHOT-.7,SHOT-.25,tau)*(1-sm(SHOT+.5,SHOT+1.1,tau));return{x:x+d[0]*w,z:z+d[1]*w,yaw};}return{x,z,yaw};}
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(JA_I,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.3):a.role==='cro'?READY:stand();
 if(k===JA_I){
  yaw=yawJA(tau);
  if(tau>SHOT-.7&&tau<SHOT+.6)yaw=lerpA(yaw,yawOf(NET[0]-SHOT_FROM[0],NET[2]-SHOT_FROM[2])+.12,sm(SHOT-.7,SHOT-.3,tau)*(1-sm(SHOT+.2,SHOT+.6,tau)));
  // a driving carry the whole way: right-foot touches, running strides between the bounces, chest over the ball
  const s=clamp((sp-2)/5),dr=dribble(distOf(JA_I,tau)/CYC,{foot:'r',speed:.55+.4*s}),run=runCycle(distOf(JA_I,tau)/3.9,{speed:.85});
  p=blendPose(stand(),blendPose(dr,run,sm(R1-.3,R1,tau)),clamp((sp-.3)/.8));
  p=over(p,DRIVE,sm(.4,1,tau)*(1-sm(SHOT-.6,SHOT-.3,tau))*.8);
  if(tau<.35)p=over(p,RECEIVE,bump(-1.2,.35,tau));
  p=over(p,DROP,bump(4.6,5.3,tau));
  const u=(tau-(SHOT-STRIKE_CONTACT*SHOT_D))/SHOT_D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.5)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.5,IN_NET+1,tau));
  return{p,yaw};}
 if(a.role==='cro'&&sp>.5&&Math.cos(yawOf(v[0],v[1])-yaw)<-.3)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:mv.kind==='clear'?STRIKE_CONTACT:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='clear'&&u>0&&u<1.5){p=blendPose(p,strike(Math.min(1,u),{foot:mv.side,power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.5,u)));p=over(p,MISS,bump(.5,1.3,u));}
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:.12});}}
 if(k===LIV&&tau<SHOT-.1)p=blendPose(p,runCycle(tau*1.6,{speed:.3}),bump(2.8,5.8,tau)*.6);
 if(k===MESSI&&Math.abs(tau-T_HEAD)<.6)p=over(p,{neckP:-40,lean:-6,air:.18,lShA:60,rShA:60,lElb:60,rElb:60,lKnee:60,rKnee:40},bump(T_HEAD-.5,T_HEAD+.45,tau));
 if(a.role==='arg'&&k!==JA_I&&tau>IN_NET+.4)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.4,IN_NET+.9,tau));
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: Al Hilm (paper, gold triads, navy key)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),tri=(cx:number,cy:number,pr0:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr0,cy+Math.sin(a)*pr0],[cx+Math.cos(b)*pr0*.45,cy+Math.sin(b)*pr0*.45]);}return polyPath(q,true);};
 pan.addPath(tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot));
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;pan.addPath(tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a));}
 s.fill(Y,pan,.95);s.fill(R,pan,.3);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const pl=placeOf(k,tau,0),x=pl.x!,z=pl.z!,q=toCam(c,[x,.9,z]);if(q[2]<1.2)return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlights: soft, short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],px=e.h*ppu,big=e.h>=300;
  const q=poseOf(e.k,tauP),qp=poseOf(e.k,tauPrev),place={...placeOf(e.k,tauP,q.yaw),x:e.x,z:e.z},prevPlace=placeOf(e.k,tauPrev,qp.yaw);
  // phone heat: low detail for small figures and extras; during a passage only Álvarez keeps 'mid'
  const detail=passing?(e.k===JA_I?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const fast=(e.k===JA_I&&((tauP>4.6&&tauP<5.3)||(tauP>SHOT-.4&&tauP<SHOT+.3)))||(e.k===LIV&&tauP>SHOT&&tauP<SHOT+.7)||(e.k===JUR&&tauP>R1-.3&&tauP<R1+.2)||(e.k===SOSA&&tauP>R2-.3&&tauP<R2+.2);
  const r=drawPlayer(s,q.p,c,{...a.style,shadow:e.h<420?false:undefined,detail},place,big&&!passing?{prev:qp.p,prevPlace,smear:hero&&fast}:{});
  if(e.k===JA_I)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
/** a spark where the ball bounces off a defender (age = τ since the bounce) */
function bounceSpark(s:Sheet,c:Cam,P:V3,age:number,seed:number,span=.35){if(age<-.02||age>span)return;const q=pr(c,[P[0],P[1]+.1,P[2]]);if(!q)return;const d=toCam(c,P)[2];
 sparkBurst(s,Y,q[0],q[1],c.F*.6/d,{n:9,seed,g:easeOutBack(clamp((age+.02)/.08))*(1-clamp((age-span*.6)/(span*.4))),width:Math.max(6,c.F*.045/d)});}
/** the ball's path on the grass from τ a to τ b (orange ribbon, drawn up to progress w) with a ring at each bounce */
function pathMarks(s:Sheet,c:Cam,a:number,b:number,w:number,rings:number){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(let i=0;i<=24;i++){const tau=lerp(a,b,i/24*w),p=ballAt(tau),q=toCam(c,[p[0],.02,p[2]]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<3)return;const wd=c.F*.1/d;s.knockout(ribbon(pts,wd*1.7,{seed:61,taper:.1,wobble:.8}),.75);s.fill(R,ribbon(pts,wd,{seed:61,taper:.1,wobble:.8}),.95);
 if(rings>0)for(const [P,i] of [[HIT1,0],[HIT2,1]] as [V3,number][]){const tt=i?R2:R1;if(lerp(a,b,w)<tt)continue;const ring:Pt[]=[];for(let j=0;j<30;j++){const q=pr(c,[P[0]+Math.cos(j/30*TAU)*.55,.02,P[2]+Math.sin(j/30*TAU)*.55]);if(q)ring.push(q);}
  if(ring.length>24){const dd=toCam(c,P)[2],rr=ribbon(ring,c.F*.07/dd,{close:true,seed:70+i,taper:0,wobble:1});s.knockout(rr,.85*rings);s.fill(Y,rr,.95*rings);}}}
/** a ground arrow ahead of Álvarez along his run (yellow): "drive forward" / "keep going" */
function driveArrow(s:Sheet,c:Cam,tau:number,len:number,w:number,seed:number){if(w<=0)return;const[x,z]=posOf(JA_I,tau),y=yawJA(tau),f:Pt=[Math.cos(y),-Math.sin(y)];
 const a=pr(c,[x+f[0]*.9,.02,z+f[1]*.9]),b=pr(c,[x+f[0]*(.9+len),.02,z+f[1]*(.9+len)]);if(!a||!b)return;const d=toCam(c,[x,0,z])[2],wd=c.F*.16/d;
 s.knockout(ribbon([a,b],wd*1.6,{seed,taper:.1}),.8*w);laneArrow(s,Y,a,b,wd,{progress:w,seed:seed+1,head:wd*3});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const mh=CUEW(0,'Messi heads'),ja=CUEW(0,'Julián'),nh=CUEW(0,'from near'),hc=CUEW(0,'He charges'),hs=CUEW(0,'he scores'),S=SECS(0);
 return key(t,mono([[0,T0+.3],[mh,T_HEAD+.05],[ja,.25],[nh,1.1],[hc,3.2],[hs,IN_NET-.05],[S+1,IN_NET-.05+(S+1-hs)]]),linear);};
const CAM1:V3=[62,24,70];
function cam1(t:number):Cam{
 const tau=tau1(t),hs=CUEW(0,'he scores'),bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,1.1,(b0[2]+b1[2]+b2[2])/3*.7];
 const open:V3=[48,6,-6],toBall=sm(0,CUEW(0,'Messi heads')-.2,t,easeInOutSine),m=posOf(JA_I,tau),cel:V3=[m[0]-2,1.1,m[1]],toJ=sm(hs+.6,hs+1.8,t,easeInOutSine);
 const T=lerp3(lerp3(open,bt,toBall),cel,toJ);
 const F=key(t,[[0,1500],[CUEW(0,'Messi heads')-.2,6200],[CUEW(0,'from near'),6800],[CUEW(0,'He charges'),7000],[hs,7400],[hs+1.8,9000],[SECS(0),9400]],easeInOutSine);
 return look(CAM1,T,F);}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t));
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.5,tau),flash:sm(IN_NET+.1,IN_NET+.4,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(JA_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, a low touchline camera just ahead of the play: the two bounces
const tau2=(t:number)=>{const jt=CUEW(1,'Juranović'),bo=CUEW(1,'bounces off'),st=CUEW(1,'Sosa'),bb=CUEW(1,'bounces back'),S=SECS(1);
 return key(t,mono([[0,3.7],[CUEW(1,'slowly'),4.1],[jt,4.62],[bo,R1+.05],[bo+.9,R1+.3],[st,R2-.22],[bb,R2+.08],[bb+1.1,SHOT-.12],[S,SHOT-.02]]),linear);};
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(JA_I,tau),push=sm(CUEW(1,'Juranović')-.4,CUEW(1,'bounces off'),t,easeInOutSine),open=1-sm(0,1.2,t,easeInOutSine);
 const C:V3=[m[0]+11+2*open,1.6+.4*open,m[1]+7.5+2.5*open-1*push],T:V3=[m[0]+2,.8,m[1]-.8];
 return look(C,T,2700+500*push-400*open);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),bo=CUEW(1,'bounces off'),bb=CUEW(1,'bounces back'),S=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  // the ball's path printed on the grass as it goes: from the last touch, off Juranović, off Sosa, back to Álvarez
  pathMarks(s,c,R1-.4,Math.max(R1-.4,Math.min(tau,SHOT-.02)),sm(bo-.3,bo,t)*(1-sm(S-.9,S-.5,t)),sm(bo,bo+.3,t)*(1-sm(S-.9,S-.5,t)));
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,after:()=>{
   // a spark on each lucky bounce, keyed to "bounces off him" / "bounces back"
   bounceSpark(s,c,HIT1,tau-R1,83,.45);bounceSpark(s,c,HIT2,tau-R2,84,.45);
   // "bounces back to Álvarez": a yellow ring pops round him as the ball returns to his feet
   const rw=sm(bb+.2,bb+.6,t,easeOutBack)*(1-sm(S-.9,S-.5,t));
   if(rw>0){const[x,z]=posOf(JA_I,tau),pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*.9*rw,.02,z+Math.sin(i/36*TAU)*.7*rw]);if(q)pts.push(q);}
    if(pts.length>30){const rr=ribbon(pts,c.F*.06/toCam(c,[x,0,z])[2],{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9);s.fill(Y,rr,.95);}}}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the right-foot finish, then the crowd
const tau3=(t:number)=>{const rf=CUEW(2,'Right foot'),cr=CUEW(2,'close range'),pl=CUEW(2,'past Liv'),tn=CUEW(2,'Two-nil'),S=SECS(2);
 return key(t,mono([[0,SHOT-.95],[rf,SHOT-.2],[cr,SHOT-.02],[pl,SHOT+.12],[pl+.6,IN_NET+.05],[tn,IN_NET+.5],[S,IN_NET+.5+(S-tn)*.85]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'Two-nil')-.2,CUEW(2,'They went')+.6,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(JA_I,tau),u=swing3(t),rf=sm(CUEW(2,'Right foot')-.4,CUEW(2,'close range'),t,easeInOutSine);
 const C0:V3=[118,5.2-1.4*rf,-4.5],T0:V3=[lerp(97,95,rf),lerp(1.2,.7,rf),lerp(-.4,.4,rf)];
 const C1:V3=[m[0]-8,2.6,m[1]-7.5],T1:V3=[m[0]+.8,2.2,m[1]+2.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(3600+1500*rf,2600,u));}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),rf=CUEW(2,'Right foot'),tn=CUEW(2,'Two-nil'),tw=CUEW(2,'They went'),u=swing3(t),S=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(tn-.2,tn+.3,t)});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "Right foot": a ring round his right boot as it swings through
   const lw=sm(rf-.1,rf+.25,t,easeOutBack)*(1-sm(CUEW(2,'past Liv')-.1,CUEW(2,'past Liv')+.3,t));
   if(hero&&lw>0){const toe=hero.joints.rToe,an=hero.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3*lw+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*.85]);}
    s.knockout(ribbon(pts,Math.max(5,r*.3),{seed:82,close:true,taper:0,wobble:.8}),.8*lw);s.fill(R,ribbon(pts,Math.max(3,r*.18),{seed:82,close:true,taper:0,wobble:.8}),.95*lw);}}});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2]);
  // "They went on to reach the final": sky-blue and white paper ribbons over the frame
  const cw=sm(tw-.1,tw+.5,t)*(1-sm(S-.5,S,t)*.3);if(cw>0){const fall=(t-tw)*240;confetti(s,[B,'paper',Y],[-v.hx,-v.hy-400+fall,2*v.hx,2*v.hy],Math.round(80*cw),71,{size:42,cov:.95});}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(JA_I,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.2/q[2]),12);},
 still:2.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low front camera on the run
const tau4=(t:number)=>{const S=SECS(3);return key(t,mono([[0,2.1],[CUEW(3,'Your'),2.2],[CUEW(3,'drive'),2.7],[CUEW(3,'Stay'),4.15],[CUEW(3,'tackles'),4.8],[CUEW(3,'keep going'),R1+.18],[S,R1+.75]]),linear);};
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(JA_I,tau),push=sm(CUEW(3,'Stay')-.4,CUEW(3,'Stay')+.5,t,easeInOutSine),back=sm(CUEW(3,'keep going')-.2,SECS(3),t,easeInOutSine);
 const C:V3=[m[0]+8.2+1.5*back,1.3+.3*back,m[1]+6.2-1.2*push+1.5*back],T:V3=[m[0]+.6,.85,m[1]-.2];
 return look(C,T,2900+600*push-300*back);}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),df=CUEW(3,'drive'),ss=CUEW(3,'Stay'),tc=CUEW(3,'tackles'),kg=CUEW(3,'keep going'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const m=posOf(JA_I,tau);
  // "drive forward": a long yellow arrow on the grass ahead of him
  driveArrow(s,c,tau,7,sm(df-.1,df+.5,t,easeOut)*(1-sm(ss-.3,ss,t)),41);
  // "Stay strong": an orange base under his feet (wide, steady)
  const bal=sm(ss-.1,ss+.35,t,easeOutBack)*(1-sm(kg-.2,kg+.2,t));
  if(bal>0){const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[m[0]+Math.cos(i/36*TAU)*.75*bal,0,m[1]+Math.sin(i/36*TAU)*.6*bal]);if(q)pts.push(q);}if(pts.length>30){const rr=ribbon(pts,c.F*.06/toCam(c,[m[0],0,m[1]])[2],{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9);s.fill(R,rr,.95);}}
  // "keep going": the arrow comes back, longer, through the bounce
  driveArrow(s,c,tau,9,sm(kg-.1,kg+.5,t,easeOut)*(1-sm(E-.8,E-.4,t)),45);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,after:({hero})=>{
   // "Stay strong": chest over the ball — a yellow arrow pressing down over his head and shoulders
   const sw=sm(ss+.05,ss+.45,t,easeOut)*(1-sm(tc-.1,tc+.2,t));
   if(hero&&sw>0){const h=hero.joints.head,n=hero.joints.neck,u=Math.hypot(h[0]-n[0],h[1]-n[1])*1.5+8,a:Pt=[h[0]+u*1.2,h[1]-u*4],b:Pt=[h[0]+u*.2,h[1]-u*1.4];s.knockout(ribbon([a,b],u*.75,{seed:71,taper:.1}),.85*sw);laneArrow(s,Y,a,b,u*.42,{progress:sw,seed:71,head:u*1.3});}
   // "tackles come in": the lunge meets the ball, a spark — and the ball runs on
   bounceSpark(s,c,HIT1,tau-R1,91,.5);
   // "keep going": speed lines stream off him
   const rw=sm(kg-.1,kg+.4,t)*(1-sm(E-.9,E-.3,t));
   if(rw>0){const q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+1,1,m[1]]);if(q&&q2){const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2];for(const k of[0,1,2])s.fill(K,ribbon([[q[0]-Math.cos(dir)*z*(.7+k*.3),q[1]-z*(.6-k*.5)],[q[0]-Math.cos(dir)*z*(1.8+k*.5),q[1]-z*(.6-k*.5)]],z*.05,{seed:9+k,taper:.9,wobble:.5}),.6*rw);}}}});
 },
 still:4.4,
};

const film:RisoStory={
 id:'alvarez-croatia-2022',format:'11v11',title:"Álvarez's charge through Croatia",theme:'Keep driving forward: a strong, determined run can carry the ball through tackles',
 ageNote:'World Cup semi-final, Argentina v Croatia, Lusail Stadium, Qatar, 13 December 2022. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flick of turf and a spark where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(R,b,.8*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
/** Solved contacts (pitch metres; Croatia's goal line at X = 105) — checked by the film test. */
export const FACTS={SHOT_FROM,HIT1,HIT2,SHOT,R1,R2,ballAt,jaRightToeAt:(tau:number)=>{const q=poseOf(JA_I,tau);return solve(q.p,JA.build,placeOf(JA_I,tau,q.yaw)).rToe;},
 posOf:(name:string,tau:number)=>posOf(ACTORS.findIndex(a=>a.name===name),tau)};
