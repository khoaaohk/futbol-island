/** Iconic-play film · Nílton Santos, "Signature: the full-back who attacks" — shown through one real, sourced moment: Brazil 3–0 Austria,
 * 1958 World Cup, Group 4, Rimnersvallen, Uddevalla (Sweden), 8 June 1958 (19:00 CET), early in the second half: Brazil's second goal.
 *
 * WHY THIS MOMENT: his entry in lib/town/iconicPlays.json is a trait (kind "signature": the attacking full-back, lesson "Defenders can attack
 * too: bring the ball forward when there is space"). FIFA's profile of him ("Brazil and Botafogo's pioneering wingback") names this goal as
 * the moment "the concept of the wingback was born": the left-back won a tackle in his own half, strode forward, laid the ball off to José
 * Altafini at the halfway line, did NOT go back, kept running and asking for the ball, and scored from the return pass. Every source that
 * tells the story adds the coach: Vicente Feola shouting at him to get back, then "Well done".
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - FIFA.com (archived 5 Mar 2016), "Brazil and Botafogo's pioneering wingback"
 *    https://web.archive.org/web/20160305155943/http://www.fifa.com/fifa-tournaments/players-coaches/people=44604/profile.html
 *    (fifa-nilton-santos-profile-archive.txt) — "The second half ... was four minutes old when, with the South Americans leading 1-0, Nilton
 *    Santos won a tackle in his own half and strode forward. Reaching the halfway line, he then laid the ball off to Jose Altafini ... instead
 *    of returning to his defensive position, Nilton Santos kept on going, advancing further and further into the Austrian half and asking
 *    for the ball as he went ... when the return pass came he was in a position to shoot and score the second goal in his side's 3-0 win."
 *    His own words: "Back then fullbacks were all but forbidden to cross the halfway line ... Feola was on the touchline shouting, 'Get back!
 *    Get back! He's crazy!' ... when I scored, he just looked at me and said, 'Well done.'"
 *  - Wikipedia, "1958 FIFA World Cup Group 4" (wiki-1958-wc-group-4.txt): date, 19:00 CET, Rimnersvallen, Uddevalla, 3–0 (Altafini 37',
 *    85'; Nílton Santos 50'), attendance 17,788, referee Maurice Guigue (France), line-ups with numbers, kit boxes.
 *  - Wikipedia, "Nílton Santos" (wiki-nilton-santos.txt) and pt.wikipedia "Nílton Santos" (ptwiki-nilton-santos.txt): pioneering attacking
 *    left-back; famous for this goal v Austria, dribbling up the field, "deixando doido o técnico Vicente Feola"; Feola kept insisting he
 *    retreat and was ignored until the goal was scored.
 *  - The Guardian, Brian Glanville, "Nilton Santos obituary" (28 Nov 2013) (guardian-nilton-santos-obit.txt): "tall, powerfully built,
 *    elegant", "always ready to surge forward and make use of his strong left foot"; "scored a superb goal against Austria".
 *  - Wikipedia, "Rimnersvallen" (wiki-rimnersvallen.txt): a multi-use stadium in Uddevalla, opened 1923.
 * CONFIRMED by those accounts: the match, date, venue, kick-off hour, referee; Brazil led 1–0 and this goal made it 2–0 early in the second
 * half (FIFA: 4 minutes in; Wikipedia: 50'); he won a tackle in his own half, strode forward, laid it off to Altafini (listed as Mazzola,
 * no. 18) at the halfway line, kept running forward asking for the ball, received the return pass and scored; Feola on the touchline
 * shouting "Get back!" and afterwards saying "Well done"; Nílton Santos was a left-back (no. 12 that day), tall and powerful with a strong
 * left foot. Kits (Wikipedia kit boxes for this match): Brazil yellow shirts with green collar and cuffs, light-blue shorts, white socks;
 * Austria white shirts, black shorts, black socks. Line-ups: Brazil Gilmar; De Sordi, Bellini, Orlando, Nílton Santos; Dino Sani, Didi;
 * Joel, Mazzola (Altafini), Dida, Zagallo. Austria Szanwald; Halla, Happel, Swoboda; Hanappi, Koller; Horak, Senekowitsch, Buzek, Körner,
 * Schleger.
 * INFERRED (illustrative, never narrated as fact): whose tackle he won (here Horak, Austria's right winger, on Brazil's left) and every
 * position, path, speed and timing in metres and seconds; which way Brazil attacked (right to left from the main stand, so his left flank is
 * the near side); where Altafini received and played the return; where he shot from (here about 21 m out, left of centre) and that he
 * shot with his LEFT foot (his strong foot; the narration never says which); the shot's height and corner (low, far post); Szanwald's
 * dive and dark jersey; the other players' runs (Zagallo cutting inside and taking Halla with him, which opens the wing); the celebration
 * and the jog back for the kick-off; where the bench stood and Feola's clothes, build and gestures (a dark jacket, cupped hands, clapping);
 * Rimnersvallen's shape (a cinder running track, low open terraces, the main stand under the camera, trees beyond the far terrace), the
 * weather (a bright, lightly clouded June evening), the crowd and flag colours, photographers behind the goal, skin screens and hair,
 * the brown 1950s leather ball, the cameras and lenses.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real
 * clock τ (seconds, τ = 0 the tackle). ch1 = the high main-stand newsreel camera, real time: Horak attacks, the tackle, the stride, the pass,
 * the run, the return, the goal (Feola small on the near touchline, shouting); ch2 = replay from a low rail camera on the track: the tackle,
 * over the halfway line, Feola big in the foreground shouting while Nílton runs on behind him; ch3 = replay from behind his run toward the
 * goal: the return pass, the shot, the net, then a whip-pan to the bench where Feola claps; ch4 = the duotone lesson (defenders can attack:
 * the space in front, bring it forward, pass, keep running, the ball comes back). Figures: lib/plays/riso/athlete.ts through ONE adapter,
 * drawPlayer(). Inks: yellow (Brazil, grass with blue), red (skin, leather, cinder track, Feola's shouts), blue (Brazil shorts, sky, grass),
 * navy (key line, Austria shorts). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,dribble,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.7 words/s plus sentence pauses (≈2.4 words/s overall, like the recorded Kokoro clips); replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.7+(/[.!?]['’]?$/.test(w)?.3:/[,;]$/.test(w)?.12:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`nilton film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py nilton-santos-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/nilton-santos-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/nilton-santos-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The run, live',"Sweden, 1958. Brazil lead Austria one-nil. Left-back Nílton Santos wins the ball in his own half, passes to Altafini, and keeps running. The ball comes back... he scores!",
  ['Sweden','1958','Brazil lead Austria','one-nil','Left-back Nílton Santos','wins the ball','in his own half','passes to Altafini','keeps running','The ball comes back','he scores']),
 prov('Get back!',"Watch again. Back then, full-backs rarely crossed halfway. Coach Feola shouted, 'Get back! Get back!' But Nílton kept running.",
  ['Watch again','Back then','full-backs','crossed halfway','Coach Feola','shouted','Get back!','Get back!','But Nílton','kept running']),
 prov('Well done',"The return pass... he shoots... goal! Two-nil. And Feola just said, 'Well done.'",
  ['The return pass','he shoots','goal','Two-nil','And Feola','just said','Well done']),
 prov('Your turn',"Your turn. Defenders can attack too! Space in front of you? Bring the ball forward, pass, and keep running!",
  ['Your turn','Defenders','attack too','Space in front of you','Bring the ball forward','pass','keep running']),
],VOICE);
/** cue onset by its words (nth repeat; throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string,nth=0)=>{const q=CHAPTERS[ch].cues.filter(c=>c.words===words)[nth];if(!q)throw new Error(`nilton film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Austria's goal line x = 0, the pitch runs to x = 105) =================
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
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
const circ3=(cx:number,cz:number,r:number,n=28):V3[]=>Array.from({length:n},(_,i)=>[cx+Math.cos(i/n*TAU)*r,.02,cz+Math.sin(i/n*TAU)*r] as V3);

// ================= Rimnersvallen, a June evening: pale sky, trees beyond the far terrace, low open terraces, a cinder track =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-9,.8,-47],[114,.8,-47],[114,8.5,-60],[-9,8.5,-60]],// far side: a long, low open terrace
 [[-14,.8,42],[-14,.8,-42],[-25,6.5,-42],[-25,6.5,42]],// behind Austria's goal
 [[114,.8,47],[-9,.8,47],[-9,11,62],[114,11,62]],// near side: the main stand under the camera
 [[119,.8,-42],[119,.8,42],[130,6.5,42],[130,6.5,-42]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper (summer shirts) / 1 navy (coats, hats) / 2 yellow / 3 red, phase] */
const CROWD=(()=>{const r=rng(1958),out:[number,number,number,number,number][]=[];[520,190,420,170].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r();out.push([st,r(),.05+r()*.9,c<.52?0:c<.8?1:c<.9?2:3,r()*TAU]);}});return out;})();
/** flag poles on the far terrace: Swedish (blue, yellow cross), Brazilian (green, yellow diamond), Austrian (red-white-red) */
const FLAGS:[V3,number][]=(()=>{const o:[V3,number][]=[];let i=0;for(let x=-4;x<=110;x+=12.5)o.push([[x,8.5,-60],[0,1,0,2][i++%4]]);for(let z=-36;z<=36;z+=18)o.push([[-25,6.5,z],z===0?1:0]);return o;})();
/** the tree line behind the far terrace (Uddevalla's wooded hills, inferred): [x, height, radius] */
const TREES:[number,number,number][]=(()=>{const r=rng(588),o:[number,number,number][]=[];for(let x=-30;x<=140;x+=5+r()*4)o.push([x,11+r()*8,4+r()*3.5]);return o;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a bright June evening: pale blue sky, soft paper cloud banks
 s.field(B,.16,.7);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-460]],true),.26);
 {const cl=new Path2D(),r=rng(8658);for(let i=0;i<6;i++){const x=(r()-.5)*Bnd*1.2,y=hz-300-r()*520,w=240+r()*380;cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.15*(1+.3*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.6);}
 // trees: soft green crowns (yellow × blue) above the far terrace
 {const tr=new Path2D();let n=0;for(const[x,h,rad] of TREES){const p:V3=[x,h,-66];if(depthOf(c,p)<5)continue;const q=P(c,p),k=kAt(c,p),r0=rad*k;if(Math.abs(q[0])>Bnd||q[1]>Bnd)continue;
   const base=P(c,[x,6,-64]);tr.addPath(polyPath(Array.from({length:14},(_,a)=>{const an=a/14*TAU;return[q[0]+Math.cos(an)*r0*(1+.08*Math.sin(an*5+x)),q[1]+Math.sin(an)*r0*.9] as Pt;}),true));tr.rect(q[0]-r0*.5,q[1],r0,Math.max(0,base[1]-q[1]));n++;}
  if(n){s.knockout(tr);s.fill(Y,tr,.75);s.tone(B,tr,.7);s.tone(K,tr,.25);}}
 // terraces: knocked out, a navy screen, stepped rows; the crowd prints as ink fields
 const stands=new Path2D(),rows=new Path2D(),walls=new Path2D();
 STANDS.forEach(q=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<12;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/12),bil(q,1,k/12),bil(q,1,(k+1)/12),bil(q,0,(k+1)/12)]));
  addPoly(walls,clipPoly(c,[q[0],q[1],[q[1][0],0,q[1][2]],[q[0][0],0,q[0][2]]]));});
 s.knockout(stands);s.tone(K,stands,.4);s.tone(B,rows,.28);s.tone(K,rows,.18);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<3)continue;const k=kAt(c,p),sz=clamp(.55*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.85);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(R,heads[3],.85);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.5);if(depthOf(c,p)<4)continue;const[x,y]=P(c,p),sz=clamp(1*kAt(c,p),8,24);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,walls,.7);
 // flags
 {const pole=new Path2D(),blue=new Path2D(),yel=new Path2D(),grn=new Path2D(),red=new Path2D(),wht=new Path2D();
  FLAGS.forEach(([b,kind],i)=>{if(depthOf(c,b)<5)return;const top:V3=[b[0],b[1]+5,b[2]],k=kAt(c,b),pb=P(c,b),pt=P(c,top);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;pole.addPath(ribbon([pb,pt],Math.max(2,.14*k),{taper:0,wobble:0}));
   const w=2.6*k,h=1.7*k,wv=(u:number)=>Math.sin(tt*5+i+u*4)*h*.12*u,cloth=(u0:number,u1:number,v0:number,v1:number)=>polyPath([[pt[0]+w*u0,pt[1]+h*v0+wv(u0)],[pt[0]+w*u1,pt[1]+h*v0+wv(u1)],[pt[0]+w*u1,pt[1]+h*v1+wv(u1)],[pt[0]+w*u0,pt[1]+h*v1+wv(u0)]],true);
   if(kind===1){grn.addPath(cloth(0,1,0,1));yel.addPath(polyPath([[pt[0]+w*.5,pt[1]+h*.12+wv(.5)],[pt[0]+w*.9,pt[1]+h*.5+wv(.9)],[pt[0]+w*.5,pt[1]+h*.88+wv(.5)],[pt[0]+w*.1,pt[1]+h*.5+wv(.1)]],true));}
   else if(kind===2){red.addPath(cloth(0,1,0,.34));wht.addPath(cloth(0,1,.34,.66));red.addPath(cloth(0,1,.66,1));}
   else{blue.addPath(cloth(0,1,0,1));yel.addPath(cloth(.3,.44,0,1));yel.addPath(cloth(0,1,.42,.58));}});
  s.fill(K,pole,.95);s.knockout(blue);s.knockout(grn);s.knockout(red);s.knockout(wht);s.fill(B,blue,.95);s.fill(B,grn,.75);s.fill(Y,grn,.9);s.fill(R,red,.95);s.knockout(yel);s.fill(Y,yel,.95);}
 // the cinder running track round the pitch (multi-use ground), then the grass: yellow × blue = green, mowing stripes, paper lines
 {const ring=(x0:number,x1:number,z0:number,z1:number,r:number):V3[]=>{const o:V3[]=[],cs:[number,number,number][]=[[x1-r,z1-r,0],[x0+r,z1-r,.25],[x0+r,z0+r,.5],[x1-r,z0+r,.75]];for(const[cx,cz,a0] of cs)for(let i=0;i<=6;i++){const a=(a0+i/24)*TAU;o.push([cx+Math.cos(a)*r,0,cz+Math.sin(a)*r]);}return o;};
  const tr=new Path2D();addPoly(tr,clipPoly(c,ring(-10,115,-44,44,14)));s.knockout(tr);s.fill(R,tr,.55);s.tone(Y,tr,.35);s.tone(K,tr,.22);}
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-4,0,-38],[109,0,-38],[109,0,38],[-4,0,38]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=0;x<105;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.16);
 Ln([0,-34],[105,-34]);Ln([0,34],[105,34]);Ln([0,-34],[0,34]);Ln([105,-34],[105,34]);Ln([52.5,-34],[52.5,34]);
 {let prev:[number,number]|null=null;for(let i=0;i<=28;i++){const a=i/28*TAU,pt:[number,number]=[52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 for(const[gx,d] of [[0,1],[105,-1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=(d>0?0:Math.PI)-.927+i/10*1.854,pt:[number,number]=[gx+d*11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 bench(s,c);
 photographers(s,c,tt);
 goal(s,c,0,-1,o.net);goal(s,c,105,1);
}
/** Brazil's bench: a low wooden bench on the track by the halfway line (inferred) */
const BENCH_Z=38.4;
function bench(s:Sheet,c:Camera){const b=new Path2D(),x0=47,x1=53.5;if(depthOf(c,[50,0,BENCH_Z])<1)return;
 addPoly(b,clipPoly(c,[[x0,.45,BENCH_Z-.2],[x1,.45,BENCH_Z-.2],[x1,.45,BENCH_Z+.25],[x0,.45,BENCH_Z+.25]]));addPoly(b,clipPoly(c,[[x0,.45,BENCH_Z-.2],[x1,.45,BENCH_Z-.2],[x1,.3,BENCH_Z-.2],[x0,.3,BENCH_Z-.2]]));
 for(const x of[x0+.2,(x0+x1)/2,x1-.2])addPoly(b,clipPoly(c,[[x-.05,0,BENCH_Z-.15],[x+.05,0,BENCH_Z-.15],[x+.05,.45,BENCH_Z-.15],[x-.05,.45,BENCH_Z-.15]]));
 s.knockout(b);s.fill(R,b,.5);s.fill(K,b,.45);}
/** press photographers crouched behind Austria's goal line with box cameras (a 1950s detail) */
const SNAPPERS:[number,number][]=[[-3,-11.5],[-2.8,-8.4],[-3.1,7.2],[-2.9,10],[-3.4,13]];
function photographers(s:Sheet,c:Camera,tt:number){
 const coat=new Path2D(),face=new Path2D(),box=new Path2D();let n=0;
 SNAPPERS.forEach(([x,z],i)=>{const g:V3=[x,0,z];if(depthOf(c,g)<6)return;const k=kAt(c,g),[gx,gy]=P(c,g);if(Math.abs(gx)>s.W||Math.abs(gy)>s.H)return;
  const bob=Math.sin(tt*3+i)*.02*k;coat.addPath(polyPath([[gx-.35*k,gy],[gx+.35*k,gy],[gx+.3*k,gy-.7*k],[gx-.25*k,gy-.8*k]],true));
  face.addPath(polyPath(Array.from({length:10},(_,a)=>[gx+Math.cos(a/10*TAU)*.13*k,gy-.95*k+bob+Math.sin(a/10*TAU)*.14*k] as Pt),true));
  box.rect(gx-.24*k,gy-.95*k+bob,.2*k,.16*k);n++;});
 if(!n)return;s.knockout(coat);s.fill(K,coat,.8);s.knockout(face);s.tone(R,face,.2);s.tone(Y,face,.45);s.fill(K,box,.95);
}
/** a 1950s goal on the line x = gx, net running back by d·2 m: square posts, a box net; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,gx:number,d:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2*d,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 if(depthOf(c,[gx,1,0])<1)return;
 const back=(u:number,v:number):V3=>D([gx+Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([gx+lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([gx+lerp(0,Dp,u),lerp(H,0,v),z]);
 const far=kAt(c,[gx,1,0])<40,nu=far?8:16;
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,nu,far?3:6);grid(top,nu,far?2:4);grid(side(-W),far?2:4,far?3:6);grid(side(W),far?2:4,far?3:6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[gx,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([gx,0,-W],[gx,H+.06,-W]);bar([gx,0,W],[gx,H+.06,W]);bar([gx,H,-W-.06],[gx,H,W+.06]);
 bar([gx+Dp,0,-W],[gx+Dp,H,-W],.06);bar([gx+Dp,0,W],[gx+Dp,H,W],.06);bar([gx,H,-W],[gx+Dp,H,-W],.05);bar([gx,H,W],[gx+Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]+2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]-w*.9,p[1]-w*.2,p[2]];};

// ================= the 1950s leather ball: tan (yellow × red screens), stitched panel seams, a lace, a blue shade =================
const BALL_R=.13;
function leatherBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(Y,disc,duo?.6:.75);if(!duo)s.tone(R,disc,.45);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.6,r*.05),.9);
 const la=spin*.7,lc:Pt=[Math.cos(la)*r*.3,Math.sin(la)*r*.3];if(Math.cos(spin*1.3)>-.2){const lace=new Path2D();for(let i=-2;i<=2;i++){const cx=lc[0]+i*r*.09*Math.cos(la),cy=lc[1]+i*r*.09*Math.sin(la);lace.moveTo(cx-r*.07*Math.sin(la),cy+r*.07*Math.cos(la));lace.lineTo(cx+r*.07*Math.sin(la),cy-r*.07*Math.cos(la));}s.stroke(K,lace,Math.max(1.6,r*.06));}
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (8 June 1958) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_MID:AthleteStyle['skin']=[[R,.32],[Y,.6],[K,.1]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]];
/** Brazil: yellow shirts with green collar and cuffs (blue over yellow), light-blue shorts, white socks */
const BRA=(skin:AthleteStyle['skin'],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:[B,.72],socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.9],...o});
/** Austria: white shirts, black shorts, black socks */
const AUT=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:K,shorts:[K,.9],socks:[K,.85],boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,...o});
const NB:Build={height:1.84,bulk:1.07,thighs:1.05};// "tall, powerfully built" (Glanville)
const NILTON:AthleteStyle=BRA(SKIN_MID,{number:12,build:NB,seed:12});
const ALTAFINI:AthleteStyle=BRA(SKIN_LIGHT,{number:18,seed:18,build:{height:1.78}});
const HORAK:AthleteStyle=AUT({number:7,seed:70,build:{height:1.72,bulk:.95}});
const KEEPER:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.8],boots:K,skin:SKIN_LIGHT,hair:[K,.6],line:K,sleeves:'long',shade:[K,.26],gloves:null,seed:21};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],line:K,sleeves:'short',seed:33};
/** Vicente Feola on the touchline: a heavy-set man in a dark jacket and trousers (clothes and build inferred) */
const FEOLA:AthleteStyle={shirt:K,trim:'paper',shorts:[K,.8],socks:[K,.8],boots:K,skin:SKIN_LIGHT,hair:[K,.55],hairStyle:'balding',line:K,sleeves:'long',shade:[K,.26],build:{height:1.72,bulk:1.28,head:1.05},seed:58};
/** duotone version of a kit for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,shirt:lead?[Y,.9]:'paper',trim:K,shorts:lead?[K,.55]:[K,.3],socks:lead?'paper':[K,.3],numberInk:K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:K,shade:[K,.2]});
/** THE figure adapter: every person in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;low?:boolean}={}){
 const st=o.low?{...style,detail:'low' as const}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the tackle) =================
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
/** a dribbling body (short strides, head over the ball) */
function dribbler(p:MKey[],tau:number,foot:'l'|'r'):{pose:Pose;place:Place}{const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz);
 return{pose:dribble(q.dist/1.9,{foot,speed:clamp(v/6)}),place:{x:q.x,z:q.z,yaw:YAW(q.vx||-1,q.vz)}};}
/** the ball a dribbler keeps: ahead of the body along the run, tapped out and gathered */
function dribbleBall(p:MKey[],tau:number):V3{const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.42+.3*Math.abs(Math.sin(q.dist*.85));return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
/** where to stand so the kicking toe meets the ball at contact */
function kickSpot(pose:Pose,build:Build,foot:'l'|'r',ball:V3,yaw:number):[number,number]{const sk=solve(pose,build,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe;return[ball[0]-toe[0],ball[2]-toe[2]];}
/** a ground pass that slows as it rolls */
const roll=(a:V3,b:V3,u:number):V3=>{const e=1-Math.pow(1-clamp(u),1.6);return[lerp(a[0],b[0],e),.11,lerp(a[2],b[2],e)];};

// ---- the key moments (τ) ----
const TP1=2.6,DP1=.62;// Nílton's pass to Altafini (contact), kick duration
const TR1=3.5;// Altafini receives
const TP2=5.3,DP2=.62;// Altafini's return pass
const TR2=6.7;// Nílton receives, on the run
const DS=.9,TSS=7.1,TS=TSS+STRIKE_CONTACT*DS;// the shot: strike starts, contact
const FLIGHT=.9,T_GOAL=TS+FLIGHT;

// ---- Horak (Austria 7) attacks down Brazil's left; the tackle ----
const HORAK_RUN:MKey[]=[[-7,39,19],[-3,49.5,22.2],[-.9,57.5,23.9],[-.1,60.3,24.2]];
const LP:[number,number]=[62.25,23.55];// Nílton's lunge spot
const LYAW=YAW(-1,.55);// facing Horak, slightly toward the touchline
const LUNGE_T0=-.45,LUNGE_D=.8;// lunge reach (.6) lands on τ ≈ 0
const TK:V3=(()=>{const sk=solve(lunge(.6,{side:'l'}),NB,{x:LP[0],z:LP[1],yaw:LYAW});return[sk.lToe[0],.11,sk.lToe[2]];})();
// ---- Nílton: step up → lunge (left foot) → gather → stride forward with the ball → pass → run on, asking for it → receive → shoot ----
const PP:V3=[53.3,.11,22.05];// the pass point
const ALT_RX:V3=[45.1,.11,10.4];// Altafini's first touch
const PY1=YAW(ALT_RX[0]-PP[0],ALT_RX[2]-PP[2])+14*D2R;
const PK1=kickSpot(strike(STRIKE_CONTACT,{foot:'l',power:.35}),NB,'l',PP,PY1);
const NIL_PRE:MKey[]=[[-7,73,16],[-3,66.6,20.6],[-1.1,63.1,23.1],[LUNGE_T0,LP[0],LP[1]]];
const NIL_DRIB:MKey[]=[[.35,LP[0]-.3,LP[1]-.05],[.9,60.1,23.3],[1.8,56.4,22.8],[TP1-STRIKE_CONTACT*DP1,PK1[0]+.25,PK1[1]+.1]];
const RX2:V3=[23.6,.11,13.1];// where the return pass meets him
const SP:V3=[21.0,.11,12.35];// the shot
const GT:V3=[-.25,.72,-2.5];// low, far post (inferred)
const SY=YAW(GT[0]-SP[0],GT[2]-SP[2])+10*D2R;
const PS=kickSpot(strike(STRIKE_CONTACT,{foot:'l'}),NB,'l',SP,SY);
const NIL_RUN:MKey[]=[[TP1+.25,PK1[0]-.2,PK1[1]-.1],[3.4,49.3,21.2],[4.3,42.1,19.4],[5.3,34.0,16.9],[TR2,RX2[0]+.75,RX2[2]+.3],[TSS,PS[0],PS[1]]];
const NIL_AFTER:MKey[]=[[T_GOAL+.25,PS[0],PS[1]],[T_GOAL+1.9,16.8,19.5],[T_GOAL+3.4,23.5,25.5],[T_GOAL+6.5,35.5,29.5],[T_GOAL+10,47,30.5]];
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
/** asking for the ball: right arm up and forward, head turned to Altafini */
const ask=(p:Pose,w:number):Pose=>w<=0?p:{...p,rShF:lerp(p.rShF,150*D2R,w),rShA:lerp(p.rShA,28*D2R,w),rElb:lerp(p.rElb,12*D2R,w),neckY:lerp(p.neckY,-38*D2R,w)};
const NIL_SEGS:Seg[]=[
 [-99,t=>runner(NIL_PRE,t,[60,0,24],backpedal(0))],
 [LUNGE_T0,t=>({pose:lunge(clamp((t-LUNGE_T0)/LUNGE_D),{side:'l'}),place:{x:LP[0],z:LP[1],yaw:LYAW}})],
 [.35,t=>dribbler(NIL_DRIB,t,'l')],
 [TP1-STRIKE_CONTACT*DP1,t=>({pose:strike(clamp((t-(TP1-STRIKE_CONTACT*DP1))/DP1),{foot:'l',power:.35}),place:{x:PK1[0],z:PK1[1],yaw:PY1}})],
 [TP1+.25,t=>{const r=runner(NIL_RUN,t,ALT_RX);r.pose=ask(r.pose,sm(3.9,4.4,t)*(1-sm(5.9,6.4,t))*.9);return r;}],
 [TSS,t=>({pose:strike(clamp((t-TSS)/DS),{foot:'l'}),place:{x:PS[0],z:PS[1],yaw:SY}})],
 [T_GOAL+.25,t=>{const q=pathPos(NIL_AFTER,t),v=Math.hypot(q.vx,q.vz),yaw=v>.3?YAW(q.vx,q.vz):YAW(1,.2),cel=t<T_GOAL+2.4;
  return{pose:cel?celebrate(Math.max(0,q.dist)/3,{kind:'run'}):runCycle(q.dist/2.4,{speed:clamp(v/8)}),place:{x:q.x,z:q.z,yaw}};}],
];
/** a body at τ from its segments, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(segs:Seg[],tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=segs[a][1](tau),Bq=segs[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}
const niltonAt=(tau:number)=>segAt(NIL_SEGS,tau);
// ---- Altafini (Mazzola, 18): shows for it, takes it, carries it a few steps, plays it back into the run ----
const PP2:V3=[41.3,.11,9.75];
const PY2=YAW(RX2[0]-PP2[0],RX2[2]-PP2[2]);
const PK2=kickSpot(strike(STRIKE_CONTACT,{foot:'r',power:.55}),{height:1.78},'r',PP2,PY2);
const ALT_IN:MKey[]=[[-7,37,3],[0,41.5,6.2],[TP1,44.4,9.2],[TR1-.1,ALT_RX[0]+.55,ALT_RX[2]+.2]];
const ALT_DRIB:MKey[]=[[TR1+.1,ALT_RX[0]+.4,ALT_RX[2]+.1],[4.4,43.2,10.1],[TP2-STRIKE_CONTACT*DP2,PK2[0]+.3,PK2[1]]];
const ALT_ON:MKey[]=[[TP2+.3,PK2[0],PK2[1]],[7,36,8],[T_GOAL+1.2,26,11],[T_GOAL+4,20,17]];
const ALT_SEGS:Seg[]=[
 [-99,t=>runner(ALT_IN,t,PP)],
 [TR1-.1,t=>dribbler(ALT_DRIB,t,'r')],
 [TP2-STRIKE_CONTACT*DP2,t=>({pose:strike(clamp((t-(TP2-STRIKE_CONTACT*DP2))/DP2),{foot:'r',power:.55}),place:{x:PK2[0],z:PK2[1],yaw:PY2}})],
 [TP2+.3,t=>runner(ALT_ON,t,RX2)],
];
// ---- the ball ----
function ballAt(tau:number):V3{
 if(tau<-.25)return dribbleBall(HORAK_RUN,tau);
 if(tau<0){const a=dribbleBall(HORAK_RUN,-.25),u=(tau+.25)/.25;return[lerp(a[0],TK[0],u),.11,lerp(a[2],TK[2],u)];}
 if(tau<.6){const b=dribbleBall(NIL_DRIB,.6),u=tau/.6;return roll(TK,b,u);}
 const kp1=TP1-STRIKE_CONTACT*DP1;
 if(tau<kp1)return dribbleBall(NIL_DRIB,tau);
 if(tau<TP1){const a=dribbleBall(NIL_DRIB,kp1-.001),u=(tau-kp1)/(TP1-kp1);return[lerp(a[0],PP[0],u),.11,lerp(a[2],PP[2],u)];}
 if(tau<TR1)return roll(PP,ALT_RX,(tau-TP1)/(TR1-TP1));
 const d0=TR1+.1,kp2=TP2-STRIKE_CONTACT*DP2;
 if(tau<d0+.3){const b=dribbleBall(ALT_DRIB,d0+.3),u=(tau-TR1)/(d0+.3-TR1);return roll(ALT_RX,b,u);}
 if(tau<kp2)return dribbleBall(ALT_DRIB,tau);
 if(tau<TP2){const a=dribbleBall(ALT_DRIB,kp2-.001),u=(tau-kp2)/(TP2-kp2);return[lerp(a[0],PP2[0],u),.11,lerp(a[2],PP2[2],u)];}
 if(tau<TR2)return roll(PP2,RX2,(tau-TP2)/(TR2-TP2));
 if(tau<TS)return roll(RX2,SP,(tau-TR2)/(TS-TR2));
 const s=tau-TS;
 if(s<FLIGHT){const u=s/FLIGHT,p=mix3(SP,GT,u);p[1]=lerp(SP[1],GT[1],u)+.55*Math.sin(u*Math.PI);p[2]+=.35*Math.sin(u*Math.PI);return p;}// a low drive, bending a touch
 const e=s-FLIGHT,u=clamp(e/.16);if(u<1)return mix3(GT,[-1.75,.65,-2.7],easeOut(u));
 const d=clamp((e-.16)/.5),h=.65*(1-d*d)+.11*d*d;return[-1.75+.3*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.66)*8))*Math.exp(-(e-.66)*3):0),-2.7+.1*d];}
const NET_HIT:V3=[-2,.65,-2.7];

// ---- everybody else ----
type Actor={style:AthleteStyle;hero?:boolean;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const HORAK_AFTER:MKey[]=[[.8,60.4,24.5],[2.6,57,23.2],[5,51,21.2],[8,46,20]];
const FEOLA_AT:[number,number]=[50.6,37.1];
/** Feola: watches, then shouts "Get back!" (a hand cupped at his mouth, the other arm sweeping back toward Brazil's goal), then claps */
function feolaAt(tau:number,ball:V3):{pose:Pose;place:Place}{
 const n=niltonAt(tau).place,yaw=YAW((n.x??50)-FEOLA_AT[0],(n.z??20)-FEOLA_AT[1]);
 const watch=posed({lHipF:6,rHipF:6,lKnee:8,rKnee:8,lean:4,lShF:44,rShF:44,lShA:18,rShA:18,lElb:112,rElb:112,lShR:30,rShR:30,neckP:-4});
 const u=((tau-2.9)/.62%1+1)%1,shout=keyPoses(u,[
  [0,posed({lHipF:14,rHipF:-4,lKnee:18,rKnee:10,lean:16,lShF:96,lShA:26,lElb:138,rShF:30,rShA:112,rElb:24,neckP:-14,twist:10})],
  [.45,posed({lHipF:14,rHipF:-4,lKnee:18,rKnee:10,lean:12,lShF:92,lShA:22,lElb:134,rShF:-40,rShA:72,rElb:18,neckP:-6,twist:-6})],
  [1,posed({lHipF:14,rHipF:-4,lKnee:18,rKnee:10,lean:16,lShF:96,lShA:26,lElb:138,rShF:30,rShA:112,rElb:24,neckP:-14,twist:10})]]);
 const cu=((tau-T_GOAL)/.42%1+1)%1,clap=posed({lHipF:6,rHipF:6,lKnee:8,rKnee:8,lean:2,lShF:70,rShF:70,lShA:14+12*Math.cos(cu*TAU),rShA:14+12*Math.cos(cu*TAU),lElb:72,rElb:72,lShR:40,rShR:40,neckP:-2+6*Math.sin(cu*TAU)});
 let pose=blendPose(watch,shout,sm(2.6,3.1,tau)*(1-sm(6.8,7.4,tau)));pose=blendPose(pose,clap,sm(T_GOAL+.2,T_GOAL+.7,tau));
 void ball;return{pose,place:{x:FEOLA_AT[0],z:FEOLA_AT[1],yaw}};}
const ACTORS:Actor[]=[
 {style:HORAK,at:(t,b)=>{// Horak dribbles at him, loses it to the lunge, is left off balance, turns and chases
  if(t<-.1)return dribbler(HORAK_RUN,t,'r');
  const e=HORAK_RUN[HORAK_RUN.length-1],yaw=YAW(1,.1);
  if(t<.8){const u=sm(-.1,.8,t);return{pose:blendPose(dribble(0,{foot:'r'}),{...stand(),lean:-12*D2R,lShA:50*D2R,rShA:40*D2R,neckY:30*D2R},u),place:{x:e[1]+.4*u,z:e[2]+.2*u,yaw:lerpAng(yaw,YAW(-1,-.3),u)}};}
  return runner(HORAK_AFTER,t,b);}},
 {style:ALTAFINI,hero:true,at:t=>segAt(ALT_SEGS,t)},
 mover(BRA(SKIN_LIGHT,{number:7,seed:7}),[[-7,50,26],[0,44.5,24],[3,38.5,17.5],[6,30.5,10],[T_GOAL,25,6.5],[T_GOAL+4,22,9]]),// Zagallo cuts inside, and takes Halla with him
 mover(AUT({number:2,seed:72}),[[-7,41,22],[0,39,21],[3,34.5,16.4],[6,28.2,10.4],[T_GOAL,23.5,7.4]],backpedal(0)),// Halla
 mover(BRA(SKIN_MID,{number:21,seed:21}),[[-7,40,-2],[0,36,1],[4,27,3],[7.5,16,4],[T_GOAL+1,12,5.5]]),// Dida
 mover(BRA(SKIN_DARK,{number:6,seed:6}),[[-7,59,-6],[0,53,-4],[4,45,-2],[8,37,0],[T_GOAL+3,30,2]]),// Didi
 mover(BRA(SKIN_MID,{number:17,seed:17}),[[-7,45,-25],[0,40,-24],[5,28,-21],[8,20,-18]]),// Joel, right wing
 mover(BRA(SKIN_LIGHT,{number:5,seed:5}),[[-7,68,4],[0,63,6],[4,56,7],[8,50,6]]),// Dino Sani
 mover(BRA(SKIN_LIGHT,{number:2,seed:2}),[[-7,82,4],[4,75,6],[9,70,4]]),// Bellini
 mover(BRA(SKIN_DARK,{number:15,seed:15}),[[-7,84,-7],[4,77,-5],[9,72,-5]]),// Orlando
 mover(AUT({number:3,seed:73}),[[-7,24,2],[0,22,3],[5,18.5,4],[7.5,14.5,3],[T_GOAL+2,12,2]],backpedal(0)),// Happel
 mover(AUT({number:4,seed:74}),[[-7,27,-7],[0,24,-4],[6,16.5,-2.5],[T_GOAL+2,12,-1]],backpedal(0)),// Swoboda
 mover(AUT({number:5,seed:75}),[[-7,53,13],[0,50.5,14.5],[3,45.5,15.2],[5.5,36.5,15],[7.6,28.5,13.8],[T_GOAL+2,22,12]]),// Hanappi, chasing, a step behind
 mover(AUT({number:6,seed:76}),[[-7,49,5],[0,47,6],[3.5,43.5,8],[5.2,42.6,8.7],[7.5,36,8]],backpedal(0)),// Koller, onto Altafini
 {style:KEEPER,at:(t,b)=>{const q=pathPos([[-7,4.5,.5],[5,3.3,1.8],[TS,2.35,1.3]],t),yaw=YAW(b[0]-q.x,b[2]-q.z);// Rudolf Szanwald
  if(t<TS+.02)return{pose:keeperSet(t*1.6),place:{x:q.x,z:q.z,yaw}};return{pose:keeperDive(clamp((t-(TS+.02))/.95),{side:'l',height:.3}),place:{x:q.x,z:q.z,yaw:YAW(SP[0]-q.x,SP[2]-q.z)}};}},
 mover(REF,[[-7,52,-8],[0,53,-4],[4,45,-2],[8,33,-1],[T_GOAL+3,30,2]]),// Maurice Guigue
 {style:FEOLA,at:(t,b)=>feolaAt(t,b)},
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Nílton (and Altafini) with motion smear + secondary motion; `low` = wide shot. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;low?:boolean;glow?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[];
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false,low=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear,low})});};
 for(const a of ACTORS){const st=a.at(tp,bp);put(a.style,st,o.hero&&a.hero?a.at(tp-1/12,ballAt(tp-1/12)):undefined,false,!!o.low);}
 const n=niltonAt(tp);put(NILTON,n,o.hero?niltonAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.5,q[1]+Math.sin(i/20*TAU)*r*1.5] as Pt),true),r*.25*o.glow,.95);
  leatherBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.8),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,nil:n};}
/** Feola's shouts: red arcs thrown from his mouth toward the pitch, one burst per "Get back!" (age = seconds since the burst) */
function shoutMarks(s:Sheet,c:Camera,tau:number,age:number,g:number){
 if(g<=.02||age<0||age>1.2)return;const f=feolaAt(tau,[0,0,0]),sk=solve(f.pose,FEOLA.build,f.place),mouth=sk.face,k=kAt(c,mouth),m=P(c,mouth);
 const n=niltonAt(tau).place,tgt=P(c,[n.x??40,1.2,n.z??20]),ang=Math.atan2(tgt[1]-m[1],tgt[0]-m[0]);
 const arcs=new Path2D();for(let i=0;i<3;i++){const r=(.35+i*.28+age*.9)*k,sp=.55-.08*i;const pts:Pt[]=[];for(let j=0;j<=10;j++){const a=ang-sp+j/10*2*sp;pts.push([m[0]+Math.cos(a)*r,m[1]+Math.sin(a)*r]);}arcs.addPath(ribbon(pts,Math.max(6,.07*k*(1-i*.2)),{taper:.5,wobble:1}));}
 s.fill(R,arcs,.95*g*(1-clamp((age-.7)/.5)));
}

// ================= chapter 1 (live, real time): the high main-stand newsreel camera follows the move; the goal goes in =================
const ch1T=()=>{const end=SEC(0),TL=Math.max(2.5,Math.min(T(0,'wins the ball'),end-T_GOAL-1.3));return{TL,end};};
const BCAM:V3=[42,11,63];
function ch1Look(tau:number):V3{const b=ballAt(tau),n=niltonAt(tau).place,nx=n.x??b[0],nz=n.z??b[2];
 let look:V3=[lerp(b[0],nx,.4),1.2,lerp(b[2],nz,.4)-1.5];
 if(tau>5.6)look=mix3(look,[lerp(b[0],9,.45),1.1,lerp(b[2],3,.45)],sm(5.6,7.2,tau));
 if(tau>T_GOAL)look=mix3(look,[lerp(nx,6,.4),1.1,lerp(nz,5,.4)],sm(T_GOAL,T_GOAL+1.2,tau));
 return look;}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.25),c=ch1Look(tau-.5),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-6,4200],[-1.5,5200],[.6,5200],[2.2,4400],[3.6,4100],[5.3,3900],[6.6,3500],[T_GOAL,3800],[T_GOAL+2.5,4600]]);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),tau=t-TL,tp=tt-TL,goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(0,.5,goalIn),flash:.2+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:14,low:true});
  // Feola, small on the near touchline, already shouting while his left-back runs on
  const g=sm(2.9,3.3,tp)*(1-sm(6.6,7,tp));if(g>0)shoutMarks(s,c,tp,((tp-2.9)%.62+.62)%.62,g*.8);},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (replay, from a low rail camera on the track): the tackle, over halfway, Feola shouting in the foreground =================
const ch2T=()=>({w:T(1,'Watch again'),bt:T(1,'Back then'),fb:T(1,'full-backs'),ha:T(1,'crossed halfway'),co:T(1,'Coach Feola'),sh:T(1,'shouted'),g1:T(1,'Get back!'),g2:T(1,'Get back!',1),bu:T(1,'But Nílton'),kr:T(1,'kept running'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,-.75],[q.bt,.15],[q.ha+.3,2.5],[q.co,3.05],[q.g1,3.55],[q.bu,4.55],[q.end,5.6]]),x=>x);};
const RAIL_Z=43.2,RAIL_Y=1.65;
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),n=niltonAt(tau).place,b=ballAt(tau),nx=n.x??50,nz=n.z??20;
 const w=sm(q.co-.4,q.co+.5,t,easeIO)*(1-sm(q.bu-.2,q.bu+.8,t,easeIO));
 const railX=lerp(nx+6,55.2,w),pos:V3=[railX,RAIL_Y,RAIL_Z];
 const subj:V3=[lerp(nx,b[0],.3),1.1,lerp(nz,b[2],.3)],fe:V3=[FEOLA_AT[0],1.45,FEOLA_AT[1]];
 const look=mix3(subj,mix3(fe,subj,.55),w),F=lerp(key(t,mono([[0,4600],[q.fb,4700],[q.ha,3800],[q.end,3600]])),2250,w);
 return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.12,flash:.1});
  // "crossed halfway": the halfway line lights up as he strides over it
  const hl=sm(q.ha-.35,q.ha+.1,tt)*(1-sm(q.co,q.co+.6,tt));if(hl>.02){const pts:Pt[]=[];for(let z=-34;z<=34;z+=2){const p:V3=[52.5,.03,z];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}if(pts.length>1)s.fill(Y,ribbon(pts,Math.max(10,.3*kAt(c,[52.5,0,20])),{taper:0,wobble:1}),.9*hl);}
  // "full-backs": a ring round his boots (his place in the back four)
  const fr=sm(q.fb-.1,q.fb+.3,tt,easeOutBack)*(1-sm(q.ha+.4,q.ha+.9,tt));if(fr>.02){const n=niltonAt(tp).place,pts=circ3(n.x??0,n.z??0,.9*fr,24).map(p=>P(c,p));s.stroke(Y,polyPath(pts,true),Math.max(6,.07*kAt(c,[n.x??0,0,n.z??0])),.95);}
  drawWorld(s,c,tau,tp,{ballMin:20,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.bt+.5,q.bt+1,tt))});
  // "Get back! Get back!": two bursts of shouts from Feola
  for(const at of[q.g1,q.g2])shoutMarks(s,c,tp,tt-at+.05,1);
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(20,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5.5,
};

// ================= chapter 3 (replay, following his run toward goal): the return pass, the shot, the net; then a whip-pan to Feola clapping =================
const ch3T=()=>({rp:T(2,'The return pass'),ar:T(2,'The return pass')+1.1,sh:T(2,'he shoots'),go:T(2,'goal'),tw:T(2,'Two-nil'),fe:T(2,'And Feola'),js:T(2,'just said'),wd:T(2,'Well done'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,5.75],[q.ar+.3,TR2],[q.sh+.35,TS],[q.go+.3,T_GOAL+.02],[q.end,T_GOAL+.02+(q.end-q.go-.3)]]),x=>x);};
/** the chasing camera: low, behind his left shoulder, looking down his run at the goal; it stops when he strikes */
function chasePos(tau:number):V3{const n=niltonAt(Math.min(tau,TSS)).place;return[(n.x??30)+8.2,2.3,(n.z??15)+5.2];}
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),pos=chasePos(tau),b=ballAt(tau);
 const g:V3=[0,1.1,-.6],play:V3=[lerp(b[0],g[0],.45),1.1,lerp(b[2],g[2],.45)];
 const pan=sm(q.fe-.25,q.fe+.45,t,easeIO),fe:V3=[FEOLA_AT[0],1.35,FEOLA_AT[1]];
 // pan: turn the look direction round (not a straight lerp through the camera)
 const d0=sub(play,pos),d1=sub(fe,pos),a0=Math.atan2(d0[2],d0[0]),a1=Math.atan2(d1[2],d1[0]),a=lerpAng(a0,a1,pan),r=lerp(Math.hypot(d0[0],d0[2]),Math.hypot(d1[0],d1[2]),pan);
 const look:V3=[pos[0]+Math.cos(a)*r,lerp(play[1],fe[1],pan),pos[2]+Math.sin(a)*r];
 const F=lerp(key(t,mono([[0,2500],[q.ar,2300],[q.sh,2100],[q.go+.3,2000],[q.tw+.5,2150]])),key(t,mono([[q.fe,3000],[q.fe+.5,5200],[q.js,6600],[q.end,7200]])),pan);
 return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.go+.3,pan=sm(q.fe-.25,q.fe+.45,t,easeIO);
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,1,shake,shake*.4);
  stadium(s,c,{t,cheer:.15+1.1*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn)*(1-.6*pan),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const w=drawWorld(s,c,tau,tp,{ballMin:20,hero:true});
  // the return pass as a dotted ink trail while it rolls into his run
  if(tp>TP2&&tp<TR2+.2){const dots=new Path2D();for(let i=0;i<=14;i++){const p=P(c,ballAt(TP2+(Math.min(tp,TR2)-TP2)*i/14));dots.moveTo(p[0]+6,p[1]);dots.arc(p[0],p[1],6,0,TAU);}s.fill(K,dots,.55*(1-sm(TR2,TR2+.2,tp)));}
  if(tp>=TS&&tp<TS+.3){const p=P(c,SP);sparkBurst(s,Y,p[0],p[1],110+110*sm(TS,TS+.1,tp,easeOut),{n:10,seed:12,g:1-sm(TS+.12,TS+.3,tp),width:13});}
  if(tp>=TS&&tp<T_GOAL+.1){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:13,len:180,width:8,cov:.85});}
  // the whip-pan: horizontal speed streaks while the camera swings to the bench
  const whip=Math.sin(Math.PI*clamp((t-(q.fe-.25))/.7));if(whip>.05)speedLines(s,K,0,0,0,{n:9,seed:14,len:900*whip,spread:1100,width:10,cov:.45*whip});
  // "Well done": paper-yellow clap sparks at Feola's hands
  if(tt>q.wd-.1){const f=feolaAt(tp,[0,0,0]),sk=solve(f.pose,FEOLA.build,f.place),h=P(c,mix3(sk.lHa,sk.rHa,.5)),cu=((tp-T_GOAL)/.42%1+1)%1;if(cu<.3)sparkBurst(s,Y,h[0],h[1],70+60*cu,{n:7,seed:15+Math.floor(tp*3),g:1-cu/.3,width:9});}
 },
 aperture(t){const q=ch3T(),c=ch3Cam(t),f=feolaAt(tau3(t),[0,0,0]),sk=solve(f.pose,FEOLA.build,f.place),[x,y]=P(c,sk.head);void q;return apertureDisc(x,y,Math.max(30,.14*kAt(c,sk.head)),12);},
 still:3.2,
};

// ================= chapter 4 (duotone lesson): defenders can attack — the space in front, bring it forward, pass, keep running, it comes back =================
const ch4T=()=>({yt:T(3,'Your turn'),de:T(3,'Defenders'),at:T(3,'attack too'),sp:T(3,'Space in front of you'),br:T(3,'Bring the ball forward'),pa:T(3,'pass'),kr:T(3,'keep running'),end:SEC(3)});
const HOME:[number,number]=[-5.4,.6],D1:[number,number]=[-1.3,.35],MATE:V3=[1.3,.11,-3.4],MEET:V3=[4.7,.11,.05];
const NILTON4=duo(NILTON,true),MATE4=duo(ALTAFINI),DEF4=[{st:duo(AUT({seed:80})),at:[6.8,-2.8] as [number,number]},{st:duo(AUT({seed:81})),at:[7.4,2.4] as [number,number]}];
const L_PASS_D=.62;
/** the lesson hero at t: ready → dribble forward → pass (left foot) → sprint on → meet the return */
function hero4(t:number,q:ReturnType<typeof ch4T>):{pose:Pose;place:Place;ball:V3}{
 const pc=q.pa+.2,ps=pc-STRIKE_CONTACT*L_PASS_D,rs=pc+.35,re=q.kr+1.5,yF=0;
 const kick=kickSpot(strike(STRIKE_CONTACT,{foot:'l',power:.35}),NB,'l',[D1[0]+.55,.11,D1[1]-.1],YAW(MATE[0]-D1[0],MATE[2]-D1[1]));
 const DRIB:MKey[]=[[q.br-.1,HOME[0],HOME[1]],[ps,kick[0],kick[1]]];
 if(t<q.br-.1){return{pose:stand(),place:{x:HOME[0],z:HOME[1],yaw:yF},ball:[HOME[0]+.5,.11,HOME[1]]};}
 if(t<ps){const d=dribbler(DRIB,t,'l');return{...d,ball:dribbleBall(DRIB,t)};}
 const py=YAW(MATE[0]-D1[0],MATE[2]-D1[1]);
 if(t<rs){const u=clamp((t-ps)/L_PASS_D),ball:V3=t<pc?[lerp(dribbleBall(DRIB,ps-.001)[0],D1[0]+.55,(t-ps)/(pc-ps)),.11,lerp(dribbleBall(DRIB,ps-.001)[2],D1[1]-.1,(t-ps)/(pc-ps))]:roll([D1[0]+.55,.11,D1[1]-.1],MATE,(t-pc)/.75);
  return{pose:strike(u,{foot:'l',power:.35}),place:{x:kick[0],z:kick[1],yaw:py},ball};}
 const RUN:MKey[]=[[rs,kick[0],kick[1]],[Math.max(rs+.4,q.kr),kick[0]+1.2,kick[1]-.05],[re,MEET[0]-.6,MEET[2]+.05]];
 const ballAt4=():V3=>{if(t<pc+.75)return roll([D1[0]+.55,.11,D1[1]-.1],MATE,(t-pc)/.75);const back=q.kr+.3;if(t<back)return MATE;if(t<re)return roll(MATE,MEET,(t-back)/(re-back));return MEET;};
 const r=runner(RUN,t,MEET);if(t>re-.3)r.place.yaw=0;return{...r,ball:ballAt4()};}
const ch4:Scene={
 draw(s,t){const q=ch4T(),tt=twos(t);
  const h=hero4(tt,q),hx=h.place.x??0;
  const push=sm(q.yt,q.end,t,easeInOutSine),F=key(t,mono([[0,2150],[q.de,2350],[q.sp,1950],[q.kr,1850],[q.end,1950]]));
  const lx=lerp(-1.2,1.4,push)*.3+hx*.65;const c=cam([lx,2.5,10.8],[lx,.75,-.4],F);frame(s);
  // the stage: a navy field, the ground as a pale print
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-40,0,-30],[40,0,-30],[40,0,7],[-40,0,7]]));s.tone(K,floor,.2);
  // "space in front of you": the empty lane ahead lights up as a yellow field
  const sp=sm(q.sp-.1,q.sp+.6,tt,easeOut);if(sp>.02){const zone=new Path2D();addPoly(zone,clipPoly(c,[[-4.2,0,-2.3],[lerp(-4.2,5.6,sp),0,-2.3],[lerp(-4.2,5.6,sp),0,2.4],[-4.2,0,2.4]]));s.knockout(zone,.5);s.tone(Y,zone,.4);}
  // his home spot in the back line, then the forward arrow on "attack too"
  {const hr=sm(q.de-.1,q.de+.3,tt,easeOutBack);if(hr>.02){const pts=circ3(HOME[0],HOME[1],.95*hr,26).map(p=>P(c,p));s.stroke(Y,polyPath(pts,true),Math.max(7,.07*kAt(c,[HOME[0],0,HOME[1]])),.95);}}
  const ar=sm(q.at-.05,q.at+.6,tt,easeOut);if(ar>.02){const a=P(c,[HOME[0]+1,.02,HOME[1]]),b=P(c,[3.6,.02,.3]);laneArrow(s,Y,a,b,64,{head:130,progress:ar,cov:.9});}
  // the pass and its return, drawn as dotted paths
  if(tt>q.pa){const dots=new Path2D(),seg=(a:V3,b:V3,u:number)=>{for(let i=0;i<=10;i++){if(i/10>u)break;const p=P(c,mix3(a,b,i/10));dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);}};
   seg([D1[0]+.55,.11,D1[1]-.1],MATE,sm(q.pa+.2,q.pa+.95,tt,x=>x));if(tt>q.kr+.3)seg(MATE,MEET,sm(q.kr+.3,q.kr+1.5,tt,x=>x));s.fill(K,dots,.8);}
  // figures: Austria's defenders far off (the space), the team-mate, the full-back
  const items:Item[]=[];
  DEF4.forEach((d,i)=>{const g:V3=[d.at[0],0,d.at[1]];items.push({depth:depthOf(c,g),draw:()=>drawPlayer(s,backpedal(tt*1.6+i*.5),c,d.st,{x:d.at[0],z:d.at[1],yaw:YAW(-1,0)})});});
  {const mp=tt>q.pa+.8&&tt<q.kr+.6?strike(clamp((tt-(q.kr+.3-STRIKE_CONTACT*.6))/.6),{foot:'r',power:.3}):stand(),g:V3=[MATE[0]-.45,0,MATE[2]-.1];
   items.push({depth:depthOf(c,g),draw:()=>drawPlayer(s,mp,c,MATE4,{x:g[0],z:g[2],yaw:YAW(MEET[0]-MATE[0],MEET[2]-MATE[2])})});}
  const pv=hero4(tt-1/12,q);items.push({depth:depthOf(c,[hx,0,h.place.z??0]),draw:()=>drawPlayer(s,h.pose,c,NILTON4,h.place,{prev:{pose:pv.pose,place:pv.place},smear:true})});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  const bp=P(c,h.ball),r=Math.max(22,BALL_R*kAt(c,h.ball));leatherBall(s,bp[0],bp[1],r,tt*4,{duo:true});
  // "keep running": speed lines behind him while he sprints on
  const kr=sm(q.kr,q.kr+.3,tt)*(1-sm(q.kr+1.3,q.kr+1.7,tt));if(kr>.02){const p=P(c,[hx,1,h.place.z??0]);speedLines(s,K,p[0]-60,p[1],Math.PI,{n:5,seed:41,len:170,width:9,cov:.7*kr});}
 },
 still:6,
};

const story:RisoStory={
 id:'nilton-santos-signature',format:'11v11',title:'Nílton Santos: the full-back who attacks',
 theme:'Defenders can attack too: bring the ball forward when there is space.',
 ageNote:'World Cup group match, Brazil 3–0 Austria, Rimnersvallen, Uddevalla, 8 June 1958. His goal made it 2–0 early in the second half.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flashbulb pops (1958 press cameras) and the leather ball hops from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  leatherBall(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
