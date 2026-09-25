/** Iconic play film (signature move): Garrincha's feint past the full-back. Brazil 2–1 Spain, 1962 World Cup, Group 3, Estadio Sausalito,
 * Viña del Mar, Chile, 6 June 1962: Brazil's winning goal, about the 86th minute (Amarildo, from Garrincha's cross).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/garrincha-signature-1962/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the film through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/garrincha-signature-1962/timing.json exists, replace the `VOICE` constant below with
 *   import timingJson from '../../../public/plays/narration/garrincha-signature-1962/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 *
 * WHY THIS MOMENT: iconicPlays.json lists Garrincha as a signature ("the feint past the full-back", lesson "Fake one way with your body, then
 * go the other way fast"). The best-described single example in the written record is the winner against Spain in 1962: with Pelé injured,
 * Garrincha took the ball on the right flank, beat his defender, PAUSED, then beat the same man and a second defender and crossed for
 * Amarildo. It is the signature (stop in front of the full-back, fake, go) in one real, documented World Cup move.
 *
 * SOURCES (read Sept 2026 as page text; the footage was not watched):
 *  - Wikipedia, "Garrincha" https://en.wikipedia.org/wiki/Garrincha (1962 World Cup section; Mel Hopkins quote; his legs; height 1.69 m)
 *  - Wikipédia (pt), "Garrincha" https://pt.wikipedia.org/wiki/Garrincha (the Spain move in more detail; "Garrincha era destro")
 *  - Wikipedia, "1962 FIFA World Cup Group 3" https://en.wikipedia.org/wiki/1962_FIFA_World_Cup_Group_3 (date, venue, attendance, referee,
 *    line-ups, kit boxes)
 *  - Linguasport, "World Cup 1962 Final Stage: Game Details" (web.archive.org copy of linguasport.com/futbol/internacional/mundial/1962_CHILE_FS.htm)
 *  - Wikipedia, "1962 FIFA World Cup knockout stage" (read to compare the England quarter-final as an alternative moment)
 * CONFIRMED by those accounts: 6 June 1962, Estadio Sausalito, Viña del Mar; Brazil 2–1 Spain (Adelardo 35', Amarildo 72' and 86'); attendance
 *  18,715; referee Sergio Bustamante (Chile); Pelé was injured and Amarildo (No. 20) played instead; Spain led 1–0 until Amarildo equalised,
 *  so it was 1–1 near the end; Garrincha (No. 7, right winger, 1.69 m, right-footed but comfortable on both feet) took the ball on the RIGHT
 *  flank, dribbled past a defender and paused, then dribbled past the same man and another defender and crossed; Amarildo scored the winner.
 *  Brazil's kit that day (Wikipedia kit box): yellow shirts with green collar and cuffs, WHITE shorts, white socks; Spain: red shirts, dark-blue
 *  shorts, black socks. Spain's left-back was Sígfrid Gràcia (the full-back who faced Brazil's right wing in the listed line-up).
 * REPORTED BY ONE ACCOUNT ONLY: Amarildo scored with a HEADER (Linguasport, which credits the cross to Vavá; both Wikipedias credit Garrincha
 *  — the film follows the two Wikipedias for the cross and Linguasport for the header). "Four minutes from time" (Linguasport) vs "five
 *  minutes before the end" (Wikipedias): the narration says only "near the end".
 * INFERRED / ILLUSTRATIVE: that the first defender was Gràcia and the second the left-half Pachín (neither is named in the film or the
 *  narration); every position, distance and run in metres; the pass out to Garrincha (from Zito); how long he stood in front of the
 *  full-back; the exact body feint (a dip of the left shoulder and a lean inside, then the burst outside with the outside of the right
 *  foot) — it is his well-described trademark, not a frame-by-frame reading of this move; that he went down the line both times; the cross
 *  taken with the right foot from near the byline; where the header was met and where it went in; the keeper Araquistáin's dark jersey and
 *  late dive; all other players and where they stood; the brown leather ball; the winter afternoon; the stadium's look (low open terraces, one
 *  roofed stand, wooded hills behind); the crowd; the camera positions and lenses; the slow-motion speeds. Garrincha's famously bent legs
 *  are not modelled (the shared figure has straight bones).
 *
 * STRUCTURE (the approved standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds; τ = 0 the outside of Garrincha's right boot pushes the ball past the full-back the first time):
 *  ch1 = LIVE, the high main-stand newsreel camera in real time (the ball out to Garrincha, the stand-off, the feint, the pause, the second
 *        beat past two defenders, the cross, Amarildo's header, the net);
 *  ch2 = the slow-motion REPLAY from low behind Garrincha (the shoulder dip, the lean inside, the defender leaning with him, the burst outside);
 *  ch3 = a second replay angle from the byline corner (the pause, two defenders come, the second beat, the cross and the header);
 *  ch4 = the lesson, a duotone (yellow + navy) print: fake one way with your body, then go the other way, fast.
 * Seams are forward passages into the ball. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). World: right-handed metres
 * like athlete.ts: Spain's goal line x = 0, the pitch runs to x = −105, Brazil attack +x, so Garrincha's right wing is +z (touchline z = 34).
 * Inks: yellow (Brazil, grass with blue), red (Spain, skin, leather), blue (sky, grass, trims), navy (key line). Newsreel: a vignette, film
 * scratches and dust over the live and replay chapters. Scenes read only their local t; drawn objects pose on twos, cameras on ones; all
 * randomness is seeded. Framing: the full sheet (card window 1.45:1 down to square), never sheet.safe. Phone heat: ≈4 plates, crowd and
 * stands batched per ink; wide-shot extras print at 'low' detail and every figure is capped a step during passages. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,partial,easeOut,easeIO,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,strike,header,lunge,backpedal,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`garrincha film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead records the narration with Kokoro; then the timing.json import goes here (see the header). */
import timingJson from '../../../public/plays/narration/garrincha-signature-1962/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Live','Chile, 1962. Brazil and Spain are tied, one-one, near the end. On the right wing, Garrincha takes on his defender, beats him, and stops. He beats him again, and one more, and crosses. Amarildo scores!',
  ['Chile','Brazil and Spain','tied, one-one','near the end','On the right wing','Garrincha','takes on','his defender','beats him','and stops','He beats him again','and one more','crosses','Amarildo scores']),
 prov('The feint','Watch slowly. Garrincha dips his shoulder and leans inside. The defender leans too... and Garrincha bursts the other way, down the line!',
  ['Watch slowly','Garrincha dips','his shoulder','leans inside','The defender','leans too','bursts','the other way','down the line']),
 prov('Once more','He stops and waits. Two defenders come. He beats them both, crosses, and Amarildo heads the winner!',
  ['He stops','waits','Two defenders','come','He beats them','both','crosses','Amarildo heads','the winner']),
 prov('Your turn',"Garrincha's secret: fake one way with your body, then go the other way, fast!",
  ["Garrincha's secret",'fake one way','with your body','then go','the other way','fast']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`garrincha film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}
/** true while two scenes print at once (the departing .65 s or the arriving .72 s): figures are capped a detail step */
const busy=(ch:number,t:number)=>t>SEC(ch)-.65||(ch>0&&t<.72);

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
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
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
const n2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};

// ================= Estadio Sausalito: wooded hills round a small bowl, low open terraces, one roofed stand, crowd, pitch, goal =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-112,.8,-38],[8,.8,-38],[8,10,-55],[-112,10,-55]],// far side, an open terrace
 [[8,.8,-36],[8,.8,36],[22,7,36],[22,7,-36]],// behind Spain's goal
 [[8,.8,39],[-112,.8,39],[-112,12,57],[8,12,57]],// near side (the main stand, the newsreel camera)
 [[-113,.8,36],[-113,.8,-36],[-128,7,-36],[-128,7,36]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** the wooded hills of Viña del Mar ringing the ground: [from, to] ground points, base height, seed */
const HILLS:[[number,number],[number,number],number,number][]=[
 [[-300,-190],[160,-190],34,1],[[190,-220],[190,220],28,2],[[160,200],[-300,200],30,3],[[-330,220],[-330,-220],26,4],
];
function ridge(c:Camera,h:typeof HILLS[number]):V3[]{const[[x0,z0],[x1,z1],hh,seed]=h,r=rng(seed*31),top:V3[]=[];const n=26;
 for(let i=0;i<=n;i++){const u=i/n,y=hh*(.55+.45*Math.sin(u*5.2+seed)+.18*Math.sin(u*17+seed*3))+r()*3;top.push([lerp(x0,x1,u),Math.max(6,y),lerp(z0,z1,u)]);}
 return[...top,[x1,0,z1],[x0,0,z0]];}
/** crowd: [stand, u, v, ink 0 paper faces / 1 navy coats / 2 red / 3 yellow, phase] (18,715 in a small ground: sparser on the ends) */
const CROWD=(()=>{const r=rng(1962),out:[number,number,number,number,number][]=[];[620,220,560,150].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r();out.push([st,r(),.05+r()*.88,c<.46?0:c<.78?1:c<.9?2:3,r()*TAU]);}});return out;})();
/** flags on the terrace tops: Chilean (a blue canton with a white star, white over red) and Brazilian (green with a yellow diamond) */
const FLAGS:[V3,number][]=(()=>{const o:[V3,number][]=[];for(let x=-104;x<=0;x+=13)o.push([[x,10,-55],(x/13)%3===0?1:0]);for(let z=-30;z<=30;z+=15)o.push([[22,7,z],z===0?1:0]);return o;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a pale winter sky with paper cloud banks
 s.field(B,.2,.7);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 {const cl=new Path2D(),r=rng(62);for(let i=0;i<7;i++){const x=(r()-.5)*Bnd*1.2,y=hz-300-r()*560,w=260+r()*420;cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.16*(1+.3*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.6);}
 // wooded hills: yellow × blue = green, a navy screen deepens the far slopes
 {const hp=new Path2D();for(const h of HILLS)addPoly(hp,clipPoly(c,ridge(c,h)));s.knockout(hp);s.fill(Y,hp,.6);s.tone(B,hp,.6);s.tone(K,hp,.2);}
 // terraces: knocked out, a navy screen, stepped rows — the crowd prints as ink fields
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),walls=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<12;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/12),bil(q,1,k/12),bil(q,1,(k+1)/12),bil(q,0,(k+1)/12)]));
  addPoly(walls,clipPoly(c,[q[0],q[1],[q[1][0],0,q[1][2]],[q[0][0],0,q[0][2]]]));
  if(si===2){// the roofed stand at the far-end half of the near side (a slab on columns)
   addPoly(roof,clipPoly(c,[[-104,17,62],[-60,17,62],[-60,15.5,44],[-104,15.5,44]]));addPoly(roof,clipPoly(c,[[-104,15.5,44],[-60,15.5,44],[-60,14.4,44],[-104,14.4,44]]));
   for(let x=-104;x<=-60;x+=11)addPoly(roof,clipPoly(c,[[x-.3,15.5,45],[x+.3,15.5,45],[x+.3,7,50],[x-.3,7,50]]));}});
 s.knockout(stands);s.tone(K,stands,.42);s.tone(Y,rows,.2);s.tone(K,rows,.2);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.85);if(seen[2])s.fill(R,heads[2],.95);if(seen[3])s.fill(Y,heads[3],.95);
 // press flashbulbs when the crowd roars
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.5);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1*kAt(c,p),8,24);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(roof);s.fill(K,roof,.85);s.fill(K,walls,.7);
 // flags on poles (Chile: blue canton, white star, white over red; Brazil: green with a yellow diamond)
 {const pole=new Path2D(),blue=new Path2D(),red=new Path2D(),yel=new Path2D(),grn=new Path2D();
  FLAGS.forEach(([b,br],i)=>{if(depthOf(c,b)<4)return;const top:V3=[b[0],b[1]+5,b[2]],k=kAt(c,b),pb=P(c,b),pt=P(c,top);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;pole.addPath(ribbon([pb,pt],Math.max(2,.14*k),{taper:0,wobble:0}));
   const w=2.6*k,h=1.7*k,wv=(u:number)=>Math.sin(tt*5+i+u*4)*h*.12*u,cloth=(u0:number,u1:number,v0:number,v1:number)=>polyPath([[pt[0]+w*u0,pt[1]+h*v0+wv(u0)],[pt[0]+w*u1,pt[1]+h*v0+wv(u1)],[pt[0]+w*u1,pt[1]+h*v1+wv(u1)],[pt[0]+w*u0,pt[1]+h*v1+wv(u0)]],true);
   if(br){grn.addPath(cloth(0,1,0,1));yel.addPath(polyPath([[pt[0]+w*.5,pt[1]+h*.12+wv(.5)],[pt[0]+w*.9,pt[1]+h*.5+wv(.9)],[pt[0]+w*.5,pt[1]+h*.88+wv(.5)],[pt[0]+w*.1,pt[1]+h*.5+wv(.1)]],true));}
   else{blue.addPath(cloth(0,.34,0,.5));red.addPath(cloth(0,1,.5,1));}});
  s.fill(K,pole,.95);s.knockout(grn);s.knockout(blue);s.knockout(red);s.fill(B,blue,.95);s.fill(B,grn,.75);s.fill(Y,grn,.9);s.fill(R,red,.95);s.knockout(yel);s.fill(Y,yel,.95);}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-113,0,-38],[8,0,-38],[8,0,39],[-113,0,39]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.16);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // the corner flag on Brazil's right (the corner Garrincha runs at)
 {const b:V3=[0,0,34],top:V3=[0,1.6,34];if(depthOf(c,b)>2){const pb=P(c,b),pt=P(c,top),k=kAt(c,b);s.fill(K,ribbon([pb,pt],Math.max(2,.05*k),{taper:0,wobble:0}),.95);const fl=polyPath([pt,[pt[0]-.5*k,pt[1]+.15*k+Math.sin(tt*6)*.05*k],[pt[0],pt[1]+.35*k]],true);s.knockout(fl);s.fill(R,fl,.95);}}
 photographers(s,c,tt);
 goal(s,c,o.net);
}
/** press photographers crouched behind the goal line with box cameras (a 1960s detail) */
const SNAPPERS:[number,number][]=[[2.6,-12],[2.4,-8.6],[2.8,6.8],[2.5,9.8],[3,13]];
function photographers(s:Sheet,c:Camera,tt:number){
 const coat=new Path2D(),face=new Path2D(),box=new Path2D();let n=0;
 SNAPPERS.forEach(([x,z],i)=>{const g:V3=[x,0,z];if(depthOf(c,g)<1.5)return;const k=kAt(c,g),[gx,gy]=P(c,g);if(Math.abs(gx)>s.W||Math.abs(gy)>s.H)return;
  const bob=Math.sin(tt*3+i)*.02*k;coat.addPath(polyPath([[gx-.35*k,gy],[gx+.35*k,gy],[gx+.3*k,gy-.7*k],[gx-.25*k,gy-.8*k]],true));
  face.addPath(polyPath(Array.from({length:10},(_,a)=>[gx+Math.cos(a/10*TAU)*.13*k,gy-.95*k+bob+Math.sin(a/10*TAU)*.14*k] as Pt),true));
  box.rect(gx-.24*k,gy-.95*k+bob,.2*k,.16*k);n++;});
 if(!n)return;s.knockout(coat);s.fill(K,coat,.8);s.knockout(face);s.tone(R,face,.2);s.tone(Y,face,.45);s.fill(K,box,.95);
}
/** the goal at x = 0: square posts, a box net held by rear stanchions; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,14,5);grid(top,14,3);grid(side(-W),3,5);grid(side(W),3,5);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[0,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

/** the newsreel: a soft vignette in the corners, two wandering film scratches and a few dust specks (≤ 3 ops) */
function newsreel(s:Sheet,t:number,amt=1){
 if(amt<=.02)return;const tt=twos(t),hw=s.W/2,hh=s.H/2,fr=Math.floor(tt*12),r=rng(4000+fr);
 const v=new Path2D();v.rect(-hw-60,-hh-60,s.W+120,s.H+120);const n=48;for(let i=n;i>=0;i--){const a=i/n*TAU,cx=Math.cos(a),cy=Math.sin(a),e=Math.pow(Math.abs(cx)**4+Math.abs(cy)**4,-.25);i===n?v.moveTo(cx*e*hw*1.04,cy*e*hh*1.08):v.lineTo(cx*e*hw*1.04,cy*e*hh*1.08);}v.closePath();
 s.tone(K,v,.3*amt);
 const sc=new Path2D();for(let i=0;i<2;i++){if(r()<.35)continue;const x=(hash(Math.floor(tt*1.5)+i*7,5)-.5)*s.W*.9+(r()-.5)*14,top=-hh+r()*hh*.6,bot=top+hh*(.6+r()*.9);sc.addPath(ribbon([[x,top],[x+(r()-.5)*12,(top+bot)/2],[x+(r()-.5)*16,bot]],2.4+r()*1.5,{taper:.3,wobble:1,seed:fr+i}));}
 for(let i=0;i<5;i++){if(r()<.5)continue;const x=(r()-.5)*s.W,y=(r()-.5)*s.H,sz=3+r()*6;sc.addPath(polyPath(Array.from({length:7},(_,k)=>[x+Math.cos(k/7*TAU)*sz*(.7+.3*Math.sin(k*2+i)),y+Math.sin(k/7*TAU)*sz] as Pt),true));}
 s.knockout(sc,.8*amt);
}

// ================= the 1962 leather ball: tan (yellow × red screens), stitched panel seams, a blue shade =================
const BALL_R=.11;
function leatherBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(Y,disc,duo?.6:.75);if(!duo)s.tone(R,disc,.45);
 if(r>=12){s.save();s.clip(disc);
  s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
  const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
  s.stroke(K,seams,Math.max(1.6,r*.05),.9);s.restore();}
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3,cov=.55){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(cov-b[1]*.05,.2,.55));}

// ================= kits (6 June 1962) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_MID:AthleteStyle['skin']=[[R,.32],[Y,.6],[K,.1]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]];
/** Brazil: yellow shirts with green (printed blue over yellow) collar and cuffs, white shorts and socks (the kit box for this match) */
const BRA=(skin:AthleteStyle['skin'],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:'paper',socks:'paper',trim:B,boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
/** Spain: red shirts, dark-blue shorts, black socks */
const ESP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:B,socks:K,trim:K,boots:K,skin:SKIN_LIGHT,hair:[K,.75],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
const GB:Build={height:1.69,bulk:.96,thighs:1.08};
const GARRINCHA:AthleteStyle=BRA(SKIN_MID,{number:7,numberInk:K,hair:K,build:GB,seed:7});
const AB:Build={height:1.72,bulk:.95};
const AMARILDO:AthleteStyle=BRA(SKIN_MID,{number:20,numberInk:K,hairStyle:'curly',build:AB,seed:20});
const FULLBACK:AthleteStyle=ESP({build:{height:1.75,bulk:1.02},seed:10});
const HALF:AthleteStyle=ESP({build:{height:1.74,bulk:1},hair:[K,.9],seed:13});
const KEEPER:AthleteStyle={shirt:[K,.82],shorts:[K,.9],socks:[K,.82],boots:K,skin:SKIN_LIGHT,hair:[K,.7],line:K,sleeves:'long',shade:[K,.26],seed:22};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],line:K,sleeves:'short',seed:33};
/** duotone kits for the lesson (yellow + navy only) */
const GARRINCHA_DUO:AthleteStyle={...GARRINCHA,trim:K,skin:[[Y,.6],[K,.22]],shade:[K,.22]};
const GHOST_DUO:AthleteStyle={...FULLBACK,shirt:[K,.42],shorts:[K,.3],socks:[K,.42],trim:K,skin:[[Y,.3]],hair:[K,.4],shade:[K,.18],shadow:[K,.15]};
const LEVEL:Record<Detail,number>={low:0,mid:1,high:2};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette).
 * prev = the pose one drawn frame earlier (hair / hem secondary motion); smear = motion echo of fast feet; detail / cap = phone heat. */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:'auto'|Detail;cap?:Detail}={}){
 let detail:'auto'|Detail=o.detail??style.detail??'auto';
 if(o.cap){if(detail==='auto'){const h=1.8*kAt(c,[place.x??0,1,place.z??0])*s.unit*s.arrival;detail=h<50?'low':h<170?'mid':'high';}if(LEVEL[detail]>LEVEL[o.cap])detail=o.cap;}
 const st={...style,detail};
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the first push past the full-back) =================
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a running body: stride phase from distance run, speed from velocity, facing the run (or `look` when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
type St={pose:Pose;place:Place};
const mixSt=(A:St,Bq:St,u:number):St=>({pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}});
/** segments on τ, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(segs:[number,(t:number)=>St][],tau:number):St{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSt(segs[i-1][1](tau),segs[i][1](tau),sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSt(segs[i][1](tau),segs[i+1][1](tau),sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}

/** THE FEINT (Garrincha's trademark, facing +x down the right wing; his left = −z = inside): the stand-off over the ball (0) → the left
 * shoulder dips and the body leans inside, the left foot steps out (.35–.5) → the weight snaps back onto the left leg (.62) → the OUTSIDE of
 * the right boot pushes the ball past the defender's other side (CONTACT .78) → the first sprint stride outside (1). Keys in degrees. */
const U_K=.78;
const STANDOFF=posed({lHipF:22,rHipF:18,lKnee:36,rKnee:32,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:30,rShA:30,lElb:46,rElb:46,neckP:26});
const FEINT_KEYS:[number,Pose][]=[
 [0,STANDOFF],
 [.35,posed({dz:-.12,roll:-10,bend:-14,yaw:14,twist:10,lHipA:24,lHipF:24,lKnee:46,rHipA:6,rHipF:14,rKnee:30,lShA:16,rShA:56,lElb:52,rElb:36,lShF:-10,rShF:14,lean:18,pitch:4,neckY:22,neckP:22})],
 [.5,posed({dz:-.22,roll:-15,bend:-18,yaw:18,twist:12,lHipA:30,lHipF:22,lKnee:54,lAnk:-6,rHipA:4,rHipF:12,rKnee:30,lShA:12,rShA:64,lElb:56,rElb:34,lShF:-14,rShF:18,lean:20,pitch:5,neckY:26,neckP:20})],
 [.62,posed({dz:-.14,roll:4,bend:4,yaw:-12,twist:-10,lHipA:18,lHipF:24,lKnee:58,lAnk:4,rHipA:24,rHipF:28,rKnee:36,rAnk:18,rHipR:-18,lShA:58,rShA:30,lElb:44,rElb:44,lean:20,pitch:6,neckY:-16,neckP:24})],
 [U_K,posed({dz:-.02,roll:12,bend:10,yaw:-26,twist:-16,lHipA:10,lHipF:18,lKnee:46,lAnk:30,rHipA:34,rHipF:34,rKnee:18,rAnk:36,rHipR:-26,lShA:70,lShF:30,rShA:26,rShF:-30,lElb:40,rElb:52,lean:22,pitch:7,neckY:-22,neckP:22})],
 [1,runCycle(.12,{speed:.9})],
];
const feintPose=(u:number)=>keyPoses(clamp(u),FEINT_KEYS);

// ---- the spots (right wing; Brazil attack +x) ----
const S1:[number,number]=[-29.5,27.0];// the first stand-off, in front of the full-back
const S2:[number,number]=[-19.4,29.7];// the pause
const GR:[number,number]=[-37.6,27.9];// where he receives
const DB1=n2(1,.62),DB2=n2(1,.7);// the pushes outside
const TAU_P=-6.4,TAU_R=-5.3,TAU_S=-2.3,F1D=.8,TAU_S2=1.6,F2D=.55,TAU_F1=2.2,TAU_3=TAU_F1+F2D,TAU_C=4.45;
/** where the ball sits in front of him at a stand-off: just outside the right boot at the push (read from the solved skeleton) */
const standBall=(x:number,z:number):V3=>{const sk=solve(feintPose(U_K),GB,{x,z,yaw:0});return[sk.rToe[0]+.1,BALL_R,sk.rToe[2]+.08];};
const BS1=standBall(S1[0],S1[1]),BS2=standBall(S2[0],S2[1]);
// the cross: contact point, run-up, body yaw and the right toe read from the solved strike
const CB:V3=[-8.4,BALL_R,30.1];
const HP:V3=[-6.3,2.02,-.9];// where Amarildo meets it
const YC=lerpAng(0,YAW(HP[0]-CB[0],HP[2]-CB[2]),.62);
const DUR_S=.9,TAU_CS=TAU_C-STRIKE_CONTACT*DUR_S;
const CXP:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),GB,{x:0,z:0,yaw:YC}),f=dirOf(YC);return[CB[0]-sk.rToe[0]-f[0]*.1,CB[2]-sk.rToe[2]-f[1]*.1];})();
const TFC=1.3,TAU_H=TAU_C+TFC,G_TO:V3=[0,.95,-2.35],TAU_G=TAU_H+.33,NET_HIT:V3=[2,.9,-2.6];
const P1:MKey[]=[[TAU_R,GR[0],GR[1]],[TAU_S,S1[0],S1[1]]];
const P2:MKey[]=[[.3,S1[0]+DB1[0]*1.25,S1[1]+DB1[1]*1.25],[.8,-24.7,29.3],[1.25,-21.1,29.8],[TAU_S2,S2[0],S2[1]]];
const P3:MKey[]=[[TAU_3+.3,S2[0]+DB2[0]*1.25,S2[1]+DB2[1]*1.25],[TAU_3+.75,-15.9,31.2],[TAU_3+1.25,-12.3,31.1],[TAU_CS,CXP[0]-1.05,CXP[1]+.35]];
const PASSER_FROM:[number,number]=[-47.8,19.6];
const ZITO:MKey[]=[[-12,-58,15],[-9,-52,17.4],[TAU_P,PASSER_FROM[0],PASSER_FROM[1]],[TAU_P+2,-44,21],[TAU_C,-34,22.5],[TAU_G+3,-28,21]];
/** his push: the ball runs on ahead of the right boot then slows */
const pushed=(from:V3,dir:[number,number],s:number):V3=>{const d=7.2/2.6*(1-Math.exp(-2.6*s));return[from[0]+dir[0]*d,BALL_R,from[2]+dir[1]*d];};
/** a feint in any frame: u(τ) from the feint's start, the place sliding out along the push after contact */
function feintSt(x:number,z:number,dir:[number,number],t0:number,dur:number,tau:number):St{
 const tc=t0+dur,u=tau<tc?(tau-t0)/dur*U_K:U_K+(tau-tc)/.3*(1-U_K),s=clamp((tau-tc)/.3),d=1.25*s*s;
 return{pose:feintPose(u),place:{x:x+dir[0]*d,z:z+dir[1]*d,yaw:lerpAng(0,YAW(dir[0],dir[1]),sm(tc-.05,tc+.3,tau))}};}
const sway=(tau:number)=>({...STANDOFF,twist:STANDOFF.twist+5*D2R*Math.sin(tau*3.1),bend:4*D2R*Math.sin(tau*2.3),neckY:8*D2R*Math.sin(tau*1.7)});
const GAR_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-12,-44,30],[TAU_P,-40.5,29.6],[TAU_R,GR[0],GR[1]]],t,[PASSER_FROM[0],0,PASSER_FROM[1]])],
 [TAU_R,t=>{const q=pathPos(P1,t),d=q.dist;return{pose:blendPose(runCycle(d/1.7,{speed:.35,stride:.72}),{...runCycle(d/1.7,{speed:.35,stride:.72}),neckP:28*D2R,lean:14*D2R},.8),place:{x:q.x,z:q.z,yaw:YAW(1,-.03)}};}],
 [TAU_S,t=>({pose:sway(t),place:{x:S1[0],z:S1[1],yaw:0}})],
 [-F1D,t=>feintSt(S1[0],S1[1],DB1,-F1D,F1D,t)],
 [.3,t=>runner(P2,t,[CB[0],0,CB[2]],sway(t))],
 [TAU_S2,t=>({pose:sway(t),place:{x:S2[0],z:S2[1],yaw:0}})],
 [TAU_F1,t=>feintSt(S2[0],S2[1],DB2,TAU_F1,F2D,t)],
 [TAU_3+.3,t=>runner(P3,t,[CB[0],0,CB[2]])],
 [TAU_CS,t=>{const u=(t-TAU_CS)/DUR_S,e=sm(0,.24,u),st=P3[P3.length-1];return{pose:strike(clamp(u),{foot:'r',power:.8}),place:{x:lerp(st[1],CXP[0],e),z:lerp(st[2],CXP[1],e),yaw:lerpAng(YAW(1,-.3),YC,sm(0,.2,u))}};}],
 [TAU_CS+DUR_S,t=>runner([[TAU_CS+DUR_S,CXP[0],CXP[1]],[TAU_G-.2,CXP[0]+2.4,CXP[1]-2.2],[TAU_G+.6,CXP[0]+2.9,CXP[1]-3]],t,HP)],
 [TAU_G+.6,t=>({pose:celebrate(Math.max(0,t-TAU_G-.6)/.9,{kind:'arms'}),place:{x:CXP[0]+2.9,z:CXP[1]-3,yaw:YAW(HP[0]-CXP[0],HP[2]-CXP[1])}})],
];
const garAt=(tau:number)=>segAt(GAR_SEGS,tau);

// ---- the ball ----
/** carried on a path: the ball runs out ahead after each touch and he catches it up (continuous lead, `stride` metres per touch) */
function carry(p:MKey[],tau:number,stride:number,lead=.9):V3{const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz)||1,f=q.dist/stride-Math.floor(q.dist/stride),l=.35+lead*Math.sin(Math.PI*f);return[q.x+q.vx/v*l,BALL_R,q.z+q.vz/v*l];}
function ballAt(tau:number):V3{
 if(tau<TAU_P){const q=pathPos(ZITO,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.3+.3*Math.abs(Math.sin(q.dist*.9));return[q.x+q.vx/v*tap,BALL_R,q.z+q.vz/v*tap];}
 const recv:V3=[GR[0]+.45,BALL_R,GR[1]];
 if(tau<TAU_R){const a=ballAt(TAU_P-1e-3),u=(tau-TAU_P)/(TAU_R-TAU_P),e=1-Math.pow(1-u,1.4);return[lerp(a[0],recv[0],e),BALL_R,lerp(a[2],recv[2],e)];}
 if(tau<-F1D){const c1=mix3(recv,carry(P1,tau,1.6,.5),sm(TAU_R,TAU_R+.5,tau));return mix3(c1,BS1,sm(TAU_S-.5,TAU_S+.3,tau));}
 if(tau<0)return BS1;
 if(tau<TAU_S2-.3){const pu=pushed(BS1,DB1,tau);return mix3(pu,carry(P2,tau,2.6,.8),sm(.45,.95,tau));}
 if(tau<TAU_3)return mix3(carry(P2,TAU_S2-.3,2.6,.8),BS2,sm(TAU_S2-.3,TAU_S2+.1,tau));
 if(tau<TAU_C){const pu=pushed(BS2,DB2,tau-TAU_3),cr=carry(P3,tau,2.6,.8);return mix3(mix3(pu,cr,sm(TAU_3+.45,TAU_3+.95,tau)),CB,sm(TAU_CS-.3,TAU_C-.08,tau));}
 if(tau<TAU_H){const s=tau-TAU_C,u=s/TFC,vy=(HP[1]-CB[1]+.5*9.81*TFC*TFC)/TFC;return[lerp(CB[0],HP[0],u),CB[1]+vy*s-.5*9.81*s*s,lerp(CB[2],HP[2],u)];}
 if(tau<TAU_G){const u=(tau-TAU_H)/(TAU_G-TAU_H),p=mix3(HP,G_TO,u);p[1]+=.25*Math.sin(u*Math.PI)*.3;return p;}
 const e=tau-TAU_G,u=clamp(e/.14);if(u<1)return mix3(G_TO,[1.75,.85,-2.5],easeOut(u));
 const d=clamp((e-.14)/.5),h=.85*(1-d*d)+.11*d*d;return[1.75-.3*d,Math.max(BALL_R,h)+(d>=1?.08*Math.abs(Math.sin((e-.64)*8))*Math.exp(-(e-.64)*3):0),-2.5+.1*d];}

// ---- the full-back (first defender): jockeys in front, bites on the feint (lunges to his right = inside), turns, recovers, bites again ----
const D1A:[number,number]=[S1[0]+2.35,S1[1]-.5],D1B:[number,number]=[S2[0]+2.05,S2[1]-.55];
const D1_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>{const r=runner([[-12,-22,24],[-8,-25,25.4],[TAU_R,-26.2,26.1],[TAU_S,D1A[0],D1A[1]]],t,ballAt(t),backpedal(0));return{...r,place:{...r.place,yaw:YAW(ballAt(t)[0]-(r.place.x??0),ballAt(t)[2]-(r.place.z??0))}};}],
 [TAU_S,t=>({pose:blendPose(backpedal(t*1.4),{...stand(),lean:24*D2R,lHipF:34*D2R,rHipF:34*D2R,lKnee:50*D2R,rKnee:50*D2R},.55),place:{x:D1A[0],z:D1A[1],yaw:Math.PI}})],
 [-.5,t=>({pose:lunge(clamp((t+.5)/.95),{side:'r'}),place:{x:D1A[0],z:D1A[1],yaw:Math.PI}})],
 [.45,t=>{const u=sm(.45,.9,t),q=pathPos([[.55,D1A[0]+.1,D1A[1]-.3],[1.05,-23.9,27.6],[TAU_S2+.1,D1B[0],D1B[1]]],t),v=Math.hypot(q.vx,q.vz),d=q.dist;
  return{pose:blendPose(lunge(1,{side:'r'}),runCycle(d/2.9,{speed:clamp(v/8)}),sm(.45,.7,t)),place:{x:q.x,z:q.z,yaw:Math.PI+Math.PI*u}};}],
 [TAU_S2+.1,t=>{const u=sm(TAU_S2+.1,TAU_S2+.45,t);return{pose:blendPose(runCycle(.2,{speed:.3}),blendPose(backpedal(t*1.4),{...stand(),lean:24*D2R,lKnee:50*D2R,rKnee:50*D2R},.5),u),place:{x:D1B[0],z:D1B[1],yaw:TAU-Math.PI*u}};}],
 [TAU_3-.4,t=>({pose:lunge(clamp((t-TAU_3+.4)/.9),{side:'r'}),place:{x:D1B[0],z:D1B[1],yaw:Math.PI}})],
 [TAU_3+.5,t=>{const u=sm(TAU_3+.5,TAU_3+.95,t),q=pathPos([[TAU_3+.6,D1B[0],D1B[1]-.3],[TAU_C,-12.2,29.6],[TAU_G+2,-8.6,27]],t);return{pose:blendPose(lunge(1,{side:'r'}),runCycle(q.dist/2.8,{speed:.7}),sm(TAU_3+.5,TAU_3+.8,t)),place:{x:q.x,z:q.z,yaw:Math.PI+Math.PI*u}};}],
];
const d1At=(tau:number)=>segAt(D1_SEGS,tau);
// ---- the second defender: comes across to double up, lunges at the outside, is left behind ----
const D2B:[number,number]=[-15.5,28.1];
const D2_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-12,-18,14],[0,-15.2,19.5],[TAU_F1-.1,D2B[0],D2B[1]]],t,ballAt(t),backpedal(0))],
 [TAU_F1-.1,t=>({pose:blendPose(backpedal(t*1.3),{...stand(),lean:22*D2R,lKnee:46*D2R,rKnee:46*D2R},.5),place:{x:D2B[0],z:D2B[1],yaw:YAW(S2[0]-D2B[0],S2[1]-D2B[1])}})],
 [TAU_3-.2,t=>({pose:lunge(clamp((t-TAU_3+.2)/.85),{side:'l'}),place:{x:D2B[0],z:D2B[1],yaw:YAW(S2[0]-D2B[0],S2[1]-D2B[1])}})],
 [TAU_3+.65,t=>{const q=pathPos([[TAU_3+.75,D2B[0]+.2,D2B[1]+.3],[TAU_C+.4,-11.4,27.5],[TAU_G+2,-8,22]],t),v=Math.hypot(q.vx,q.vz);return{pose:blendPose(lunge(1,{side:'l'}),runCycle(q.dist/2.7,{speed:clamp(v/8)}),sm(TAU_3+.65,TAU_3+.95,t)),place:{x:q.x,z:q.z,yaw:v>.5?YAW(q.vx,q.vz):Math.PI}};}],
];
const d2At=(tau:number)=>segAt(D2_SEGS,tau);
// ---- Amarildo: runs into the box, leaps and heads the cross in ----
const DUR_H=1.1,TAU_HS=TAU_H-.52*DUR_H;
const YA=YAW(...n2(n2(CB[0]-HP[0],CB[2]-HP[2])[0]*.55+n2(G_TO[0]-HP[0],G_TO[2]-HP[2])[0]*.45,n2(CB[0]-HP[0],CB[2]-HP[2])[1]*.55+n2(G_TO[0]-HP[0],G_TO[2]-HP[2])[1]*.45));
const AP:[number,number]=(()=>{const sk=solve(header(.52),AB,{x:0,z:0,yaw:YA}),f=dirOf(YA);return[HP[0]-sk.head[0]-f[0]*.12,HP[2]-sk.head[2]-f[1]*.12];})();
const AFA=dirOf(YA);
const AMA_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-12,-30,-6],[-4,-22,-5],[TAU_C-1,-13.5,-3.4],[TAU_HS,AP[0]-AFA[0]*1.3,AP[1]-AFA[1]*1.3]],t,ballAt(t))],
 [TAU_HS,t=>{const u=(t-TAU_HS)/DUR_H,e=sm(0,.3,u);return{pose:header(clamp(u)),place:{x:lerp(AP[0]-AFA[0]*.5,AP[0],e),z:lerp(AP[1]-AFA[1]*.5,AP[1],e),yaw:YA}};}],
 [TAU_HS+DUR_H,t=>{const q=pathPos([[TAU_HS+DUR_H,AP[0],AP[1]],[TAU_G+1.6,AP[0]-.8,AP[1]+4.2],[TAU_G+4,AP[0]-2,AP[1]+7]],t);return{pose:celebrate(q.dist/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:YAW(-.2,1)}};}],
];
const amaAt=(tau:number)=>segAt(AMA_SEGS,tau);

// ---- everybody else (illustrative: who stood where is not documented) ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>St};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const ACTORS:Actor[]=[
 {style:BRA(SKIN_LIGHT,{number:4,numberInk:K,seed:4}),at:(t,b)=>{const r=runner(ZITO,t,b);if(t>TAU_P-.55&&t<TAU_P+.6){const u=clamp((t-TAU_P+.55)/1.1);r.pose=blendPose(r.pose,keyPoses(u,[[0,runCycle(.1,{speed:.5})],[.4,posed({lHipF:26,lKnee:30,rHipF:-38,rKnee:90,rAnk:40,lShA:56,rShA:36,lean:6,yaw:-10,twist:16,neckP:20})],[.5,posed({lHipF:18,lKnee:30,rHipF:40,rKnee:22,rAnk:46,lShA:64,rShA:36,lean:-4,yaw:8,twist:-14,neckP:18})],[1,runCycle(.6,{speed:.4})]]),Math.sin(u*Math.PI));}return r;}},// Zito plays it out wide
 mover(BRA(SKIN_MID,{number:19,numberInk:K,seed:19}),[[-12,-26,4],[-2,-15,5.5],[TAU_C,-7.2,4.4],[TAU_G,-4.6,2.6]]),// Vavá, near post
 mover(BRA(SKIN_LIGHT,{number:21,numberInk:K,seed:21}),[[-12,-32,-18],[-2,-20,-14],[TAU_C,-10,-9],[TAU_G,-7.4,-6.6]]),// Zagallo, far post
 mover(BRA(SKIN_DARK,{number:8,numberInk:K,seed:8}),[[-12,-44,-2],[-2,-31,6],[TAU_C,-22,8],[TAU_G,-19,6]]),// Didi, edge of the box
 mover(ESP({seed:40,build:{height:1.8,bulk:1.06}}),[[-12,-20,2],[-2,-12,3.8],[TAU_C,-6.4,3.4],[TAU_G,-4,1.8]],backpedal(0)),// centre-half on Vavá
 mover(ESP({seed:41}),[[-12,-24,-12],[-2,-14,-10],[TAU_C,-8.6,-6.2],[TAU_G,-6.6,-4.8]],backpedal(0)),// right-back on Zagallo
 mover(ESP({seed:42}),[[-12,-30,6],[-2,-22,11],[TAU_C,-18,12],[TAU_G,-14,8]]),// a half-back tracking back
 mover(ESP({seed:43,hairStyle:'balding'}),[[-12,-50,4],[-2,-42,8],[TAU_G,-34,10]]),// a Spanish forward, well behind the play
 mover(REF,[[-12,-40,8],[-2,-30,14],[TAU_C,-20,16],[TAU_G,-15,13]]),// Sergio Bustamante
 {style:KEEPER,at:(t,b)=>{const z=clamp(lerp(b[2]*.08,.4,sm(TAU_C,TAU_H-.3,t)),-1.2,2.4),x=-1.1;if(t<TAU_H-.04)return{pose:keeperSet(t*1.5),place:{x,z,yaw:YAW(b[0]-x,b[2]-z)}};
  return{pose:keeperDive(clamp((t-TAU_H+.04)/.9),{side:'r',height:.45}),place:{x,z:lerp(2.4,.4,1),yaw:YAW(HP[0]-x,HP[2]-.4)}};}},// Araquistáin
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws the principals with secondary motion (+ smear on Garrincha's fast feet). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prevDt?:number;cap?:boolean;glow?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],dt=o.prevDt??1/12;
 const put=(style:AthleteStyle,st:St,prev?:St,smear=false,low=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear,detail:low?'low':'auto',cap:o.cap?(low?'low':'mid'):undefined})});};
 for(const a of ACTORS)put(a.style,a.at(tp,bp),undefined,false,!o.hero);
 const fast=(tp>-.1&&tp<TAU_S2)||(tp>TAU_3-.1&&tp<TAU_C+.4);
 put(FULLBACK,d1At(tp),o.hero?d1At(tp-dt):undefined);
 put(HALF,d2At(tp),o.hero?d2At(tp-dt):undefined);
 put(AMARILDO,amaAt(tp),o.hero?amaAt(tp-dt):undefined,!!o.hero&&tp>TAU_HS&&tp<TAU_H+.3);
 put(GARRINCHA,garAt(tp),garAt(tp-dt),!!o.hero&&fast);
 items.push({depth:depthOf(c,ball),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.5,q[1]+Math.sin(i/20*TAU)*r*1.5] as Pt),true),r*.25*o.glow,.95);
  leatherBall(s,q[0],q[1],r,spinAt(tau),{sq:clamp(sp/(r*4),0,.6),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
const spinAt=(tau:number)=>{const a=ballAt(tau-.1),b=ballAt(tau);return tau*1.3+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])*20;};
/** a halo round the torso and head (pelvis → chest → head) printed BEFORE the figure, so only its rim shows: "dips his shoulder" / "with your body" */
function bodyHalo(s:Sheet,c:Camera,pose:Pose,place:Place,build:Build,ink:string,g:number,cov=.85){
 if(g<=.02)return;const sk=solve(pose,build,place),k=kAt(c,sk.chest);
 s.fill(ink,ribbon([sk.pelvis,sk.chest,sk.lSh,sk.head].map(j=>P(c,j)),(.5+.12*g)*k*g,{taper:.1,pressure:0,wobble:1,seed:81}),cov);}
/** a dashed ground path (one op) */
function groundDash(s:Sheet,c:Camera,pts:V3[],w:number,ink:string,seed:number,o:{cov?:number;dash?:number;progress?:number}={}){
 const{cov=1,dash=.22,progress=1}=o;let q=pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));if(progress<1)q=partial(q,progress);if(q.length<2)return;
 let L=0;for(let i=1;i<q.length;i++)L+=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);const k=kAt(c,pts[0]),n=Math.max(1,Math.floor(L/(dash*k*2))),gaps:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;gaps.push([u,u+.45/n]);}
 s.fill(ink,ribbon(q,w,{seed,pressure:.3,taper:.15,wobble:1,gaps}),cov);}
function arrowTip(s:Sheet,ink:string,a:Pt,b:Pt,size:number,cov=1){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),q:Pt[]=[[size*.4,0],[-size*.7,-size*.6],[-size*.4,0],[-size*.7,size*.6]].map(([x,y])=>[b[0]+x*Math.cos(ang)-y*Math.sin(ang),b[1]+x*Math.sin(ang)+y*Math.cos(ang)] as Pt);s.fill(ink,polyPath(q,true),cov);}
const groundRing=(x:number,z:number,rx:number,rz=rx,n=24)=>{const o:V3[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;o.push([x+Math.cos(a)*rx,.02,z+Math.sin(a)*rz]);}return o;};
/** a ground arrow (solid ribbon + tip) from a along a straight line, drawn to `progress` */
function groundArrow(s:Sheet,c:Camera,a:[number,number],b:[number,number],w:number,ink:string,seed:number,progress:number,cov=.95){
 if(progress<=.02)return;const pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*progress;pts.push([lerp(a[0],b[0],u),.02,lerp(a[1],b[1],u)]);}const pp=pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));if(pp.length<2)return;
 s.fill(ink,ribbon(pp,w,{seed,taper:.15,wobble:1}),cov);arrowTip(s,ink,pp[pp.length-2],pp[pp.length-1],w*3.4,cov);}

// ================= chapter 1 (LIVE, real time): the high main-stand newsreel camera =================
const TL=T(0,'beats him')+.1;// τ = 0 (the first push past the full-back) lands just after the words "beats him"
const BCAM:V3=[-22,14,70];
function ch1Look(tau:number):V3{const b=ballAt(tau);
 const toBox=sm(TAU_C-.2,TAU_H,tau,easeInOutSine),box:V3=[lerp(HP[0],b[0],.3)-2,2.2,lerp(HP[2],b[2],.3)+3];
 const est=1-sm(-9,TAU_R+1,tau);// the establishing view: aimed up over the play at the far terrace and the hills
 return mix3(mix3([b[0]+1.2,1.6,b[2]-1.2],[-34,7,-6],est*.8),box,toBox);}
function ch1Cam(t:number){const tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const push=1+.12*sm(T(0,'On the right wing'),T(0,'On the right wing')+1.4,t)+.1*sm(T(0,'his defender'),T(0,'his defender')+1.2,t);
 const F=key(tau,[[-14,3300],[TAU_R-1,3900],[TAU_S,6200],[TAU_S2,7000],[TAU_3+.6,6800],[TAU_C,6000],[TAU_H,6800],[TAU_G+2,6400]])*push;return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=ch1Cam(t),goalIn=t-TL-TAU_G;frame(s);
  stadium(s,c,{t,cheer:.15+.35*sm(TL-.2,TL+.6,t)*(1-sm(TL+1,TL+2,t))+1.1*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,t-TL,tt-TL,{ballMin:12,cap:busy(0,t)});
  newsreel(s,t,1);},
 aperture(t){const c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(12,BALL_R*kAt(c,p))*.95,12);},
 still:11,
};

// ================= chapter 2 (TV slow-motion replay, low behind Garrincha): the dip, the lean, the defender leans too, the burst =================
const ch2T=()=>({w:T(1,'Watch slowly'),gd:T(1,'Garrincha dips'),sh:T(1,'his shoulder'),li:T(1,'leans inside'),td:T(1,'The defender'),lt:T(1,'leans too'),b:T(1,'bursts'),ow:T(1,'the other way'),dl:T(1,'down the line'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,TAU_S+.4],[q.gd,-F1D],[q.sh+.3,-F1D+.3],[q.li+.4,-F1D+.45*F1D/U_K+.02],[q.td+.3,-.2],[q.lt+.3,-.06],[q.b+.25,.04],[q.ow+.4,.42],[q.dl+.4,.95],[q.end,1.4]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),g=garAt(tau).place,d=d1At(tau).place,gx=g.x??0,gz=g.z??0;
 const run=sm(q.b,q.end,t,easeIO),back=lerp(5.4,6.4,run),side=lerp(-1.3,-2.2,run);
 const pos:V3=[gx-back,lerp(1.35,1.6,run),gz+side],look:V3=[lerp(gx,d.x??0,.45)+.6,lerp(.95,.85,run),lerp(gz,d.z??0,.45)+.4*run];
 const F=key(t,mono([[0,1500],[q.gd,1700],[q.li,1850],[q.lt,1850],[q.b,1650],[q.end,1450]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),prevDt=Math.max(.02,tp-tau2(tt-1/12));frame(s);
  stadium(s,c,{t,cheer:.15+.5*sm(q.b,q.ow,t),flash:.1});
  const g=garAt(tp);
  // "leans inside": a dashed yellow arrow to the inside (the way he pretends to go); crossed out on "bursts"
  const fake=sm(q.li-.1,q.li+.5,tt,easeOut),off=1-sm(q.ow,q.dl,tt);
  if(fake>0&&off>0){const a:[number,number]=[S1[0]+.6,S1[1]-.5],b:[number,number]=[S1[0]+3.2,S1[1]-3.4],pts:V3[]=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([lerp(a[0],b[0],u),.02,lerp(a[1],b[1],u)]);}
   groundDash(s,c,pts,16,Y,31,{progress:fake,cov:.95*off});if(fake>.95)arrowTip(s,Y,P(c,pts[10]),P(c,pts[12]),52,.95*off);
   const x=sm(q.b,q.b+.4,tt,easeOutBack)*off;if(x>.02){const m=P(c,pts[7]),r=44*x;s.fill(K,ribbon([[m[0]-r,m[1]-r],[m[0]+r,m[1]+r]],13,{seed:32}),.95);s.fill(K,ribbon([[m[0]+r,m[1]-r],[m[0]-r,m[1]+r]],13,{seed:33}),.95);}}
  // "the defender leans too": a navy wobble ring under his feet
  const lt=sm(q.lt-.1,q.lt+.4,tt,easeOutBack)*(1-sm(q.ow,q.dl,tt));if(lt>.02){const d=d1At(tp).place;s.fill(B,ribbon(groundRing((d.x??0),(d.z??0)-.25,.75*lt,.55*lt).map(p=>P(c,p)),10,{seed:40,close:true,wobble:1.5}),.9);}
  // "the other way": the real route prints outside, in red (the push past him)
  groundArrow(s,c,[S1[0]+.5,S1[1]+.3],[S1[0]+6.2,S1[1]+3.8],18,R,34,sm(q.ow-.1,q.ow+.6,tt,easeOut),.95*(1-sm(q.dl+.8,q.end,tt)));
  // "dips his shoulder": a yellow halo round his torso while he sells the fake
  bodyHalo(s,c,g.pose,g.place,GB,Y,sm(q.sh-.1,q.sh+.3,tt,easeOut)*(1-sm(q.lt,q.b,tt)));
  drawWorld(s,c,tau,tp,{ballMin:18,hero:true,prevDt,cap:busy(1,t)});
  // the outside of the boot meets the ball: a tick of contact; "bursts": speed lines behind him
  if(tp>-.03&&tp<.12){const p=P(c,ballAt(tp));sparkBurst(s,Y,p[0],p[1],90+60*sm(-.03,.06,tp),{n:8,seed:37,g:1-sm(.06,.12,tp),width:10});}
  const away=sm(q.b,q.b+.3,tt)*(1-sm(q.dl+.4,q.end,tt));if(away>.02){const a=garAt(tp-.2).place,b=g.place,pa=P(c,[a.x??0,1,a.z??0]),pb=P(c,[b.x??0,1,b.z??0]);speedLines(s,K,pb[0],pb[1],Math.atan2(pb[1]-pa[1],pb[0]-pa[0]),{n:5,seed:38,len:240,width:9,cov:.8*away});}
  newsreel(s,t,.7);
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (second replay angle, from the byline corner): the pause, two defenders, the second beat, the cross, the header =================
const ch3T=()=>({hs:T(2,'He stops'),w:T(2,'waits'),td:T(2,'Two defenders'),c:T(2,'come'),hb:T(2,'He beats them'),b:T(2,'both'),cr:T(2,'crosses'),ah:T(2,'Amarildo heads'),tw:T(2,'the winner'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,1.0],[q.hs+.3,TAU_S2],[q.w+.4,TAU_S2+.3],[q.td+.2,TAU_S2+.5],[q.c+.3,TAU_F1+.1],[q.hb+.35,TAU_3],[q.b+.3,TAU_3+.45],[q.cr+.25,TAU_C],[q.ah+.25,TAU_H-.25],[q.tw+.2,TAU_G],[q.end,TAU_G+.9]]),x=>x);};
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),g=garAt(tau).place,b=ballAt(tau);
 const toBox=sm(q.cr,q.ah+.3,t,easeInOutSine),wing:V3=[(g.x??0)+1.2,1.1,(g.z??0)-.6],box:V3=[lerp(HP[0],b[0],.25)-1,1.3,lerp(HP[2],b[2],.25)];
 const pos:V3=mix3([-4.5,3.1,37.5],[-1.5,4.2,30],toBox),F=key(t,mono([[0,3000],[q.td,2800],[q.hb,3000],[q.cr,2700],[q.ah,3300],[q.end,3000]]));
 return cam(pos,mix3(wing,box,toBox),F);}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),prevDt=Math.max(.02,tp-tau3(tt-1/12)),goalIn=tau-TAU_G;
  const shake=tp>=TAU_G?7*settle(tp,TAU_G,{freq:6,decay:6}):0;frame(s,1,shake,shake*.4);
  stadium(s,c,{t,cheer:.2+1.1*sm(0,.5,goalIn),flash:.15+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "waits": a stopwatch ring on the grass round the ball while he stands still; "two defenders come": their runs print in red dashes
  const w=sm(q.w-.1,q.w+.5,tt,easeOutBack)*(1-sm(q.hb-.2,q.hb+.2,tt));
  if(w>.02){const gg=1-Math.pow(1-sm(q.w-.1,q.hb,tt),2),pts:V3[]=[];for(let i=0;i<=30;i++){const a=-Math.PI/2+i/30*TAU*gg;pts.push([BS2[0]+Math.cos(a)*.95*w,.02,BS2[2]+Math.sin(a)*.95*w]);}const pp=pts.map(p=>P(c,p));if(pp.length>1)s.fill(Y,ribbon(pp,Math.max(10,.1*kAt(c,BS2)),{taper:.1,pressure:.2,wobble:1,seed:61}),.95);}
  const dc=sm(q.td-.1,q.c+.5,tt,x=>x)*(1-sm(q.hb,q.b,tt));if(dc>.02){const r2:V3[]=[];for(let i=0;i<=10;i++){const p=d2At(lerp(0,TAU_F1-.1,i/10)).place;r2.push([p.x??0,.02,p.z??0]);}groundDash(s,c,r2,12,R,62,{progress:dc,cov:.9});}
  // "He beats them": the route between them and the touchline prints in yellow
  groundArrow(s,c,[S2[0]+.6,S2[1]+.4],[-12.5,31.2],16,Y,63,sm(q.hb-.1,q.b+.3,tt,easeOut),.95*(1-sm(q.cr+.3,q.ah,tt)));
  const w2=drawWorld(s,c,tau,tp,{ballMin:16,hero:true,prevDt,cap:busy(2,t)});
  // "crosses": the flight prints as dotted ink behind the ball; the header: a spark and speed lines into the net
  if(tp>TAU_C&&tp<TAU_H+.2){const dots=new Path2D();for(let i=0;i<=16;i++){const p=P(c,ballAt(TAU_C+(Math.min(tp,TAU_H)-TAU_C)*i/16));dots.moveTo(p[0]+6,p[1]);dots.arc(p[0],p[1],6,0,TAU);}s.fill(K,dots,.6*(1-sm(TAU_H,TAU_H+.2,tp)));}
  if(tp>=TAU_H-.02&&tp<TAU_H+.3){const p=P(c,HP);sparkBurst(s,Y,p[0],p[1],110+100*sm(TAU_H,TAU_H+.1,tp,easeOut),{n:10,seed:64,g:1-sm(TAU_H+.12,TAU_H+.3,tp),width:13});}
  if(tp>=TAU_H&&tp<TAU_G+.1){const a=P(c,ballAt(tp-.05)),b=P(c,w2.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:65,len:200,width:8,cov:.85});}
  newsreel(s,t,.7);
 },
 aperture(t){const c=ch3Cam(t),p=ballAt(tau3(t)),[x,y]=P(c,p),r=Math.max(16,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): fake one way with your body, then go the other way, fast =================
const ch4T=()=>({s:T(3,"Garrincha's secret"),f:T(3,'fake one way'),wb:T(3,'with your body'),tg:T(3,'then go'),ow:T(3,'the other way'),fa:T(3,'fast'),end:SEC(3)});
const DL=n2(1,.8);
/** lesson feint u(t), keyed on the cue words (slow, clear, with a hold at the full fake) */
const u4=(t:number)=>{const q=ch4T();return key(t,mono([[0,0],[q.f-.05,0],[q.f+.6,.42],[q.wb+.3,.5],[q.tg+.1,.56],[q.ow-.05,.66],[q.ow+.25,U_K],[q.ow+.55,1]]),x=>x);};
function lesson(t:number):{st:St;ball:V3;u:number;run:number}{
 const q=ch4T(),u=u4(t),s=Math.max(0,t-(q.ow+.25)),d=s<=0?0:6.6*s-2.4*(1-Math.exp(-s/.55)),bs=standBall(0,0);
 if(u<1||d<=1.25){const e=clamp(d/1.25),place:Place={x:DL[0]*1.25*e*e,z:DL[1]*1.25*e*e,yaw:lerpAng(0,YAW(DL[0],DL[1]),sm(q.ow+.2,q.ow+.55,t))};
  return{st:{pose:u<=0?sway(t):feintPose(u),place},ball:s>0?pushed(bs,DL,s):bs,u,run:d};}
 const n=(d-1.25)/2.6,k=Math.floor(n),bd=2.6*(k+easeOut(n-k))+2.1;
 return{st:{pose:runCycle(.12+(d-1.25)/(2.2+2.4*.9),{speed:.9}),place:{x:DL[0]*d,z:DL[1]*d,yaw:YAW(DL[0],DL[1])}},ball:mix3(pushed(bs,DL,s),[bs[0]+DL[0]*bd,BALL_R,bs[2]+DL[1]*bd],sm(.5,.9,s)),u,run:d};}
/** the ghost full-back: jockeys, leans the wrong way on the fake, is left standing, turns */
function ghost(t:number):St{const q=ch4T(),lu=key(t,mono([[q.f+.25,0],[q.wb+.2,.55],[q.ow+.2,.7],[q.ow+.9,1]]),x=>x),turn=sm(q.ow+.5,q.fa+.8,t,easeIO);
 const base=blendPose(blendPose(backpedal(t*1.2),{...stand(),lean:24*D2R,lKnee:50*D2R,rKnee:50*D2R},.5),lunge(lu,{side:'r'}),sm(q.f+.2,q.f+.45,t));
 return{pose:blendPose(base,{...stand(),neckY:-40*D2R},turn*.5),place:{x:2.35,z:-.5,yaw:Math.PI+turn*1.1}};}
const ch4:Scene={
 draw(s,t){const q=ch4T(),tt=twos(t),L=lesson(tt),Lp=lesson(tt-1/12),cap=busy(3,t);
  // camera: low and behind him (his inside is screen-left, the outside screen-right); a push on the fake, then it follows him away
  const fol=L.run>0?lesson(t).st.place:null,fx=fol?(fol.x??0)*.85:0,fz=fol?(fol.z??0)*.85:0;
  const v=key(t,mono([[0,4.6,1.9,1500],[q.f,4.1,1.7,1650],[q.wb+.3,3.9,1.6,1750],[q.ow,4.2,1.7,1650],[q.end,4.8,1.9,1500]]),easeIO,true);
  const c=cam([fx-v[0],v[1],fz-1.2],[fx+1.1,.75,fz+.1],v[2]);frame(s);
  // the print: a yellow sky stepped in bands, a navy floor with a stepped light pool
  s.field(Y,.32,.6);
  const hz=P(c,[c.eye[0]+c.f[0]*1e4,0,c.eye[2]+c.f[2]*1e4])[1],Bn=Math.max(s.W,s.H)*1.6;
  for(let i=0;i<4;i++)s.tone(Y,polyPath([[-Bn,hz-120-i*170],[Bn,hz-120-i*170],[Bn,hz-40],[-Bn,hz-40]],true),.18);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-40,0,-40],[40,0,-40],[40,0,40],[-40,0,40]]));s.knockout(floor);s.fill(K,floor,.72);
  const pool=(r:number)=>{const pa=new Path2D();addPoly(pa,clipPoly(c,groundRing(1,0,r,r*.9,40)));return pa;};
  s.knockout(pool(3.4),.55);s.tone(Y,pool(3.4),.25);s.tone(Y,pool(1.9),.3);
  // "Garrincha's secret": flashbulbs pop and stamp rings print round him
  const fl=sm(q.s,q.s+.3,tt)*(1-sm(q.f-.2,q.f+.2,tt));if(fl>.02){const fp=new Path2D(),r=rng(900+Math.floor(tt*6));for(let i=0;i<9;i++){const x=(r()-.5)*1400,y=hz-80-r()*420,sz=16+r()*20;fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));}s.knockout(fp,fl);
   for(let i=0;i<3;i++)s.fill(Y,ribbon(groundRing(0,0,(.8+i*.4)*fl,(.7+i*.36)*fl,32).map(p=>P(c,p)),12-i*3,{seed:50+i,close:true,wobble:1.2}),.95);}
  // "fake one way": a dashed arrow prints to the inside (screen-left); crossed out on "the other way"
  const fk=sm(q.f,q.f+.8,tt,easeOut),off=1-sm(q.fa,q.fa+.5,tt);
  if(fk>0&&off>0){const pts:V3[]=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([lerp(.7,3.2,u),.02,lerp(-.4,-2.9,u)]);}groundDash(s,c,pts,18,Y,52,{progress:fk,cov:.95*off});if(fk>.95)arrowTip(s,Y,P(c,pts[10]),P(c,pts[12]),58,.95*off);
   const x=sm(q.ow,q.ow+.4,tt,easeOutBack)*off;if(x>.02){const m=P(c,pts[6]),r=54*x;s.knockout(ribbon([[m[0]-r,m[1]-r],[m[0]+r,m[1]+r]],22,{seed:53}));s.knockout(ribbon([[m[0]+r,m[1]-r],[m[0]-r,m[1]+r]],22,{seed:54}));s.fill(K,ribbon([[m[0]-r,m[1]-r],[m[0]+r,m[1]+r]],14,{seed:53}));s.fill(K,ribbon([[m[0]+r,m[1]-r],[m[0]-r,m[1]+r]],14,{seed:54}));}}
  // "then go" / "the other way": a solid paper arrow to the outside (screen-right)
  {const g=sm(q.tg,q.ow+.5,tt,easeOut)*(1-sm(q.fa+.6,q.end,tt));if(g>.02){const pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*g;pts.push([.6+DL[0]*5*u,.02,.4+DL[1]*5*u]);}const pp=pts.map(p=>P(c,p));s.knockout(ribbon(pp,22,{seed:55,taper:.15,wobble:1}),.95);s.fill(Y,ribbon(pp,22,{seed:55,taper:.15,wobble:1}),.5);arrowTip(s,Y,pp[pp.length-2],pp[pp.length-1],70,.95);}}
  // figures, depth sorted: the ghost full-back, Garrincha (the body halo printed first so only its rim shows), the ball
  const items:Item[]=[],gh=ghost(tt),ghp=ghost(tt-1/12);
  items.push({depth:depthOf(c,[gh.place.x??0,0,gh.place.z??0]),draw:()=>drawPlayer(s,gh.pose,c,GHOST_DUO,gh.place,{prev:ghp,cap:cap?'mid':undefined})});
  items.push({depth:depthOf(c,[L.st.place.x??0,0,L.st.place.z??0]),draw:()=>{
   bodyHalo(s,c,L.st.pose,L.st.place,GB,Y,sm(q.wb-.1,q.wb+.3,tt,easeOut)*(1-sm(q.tg+.2,q.ow,tt)),.95);
   drawPlayer(s,L.st.pose,c,GARRINCHA_DUO,L.st.place,{prev:Lp.st,smear:L.u>.6,cap:cap?'mid':undefined});}});
  items.push({depth:depthOf(c,L.ball)-.05,draw:()=>{const p=P(c,L.ball),r=Math.max(22,BALL_R*kAt(c,L.ball));ballShadow(s,c,L.ball,.4);leatherBall(s,p[0],p[1],r,tt*1.5+L.run*9,{duo:true});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "fast": speed lines trail him and a burst prints where he left
  const fa=sm(q.fa-.05,q.fa+.3,tt);if(fa>.02){const a=lesson(tt-.2).st.place,b=L.st.place,pa=P(c,[a.x??0,1,a.z??0]),pb=P(c,[b.x??0,1,b.z??0]);speedLines(s,K,pb[0],pb[1],Math.atan2(pb[1]-pa[1],pb[0]-pa[0]),{n:6,seed:58,len:300,width:10,cov:.85*fa});
   sparkBurst(s,Y,pb[0],pb[1],160*easeOut(sm(q.fa,q.fa+.3,tt)),{n:9,seed:59,g:1-sm(q.fa+.3,q.fa+.8,tt),width:12});}
 },
 still:5.2,
};

const story:RisoStory={
 id:'garrincha-signature-1962',format:'11v11',title:"Garrincha's feint, 1962",
 theme:'Fake one way with your body, then go the other way fast.',
 ageNote:'World Cup group match, Brazil 2–1 Spain, Estadio Sausalito, Viña del Mar, Chile, 6 June 1962. Garrincha set up Amarildo’s late winner.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a dashed feint arrow points one way, then a solid arrow shoots the other way and the leather ball follows it. Reduced motion: still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),a0=(hash(seed,2)-.5)*.6,fake:Pt=[x-Math.cos(a0)*150,y-Math.sin(a0)*60],go:Pt=[x+Math.cos(a0)*230*u,y+Math.sin(a0)*80*u];
  s.fill(Y,ribbon([[x,y],fake],12,{seed,taper:.2,wobble:1,gaps:[[.25,.4],[.55,.7]]}),.9);
  if(u>.05){s.fill(R,ribbon([[x,y],go],14,{seed:seed+1,taper:.15,wobble:1}),.95);arrowTip(s,R,[x,y],go,40);}
  leatherBall(s,lerp(x,go[0],u*.7),lerp(y,go[1],u*.7),44,age*9+hash(seed,3)*TAU,{sq:age>0?.14*Math.max(0,1-age*4):0});
  if(age>0&&age<.5)sparkBurst(s,Y,x,y,110*easeOutBack(clamp(age/.2)),{n:8,seed,g:1-clamp(age/.5),width:10});
 },
};
export default story;
