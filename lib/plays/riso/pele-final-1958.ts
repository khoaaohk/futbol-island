/** Iconic play film: Pelé's volley in the 1958 World Cup final, Sweden 2–5 Brazil, Råsunda Stadium, Solna, 29 June 1958 (Brazil's third goal, 55').
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/pele-final-1958/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds,
 * so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/pele-final-1958/timing.json exists, replace the `TIMING` constant below with
 *   import timing from '../../../public/plays/narration/pele-final-1958/timing.json';   (and pass `timing as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage):
 *  - Wikipedia, "1958 FIFA World Cup final" https://en.wikipedia.org/wiki/1958_FIFA_World_Cup_final
 *  - FIFA, "Brazil v Sweden | Greatest Games | 1958 FIFA World Cup" https://www.fifa.com/en/tournaments/mens/worldcup/articles/brazil-sweden-1958
 *  - France 24 / AFP, "At 17, Pele conquered the world" (29 Dec 2022) https://www.france24.com/en/live-news/20221229-at-17-pele-conquered-the-world
 *  - France 24 / AFP, "Pele: Five great World Cup goals" https://www.france24.com/en/live-news/20221229-pele-five-great-world-cup-goals
 *  - These Football Times, "How Pelé, at just 17, dominated the 1958 World Cup final" https://thesefootballtimes.co/2018/11/26/how-pele-at-just-17-dominated-the-1958-world-cup-final/
 *  - ESPN, "World Cup's Greatest Goals: Pele (1958, Brazil vs. Sweden)" https://www.espn.com/soccer/story/_/id/37372544/pele-brazil-vs-sweden1958
 *  - Britannica, "Famous FIFA World Cup Goals: Teen Prodigy Pelé" and "Today in History: June 29"
 *  - 90min, "Brazil 1958: The Real Birth of International Football's Most Iconic Kit" (the blue shirts)
 *  - Goal.com, "Pele: I became Brazil's No.10 by accident"; FIFA, "Brazil of Garrincha & Pele in stats"
 * CONFIRMED by those accounts: 29 June 1958, Råsunda Stadium, Solna; Brazil won 5–2 (Liedholm 4', Vavá 9' and 32', Pelé 55', Zagallo 68',
 *  Simonsson 80', Pelé 90'), so this goal made it 3–1; Pelé was 17 and wore No. 10 (numbers were handed out by chance); Brazil wore BLUE
 *  because Sweden, the hosts, kept yellow (a draw/coin toss; Brazil's officials bought blue shirts and sewed badges on); the ball came into the
 *  penalty area; Pelé, with his back to goal and Sigge Parling at his back, leapt and twisted to control it on his CHEST; Bengt Gustavsson
 *  lunged in and Pelé flicked the ball over his head; he volleyed the dropping ball (FIFA: it fell from ≈3.2 m) before it landed, past
 *  keeper Kalle Svensson ("bounced a volley under" him, AFP); referee Maurice Guigue (France); attendance 49,737.
 * REPORTED BY ONE ACCOUNT ONLY: Nílton Santos delivered the cross.
 * INFERRED / ILLUSTRATIVE: every position and run in metres, the cross's side (from Brazil's left, Nílton Santos's wing), flight times, the
 *  ball's bounce before the flick, Pelé's feet (right-foot flick and volley), the shot's one low bounce, where the other players stand and
 *  which of them are shown (Vavá, Garrincha, Didi, Zagallo; Axbom, Bergmark, Börjesson), Sweden's shorts/socks, Brazil's white shorts and
 *  socks, Svensson's dark jersey, the referee's black kit, the brown 1950s leather ball, the overcast afternoon, the stands (open terraces,
 *  one roofed stand), flags on the terraces, photographers crouched behind the goal line, the camera placements and lenses, the celebration.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 the cross): ch1 = the high main-stand broadcast camera in real time (cross, chest, flick,
 * volley, net); ch2 = the TV slow-motion replay from in front of Pelé (the chest cushion, ×≈5); ch3 = the replay from the side (the flick
 * over Gustavsson, the spin, the volley, the net, the celebration); ch4 = a duotone lesson replay (soft touch vs hard touch, time and space).
 * Seams are forward passages into the ball. Ball physics: the cross and the flick are ballistic (g = 9.81), contact points are read from the
 * solved skeleton (chest, right toe) so the ball always meets the body. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer().
 * Inks: yellow (Sweden, light), red (skin, leather), blue (Brazil, sky, grass with yellow), navy (key line). Scenes read only their local t;
 * drawn objects pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,volley,lunge,backpedal,celebrate,keeperSet,keeperDive,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`pele film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/pele-final-1958/timing.json';
const TIMING:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The final',"Sweden, 1958, the World Cup final. Brazil, in blue, lead Sweden two goals to one. Now a high ball drops into the box, where seventeen-year-old Pelé is waiting.",
  ['Sweden','the World Cup final','Brazil, in blue','lead Sweden','two goals to one','Now','a high ball','drops into the box','Pelé is waiting']),
 prov('Chest control','Watch again, slowly. Pelé cushions the ball on his chest, and it drops softly, right in front of him.',
  ['Watch again','slowly','Pelé cushions','on his chest','drops softly','right in front of him']),
 prov('Flick and volley','A defender rushes in. Pelé flicks the ball over his head, spins round him, and volleys it in before it lands!',
  ['A defender','rushes in','Pelé flicks','over his head','spins round','volleys it in','before it lands']),
 prov('Soft touch','Cushion the ball like Pelé and it stays close. A soft first touch buys you time and space.',
  ['Cushion the ball','like Pelé','stays close','A soft first touch','buys you','time','space']),
],TIMING);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`pele film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, the pitch runs to x = −105) =================
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

// ================= the Råsunda bowl: overcast sky, open terraces + one roofed stand, crowd as ink fields, flags, pitch, goal =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-118,.8,-38],[14,.8,-38],[14,15,-64],[-118,15,-64]],// far side terrace (across from the TV camera)
 [[8,.8,-44],[8,.8,44],[32,12,44],[32,12,-44]],// behind the goal
 [[14,.8,40],[-118,.8,40],[-118,16,66],[14,16,66]],// near side (the main stand under the camera)
 [[-113,.8,44],[-113,.8,-44],[-137,11,-44],[-137,11,44]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper faces / 1 navy hats and coats / 2 yellow / 3 blue, phase] */
const CROWD=(()=>{const r=rng(1958),out:[number,number,number,number,number][]=[];[760,380,320,160].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r();out.push([st,r(),.04+r()*.9,c<.5?0:c<.74?1:c<.87?2:3,r()*TAU]);}});return out;})();
/** flag poles along the terrace tops: Swedish blue-and-yellow crosses, a few Brazilian green-and-yellow */
const FLAGS:[V3,number][]=(()=>{const o:[V3,number][]=[];for(let x=-110;x<=8;x+=11)o.push([[x,15,-64],x%3===0?1:0]);for(let z=-40;z<=40;z+=10)o.push([[32,12,z],z===0?1:0]);return o;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // overcast sky: a pale blue screen, a deeper band high up and paper cloud banks
 s.field(B,.2,.7);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-520],[-Bnd,hz-420]],true),.32);
 {const cl=new Path2D(),r=rng(58);for(let i=0;i<7;i++){const x=(r()-.5)*Bnd*1.2,y=hz-260-r()*520,w=260+r()*420;cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.16*(1+.3*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.6);}
 // terraces: knocked out, a navy screen, stepped rows (every other row deeper) — the crowd prints as ink fields
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),walls=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<14;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/14),bil(q,1,k/14),bil(q,1,(k+1)/14),bil(q,0,(k+1)/14)]));
  addPoly(walls,clipPoly(c,[q[0],q[1],[q[1][0],0,q[1][2]],[q[0][0],0,q[0][2]]]));
  if(si===0){// the roofed stand in the middle of the far side (a slab on columns)
   addPoly(roof,clipPoly(c,[[-82,21,-68],[-22,21,-68],[-22,19.5,-46],[-82,19.5,-46]]));addPoly(roof,clipPoly(c,[[-82,19.5,-46],[-22,19.5,-46],[-22,18.3,-46],[-82,18.3,-46]]));
   for(let x=-82;x<=-22;x+=12)addPoly(roof,clipPoly(c,[[x-.3,19.5,-47],[x+.3,19.5,-47],[x+.3,9,-51.5],[x-.3,9,-51.5]]));}});
 s.knockout(stands);s.tone(K,stands,.45);s.tone(B,rows,.32);s.tone(K,rows,.2);
 // crowd heads: a speckle of faces, hats, scarves, bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.9);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);
 // photographers' flashbulbs (1958): paper sparks on the twos
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.5);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1*kAt(c,p),8,24);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(roof);s.fill(K,roof,.88);s.fill(K,walls,.7);
 // flags on poles, fluttering (Sweden: blue with a yellow cross; Brazil: green with a yellow diamond)
 {const pole=new Path2D(),blue=new Path2D(),yel=new Path2D(),grn=new Path2D();
  FLAGS.forEach(([b,br],i)=>{if(depthOf(c,b)<4)return;const top:V3=[b[0],b[1]+5,b[2]],k=kAt(c,b),pb=P(c,b),pt=P(c,top);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;pole.addPath(ribbon([pb,pt],Math.max(2,.14*k),{taper:0,wobble:0}));
   const w=2.6*k,h=1.7*k,wv=(u:number)=>Math.sin(tt*5+i+u*4)*h*.12*u,cloth=(u0:number,u1:number,v0:number,v1:number)=>polyPath([[pt[0]+w*u0,pt[1]+h*v0+wv(u0)],[pt[0]+w*u1,pt[1]+h*v0+wv(u1)],[pt[0]+w*u1,pt[1]+h*v1+wv(u1)],[pt[0]+w*u0,pt[1]+h*v1+wv(u0)]],true);
   if(br){grn.addPath(cloth(0,1,0,1));yel.addPath(polyPath([[pt[0]+w*.5,pt[1]+h*.12+wv(.5)],[pt[0]+w*.9,pt[1]+h*.5+wv(.9)],[pt[0]+w*.5,pt[1]+h*.88+wv(.5)],[pt[0]+w*.1,pt[1]+h*.5+wv(.1)]],true));}
   else{blue.addPath(cloth(0,1,0,1));yel.addPath(cloth(.3,.44,0,1));yel.addPath(cloth(0,1,.42,.58));}});
  s.fill(K,pole,.95);s.knockout(blue);s.knockout(grn);s.fill(B,blue,.95);s.fill(B,grn,.75);s.fill(Y,grn,.9);s.knockout(yel);s.fill(Y,yel,.95);}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-113,0,-42],[10,0,-42],[10,0,42],[-113,0,42]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.16);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 photographers(s,c,tt);
 goal(s,c,o.net);
}
/** press photographers crouched behind the goal line with box cameras (a 1950s detail) */
const SNAPPERS:[number,number][]=[[2.6,-11],[2.4,-8.2],[2.8,6.5],[2.5,9.4],[3,12.6]];
function photographers(s:Sheet,c:Camera,tt:number){
 const coat=new Path2D(),face=new Path2D(),box=new Path2D();let n=0;
 SNAPPERS.forEach(([x,z],i)=>{const g:V3=[x,0,z];if(depthOf(c,g)<1.5)return;const k=kAt(c,g),[gx,gy]=P(c,g);if(Math.abs(gx)>s.W||Math.abs(gy)>s.H)return;
  const bob=Math.sin(tt*3+i)*.02*k;coat.addPath(polyPath([[gx-.35*k,gy],[gx+.35*k,gy],[gx+.3*k,gy-.7*k],[gx-.25*k,gy-.8*k]],true));
  face.addPath(polyPath(Array.from({length:10},(_,a)=>[gx+Math.cos(a/10*TAU)*.13*k,gy-.95*k+bob+Math.sin(a/10*TAU)*.14*k] as Pt),true));
  box.rect(gx-.24*k,gy-.95*k+bob,.2*k,.16*k);n++;});
 if(!n)return;s.knockout(coat);s.fill(K,coat,.8);s.knockout(face);s.tone(R,face,.2);s.tone(Y,face,.45);s.fill(K,box,.95);
}
/** the 1950s goal at x = 0: square posts, a box net held by rear stanchions; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[0,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the 1950s leather ball: tan (yellow × red screens), stitched panel seams, a lace, a blue shade =================
const BALL_R=.13;
function leatherBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);s.fill(Y,disc,duo?.6:.75);if(!duo)s.tone(R,disc,.45);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 // three stitched panel bands (an 18-panel ball) turning with the spin
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.6,r*.05),.9);
 const la=spin*.7,lc:Pt=[Math.cos(la)*r*.3,Math.sin(la)*r*.3];if(Math.cos(spin*1.3)>-.2){const lace=new Path2D();for(let i=-2;i<=2;i++){const cx=lc[0]+i*r*.09*Math.cos(la),cy=lc[1]+i*r*.09*Math.sin(la);lace.moveTo(cx-r*.07*Math.sin(la),cy+r*.07*Math.cos(la));lace.lineTo(cx+r*.07*Math.sin(la),cy-r*.07*Math.cos(la));}s.stroke(K,lace,Math.max(1.6,r*.06));}
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (1958) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_MID:AthleteStyle['skin']=[[R,.32],[Y,.6],[K,.1]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]];
const BRA=(skin:AthleteStyle['skin'],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:'paper',trim:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
const SWE=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:B,socks:Y,trim:B,boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
const PELE:AthleteStyle=BRA(SKIN_DARK,{number:10,numberInk:'paper',hairStyle:'short',build:{height:1.73,bulk:.94,thighs:1.05},seed:10});
const KEEPER:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.8],boots:K,skin:SKIN_LIGHT,hair:[K,.6],line:K,sleeves:'long',shade:[K,.26],seed:22};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],line:K,sleeves:'short',seed:33};
/** duotone version of a kit for the lesson chapter (navy + yellow only) */
const duo=(st:AthleteStyle,lead=false):AthleteStyle=>({...st,shirt:lead?[K,.45]:[Y,.75],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.75],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:K,shade:[K,.2]});
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}){
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the cross) =================
const G=9.81,TF=1.9;// cross flight (real ballistics, ≈5 m apex)
const LAUNCH:V3=[-28.4,.11,-27.2];// Nílton Santos, out on Brazil's left
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}

// ---- Pelé: wait → leap, chest, cushion → twist → flick → run round → volley → celebrate ----
const PB:Build=PELE.build!;
const PCH:[number,number]=[-11.2,-2.1],Y0=YAW(LAUNCH[0]-PCH[0],LAUNCH[2]-PCH[1]);// facing the cross, back to goal
const GF:[number,number]=[-9.5,-1.55];// Gustavsson's lunge spot
const PFL:[number,number]=[-11.05,-2.05],Y1=YAW(GF[0]-PFL[0],GF[1]-PFL[1]);// after the twist: facing Gustavsson / the goal
const CH0=TF-.5,CH1=TF+.95;// chest window
const CHEST_KEYS:[number,Pose][]=[
 [0,posed({lHipF:14,rHipF:14,lKnee:24,rKnee:24,lShA:26,rShA:26,lElb:40,rElb:40,neckP:-32,lean:4})],
 [.2,posed({lHipF:44,rHipF:44,lKnee:66,rKnee:66,lAnk:-12,rAnk:-12,lean:16,lShA:28,rShA:28,lShF:-34,rShF:-34,lElb:52,rElb:52,neckP:-36})],
 [.345,posed({air:.24,lean:-26,pitch:-6,neckP:36,lHipF:16,rHipF:30,lKnee:36,rKnee:54,lAnk:42,rAnk:36,lShA:80,rShA:80,lShF:12,rShF:12,lElb:28,rElb:28})],
 [.5,posed({air:.1,lean:-14,pitch:-3,neckP:42,lHipF:30,rHipF:24,lKnee:50,rKnee:44,lShA:64,rShA:70,lElb:36,rElb:36,twist:-16})],
 [.72,posed({lean:12,neckP:34,lHipF:34,rHipF:20,lKnee:54,rKnee:40,twist:-28,lShA:42,rShA:52,lElb:50,rElb:44})],
 [1,posed({lean:14,neckP:36,lHipF:24,rHipF:6,lKnee:36,rKnee:30,lShA:38,rShA:42,lElb:50,rElb:50})],
];
const chestU=(tau:number)=>(tau-CH0)/(CH1-CH0);
const FLK=.3;// flick half-window
const FLICK_KEYS:[number,Pose][]=[
 [0,CHEST_KEYS[5][1]],
 [.32,posed({lean:12,neckP:38,lHipF:20,lKnee:32,rHipF:-10,rKnee:72,rAnk:32,lShA:46,rShA:52,lElb:44,rElb:44})],
 [.5,posed({lean:-8,neckP:18,lHipF:14,lKnee:30,lAnk:10,rHipF:54,rKnee:28,rAnk:-26,lShA:62,rShA:56,lShF:-10,rShF:10,lElb:36,rElb:36})],
 [.78,posed({lean:-14,neckP:-32,lHipF:10,lKnee:26,rHipF:36,rKnee:48,rAnk:12,lShA:56,rShA:50,lElb:40,rElb:40})],
 [1,posed({lean:6,neckP:-26,lHipF:30,lKnee:40,rHipF:-10,rKnee:70,rAnk:30,lShA:30,rShA:30,lShF:-20,rShF:30,lElb:80,rElb:80})],
];
// contact points read from the solved skeleton, so ball and body always meet
const chestPlace=(tau:number):Place=>{const u=sm(TF+.2,TF+.7,tau,easeIO),w=sm(TF+.1,TF+.65,tau,easeIO);return{x:lerp(PCH[0],PFL[0],u),z:lerp(PCH[1],PFL[1],u),yaw:lerpAng(Y0,Y1,w)};};
const C_HIT:V3=(()=>{const sk=solve(keyPoses(chestU(TF),CHEST_KEYS),PB,chestPlace(TF)),T=sk.fr.T,fwd:V3=[T[0],T[3],T[6]];return add(add(sk.chest,mul(fwd,.16)),[0,.05,0]);})();
const TFL=TF+.98;// the flick
const D_FLICK:V3=(()=>{const sk=solve(keyPoses(.5,FLICK_KEYS),PB,{x:PFL[0],z:PFL[1],yaw:Y1});return add(sk.rToe,[0,.1,0]);})();
const POP=.6,T_DROP=TF+(POP+Math.sqrt(POP*POP+2*G*(C_HIT[1]-.11)))/G;// cushioned: a small pop, then gravity
const G_LAND:V3=[lerp(C_HIT[0],D_FLICK[0],.55),.11,lerp(C_HIT[2],D_FLICK[2],.55)];
const APEX=3.3;// FIFA: the ball dropped from ≈3.2 m
const V_AIM:[number,number]=[-8.05,-1.25];// where the flick comes down (just past Gustavsson)
const SHOT_TO:V3=[0,.24,1.85],SHOT_BOUNCE:V3=[-2.7,.11,1.0];// low, one bounce, under the keeper (keeper's left)
const VOL=(u:number)=>volley(u,{foot:'r',height:.25});
const YV=YAW(SHOT_TO[0]-V_AIM[0],SHOT_TO[2]-V_AIM[1])+24*D2R;
const VOL_SK=solve(VOL(.5),PB,{yaw:YV});
const V_HIT:V3=[V_AIM[0],VOL_SK.rToe[1]+.1,V_AIM[1]];
const PV:[number,number]=[V_AIM[0]-VOL_SK.rToe[0],V_AIM[1]-VOL_SK.rToe[2]];
const FLV0=Math.sqrt(2*G*(APEX-D_FLICK[1])),FL=FLV0/G+Math.sqrt(2*(APEX-V_HIT[1])/G),TV=TFL+FL;
const SH1=.24,SH2=.12,T_GOAL=TV+SH1+SH2;
const RUN_ROUND:MKey[]=[[TFL+.3,PFL[0],PFL[1]],[TFL+.72,-10.15,-2.95],[TFL+1.08,-9.15,-2.75],[TV-.45,PV[0],PV[1]]];
const CELEB:MKey[]=[[TV+.5,PV[0],PV[1]],[TV+1.4,PV[0]+2.6,PV[1]+2.2],[TV+2.1,PV[0]+3.6,PV[1]+3.2]];
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
const PELE_SEGS:Seg[]=[
 [-99,t=>runner([[-6,-24,-7.5],[-3,-17,-5],[CH0-.6,PCH[0],PCH[1]]],t,LAUNCH)],
 [CH0-.6,t=>({pose:blendPose(stand(),CHEST_KEYS[0][1],sm(CH0-.6,CH0-.2,t)),place:{x:PCH[0],z:PCH[1],yaw:Y0}})],
 [CH0,t=>({pose:keyPoses(clamp(chestU(t)),CHEST_KEYS),place:chestPlace(t)})],
 [TFL-FLK,t=>({pose:keyPoses(clamp((t-(TFL-FLK))/(2*FLK)),FLICK_KEYS),place:{x:PFL[0],z:PFL[1],yaw:Y1}})],
 [TFL+FLK,t=>{const r=runner(RUN_ROUND,t,V_HIT);r.pose={...r.pose,neckP:-28*D2R};r.place.yaw=lerpAng(r.place.yaw??0,YV,sm(TV-.75,TV-.45,t));return r;}],
 [TV-.45,t=>({pose:VOL(clamp((t-(TV-.5))/1)),place:{x:PV[0],z:PV[1],yaw:YV}})],
 [TV+.5,t=>{const q=pathPos(CELEB,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}],
 [TV+2.1,t=>{const e=CELEB[CELEB.length-1];return{pose:celebrate(Math.max(0,t-TV-2.1)/.9,{kind:'arms'}),place:{x:e[1],z:e[2],yaw:YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}],
];
/** Pelé at τ: the active segment, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function peleAt(tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<PELE_SEGS.length&&tau>=PELE_SEGS[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=PELE_SEGS[a][1](tau),Bq=PELE_SEGS[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=PELE_SEGS[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=PELE_SEGS[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return PELE_SEGS[i][1](tau);}

// ---- the ball ----
const SANTOS:MKey[]=[[-7,-50,-31],[-3,-37,-29.5],[-.35,-29.2,-27.8],[1.5,-24,-25],[5,-21,-21]];
function ballAt(tau:number):V3{
 if(tau<-.35){const q=pathPos(SANTOS,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.3+.25*Math.abs(Math.sin(q.dist*.9));return[q.x+q.vx/v*tap,.11,q.z+q.vz/v*tap];}
 if(tau<0){const a=ballAt(-.3501),u=(tau+.35)/.35;return[lerp(a[0],LAUNCH[0],u),.11,lerp(a[2],LAUNCH[2],u)];}
 if(tau<TF){const u=tau/TF,vy=(C_HIT[1]-LAUNCH[1]+.5*G*TF*TF)/TF;return[lerp(LAUNCH[0],C_HIT[0],u),LAUNCH[1]+vy*tau-.5*G*tau*tau,lerp(LAUNCH[2],C_HIT[2],u)];}
 if(tau<T_DROP){const s=tau-TF,u=s/(T_DROP-TF);return[lerp(C_HIT[0],G_LAND[0],u),Math.max(.11,C_HIT[1]+POP*s-.5*G*s*s),lerp(C_HIT[2],G_LAND[2],u)];}
 if(tau<TFL){const u=(tau-T_DROP)/(TFL-T_DROP),p=mix3(G_LAND,D_FLICK,u);p[1]+=.32*4*u*(1-u);return p;}
 if(tau<TV){const s=tau-TFL,u=s/FL;return[lerp(D_FLICK[0],V_HIT[0],u),D_FLICK[1]+FLV0*s-.5*G*s*s,lerp(D_FLICK[2],V_HIT[2],u)];}
 const s=tau-TV;if(s<SH1){const u=s/SH1;return mix3(V_HIT,SHOT_BOUNCE,u);}
 if(s<SH1+SH2){const u=(s-SH1)/SH2,p=mix3(SHOT_BOUNCE,SHOT_TO,u);p[1]+=.12*Math.sin(u*Math.PI);return p;}
 const e=s-SH1-SH2,u=clamp(e/.16);if(u<1)return mix3(SHOT_TO,[1.75,.3,2.05],easeOut(u));
 const d=clamp((e-.16)/.5),h=.3*(1-d*d)+.11*d*d;return[1.75-.3*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.66)*8))*Math.exp(-(e-.66)*3):0),2.05-.1*d];}
const NET_HIT:V3=[2,.3,2.05];

// ---- everybody else ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const GUST:MKey[]=[[-6,-13,1.5],[0,-8.6,-.2],[TF+.3,-8.7,-.9],[TFL-.35,GF[0],GF[1]]];
const PARL:MKey[]=[[-6,-17,-3.8],[-1,-11.4,-3.2],[TF,-10.55,-2.75]];
const ACTORS:Actor[]=[
 {style:BRA(SKIN_LIGHT,{seed:16}),at:(t,b)=>{const r=runner(SANTOS,t,b);if(t>-.55&&t<.6){const u=clamp((t+.55)/1.1);r.pose=blendPose(r.pose,keyPoses(u,[[0,runCycle(.1,{speed:.6})],[.4,posed({lHipF:26,lKnee:30,rHipF:-40,rKnee:96,rAnk:40,lShA:60,rShA:40,lean:6,yaw:-14,twist:20,neckP:20})],[.5,posed({lHipF:18,lKnee:30,rHipF:44,rKnee:20,rAnk:50,lShA:70,rShA:40,lean:-6,yaw:10,twist:-18,neckP:18})],[1,runCycle(.6,{speed:.5})]]),Math.sin(u*Math.PI));}return r;}},// Nílton Santos crosses
 mover(BRA(SKIN_MID,{seed:20}),[[-6,-20,-9],[0,-9,-5.5],[TF+.4,-6.4,-4.2],[TV+.8,-5.6,-3],[TV+2.4,PV[0]+3.3,PV[1]+2.4]]),// Vavá, then to Pelé
 mover(BRA(SKIN_MID,{seed:7,hairStyle:'curly'}),[[-6,-32,22],[0,-25,19],[TV,-18,15]]),// Garrincha, right wing
 mover(BRA(SKIN_DARK,{seed:8}),[[-6,-40,-6],[0,-31,-5],[TV,-23,-4]]),// Didi
 mover(BRA(SKIN_LIGHT,{seed:11}),[[-6,-33,-16],[0,-22,-13],[TV,-16,-9]]),// Zagallo
 {style:SWE({seed:40,build:{height:1.84,bulk:1.05}}),at:(t,b)=>{// Bengt Gustavsson: comes out, lunges, is beaten, turns to chase
  if(t<TFL-.35)return runner(GUST,t,b,backpedal(0));
  const yaw=YAW(PFL[0]-GF[0],PFL[1]-GF[1]);
  if(t<TFL+.45)return{pose:lunge((t-(TFL-.35))/.8),place:{x:GF[0],z:GF[1],yaw}};
  const u=sm(TFL+.45,TFL+1.3,t);return{pose:blendPose(lunge(1),{...backpedal(t*2),neckP:-30*D2R},u),place:{x:GF[0]+.6*u,z:GF[1]+.3*u,yaw:lerpAng(yaw,YAW(b[0]-GF[0],b[2]-GF[1]),u)}};}},
 {style:SWE({seed:41,build:{height:1.86,bulk:1.12}}),at:(t,b)=>{// Sigge Parling at Pelé's back, left behind by the twist
  if(t<TF-.2){const r=runner(PARL,t,b,backpedal(0));return r;}
  const u=sm(TF+.15,TF+.9,t),x=lerp(PARL[2][1],-10.95,u),z=lerp(PARL[2][2],-3.7,u);return{pose:blendPose({...backpedal(t*2.2),lShF:40*D2R,rShF:30*D2R},{...stand(),lean:-10*D2R,neckP:-24*D2R},u),place:{x,z,yaw:lerpAng(Y0,YAW(b[0]-x,b[2]-z),u)}};}},
 mover(SWE({seed:42}),[[-6,-15,-7],[0,-9.2,-4.6],[TV,-6.3,-3.4],[TV+1,-5.2,-2.4]],backpedal(0)),// Axbom, covering Vavá
 mover(SWE({seed:43}),[[-6,-33,-22],[0,-27,-24],[TF+1,-23,-20],[TV,-19,-15]]),// Bergmark, closing Santos
 mover(SWE({seed:44}),[[-6,-31,4],[0,-25,1.5],[TV,-18,.5]]),// Börjesson, midfield
 {style:KEEPER,at:(t,b)=>{const q=pathPos([[-6,-1.3,-1.2],[TF,-1.9,-1.0],[TV-.2,-2.35,-.45]],t),yaw=YAW(b[0]-q.x,b[2]-q.z);
  if(t<TV-.08)return{pose:keeperSet(t*1.6),place:{x:q.x,z:q.z,yaw}};return{pose:keeperDive(clamp((t-(TV-.08))/.95),{side:'l',height:.05}),place:{x:q.x,z:q.z,yaw:YAW(V_HIT[0]-q.x,V_HIT[2]-q.z)}};}},// Kalle Svensson
 mover(REF,[[-6,-42,6],[0,-31,10],[TV,-22,11]]),// Maurice Guigue
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Pelé with motion smear + secondary motion. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[];
 const put=(style:AthleteStyle,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear})});};
 for(const a of ACTORS)put(a.style,a.at(tp,bp));
 const pe=peleAt(tp);put(PELE,pe,o.hero?peleAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.5,q[1]+Math.sin(i/20*TAU)*r*1.5] as Pt),true),r*.25*o.glow,.95);
  leatherBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.8),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,pele:pe};}

// ================= chapter 1 (live, real time): the high main-stand camera follows the move; the goal goes in =================
const ch1T=()=>{const end=SEC(0),TL=Math.max(2,Math.min(T(0,'a high ball')-.2,end-T_GOAL-1.4));return{TL,end};};
const BCAM:V3=[-50,19,52];
function ch1Look(tau:number):V3{const b=ballAt(tau);
 if(tau<0){const q=pathPos(SANTOS,tau),w=.12+.3*sm(-1.6,0,tau);return[lerp(q.x,-12,w),1.2,lerp(q.z,-2,w)];}
 if(tau<TF){const u=sm(0,TF,tau);return mix3([lerp(b[0],-12,.42),1.4,lerp(b[2],-2,.42)],[-10.6,1.2,-1.8],u);}
 if(tau<TV)return[lerp(-10.2,b[0],.4),1.3,lerp(-1.8,b[2],.4)];
 return mix3([lerp(-8,b[0],.5),1.2,lerp(-1.2,b[2],.5)],[-4.5,1.1,.6],sm(TV,TV+.8,tau));}
function ch1Cam(t:number){const{TL}=ch1T(),tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.25),c=ch1Look(tau-.5),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-8,7600],[-1.6,7800],[-.2,4200],[TF-.9,6200],[TF-.1,9800],[TV,9800],[TV+.6,7600],[TV+3,6800]]);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(0,.5,goalIn),flash:.2+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,t-TL,tt-TL,{ballMin:15});},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(15,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, in front of Pelé): the leap, the chest, the soft drop =================
const ch2T=()=>({w:T(1,'Watch again'),c:T(1,'Pelé cushions'),ch:T(1,'on his chest'),d:T(1,'drops softly'),r:T(1,'right in front of him'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,TF-1.25],[q.ch+.15,TF],[q.d+.2,T_DROP-.1],[q.r+.3,T_DROP+.12],[q.end,TFL-.32]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.d-.3,q.end,t,easeIO),ang=Y0-1.25*orbit+.12*sm(0,q.c,t),[fx,fz]=dirOf(ang),D=lerp(7.4,6.4,sm(q.c,q.ch+.5,t));
 const pos:V3=[PCH[0]+fx*D,1.05+.2*sm(0,q.c,t),PCH[1]+fz*D],body:V3=[lerp(PCH[0],PFL[0],orbit),1.05,lerp(PCH[1],PFL[1],orbit)];
 const w=key(t,mono([[0,.72],[q.c,.6],[q.ch+.4,.55],[q.d,.7],[q.end,.8]])),F=key(t,mono([[0,1250],[q.c,1650],[q.ch+.2,1900],[q.d+.3,1750],[q.end,1650]]));
 return cam(pos,mix3([b[0],Math.min(b[1],2.2),b[2]],body,w),F);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.12});
  const glow=sm(q.c-.1,q.c+.3,tt)*(1-sm(q.r+.4,q.r+1,tt));
  drawWorld(s,c,tau,tp,{ballMin:34,hero:true,glow});
  // the cushion: soft paper rings where the ball meets the chest (it gives, it does not bounce away)
  const hit=sm(TF-.02,TF+.3,tp),e=1-sm(TF+.25,TF+.55,tp);if(hit>0&&e>0){const p=P(c,C_HIT),k=kAt(c,C_HIT),r0=.18*k;for(let i=0;i<3;i++){const r=r0*(1+i*.45)*(.6+.4*hit);s.stroke(Y,polyPath(Array.from({length:22},(_,j)=>[p[0]+Math.cos(j/22*TAU)*r,p[1]+Math.sin(j/22*TAU)*r*.9] as Pt),true),Math.max(4,.025*k),.95*e);}}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(34,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6,
};

// ================= chapter 3 (replay from the side): Gustavsson rushes in, the flick over his head, the spin, the volley, the net =================
const ch3T=()=>({a:T(2,'A defender'),ru:T(2,'rushes in'),f:T(2,'Pelé flicks'),o:T(2,'over his head'),sp:T(2,'spins round'),v:T(2,'volleys it in'),b:T(2,'before it lands'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,TFL-.34],[q.ru+.25,TFL-.12],[q.f+.35,TFL+.02],[q.o+.4,TFL+.55],[q.sp+.3,TFL+1.05],[q.v+.3,TV],[q.b+.25,T_GOAL+.02],[q.end,T_GOAL+.02+(q.end-q.b-.25)]]),x=>x);};
function ch3Cam(t:number){const q=ch3T(),tau=tau3(t),b=ballAt(tau),pe=peleAt(tau).place;
 const mid:V3=[lerp(pe.x??0,b[0],.5),clamp(lerp(1.1,b[1],.45),1,2.6),lerp(pe.z??0,b[2],.5)];
 const gl:V3=[-3.6,1.1,.4],u=sm(q.v+.05,q.b+.1,t,easeInOutSine),look=mix3(mid,gl,u);
 const cel=sm(q.b+.5,q.b+1.8,t,easeInOutSine),look2=mix3(look,[-1.8,1.0,1.4],cel);
 const pos:V3=[lerp(lerp(-9.4,-5.8,u),-3,cel),1.5+.2*u,lerp(lerp(7.6,9.4,u),11,cel)],F=key(t,mono([[0,2000],[q.f,2100],[q.o+.3,1800],[q.v,1900],[q.b+.3,1500],[q.b+1.8,1250],[q.end,1250]]));return cam(pos,look2,F);}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.v+.3;
  const shake=t>=hitT?8*settle(t,hitT,{freq:6,decay:6}):0;frame(s,1,shake,shake*.4);
  stadium(s,c,{t,cheer:.15+1.1*sm(0,.5,goalIn),flash:.15+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const w=drawWorld(s,c,tau,tp,{ballMin:30,hero:true});
  // the flick's arc over Gustavsson's head, drawn as dotted ink while the ball hangs, and the strike
  if(tp>TFL&&tp<TV+.1){const dots=new Path2D();for(let i=0;i<=16;i++){const tt2=TFL+(Math.min(tp,TV)-TFL)*i/16,p=P(c,ballAt(tt2));dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);}s.fill(K,dots,.6);}
  if(tp>=TV&&tp<TV+.3){const p=P(c,V_HIT);sparkBurst(s,Y,p[0],p[1],120+120*sm(TV,TV+.1,tp,easeOut),{n:10,seed:58,g:1-sm(TV+.12,TV+.3,tp),width:14});}
  if(tp>=TV&&tp<T_GOAL+.1){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:59,len:200,width:8,cov:.85});}
 },
 aperture(t){const c=ch3Cam(t),p=ballAt(tau3(t)),[x,y]=P(c,p),r=Math.max(30,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5.2,
};

// ================= chapter 4 (duotone lesson): soft chest = ball stays close; hard chest = ball flies away; time and space =================
const ch4T=()=>({c:T(3,'Cushion the ball'),l:T(3,'like Pelé'),sc:T(3,'stays close'),so:T(3,'A soft first touch'),bu:T(3,'buys you'),ti:T(3,'time'),spc:T(3,'space'),end:SEC(3)});
const L_CHEST=.9;// lesson: contact time after "Cushion"
const DEF4:{style:AthleteStyle;from:[number,number];to:[number,number]}[]=[
 {style:duo(SWE({seed:50})),from:[2.3,-2.4],to:[3.6,-4.6]},
 {style:duo(SWE({seed:51})),from:[-2.1,-2.8],to:[-3.4,-5.2]},
];
const PELE4=duo(PELE,true);
function lessonPose(t:number,q:ReturnType<typeof ch4T>):Pose{
 const u=(t-(q.c+L_CHEST))/(CH1-CH0)+(TF-CH0)/(CH1-CH0);let p=keyPoses(clamp(u,0,.86),CHEST_KEYS);
 // on "space": head up, a look round (he has time to choose)
 const look=sm(q.spc-.2,q.spc+.5,t);if(look>0)p={...p,neckP:lerp(p.neckP,-8*D2R,look),neckY:lerp(0,34*D2R,look)*Math.sin(Math.min(1,look)*Math.PI*.5)};
 return p;}
const ch4:Scene={
 draw(s,t){const q=ch4T(),tt=twos(t),hit=q.c+L_CHEST;
  // camera: push to the chest on "cushion", down to the feet on "stays close", pull wide for the soft/hard compare, wider for time and space
  const v=key(t,mono([[0,.4,1.0,1.25,2600],[q.c,.3,1.05,1.3,2800],[hit,0,1.2,1.2,3400],[q.sc,0,1.0,.75,3200],[q.sc+.8,0,1.0,.6,3000],[q.so,.8,1.3,1.1,2500],[q.bu,1.2,1.5,1.0,2300],[q.ti+.3,2,2.1,.7,2050],[q.end,2.2,2.4,.6,2000]]),easeIO,true);
  const c=cam([0,v[1],7.4+v[0]],[.15,v[2],0],v[3]);frame(s);
  // the stage: a navy field, the ground as a stepped yellow light pool, the horizon of an empty print
  s.field(K,.75,.5);
  const ring=(r:number,y=.01)=>{const pts:V3[]=[];for(let i=0;i<40;i++){const a=i/40*TAU;pts.push([Math.cos(a)*r,y,Math.sin(a)*r]);}const pa=new Path2D();addPoly(pa,clipPoly(c,pts));return pa;};
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-40,0,-30],[40,0,-30],[40,0,6.5],[-40,0,6.5]]));s.tone(K,floor,.2);
  s.knockout(ring(6),.2);s.tone(K,ring(6),.2);s.tone(Y,ring(1.6),.2);s.tone(Y,ring(.9),.32);
  // "time and space": a stopwatch ring on the grass fills round, then grows and holds the defenders off
  const grow=sm(q.ti,q.ti+.8,t,easeOutBack),space=sm(q.spc,q.spc+.9,t,easeOutBack),R0=1.1+1.5*grow+1.4*space;
  if(t>=q.ti-.05){const g=1-Math.pow(1-sm(q.ti-.05,q.ti+1.1,tt),2),pts:V3[]=[];for(let i=0;i<=36;i++){const a=-Math.PI/2+i/36*TAU*g;pts.push([Math.cos(a)*R0,.02,Math.sin(a)*R0]);}
   const pp=pts.map(p=>P(c,p));if(pp.length>1)s.fill(Y,ribbon(pp,Math.max(12,.16*kAt(c,[0,0,0])),{taper:.1,pressure:.2,wobble:1}),.95);
   const ticks=new Path2D();for(let i=0;i<12;i++){if(i/12>g)break;const a=-Math.PI/2+i/12*TAU;groundLine(ticks,c,[Math.cos(a)*(R0+.12),Math.sin(a)*(R0+.12)],[Math.cos(a)*(R0+.42),Math.sin(a)*(R0+.42)],.07);}s.fill(Y,ticks,.95);}
  // defenders (Swedish shirts, halftone ghosts), held back by the ring on "space"
  const items:Item[]=[];
  DEF4.forEach((d,i)=>{const back=sm(q.spc,q.spc+.8,tt),come=sm(q.so,q.ti,tt),x=lerp(lerp(d.from[0]*1.6,d.from[0],come),d.to[0],back),z=lerp(lerp(d.from[1]*1.6,d.from[1],come),d.to[1],back),g:V3=[x,0,z];
   const ph=tt*1.8+i*.5,pose=back>0&&back<1?backpedal(ph):come>0&&come<1?runCycle(ph,{speed:.5}):stand();
   items.push({depth:depthOf(c,g),draw:()=>drawPlayer(s,pose,c,d.style,{x,z,yaw:YAW(-x,-z)})});});
  // Pelé, side-on, facing screen-right: leap, chest, cushion, the ball drops dead at his feet
  const pose=lessonPose(tt,q),prev=lessonPose(tt-1/12,q),place:Place={x:0,z:0,yaw:0};
  items.push({depth:depthOf(c,[0,0,0]),draw:()=>{drawPlayer(s,pose,c,PELE4,place,{prev:{pose:prev,place},smear:true});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  const sk=solve(keyPoses(clamp((TF-CH0)/(CH1-CH0)),CHEST_KEYS),PB,place),T3=sk.fr.T,fwd:V3=[T3[0],T3[3],T3[6]],CHP=add(add(sk.chest,mul(fwd,.17)),[0,.05,0]),FOOT:V3=[.42,.11,.08];
  // the ball: floats in from the front on a dotted arc, meets the chest, drops softly to the feet
  const from:V3=[2.6,3.4,.1],br=(p:V3)=>Math.max(26,BALL_R*kAt(c,p));
  let bpos:V3,sq=0;
  if(tt<hit){const u=sm(q.c-.2,hit,tt,x=>x);bpos=mix3(from,CHP,u);bpos[1]+=1.2*u*(1-u);}
  else{const e=tt-hit,d=clamp(e/.62);bpos=mix3(CHP,FOOT,d);bpos[1]=Math.max(.11,CHP[1]+.5*e-4.9*e*e);if(e>.62)bpos[1]=.11+.06*Math.abs(Math.sin((e-.62)*9))*Math.exp(-(e-.62)*5);sq=e<.1?.25*(1-e/.1):0;}
  if(tt>q.c-.25&&tt<hit+.2){const dots=new Path2D();for(let i=0;i<=14;i++){const u=i/14,p0=mix3(from,CHP,u);p0[1]+=1.2*u*(1-u);const p=P(c,p0);dots.moveTo(p[0]+9,p[1]);dots.arc(p[0],p[1],9,0,TAU);}s.fill(Y,dots,.9*(1-sm(hit,hit+.2,tt)));}
  // cushion rings at the chest
  if(tt>=hit-.05&&tt<hit+.6){const p=P(c,CHP),k=kAt(c,CHP),e=sm(hit-.05,hit+.3,tt);for(let i=0;i<3;i++){const r=.16*k*(1+i*.5)*(.5+.5*e);s.stroke(Y,polyPath(Array.from({length:22},(_,j)=>[p[0]+Math.cos(j/22*TAU)*r,p[1]+Math.sin(j/22*TAU)*r] as Pt),true),Math.max(5,.02*k),.95*(1-sm(hit+.3,hit+.6,tt)));}}
  // "stays close": a snug paper ring round ball and boots
  const close=sm(q.sc,q.sc+.35,tt,easeOutBack)*(1-sm(q.so-.1,q.so+.3,tt));if(close>.02){const pts:V3[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([.3+Math.cos(a)*.62*close,.02,Math.sin(a)*.5*close]);}s.stroke(Y,polyPath(pts.map(p=>P(c,p)),true),Math.max(8,.05*kAt(c,[0,0,0])),.95);}
  // "a soft first touch" versus a hard one: a ghost ball bounces off a stiff chest and away to a defender (halftone, dashed)
  const gh=sm(q.so,q.so+1.1,tt,x=>x),ghFade=1-sm(q.bu+.3,q.ti,tt);if(gh>0&&ghFade>0){const to:V3=[DEF4[0].from[0]-.4,.11,DEF4[0].from[1]+.3],path:Pt[]=[];for(let i=0;i<=20;i++){const u=i/20*gh,p=mix3(CHP,to,u);p[1]=CHP[1]*(1-u)+2.2*Math.sin(u*Math.PI)+.11*u;path.push(P(c,p));}
   const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.12)gaps.push([x,x+.06]);s.knockout(ribbon(path,22,{taper:.2,wobble:1,gaps}),.9);s.fill(Y,ribbon(path,22,{taper:.2,wobble:1,gaps}),.45);
   const e=path[path.length-1],r=br(to)*.9;s.save();s.translate(e[0],e[1]);const gp=polyPath(Array.from({length:20},(_,i)=>[Math.cos(i/20*TAU)*r,Math.sin(i/20*TAU)*r] as Pt),true);s.knockout(gp,.6*ghFade);s.fill(Y,gp,.32*ghFade);s.stroke(Y,gp,8,.95*ghFade);s.restore();}
  const bp=P(c,bpos),r=br(bpos);leatherBall(s,bp[0],bp[1],r,tt<hit?tt*3:hit*3+(tt-hit)*1.2*Math.exp(-(tt-hit)),{sq,dir:-Math.PI/2,duo:true});
 },
 still:6,
};

const story:RisoStory={
 id:'pele-final-1958',format:'11v11',title:"Pelé's 1958 final volley",
 theme:'A soft first touch buys you time and space.',
 ageNote:'World Cup final, Sweden 2–5 Brazil, Råsunda Stadium, Solna, 29 June 1958. Pelé was 17.',
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
