/** Iconic play film: Paolo Rossi's hat-trick, Italy 3–2 Brazil, 1982 World Cup second round (Group C), Estadio de Sarrià, Barcelona,
 * 5 July 1982. A RisoStory (chapters mode) played by the card window and StoryFilmPlayer. Narration text:
 * public/plays/narration/rossi-brazil-1982/script.json. The lead voices it later with local Kokoro; until then every chapter runs on
 * provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once timing.json
 * exists `withTiming` re-times the whole film through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/rossi-brazil-1982/timing.json exists, replace the `VOICE` constant below with
 *   import timingJson from '../../../public/plays/narration/rossi-brazil-1982/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 *
 * SOURCES (read Sept 2026 with curl; cached in scratchpad/films/src-cache; the footage itself was not watched):
 *  - Wikipedia, "Italy v Brazil (1982 FIFA World Cup)" (raw wikitext: summary, line-ups, kit templates)
 *    https://en.wikipedia.org/wiki/Italy_v_Brazil_(1982_FIFA_World_Cup)
 *  - The Guardian, Rob Smyth, "Italy 3-2 Brazil: 1982 World Cup, second round Group C – as it happened" (21 Apr 2020, a minute-by-minute
 *    replay of the broadcast, both pages) https://www.theguardian.com/sport/live/2020/apr/21/italy-v-brazil-1982-world-cup-second-round-group-c-live
 *  - Wikipedia (it), "Italia-Brasile 3-2" (raw wikitext: the match narrative, kit template)
 * CONFIRMED by those pages: 5 July 1982, 17:15, Sarrià, Barcelona, 44,000, referee Abraham Klein (Israel); a very hot afternoon ("over 90
 *  degrees"). Italy had to win (Brazil were through with a draw). Rossi 5', Sócrates 12', Rossi 25', Falcão 68', Rossi 74'/75' (3–2).
 *  Brazil kicked off LEFT to RIGHT on the broadcast and Italy kicked off the second half left to right, so on the main camera Italy attacked
 *  the LEFT goal in the first half (goals 1 and 2) and the RIGHT goal in the second (goal 3).
 *  Goal 1: Bruno Conti swerved away from Cerezo and Éder and swept an outside-of-the-foot crossfield pass to the onrushing Cabrini on the
 *  left; Cabrini crossed to the far post, where Rossi, in too much space between Luizinho and Júnior, headed back across Waldir Peres
 *  from six yards. Goal 2: Peres threw out to Leandro, who laid it square to Cerezo about 30 yards from goal; Cerezo's lazy square pass
 *  was cut out by Rossi, who beat Júnior (diving in) to the ball, ran to the edge of the area and thrashed a shot through Peres; Luizinho
 *  was trotting upfield, Falcão was not expecting the pass. Goal 3: Cerezo headed Antognoni's deep cross behind, the only Italian corner
 *  of the match; Conti drove it toward the edge of the area where Bergomi, Zico and Sócrates went up (it.wiki: Oscar, hindered by
 *  Sócrates, headed it); it dropped to Tardelli, whose mishit volley went through a crowd of players and was turned in from about four
 *  yards by Rossi, with Graziani going for the same ball; Júnior, slow off the near post, played Rossi onside.
 *  Numbers: Italy Zoff 1, Bergomi 3 (on for Collovati 34'), Cabrini 4, Gentile 6, Scirea 7, Antognoni 9, Oriali 13, Tardelli 14, Conti 16,
 *  Graziani 19, Rossi 20; Brazil Waldir Peres 1, Leandro 2, Oscar 3, Luizinho 4, Cerezo 5, Júnior 6, Paulo Isidoro 7 (on 69'), Sócrates 8,
 *  Serginho 9 (off 69'), Zico 10, Éder 11, Falcão 15. Kits (both wikis' kit templates, and the Guardian's "yellow tops"): Italy azure
 *  shirts, white shorts, blue socks; Brazil yellow shirts with green collar and cuffs, blue shorts, white socks.
 *  Graziani's "straggly hair" (Guardian).
 * SOURCES DISAGREE: who headed Conti's corner out (the Guardian: off Sócrates' head; it.wiki: Oscar, hindered by Sócrates). The film shows
 *  Sócrates and Oscar going up together and the narration only says "cleared".
 * INFERRED / ILLUSTRATIVE: every position, distance, speed and run in metres; which corner flag Conti used (printed: Italy's right, the near
 *  side under the main-stand camera); every foot (Conti's left-footed pass and corner, Cabrini's left-footed cross, Cerezo's pass, Rossi's
 *  RIGHT foot for goals 2 and 3, Tardelli's right-footed volley; none is narrated); the keepers' dives; the goalkeeper kits (Peres grey,
 *  inferred); the celebrations; hair and skin screens; the referee's black kit; the ball (Tango-style panels); the Sarrià's look (compact
 *  steep terraces close to the pitch on four sides, floodlight masts, apartment blocks beyond the rim), crowd colours and flags (drawn as
 *  simple stripes); ad boards (no lettering); every camera position, lens and the slow-motion speed; the hat-trick counter (a graphic).
 *
 * STRUCTURE (the approved standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down). Each goal is ONE
 * simulation on its own clock τ (seconds; τ = 0 the moment Rossi touches the ball in); the chapters sample them:
 *  ch1 = LIVE, the high main-stand camera in real time: goal 1 at the left end (Cabrini's cross, the header), a tilt up into the crowd
 *        (Brazil equalise), goal 2 (the stolen pass, the shot), a whip pan along the far terrace to the right end (Brazil equalise again),
 *        goal 3 (the corner, the scramble, the poke). A hat-trick counter at the top prints each goal (blue balls = Rossi, yellow = Brazil);
 *  ch2 = the TV slow-motion REPLAY of the winner from a low reverse-angle camera across the box (the corner, the clearance, Tardelli's mishit through
 *        the legs, Rossi's eyes on the ball, the reaction, the touch);
 *  ch3 = the lesson, a duotone (blue + navy) replay on an empty print: poachers stay alert in the box, watch the ball, react first.
 * Seams are forward passages into the ball. The ball meets the solved boots / forehead (placeFor(), headPlace()). World: right-handed
 * metres like athlete.ts: the right-hand goal line x = 0, the left one x = −105; the main-stand camera is on the +z side (near touchline
 * z = +34), so +x runs to screen right. Inks: yellow (Brazil, skin, grass with blue), orange (skin, the Italian flag's red, boards), blue (Italy, sky, grass), navy (key
 * line, Brazil's shorts via blue). Scenes read only their local t; drawn objects pose on twos, cameras on ones; randomness is seeded.
 * Framing: the full sheet (card window 1.45:1 down to square), never sheet.safe; subjects stay inside ±540 units of the centre.
 * Phone heat: ≈4 plates, the crowd batched per ink, wide-shot figures at 'low' detail, only the named players drawn 'mid' in the replay,
 * every figure capped during passages. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,ribbon,polyPath,smoothPts,partial,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,lunge,keeperSet,keeperDive,strike,volley,header,slideTackle,celebrate,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail,type InkFill} from './athlete';

const O='orange',Y='yellow',B='blue',K='navy';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`rossi film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead records the narration with Kokoro; then the timing.json import goes here (see the header). */
import timingJson from '../../../public/plays/narration/rossi-brazil-1982/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Live','Barcelona, 1982. Italy, in blue, must beat Brazil, in yellow. Rossi heads in the first! Brazil equalise. Rossi steals a lazy pass and scores! Brazil equalise again. Then a corner is cleared, and Rossi pokes it in. Hat-trick!',
  ['Barcelona','1982','Italy','in blue','must beat Brazil','in yellow','Rossi heads','the first','Brazil equalise','Rossi steals','a lazy pass','scores','equalise again','Then','a corner','is cleared','Rossi pokes','Hat-trick']),
 prov('The replay','Watch the winner again. The corner is headed out. Tardelli mishits a shot through a crowd of legs. Rossi never takes his eyes off the ball. He reacts first and turns it in!',
  ['Watch the winner','The corner','headed out','Tardelli','mishits','a crowd of legs','Rossi never','his eyes','the ball','He reacts first','turns it in']),
 prov('Your turn',"Rossi's hat-trick knocked Brazil out. Poachers stay alert in the box, watch the ball, and react first!",
  ["Rossi's hat-trick",'knocked Brazil out','Poachers','stay alert','in the box','watch the ball','react first']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`rossi film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}
/** true while two scenes print at once (the departing .65 s or the arriving .72 s): figures are capped a detail step */
const busy=(ch:number,t:number)=>t>SEC(ch)-.65||(ch>0&&t<.72);

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up) =================
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
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

// ================= the Sarrià: compact steep terraces hard against the pitch on four sides, floodlight masts, flats beyond =================
const CX=-52.5;// the centre spot
/** a point on a squarish oval round the centre spot: a along x, b along z, height y, angle th (0 = +x end) */
function ov(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th),e=.28;return[CX+a*Math.sign(c)*Math.pow(Math.abs(c),e),y,b*Math.sign(s)*Math.pow(Math.abs(s),e)];}
const IN:[number,number,number]=[58.5,39.5,1.1],OUT:[number,number,number]=[80,60,22];// the terrace front and rim
const NSEG=48;
const bowlPt=(th:number,v:number):V3=>mix3(ov(IN[0],IN[1],IN[2],th),ov(OUT[0],OUT[1],OUT[2],th),v);
/** crowd: [u round the bowl, v up the terrace, ink 0 paper / 1 navy / 2 yellow (Brazil) / 3 blue (Italy) / 4 orange, phase] */
const CROWD=(()=>{const r=rng(1982),o:[number,number,number,number][]=[];for(let i=0;i<2100;i++){const c=r();o.push([r(),.03+r()*.94,c<.3?0:c<.44?1:c<.72?2:c<.88?3:4,r()*TAU]);}return o;})();
/** flags: [u, v, 1 Italian (green-paper-orange) / 0 Brazilian (green-yellow-green, simplified)] */
const FLAGS:[number,number,number][]=(()=>{const r=rng(705),o:[number,number,number][]=[];for(let i=0;i<30;i++)o.push([r(),.12+r()*.7,r()<.45?1:0]);return o;})();
/** apartment blocks round the rim (the Sarrià sat hemmed in by the upper city): [angle, width m, height m] */
const FLATS:[number,number,number][]=(()=>{const r=rng(88),o:[number,number,number][]=[];for(let i=0;i<22;i++)o.push([i/22*TAU+r()*.1,10+r()*12,8+r()*16]);return o;})();
type Crowd={cheer?:number;flash?:number;ita?:number;bra?:number;t:number;lite?:boolean};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,ita=0,bra=0,t,lite=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a white-hot July sky, pale haze toward the rim
 s.field(B,.16,.7);
 {const hz=new Path2D(),hp=P(c,[c.eye[0]+c.f[0]*400,26,c.eye[2]+c.f[2]*400]);hz.rect(-Bnd,hp[1],Bnd*2,Bnd);s.tone(Y,hz,.14);}
 // the flats behind the rim: blocks with a darker band of windows
 if(!lite){const fl=new Path2D(),win=new Path2D();for(const[a,w,h] of FLATS){const b=ov(OUT[0]+14,OUT[1]+14,0,a),tan:[number,number]=[-Math.sin(a),Math.cos(a)],half=w/2;
   const q:V3[]=[[b[0]-tan[0]*half,OUT[2]-2,b[2]-tan[1]*half],[b[0]+tan[0]*half,OUT[2]-2,b[2]+tan[1]*half],[b[0]+tan[0]*half,OUT[2]+h,b[2]+tan[1]*half],[b[0]-tan[0]*half,OUT[2]+h,b[2]-tan[1]*half]];addPoly(fl,clipPoly(c,q));
   for(let k=1;k<4;k++){const y=OUT[2]+h*k/4;addPoly(win,clipPoly(c,[[q[0][0],y,q[0][2]],[q[1][0],y,q[1][2]],[q[1][0],y+1.2,q[1][2]],[q[0][0],y+1.2,q[0][2]]]));}}
  s.knockout(fl,.8);s.tone(O,fl,.22);s.tone(K,fl,.16);s.tone(K,win,.35);}
 // floodlight masts at the four corners
 if(!lite){const m=new Path2D(),lamps=new Path2D();for(const a of[.1,.4,.6,.9].map(v=>v*TAU+(v<.5?.06:-.06))){const b=ov(OUT[0]+4,OUT[1]+4,0,a),tp:V3=[b[0],48,b[2]];if(depthOf(c,b)<NEAR||depthOf(c,tp)<NEAR)continue;const k=kAt(c,b),pb=P(c,b),pt=P(c,tp);
   m.addPath(ribbon([pb,pt],Math.max(2,.9*k),{taper:.5,wobble:0}));lamps.rect(pt[0]-3*k,pt[1]-2.4*k,6*k,2.4*k);}
  s.fill(K,m,.8);s.knockout(lamps,.9);s.stroke(K,lamps,3,.8);}
 // the terraces: knocked out, a navy screen, stepped rows
 const bowl=new Path2D(),steps=new Path2D(),rim=new Path2D();
 for(let i=0;i<NSEG;i++){const a0=i/NSEG*TAU,a1=(i+1)/NSEG*TAU;addPoly(bowl,clipPoly(c,[bowlPt(a0,0),bowlPt(a1,0),bowlPt(a1,1),bowlPt(a0,1)]));
  for(let k=0;k<12;k+=2)addPoly(steps,clipPoly(c,[bowlPt(a0,k/12),bowlPt(a1,k/12),bowlPt(a1,(k+1)/12),bowlPt(a0,(k+1)/12)]));
  addPoly(rim,clipPoly(c,[bowlPt(a0,1),bowlPt(a1,1),add(bowlPt(a1,1),[0,1.6,0]),add(bowlPt(a0,1),[0,1.6,0])]));}
 s.knockout(bowl);s.tone(K,bowl,.38);s.tone(O,steps,.12);s.tone(K,steps,.16);s.fill(K,rim,.8);
 // crowd heads (they bob on the twos when the crowd roars)
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[u,v,col,ph] of CROWD){const p=bowlPt(u*TAU,v);p[1]+=.35+(cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0);if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.85);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);if(seen[4])s.fill(O,heads[4],.95);
 // flags: Italian tricolours rise for Italy's goals, Brazilian ones (simplified green and yellow) for Brazil's
 if(!lite){const pole=new Path2D(),grn=new Path2D(),yel=new Path2D(),org=new Path2D(),pap=new Path2D();
  FLAGS.forEach(([u,v,d],i)=>{const lift=d?ita:bra,b=bowlPt(u*TAU,v);b[1]+=1.2+1.4*lift;if(depthOf(c,b)<4)return;const k=kAt(c,b),pb=P(c,b);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;
   const pt:Pt=[pb[0],pb[1]-1.6*k],w=2.2*k,h=1.4*k,wv=(q:number)=>Math.sin(tt*(5+3*lift)+i+q*4)*h*(.1+.15*lift)*q;pole.addPath(ribbon([pb,pt],Math.max(2,.12*k),{taper:0,wobble:0}));
   const cloth=(u0:number,u1:number)=>polyPath([[pt[0]+w*u0,pt[1]+wv(u0)],[pt[0]+w*u1,pt[1]+wv(u1)],[pt[0]+w*u1,pt[1]+h+wv(u1)],[pt[0]+w*u0,pt[1]+h+wv(u0)]],true);
   if(d){grn.addPath(cloth(0,.34));pap.addPath(cloth(.34,.67));org.addPath(cloth(.67,1));}else{grn.addPath(cloth(0,1));yel.addPath(polyPath([[pt[0]+w*.12,pt[1]+h*.5+wv(.12)],[pt[0]+w*.5,pt[1]+h*.14+wv(.5)],[pt[0]+w*.88,pt[1]+h*.5+wv(.88)],[pt[0]+w*.5,pt[1]+h*.86+wv(.5)]],true));}});
  s.fill(K,pole,.9);s.knockout(grn);s.knockout(org);s.knockout(pap);s.fill(Y,grn,.95);s.tone(B,grn,.75);s.fill(O,org,.95);s.fill(Y,yel,.95);}
 // flashbulbs when the crowd roars
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const p=bowlPt(r()*TAU,.05+r()*.6);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1*kAt(c,p),8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // the narrow surround (the terraces sit right on the pitch) and ad boards at the pitch edge (no lettering)
 {const sur=new Path2D();addPoly(sur,clipPoly(c,[[-110,0,-38.5],[5,0,-38.5],[5,0,38.5],[-110,0,38.5]]));s.knockout(sur);s.tone(O,sur,.28);s.tone(K,sur,.12);}
 {const bd=new Path2D(),blk=[new Path2D(),new Path2D(),new Path2D()];
  for(const z of[-36.5,36.5])for(let x=-107;x<2;x+=6){addPoly(bd,clipPoly(c,[[x+.2,0,z],[x+5.8,0,z],[x+5.8,.9,z],[x+.2,.9,z]]));const i=Math.abs(Math.round(x/6))%3;addPoly(blk[i],clipPoly(c,[[x+.8,.2,z],[x+4.2,.2,z],[x+4.2,.7,z],[x+.8,.7,z]]));}
  for(const x of[-108.5,3.5])for(let z=-33;z<33;z+=6){addPoly(bd,clipPoly(c,[[x,0,z+.2],[x,0,z+5.8],[x,.9,z+5.8],[x,.9,z+.2]]));const i=Math.abs(Math.round(z/6))%3;addPoly(blk[i],clipPoly(c,[[x,.2,z+.8],[x,.2,z+4.2],[x,.7,z+4.2],[x,.7,z+.8]]));}
  s.knockout(bd);s.stroke(K,bd,3,.7);s.fill(O,blk[0],.9);s.fill(B,blk[1],.9);s.fill(Y,blk[2],.95);}
 // grass: yellow × blue = green, mowing stripes, paper lines (both halves)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-108,0,-35.5],[3,0,-35.5],[3,0,35.5],[-108,0,35.5]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.16);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;
  Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=(d<0?Math.PI:0)-.927+i/10*1.854,pt:[number,number]=[gx+d*11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 s.knockout(lines,.95);
 // corner flags
 {const po=new Path2D(),cf=new Path2D();let n=0;for(const x of[0,-105])for(const z of[-34,34]){const b:V3=[x,0,z],top:V3=[x,1.6,z];if(depthOf(c,b)>2){const pb=P(c,b),pt=P(c,top),k=kAt(c,b);if(Math.abs(pb[0])>Bnd)continue;po.addPath(ribbon([pb,pt],Math.max(2,.05*k),{taper:0,wobble:0}));cf.addPath(polyPath([pt,[pt[0]-.5*k,pt[1]+.15*k+Math.sin(tt*6+z+x)*.05*k],[pt[0],pt[1]+.35*k]],true));n++;}}
  if(n){s.fill(K,po,.95);s.knockout(cf);s.fill(O,cf,.95);}}
}
/** a goal on the line x = X (net behind it toward d = ±1): square posts, a box net; `bulge` pushes the back net out round (bz, by) */
function goal(s:Sheet,c:Camera,X:number,d:number,bulge=0,bz=0,by=.4){
 if(depthOf(c,[X,1,0])<NEAR+1)return;{const g=P(c,[X,1.2,0]),k=kAt(c,[X,1.2,0]);if(Math.abs(g[0])>s.W*.6+5*k||Math.abs(g[1])>s.H*.6+4*k)return;}
 const W=3.66,H=2.44,Dp=2,vol=new Path2D(),mesh=new Path2D();
 const bx=(z:number,y:number)=>X+d*(Dp+bulge*.7*Math.exp(-Math.pow((z-bz)/1.4,2)-Math.pow((y-by)/1.1,2)));
 const back=(u:number,v:number):V3=>{const z=lerp(-W,W,u),y=lerp(H,0,v);return[bx(z,y),y,z];},top=(u:number,v:number):V3=>[X+d*lerp(0,Dp,v),H,lerp(-W,W,u)],side=(z:number)=>(u:number,v:number):V3=>[X+d*lerp(0,Dp,u),lerp(H,0,v),z];
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,14,6);grid(top,12,3);grid(side(-W),3,5);grid(side(W),3,5);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.7);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([X,0,-W],[X,H+.06,-W]);bar([X,0,W],[X,H+.06,W]);bar([X,H,-W-.06],[X,H,W+.06]);
 bar([X+d*Dp,0,-W],[X+d*Dp,H,-W],.06);bar([X+d*Dp,0,W],[X+d*Dp,H,W],.06);
 s.fill(K,edge,.9);s.knockout(frameP);
}

// ================= the 1982 ball: white with black "Tango" triads, navy shade, rim, glint =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const pts=blob(0,0,r,r,11,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 if(r<12){s.fill(K,ribbon(pts,Math.max(3,r*.22),{seed:12,close:true,wobble:.4}));s.restore();return;}
 s.save();s.clip(disc);s.tone(K,crescent(0,0,r*1.02,[-.42,-.45]),.24);
 // Tango: rounded triads round small circles
 const pan=new Path2D();for(let i=0;i<4;i++){const a=rot+i/4*TAU,cx=Math.cos(a)*r*.55,cy=Math.sin(a)*r*.55,q:Pt[]=[];for(let k=0;k<3;k++){const b=a+Math.PI+(k-1)*.8;q.push([cx+Math.cos(b)*r*.42,cy+Math.sin(b)*r*.42]);}pan.addPath(ribbon(smoothPts(q,false,6,2),Math.max(2.5,r*.12),{taper:.3,wobble:0}));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(3.5,r*.075),{seed:12,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(-r*.4,-r*.42,r*.13,r*.09,13,{amp:.05,n:12}),true));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3,cov=.5){const pts:Pt[]=[],rad=.17+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad*1.2,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(cov-b[1]*.05,.2,.55));}

// ================= kits (5 July 1982) and the figure adapter =================
const LIGHT:InkFill[]=[[O,.24],[Y,.15]],MID:InkFill[]=[[O,.72],[Y,.2]],DARK:InkFill[]=[[O,.88],[K,.22]];
/** Italy: azure shirts, white shorts, blue socks (kit templates); white trim inferred */
const ITA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:'paper',socks:B,boots:K,skin:LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:'paper',...o});
/** Brazil: yellow shirts, green collar and cuffs (blue over yellow), blue shorts, white socks */
const BRA=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,trim:[B,.6],shorts:B,socks:'paper',boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[B,.6],...o});
const RB:Build={height:1.74,bulk:.94,thighs:1.02};// Rossi: slight and quick
const ROSSI:AthleteStyle=ITA({number:20,hair:K,hairStyle:'curly',build:RB,seed:20});
const CONTI:AthleteStyle=ITA({number:16,hair:K,build:{height:1.69,bulk:.96},seed:16});
const CABRINI:AthleteStyle=ITA({number:4,hair:K,build:{height:1.78},seed:4});
const GRAZIANI:AthleteStyle=ITA({number:19,hair:[K,.8],hairStyle:'long',build:{height:1.82},seed:19});
const TARDELLI:AthleteStyle=ITA({number:14,hair:K,hairStyle:'long',build:{height:1.8,bulk:.98},seed:14});
const BERGOMI:AthleteStyle=ITA({number:3,hair:K,build:{height:1.84,bulk:1.04},seed:3});
const ANTOGNONI:AthleteStyle=ITA({number:9,hair:[K,.7],hairStyle:'long',seed:9});
const ORIALI:AthleteStyle=ITA({number:13,hair:K,hairStyle:'curly',build:{height:1.75},seed:13});
const PERES:AthleteStyle={shirt:[K,.45],shorts:[K,.85],socks:[K,.45],trim:'paper',boots:K,skin:LIGHT,hair:K,line:K,sleeves:'long',gloves:'paper',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.84},seed:1};
const JUNIOR:AthleteStyle=BRA(DARK,{number:6,hairStyle:'curly',seed:6});
const CEREZO:AthleteStyle=BRA(DARK,{number:5,hairStyle:'curly',build:{height:1.86,bulk:.94},seed:5});
const SOCRATES:AthleteStyle=BRA(MID,{number:8,hairStyle:'curly',build:{height:1.92,bulk:.95},seed:8});
const OSCAR:AthleteStyle=BRA(LIGHT,{number:3,build:{height:1.84,bulk:1.04},seed:23});
const LUIZINHO:AthleteStyle=BRA(MID,{number:4,build:{height:1.82},seed:24});
const LEANDRO:AthleteStyle=BRA(MID,{number:2,hairStyle:'curly',seed:22});
const FALCAO:AthleteStyle=BRA(LIGHT,{number:15,hair:[O,.55],hairStyle:'curly',build:{height:1.83},seed:15});
const ZICO:AthleteStyle=BRA(MID,{number:10,build:{height:1.72},seed:10});
const EDER:AthleteStyle=BRA(LIGHT,{number:11,seed:11});
const SERGINHO:AthleteStyle=BRA(MID,{number:9,build:{height:1.85,bulk:1.05},seed:29});
const ISIDORO:AthleteStyle=BRA(MID,{number:7,seed:27});
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:LIGHT,hair:[K,.5],hairStyle:'balding',line:K,sleeves:'short',build:{height:1.68},seed:33};
/** duotone kits for the lesson (blue + navy only) */
const ROSSI_DUO:AthleteStyle={...ROSSI,skin:[[B,.2]],shorts:'paper',shade:[K,.22]};
const GHOST=(st:AthleteStyle):AthleteStyle=>({...st,shirt:[K,.4],shorts:[K,.25],socks:[K,.4],trim:K,skin:[[B,.16]],hair:[K,.3],shade:[K,.16],shadow:[K,.15],number:null});
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

// ================= shared motion helpers =================
type MKey=[number,number,number];// τ, x, z
/** position along a keyed path: linear between keys (steady running), eased into the first key and out of the last */
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};const n=p.length;
 for(let i=0;i+1<n;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt,first=i===0,last=i===n-2;
   const ee=first&&last?easeInOutSine(u):first?.5*u*u+.5*u:last?1-.5*(1-u)*(1-u)-.5*(1-u):u,ev=first&&last?Math.PI/2*Math.sin(Math.PI*u):first?u+.5:last?1.5-u:1;
   return{x:lerp(a[1],b[1],ee),z:lerp(a[2],b[2],ee),vx:(b[1]-a[1])/dt*ev,vz:(b[2]-a[2])/dt*ev,dist:dist+L*ee};}dist+=L;}
 const l=p[n-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
type St={pose:Pose;place:Place};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or `look` when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):St{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
const mixSt=(A:St,Bq:St,u:number):St=>({pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}});
/** segments on τ, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(segs:[number,(t:number)=>St][],tau:number):St{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSt(segs[i-1][1](tau),segs[i][1](tau),sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSt(segs[i][1](tau),segs[i+1][1](tau),sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}
/** the ball's spot against a solved boot (between ankle and toe, a ball radius ahead of the instep) */
function footBall(pose:Pose,build:Build,place:Place,foot:'l'|'r'='r'):V3{const sk=solve(pose,build,place),f=dirOf(place.yaw??0),an=foot==='r'?sk.rAn:sk.lAn,to=foot==='r'?sk.rToe:sk.lToe;return[(an[0]+to[0])/2+f[0]*.1,BALL_R,(an[2]+to[2])/2+f[1]*.1];}
/** where to stand (at this yaw) so that this pose's boot meets the ball at `target` */
function placeFor(pose:Pose,build:Build,yaw:number,target:[number,number],foot:'l'|'r'='r'):Place{const b=footBall(pose,build,{x:0,z:0,yaw},foot);return{x:target[0]-b[0],z:target[1]-b[2],yaw};}
/** where to stand so that this pose's forehead meets the ball over `target`; returns the place and the ball height at contact */
function headPlace(pose:Pose,build:Build,yaw:number,target:[number,number]):{place:Place;y:number}{const sk=solve(pose,build,{x:0,z:0,yaw}),f=dirOf(yaw),h:V3=[sk.face[0]+f[0]*.12,sk.face[1]+.02,sk.face[2]+f[1]*.12];return{place:{x:target[0]-h[0],z:target[1]-h[2],yaw},y:h[1]};}
/** a parabolic flight a → b with an extra `peak` of height at the middle */
const arcP=(a:V3,b:V3,u:number,peak:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+4*peak*u*(1-u),lerp(a[2],b[2],u)];
/** a pass along the ground, slowing a touch */
const rollP=(a:[number,number],b:[number,number],u:number):V3=>{const e=1-Math.pow(1-clamp(u),1.4);return[lerp(a[0],b[0],e),BALL_R,lerp(a[1],b[1],e)];};
/** after the line: into the back net, then it drops */
function inNet(line:V3,backP:V3,tauLine:number,tauNet:number,tau:number):V3{if(tau<tauNet){const u=(tau-tauLine)/(tauNet-tauLine);return mix3(line,backP,u);}const s=tau-tauNet,drop=Math.max(BALL_R,backP[1]-4.9*s*s),back=Math.sign(backP[0]-line[0]);return[backP[0]-back*.35*(1-Math.exp(-s*3)),drop,backP[2]];}
const bulgeOf=(tauNet:number)=>(tau:number)=>tau<tauNet-.04?0:Math.exp(-(tau-tauNet)*2.4)*(1+.3*Math.sin((tau-tauNet)*14))*sm(tauNet-.04,tauNet+.04,tau,x=>x);

// ================= the three goals, each ONE simulation on its own τ =================
type Actor={style:AthleteStyle;at:(tau:number)=>St;hero?:boolean;smear?:[number,number]};
type Play={cast:Actor[];ball:(tau:number)=>V3;goalX:number;goalD:number;net:V3;bulge:(tau:number)=>number;rossi:(tau:number)=>St};
/** someone running a keyed path, facing the ball when still */
const mover=(style:AthleteStyle,ballAt:(t:number)=>V3,p:MKey[]):Actor=>({style,at:t=>runner(p,t,ballAt(t))});

// ---- GOAL 1 (5'): Conti's crossfield pass, Cabrini's cross from the left, Rossi heads back across Peres at the far post. Italy attack −x. ----
const G1={
 CP:[-61.2,-16.4] as [number,number],// Conti's pass
 CR:[-80.2,23.0] as [number,number],// Cabrini takes it
 XP:[-86.6,21.4] as [number,number],// Cabrini's cross
 HT:[-99.3,-3.3] as [number,number],// the header, six yards out at the far post
 LINE:[-105,.55,1.7] as V3,BACK:[-106.8,.5,1.9] as V3,
 tP:-4.9,tR:-2.75,tX:-1.45,tLine:.33,tNet:.42,
};
const Y1H=YAW(-5.7,5.0);// Rossi faces goal, back across the keeper
const R1HEAD=headPlace(header(.52),RB,Y1H,G1.HT);
const H1:V3=[G1.HT[0],R1HEAD.y,G1.HT[1]];
const CON1=placeFor(strike(.52,{foot:'l',power:.8}),{height:1.69,bulk:.96},YAW(G1.CR[0]-G1.CP[0],G1.CR[1]-G1.CP[1])+.25,G1.CP,'l');
const CAB1=placeFor(strike(.52,{foot:'l',power:.8}),{height:1.78},YAW(G1.HT[0]-G1.XP[0],G1.HT[1]-G1.XP[1])+.35,G1.XP,'l');
const CON_PATH:MKey[]=[[-7.5,-52,-20.5],[-6.3,-55.5,-18.8],[-5.6,-57.8,-17.8],[G1.tP-.5,CON1.x!,CON1.z!]];
const CAB_PATH:MKey[]=[[-7.5,-66,27],[G1.tR,G1.CR[0]+.6,G1.CR[1]+.4],[G1.tX-.5*.9-.05,CAB1.x!,CAB1.z!]];
function ball1(tau:number):V3{
 if(tau<G1.tP-.5){const q=pathPos(CON_PATH,tau),v=Math.hypot(q.vx,q.vz),d=v>.3?[q.vx/v,q.vz/v]:[-1,.3];return[q.x+d[0]*.5,BALL_R,q.z+d[1]*.5];}
 if(tau<G1.tP)return mix3(ball1(G1.tP-.5-1e-3),[G1.CP[0],BALL_R,G1.CP[1]],sm(G1.tP-.5,G1.tP,tau));
 if(tau<G1.tR)return arcP([G1.CP[0],BALL_R,G1.CP[1]],[G1.CR[0],BALL_R,G1.CR[1]],(tau-G1.tP)/(G1.tR-G1.tP),5.5);
 if(tau<G1.tX){const u=(tau-G1.tR)/(G1.tX-G1.tR);return[lerp(G1.CR[0],G1.XP[0],easeIO(u)),BALL_R,lerp(G1.CR[1],G1.XP[1],easeIO(u))];}
 if(tau<0){const u=(tau-G1.tX)/-G1.tX;return arcP([G1.XP[0],BALL_R,G1.XP[1]],H1,u,2.6);}
 if(tau<G1.tLine)return mix3(H1,G1.LINE,tau/G1.tLine);
 return inNet(G1.LINE,G1.BACK,G1.tLine,G1.tNet,tau);}
const R1PATH:MKey[]=[[-7,-79,-2.5],[-3.2,-88.5,-3.2],[-1.4,-95.8,-3.8],[-.62,R1HEAD.place.x!,R1HEAD.place.z!]];
const ROSSI1_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(R1PATH,t,ball1(t))],
 [-.52,t=>({pose:header(clamp((t+.52)/1.0)),place:{...R1HEAD.place}})],
 [.5,t=>{const s=t-.5;return{pose:celebrate(s*1.2,{kind:'run'}),place:{x:R1HEAD.place.x!+s*2.8,z:R1HEAD.place.z!-s*3.4,yaw:YAW(2.8,-3.4)}};}],
];
const rossi1=(t:number)=>segAt(ROSSI1_SEGS,t);
const CON1_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>({pose:runCycle(pathPos(CON_PATH,t).dist/2.6,{speed:.55}),place:{...runner(CON_PATH,t,ball1(t)).place}})],
 [G1.tP-.5,t=>({pose:strike(clamp((t-G1.tP+.52*.95)/.95),{foot:'l',power:.8}),place:{...CON1}})],
 [G1.tP+.45,t=>runner([[G1.tP+.45,CON1.x!,CON1.z!],[1,-72,-12]],t,ball1(t))],
];
const CAB1_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(CAB_PATH,t,ball1(t))],
 [G1.tX-.52*.9,t=>({pose:strike(clamp((t-G1.tX+.52*.9)/.9),{foot:'l',power:.8}),place:{...CAB1}})],
 [G1.tX+.45,t=>({pose:blendPose(strike(1,{foot:'l',power:.8}),stand(),sm(G1.tX+.45,G1.tX+1,t)),place:{...CAB1,yaw:lerpAng(CAB1.yaw!,YAW(-1,-1),sm(-.4,.4,t))}})],
];
/** Peres covers the far post for the cross, then the late dive back to his right (+z) */
function peres1(tau:number):St{const b=ball1(tau),z0=tau<G1.tX?clamp(b[2]*.08,-1,1.6):lerp(1.2,-1.5,sm(G1.tX,-.1,tau));
 if(tau<.02)return{pose:keeperSet(tau*1.4),place:{x:-103.8,z:z0,yaw:YAW(b[0]+103.8,b[2]-z0)}};
 return{pose:keeperDive(clamp((tau-.02)/1.0),{side:'r',height:.35}),place:{x:-103.8,z:-1.5,yaw:0}};}
const PLAY1:Play={goalX:-105,goalD:-1,net:G1.BACK,bulge:bulgeOf(G1.tNet),ball:ball1,rossi:rossi1,cast:[
 {style:ROSSI,at:rossi1,hero:true,smear:[-.6,.2]},
 {style:CONTI,at:t=>segAt(CON1_SEGS,t),hero:true},
 {style:CABRINI,at:t=>segAt(CAB1_SEGS,t),hero:true},
 {style:PERES,at:peres1,hero:true},
 mover(JUNIOR,ball1,[[-7,-86,-10],[-2,-94,-8.5],[0,-96.6,-7.2],[1.5,-97.5,-6]]),
 mover(LUIZINHO,ball1,[[-7,-88,-1],[-2,-95.5,.8],[0,-97.2,.6],[1.5,-98,0]]),
 mover(OSCAR,ball1,[[-7,-89,5],[-2,-97,3.4],[0,-99.8,2.6]]),
 mover(LEANDRO,ball1,[[-7,-72,19],[-2.8,-80.5,20.6],[-1.4,-85.3,19.6],[1,-88,17.5]]),
 mover(EDER,ball1,[[-7.5,-49.5,-17.5],[-6,-55.5,-17.4],[-4,-60,-15.5],[0,-66,-12]]),
 mover(CEREZO,ball1,[[-7.5,-55,-12],[-3,-70,-8],[1,-82,-5]]),
 mover(FALCAO,ball1,[[-7.5,-60,5],[-3,-76,2],[1,-86,.5]]),
 mover(SOCRATES,ball1,[[-7.5,-58,10],[1,-74,6]]),
 mover(ZICO,ball1,[[-7.5,-50,3],[1,-62,4]]),
 mover(SERGINHO,ball1,[[-7.5,-46,7],[1,-56,6]]),
 mover(GRAZIANI,ball1,[[-7,-76,5],[-3,-87,5],[-.6,-96.5,4],[1.5,-97.5,3.5]]),
 mover(ANTOGNONI,ball1,[[-7,-68,3],[-2,-80,4.5],[1,-85,4]]),
 mover(TARDELLI,ball1,[[-7,-66,-9],[-2,-78,-9.5],[1,-84,-8]]),
 mover(ORIALI,ball1,[[-7,-58,-4],[1,-70,-5]]),
 mover(REF,ball1,[[-7,-62,6],[-2,-78,10],[1,-84,10]]),
]};

// ---- GOAL 2 (25'): Leandro lays it to Cerezo, Cerezo's lazy square pass, Rossi cuts it out past Júnior's dive, runs, thrashes it through Peres ----
const G2={
 LP:[-85.2,15.4] as [number,number],// Leandro's lay-off
 C2:[-80.4,8.9] as [number,number],// Cerezo
 POCKET:[-77.9,-8.2] as [number,number],// where the square pass was meant to go
 I2:[-78.7,-2.3] as [number,number],// Rossi cuts it out
 SH:[-87.0,-2.6] as [number,number],// the shot, at the edge of the area
 LINE:[-105,.45,-.3] as V3,BACK:[-106.8,.5,-.4] as V3,
 tL:-3.5,tC:-2.4,tI:-1.62,tLine:.56,tNet:.64,
};
const CER2=placeFor(strike(.52,{foot:'r',power:.45}),{height:1.86,bulk:.94},YAW(G2.POCKET[0]-G2.C2[0],G2.POCKET[1]-G2.C2[1])+.3,G2.C2);
const Y2SHOT=YAW(G2.LINE[0]-G2.SH[0],G2.LINE[2]-G2.SH[1]);
const R2SHOT=placeFor(strike(.52,{foot:'r',power:1}),RB,Y2SHOT,G2.SH);
const R2_T0=-STRIKE_CONTACT*.9;
const R2PATH:MKey[]=[[-5,-75.8,3.2],[-3,-76.6,1.4],[G2.tI,G2.I2[0]+.35,G2.I2[1]-.25],[R2_T0-.05,R2SHOT.x!,R2SHOT.z!]];
function ball2(tau:number):V3{
 if(tau<G2.tL)return[G2.LP[0]+.4,BALL_R,G2.LP[1]-.3];
 if(tau<G2.tC-.25)return rollP(G2.LP,G2.C2,(tau-G2.tL)/(G2.tC-.25-G2.tL));
 if(tau<G2.tC)return[G2.C2[0],BALL_R,G2.C2[1]];
 if(tau<G2.tI){const u=(tau-G2.tC)/(G2.tI-G2.tC),full=(G2.I2[1]-G2.C2[1])/(G2.POCKET[1]-G2.C2[1]);return[lerp(G2.C2[0],G2.POCKET[0],u*full),BALL_R,lerp(G2.C2[1],G2.POCKET[1],u*full)];}
 if(tau<0){const q=pathPos(R2PATH,Math.min(tau,R2_T0)),v=Math.hypot(q.vx,q.vz),d=v>.3?[q.vx/v,q.vz/v]:[-1,0],tap=.45+.25*Math.abs(Math.sin(q.dist*1.1)),c:V3=[q.x+d[0]*tap,BALL_R,q.z+d[1]*tap];
  return mix3(mix3([G2.I2[0],BALL_R,G2.I2[1]],c,sm(G2.tI,G2.tI+.2,tau)),[G2.SH[0],BALL_R,G2.SH[1]],sm(R2_T0-.3,-.03,tau));}
 if(tau<G2.tLine){const u=tau/G2.tLine;return[lerp(G2.SH[0],G2.LINE[0],u),BALL_R+(G2.LINE[1]-BALL_R)*u+.35*Math.sin(Math.PI*u),lerp(G2.SH[1],G2.LINE[2],u)];}
 return inNet(G2.LINE,G2.BACK,G2.tLine,G2.tNet,tau);}
const ROSSI2_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(R2PATH,t,ball2(t))],
 [R2_T0,t=>({pose:strike(clamp((t-R2_T0)/.9),{foot:'r',power:1}),place:{...R2SHOT}})],
 [R2_T0+.9,t=>{const s=t-R2_T0-.9;return{pose:celebrate(s*1.2,{kind:'run'}),place:{x:R2SHOT.x!+s*1.2,z:R2SHOT.z!-s*4,yaw:YAW(1.2,-4)}};}],
];
const rossi2=(t:number)=>segAt(ROSSI2_SEGS,t);
const CER2_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>({pose:stand(),place:{...CER2,yaw:YAW(G2.LP[0]-CER2.x!,G2.LP[1]-CER2.z!)}})],
 [G2.tC-.52*.8,t=>({pose:strike(clamp((t-G2.tC+.52*.8)/.8),{foot:'r',power:.45}),place:{...CER2}})],
 [G2.tC+.4,t=>({pose:blendPose(strike(1,{foot:'r',power:.45}),stand(),sm(G2.tC+.4,G2.tC+.9,t)),place:{...CER2}})],
];
/** Júnior dives in a moment too late */
const JUN2_T=-2.05,JUN2:Place={x:-80.6,z:-8.6,yaw:YAW(1.5,5.6)};
const JUN2_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-5,-82.5,-11],[JUN2_T-.05,JUN2.x!,JUN2.z!]],t,ball2(t))],
 [JUN2_T,t=>({pose:slideTackle(clamp((t-JUN2_T)/1.1),{foot:'r'}),place:{...JUN2}})],
];
function peres2(tau:number):St{const b=ball2(tau);
 if(tau<.1)return{pose:keeperSet(tau*1.4),place:{x:lerp(-103.2,-102.2,sm(-1,0,tau)),z:clamp(b[2]*.1,-1,1),yaw:YAW(b[0]+102.5,b[2])}};
 return{pose:keeperDive(clamp((tau-.1)/1.0),{side:'l',height:.08}),place:{x:-102.2,z:-.1,yaw:0}};}
const PLAY2:Play={goalX:-105,goalD:-1,net:G2.BACK,bulge:bulgeOf(G2.tNet),ball:ball2,rossi:rossi2,cast:[
 {style:ROSSI,at:rossi2,hero:true,smear:[-1.7,.25]},
 {style:CEREZO,at:t=>segAt(CER2_SEGS,t),hero:true},
 {style:JUNIOR,at:t=>segAt(JUN2_SEGS,t),hero:true},
 {style:PERES,at:peres2,hero:true},
 mover(LEANDRO,ball2,[[-5,-86,16.4],[-3.4,-85.8,16],[1,-84,13]]),
 mover(LUIZINHO,ball2,[[-5,-80,4.5],[-1,-76.5,4.2],[1,-78,3]]),// trotting upfield
 mover(FALCAO,ball2,[[-5,-73.5,-5.5],[-2,-74.8,-5],[1,-80,-4]]),
 mover(OSCAR,ball2,[[-5,-90,4],[1,-98,1.6]]),
 mover(SOCRATES,ball2,[[-5,-70,12],[1,-75,9]]),
 mover(ZICO,ball2,[[-5,-66,-1],[1,-71,-2]]),
 mover(EDER,ball2,[[-5,-64,-14],[1,-70,-12]]),
 mover(SERGINHO,ball2,[[-5,-62,6],[1,-66,5]]),
 mover(GRAZIANI,ball2,[[-5,-73.5,9],[-1,-83,6],[1,-90,5]]),
 mover(CONTI,ball2,[[-5,-69,-16],[1,-79,-14]]),
 mover(ANTOGNONI,ball2,[[-5,-67,2],[1,-75,0]]),
 mover(TARDELLI,ball2,[[-5,-66,-6],[1,-73,-6]]),
 mover(REF,ball2,[[-5,-70,14],[1,-78,12]]),
]};

// ---- GOAL 3 (74'): Conti's corner from Italy's right, headed out, Tardelli's mishit volley through the legs, Rossi turns it in from four yards ----
const G3={
 CF:[-.6,33.5] as [number,number],// the corner (far side, Italy's right: inferred)
 HP:[-13.4,3.1] as [number,number],// the header at the edge of the area
 TV:[-16.9,-4.3] as [number,number],// Tardelli's volley
 RS:[-3.9,1.35] as [number,number],// Rossi's touch, four yards out
 LINE:[0,.22,-1.15] as V3,BACK:[1.7,.3,-1.35] as V3,
 tK:-3.0,tH:-1.8,tV:-.95,tLine:.26,tNet:.36,
};
const SOC_Y=YAW(G3.CF[0]-G3.HP[0],G3.CF[1]-G3.HP[1]);
const SOC3=headPlace(header(.52),{height:1.92,bulk:.95},SOC_Y,G3.HP);
const HB:V3=[G3.HP[0],SOC3.y,G3.HP[1]];
const CON3=placeFor(strike(.52,{foot:'l',power:.9}),{height:1.69,bulk:.96},YAW(G3.HP[0]-G3.CF[0],G3.HP[1]-G3.CF[1])+.2,G3.CF,'l');
const TAR_Y=YAW(G3.RS[0]-G3.TV[0],G3.RS[1]-G3.TV[1])+62*D2R;// side-on: the volley swivels the hips round toward the target
const TV_Y=.5;
function volleyBall(pose:Pose,build:Build,place:Place):V3{const sk=solve(pose,build,place);return[(sk.rAn[0]+sk.rToe[0])/2,Math.max(BALL_R,(sk.rAn[1]+sk.rToe[1])/2),(sk.rAn[2]+sk.rToe[2])/2];}
const TAR3:Place=(()=>{const b=volleyBall(volley(.5,{foot:'r',height:.2}),{height:1.8,bulk:.98},{x:0,z:0,yaw:TAR_Y});return{x:G3.TV[0]-b[0],z:G3.TV[1]-b[2],yaw:TAR_Y};})();
const TVB:V3=(()=>{const b=volleyBall(volley(.5,{foot:'r',height:.2}),{height:1.8,bulk:.98},TAR3);return[G3.TV[0],Math.max(TV_Y*.6,b[1]),G3.TV[1]];})();
const Y3=YAW(G3.LINE[0]-G3.RS[0],G3.LINE[2]-G3.RS[1])+.35;
const R3TOUCH=placeFor(strike(.52,{foot:'r',power:.3}),RB,Y3,G3.RS);
/** Rossi's alert stance: knees soft, weight forward on the balls of the feet, a small bounce */
const ALERT=(t:number)=>{const b=.5+.5*Math.sin(TAU*t*1.8);return posed({lHipF:26,rHipF:20,lKnee:34-6*b,rKnee:30-6*b,lAnk:-4+8*b,rAnk:-4+8*b,lHipA:8,rHipA:8,lean:16,pitch:5,lShA:24,rShA:22,lElb:62,rElb:58,lShF:16,rShF:10,neckP:6,air:.02*b});};
const R3KEYS:[number,Pose][]=[[-.62,ALERT(0)],[-.42,strike(.22,{foot:'r',power:.3})],[-.2,strike(.4,{foot:'r',power:.3})],[0,strike(.52,{foot:'r',power:.3})],[.22,strike(.7,{foot:'r',power:.3})],[.55,strike(.9,{foot:'r',power:.3})]];
const R3READY:Place={x:-5.5,z:2.2};
function ball3(tau:number):V3{
 if(tau<G3.tK)return[G3.CF[0],BALL_R,G3.CF[1]];
 if(tau<G3.tH){const u=(tau-G3.tK)/(G3.tH-G3.tK);return arcP([G3.CF[0],BALL_R,G3.CF[1]],HB,1-Math.pow(1-u,1.15),3.4);}
 if(tau<G3.tV){const u=(tau-G3.tH)/(G3.tV-G3.tH);return arcP(HB,TVB,u,2.3);}
 if(tau<0){const u=(tau-G3.tV)/-G3.tV,e=u*(1.1-.1*u);return[lerp(G3.TV[0],G3.RS[0],e),BALL_R+(TVB[1]-BALL_R)*Math.max(0,1-u*3)+.3*Math.abs(Math.sin(Math.PI*u*1.6))*(1-u),lerp(G3.TV[1],G3.RS[1],e)];}
 if(tau<G3.tLine){const u=tau/G3.tLine;return[lerp(G3.RS[0],G3.LINE[0],u),BALL_R+(G3.LINE[1]-BALL_R)*u,lerp(G3.RS[1],G3.LINE[2],u)];}
 return inNet(G3.LINE,G3.BACK,G3.tLine,G3.tNet,tau);}
const ROSSI3_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-4,-8.2,4.4],[-2.6,-6.6,3.4],[-1.4,R3READY.x!,R3READY.z!]],t,ball3(t),ALERT(t))],
 [-1.25,t=>{const b=ball3(t),u=sm(-1.25,-.62,t);return{pose:ALERT(t),place:{x:lerp(R3READY.x!,R3TOUCH.x!-.55*Math.cos(Y3),u),z:lerp(R3READY.z!,R3TOUCH.z!+.55*Math.sin(Y3),u),yaw:lerpAng(YAW(b[0]-R3READY.x!,b[2]-R3READY.z!),Y3,sm(-.8,-.5,t))}};}],
 [-.62,t=>({pose:keyPoses(clamp(t,-.62,.55),R3KEYS),place:{x:lerp(R3TOUCH.x!-.55*Math.cos(Y3),R3TOUCH.x!,sm(-.62,-.3,t)),z:lerp(R3TOUCH.z!+.55*Math.sin(Y3),R3TOUCH.z!,sm(-.62,-.3,t)),yaw:Y3}})],
 [.6,t=>{const s=t-.6;return{pose:celebrate(s*1.2,{kind:'run'}),place:{x:R3TOUCH.x!-s*3.6,z:R3TOUCH.z!+s*1.8,yaw:YAW(-3.6,1.8)}};}],
];
const rossi3=(t:number)=>segAt(ROSSI3_SEGS,t);
const CON3_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>({pose:stand(),place:{...CON3,x:CON3.x!-1.2,z:CON3.z!+.9}})],
 [G3.tK-.52*1.0,t=>({pose:strike(clamp((t-G3.tK+.52)/1.0),{foot:'l',power:.9}),place:{...CON3}})],
 [G3.tK+.5,t=>runner([[G3.tK+.5,CON3.x!,CON3.z!],[1,-5,26]],t,ball3(t))],
];
const TAR3_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-4,-21,-6.5],[G3.tV-.5-.05,TAR3.x!-.6,TAR3.z!-.2]],t,ball3(t))],
 [G3.tV-.5,t=>({pose:volley(clamp((t-G3.tV+.5)),{foot:'r',height:.2}),place:{...TAR3}})],
 [G3.tV+.5,t=>({pose:blendPose(volley(1,{foot:'r',height:.2}),stand(),sm(G3.tV+.5,G3.tV+1,t)),place:{...TAR3}})],
];
const SOC3_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[-4,-11.5,1.5],[G3.tH-.52-.05,SOC3.place.x!,SOC3.place.z!]],t,ball3(t))],
 [G3.tH-.52,t=>({pose:header(clamp(t-G3.tH+.52)),place:{...SOC3.place}})],
 [G3.tH+.5,t=>({pose:blendPose(header(1),stand(),sm(G3.tH+.5,G3.tH+1,t)),place:{...SOC3.place,yaw:lerpAng(SOC_Y,YAW(1,-.4),sm(G3.tH+.4,G3.tH+1.1,t))}})],
];
/** others jumping at the corner with Sócrates (Oscar beside him, Bergomi behind) */
const jumper=(style:AthleteStyle,at:[number,number],yaw:number,dt:number,h=.85):Actor=>({style,at:t=>{const u=(t-G3.tH+.52+dt)/1.0;return u<0?runner([[-4,at[0]-1.2,at[1]+.6],[G3.tH-.52-dt-.05,at[0],at[1]]],t,ball3(t)):{pose:blendPose(header(clamp(u)),stand(),u>1?sm(1,1.5,u):1-h),place:{x:at[0],z:at[1],yaw:u>1.2?YAW(ball3(t)[0]-at[0],ball3(t)[2]-at[1]):yaw}};}});
const JUN3_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>({pose:stand(),place:{x:-.55,z:3.15,yaw:YAW(ball3(t)[0]+.55,ball3(t)[2]-3.15)}})],
 [-.7,t=>runner([[-.7,-.55,3.15],[.4,-2.0,3.5]],t,ball3(t))],
];
function peres3(tau:number):St{const b=ball3(tau),z0=tau<G3.tV?clamp(b[2]*.12,-1,2.2):lerp(1.4,1.9,sm(G3.tV,-.2,tau));
 if(tau<.04)return{pose:keeperSet(tau*1.4),place:{x:-1.0,z:z0,yaw:YAW(b[0]+1,b[2]-z0)}};
 return{pose:keeperDive(clamp((tau-.04)/1.0),{side:'r',height:.12}),place:{x:-1.0,z:1.9,yaw:Math.PI}};}
const GRA3:Actor={style:GRAZIANI,hero:true,at:t=>t<-.5?runner([[-4,-7.8,5.2],[-1.4,-5.2,3.9]],t,ball3(t),ALERT(t+.3)):{pose:lunge(clamp((t+.5)/.7),{side:'l'}),place:{x:-5.2,z:3.9,yaw:YAW(G3.RS[0]+5.2,G3.RS[1]-3.9)}}};
const PLAY3:Play={goalX:0,goalD:1,net:G3.BACK,bulge:bulgeOf(G3.tNet),ball:ball3,rossi:rossi3,cast:[
 {style:ROSSI,at:rossi3,hero:true,smear:[-.5,.3]},
 {style:TARDELLI,at:t=>segAt(TAR3_SEGS,t),hero:true,smear:[-1.2,-.7]},
 GRA3,
 {style:JUNIOR,at:t=>segAt(JUN3_SEGS,t),hero:true},
 {style:PERES,at:peres3,hero:true},
 {style:SOCRATES,at:t=>segAt(SOC3_SEGS,t)},
 {style:CONTI,at:t=>segAt(CON3_SEGS,t)},
 jumper(OSCAR,[G3.HP[0]+.7,G3.HP[1]+.9],SOC_Y,.04,.8),
 jumper(BERGOMI,[G3.HP[0]-.9,G3.HP[1]-.5],SOC_Y,-.06,.7),
 jumper(ZICO,[G3.HP[0]+.4,G3.HP[1]-1.3],SOC_Y,.1,.55),
 mover(LUIZINHO,ball3,[[-4,-7.5,-.2],[-1,-6.6,-.8],[1,-5,-.4]]),
 mover(LEANDRO,ball3,[[-4,-11,-4],[-1,-10.4,-3],[1,-9.6,-2.4]]),
 mover(CEREZO,ball3,[[-4,-11.5,-2.2],[-1,-11,-1.6],[1,-10.2,-1]]),
 mover(FALCAO,ball3,[[-4,-16,-.5],[-1,-14.5,-1.5],[1,-11,-1]]),
 mover(ISIDORO,ball3,[[-4,-20,-9],[1,-17,-7]]),
 mover(EDER,ball3,[[-4,-10,7.5],[1,-8,5.5]]),
 mover(ANTOGNONI,ball3,[[-4,-22,-1],[1,-18,-.5]]),
 mover(REF,ball3,[[-4,-19,9],[1,-15,8]]),
]};
const PLAYS=[PLAY1,PLAY2,PLAY3];

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. hero: the named players with secondary motion at card detail; others print 'low'. */
function drawWorld(s:Sheet,c:Camera,pl:Play,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prevDt?:number;cap?:boolean;smear?:boolean;only?:Set<AthleteStyle>}){
 const bl0=pl.ball(tau),items:Item[]=[],dt=o.prevDt??1/12;
 for(const a of pl.cast){if(o.only&&!o.only.has(a.style))continue;const st=a.at(tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)continue;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)continue;
  const big=!!(o.hero&&a.hero),prev=big||a.smear?a.at(tp-dt):undefined,smear=!!(o.smear!==false&&a.smear&&tp>a.smear[0]&&tp<a.smear[1]&&prev);
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,a.style,st.place,{prev,smear,detail:big&&!o.cap?'auto':'low',cap:big&&!o.cap?'mid':undefined})});}
 items.push({depth:depthOf(c,bl0),draw:()=>{const a=P(c,pl.ball(tau-.03)),q=P(c,bl0),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,bl0));ballShadow(s,c,bl0);
  ball(s,q[0],q[1],r,spinOf(pl,tau),{sq:clamp(sp/(r*4),0,.5),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball:bl0};}
/** ball spin: rolls with its distance travelled */
const spinOf=(pl:Play,tau:number)=>{const a=pl.ball(tau-.1),b=pl.ball(tau);return tau*1.3+Math.hypot(b[0]-a[0],b[2]-a[2])*20;};
const goals=(s:Sheet,c:Camera,pl:Play|null,tau:number)=>{goal(s,c,0,1,pl&&pl.goalX===0?pl.bulge(tau):0,pl?pl.net[2]:0,pl?pl.net[1]:.4);goal(s,c,-105,-1,pl&&pl.goalX===-105?pl.bulge(tau):0,pl?pl.net[2]:0,pl?pl.net[1]:.4);};

// ================= the hat-trick counter (a broadcast-style graphic at the top of the frame) =================
/** blue slab = Italy (a ball per Rossi goal), yellow slab = Brazil (a disc per equaliser); each prints in with a stamp */
function counter(s:Sheet,t:number,r:number[],b:number[],o:{glow?:number;alpha?:number}={}){
 const{glow=0,alpha=1}=o;if(alpha<=.02)return;const y=-448,tt=twos(t);
 const it=polyPath(blob(-120,y,190,52,61,{amp:.03,n:24}),true),br=polyPath(blob(150,y,120,48,62,{amp:.03,n:20}),true);
 s.knockout(it,.95*alpha);s.tone(B,it,.85*alpha);s.knockout(br,.95*alpha);s.tone(Y,br,.9*alpha);
 const slots=new Path2D();for(let i=0;i<3;i++)slots.addPath(polyPath(blob(-230+i*110,y,34,34,70+i,{amp:.02,n:16}),true));for(let i=0;i<2;i++)slots.addPath(polyPath(blob(110+i*80,y,24,24,80+i,{amp:.02,n:14}),true));
 s.stroke(K,slots,5,.8*alpha);
 r.forEach((t0,i)=>{const u=sm(t0,t0+.35,tt,easeOutBack);if(u<=.02)return;const x=-230+i*110,rr=30*u*(1+.12*glow*Math.sin(tt*14+i*2));ball(s,x,y,rr,i*1.3+tt*.4*glow);});
 b.forEach((t0,i)=>{const u=sm(t0,t0+.35,tt,easeOutBack);if(u<=.02)return;s.fill(B,polyPath(blob(110+i*80,y,22*u,22*u,90+i,{amp:.04,n:14}),true),.9*alpha);});
 if(glow>.02)sparkBurst(s,Y,-120,y,200*easeOut(clamp(glow)),{n:10,seed:91,g:1-clamp(glow*1.3-.3),width:10});
}

// ================= chapter 1 (LIVE, real time): the high main-stand camera; three goals, a tilt into the crowd and a whip pan between them =================
const BCAM:V3=[-52.5,18,50];
const ch1T=()=>({g1:T(0,'Rossi heads')+.45,eq1:T(0,'Brazil equalise'),st:T(0,'Rossi steals'),g2:T(0,'scores')+.12,eq2:T(0,'equalise again'),th:T(0,'Then'),g3:T(0,'Rossi pokes')+.42,ht:T(0,'Hat-trick'),it:T(0,'Italy'),bra:T(0,'must beat Brazil'),end:SEC(0)});
/** which goal is on screen and its τ (the switches happen while the camera is up in the crowd) */
function ch1Play(t:number){const q=ch1T(),s1=(q.eq1+q.st)/2-.15,s2=(q.eq2+q.th)/2;
 return t<s1?{i:0,tau:t-q.g1}:t<s2?{i:1,tau:t-q.g2}:{i:2,tau:t-q.g3};}
/** how far the camera is tilted up into the far terrace (0 = on the play), and where along it it looks */
function ch1Up(t:number){const q=ch1T();
 const u1=sm(q.g1+1.05,q.eq1+.25,t,easeInOutSine)*(1-sm((q.eq1+q.st)/2+.05,q.st-.05,t,easeInOutSine));
 const u2=sm(q.g2+.9,q.eq2+.05,t,easeInOutSine)*(1-sm((q.eq2+q.th)/2+.1,q.th-.15,t,easeInOutSine));
 const x=u2>0?lerp(-86,-14,sm(q.g2+1.1,(q.eq2+q.th)/2+.1,t,easeInOutSine)):-88;return{up:Math.max(u1,u2),x};}
function playLook(i:number,tau:number):V3{const pl=PLAYS[i],b=pl.ball(tau),r=pl.rossi(tau).place;
 const w=i===0?sm(-1.8,-.4,tau)*(1-sm(1.2,2.4,tau)*.5):i===1?sm(-2,-.4,tau)*.6:sm(-1.2,-.2,tau)*(1-sm(1.4,2.6,tau)*.4);
 const gx=pl.goalX,toG=i===2?.25*sm(-3.2,-1.5,tau):.3*sm(-2.2,0,tau);
 return[lerp(lerp(b[0],(r.x??0),w*.5),gx,toG),2.8,lerp(lerp(b[2],(r.z??0),w*.5),0,toG)];}
function ch1Cam(t:number){const q=ch1T(),{i,tau}=ch1Play(t),a=playLook(i,tau),b=playLook(i,tau-.3),c=playLook(i,tau-.6),ground:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const U=ch1Up(t),look=mix3(ground,[U.x,13,-54],U.up);
 const Fp=i===0?key(tau,[[-7,3000],[-4.9,3300],[-2.7,3600],[-1.4,4300],[0,4900],[1.4,4900],[3,4400]]):i===1?key(tau,[[-4,4000],[-2.4,4300],[-1.6,4500],[0,5000],[1.5,4800]]):key(tau,[[-3.6,3700],[-3,3600],[-1.8,4200],[-.9,4800],[0,5200],[1.4,5000],[3,4400]]);
 const push=1-.06*sm(q.it,q.it+1,t)+.06*sm(q.bra,q.bra+1,t);
 return cam(BCAM,look,lerp(Fp*push,2700,U.up));}
const ch1:Scene={
 draw(s,t){const q=ch1T(),tt=twos(t),c=ch1Cam(t),{i,tau}=ch1Play(t),{i:ip,tau:tp}=ch1Play(tt),pl=PLAYS[i];frame(s);
  const r1=q.g1+G1.tLine,r2=q.g2+.56,r3=q.g3+.26;
  const roar=(g:number)=>sm(g-.1,g+.3,t)*(1-sm(g+1.6,g+3,t));
  stadium(s,c,{t,lite:busy(0,t),cheer:.2+1.1*Math.max(roar(r1),roar(r2),roar(r3)*1.2)+.7*sm(q.eq1-.2,q.eq1+.3,t)*(1-sm(q.eq1+1,q.st,t))+.7*sm(q.eq2-.2,q.eq2+.3,t)*(1-sm(q.eq2+1,q.th+.4,t)),
   flash:.1+.8*Math.max(roar(r1),roar(r2),roar(r3)),ita:Math.max(sm(q.it,q.it+.5,t)*(1-sm(q.bra,q.bra+1,t))*.8,roar(r1),roar(r2),sm(r3-.1,r3+.4,t)),
   bra:Math.max(sm(q.bra,q.bra+.5,t)*(1-sm(q.bra+1.4,q.bra+2.4,t)),sm(q.eq1-.2,q.eq1+.3,t)*(1-sm(q.eq1+1.2,q.st,t)),sm(q.eq2-.2,q.eq2+.3,t)*(1-sm(q.eq2+1.2,q.th+.3,t)))});
  goals(s,c,pl,tau);
  drawWorld(s,c,PLAYS[ip],tau,tp,{ballMin:12,cap:busy(0,t)});
  counter(s,t,[r1,r2,r3],[q.eq1,q.eq2],{glow:sm(q.ht,q.ht+.4,t)*(1-sm(q.ht+1.2,q.ht+2.2,t)),alpha:1-sm(SEC(0)-1.1,SEC(0)-.7,t)});},
 aperture(t){const c=ch1Cam(t),{i,tau}=ch1Play(t),p=PLAYS[i].ball(tau),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(12,BALL_R*kAt(c,p))*.95,12);},
 still:0,
};
ch1.still=T(0,'Hat-trick')+.2;

// ================= chapter 2 (TV slow-motion replay of the winner, low and close by the near post) =================
const ch2T=()=>({w:T(1,'Watch the winner'),co:T(1,'The corner'),ho:T(1,'headed out'),ta:T(1,'Tardelli'),mi:T(1,'mishits'),cr:T(1,'a crowd of legs'),rn:T(1,'Rossi never'),ey:T(1,'his eyes'),bl:T(1,'the ball'),re:T(1,'He reacts first'),ti:T(1,'turns it in'),end:SEC(1)});
/** replay clock: the corner on "The corner", the header on "headed out", the volley on "mishits", slowest through the legs and the reaction */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,-3.45],[q.co+.3,G3.tK+.02],[q.ho+.25,G3.tH],[q.ta+.2,-1.3],[q.mi+.25,G3.tV],[q.cr+.3,-.72],[q.rn,-.58],[q.ey,-.46],[q.bl+.2,-.34],[q.re,-.24],[q.re+.5,-.1],[q.ti+.15,0],[q.ti+.9,G3.tNet+.05],[q.end,1.05]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),b=ball3(tau),r=rossi3(tau).place;
 const onR=sm(q.ta,q.rn,t,easeIO),onG=sm(q.ti-.2,q.ti+.9,t,easeIO);
 const focus:V3=mix3(mix3(mix3([-9.5,1.4,4],[b[0],Math.min(1.6,b[1]),b[2]],.35),[(r.x??0)-1.5,.8,(r.z??0)-1],onR*.8),[-.8,.7,-.6],onG*.6);
 const pos:V3=[key(t,mono([[0,-2.2],[q.ho,-3.2],[q.mi,-5.2],[q.rn,-6.4],[q.re,-6.6],[q.ti,-6.2],[q.end,-5.6]])),key(t,mono([[0,1.7],[q.ho,1.6],[q.rn,1.25],[q.ti,1.15],[q.end,1.3]])),key(t,mono([[0,-15],[q.ho,-14.2],[q.mi,-12.5],[q.rn,-10.8],[q.re,-10.2],[q.ti,-10.2],[q.end,-10.8]]))];
 const F=key(t,mono([[0,1150],[q.ho,1250],[q.mi,1500],[q.rn,2000],[q.ey,2150],[q.re,2200],[q.ti,2000],[q.end,1800]]));
 return cam(pos,focus,F);}
/** a dashed path through 3D points (one op) */
function dash3(s:Sheet,c:Camera,pts:V3[],w:number,ink:string,seed:number,o:{cov?:number;dash?:number;progress?:number}={}){
 const{cov=1,dash=.22,progress=1}=o;let q=pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));if(progress<1)q=partial(q,progress);if(q.length<2)return;
 let L=0;for(let i=1;i<q.length;i++)L+=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);const k=kAt(c,pts[0]),n=Math.max(1,Math.floor(L/(dash*k*2))),gaps:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;gaps.push([u,u+.45/n]);}
 s.fill(ink,ribbon(q,w,{seed,pressure:.3,taper:.15,wobble:1,gaps}),cov);}
function arrowTip(s:Sheet,ink:string,a:Pt,b:Pt,size:number,cov=1){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),q:Pt[]=[[size*.4,0],[-size*.7,-size*.6],[-size*.4,0],[-size*.7,size*.6]].map(([x,y])=>[b[0]+x*Math.cos(ang)-y*Math.sin(ang),b[1]+x*Math.sin(ang)+y*Math.cos(ang)] as Pt);s.fill(ink,polyPath(q,true),cov);}
/** a halo round the right leg (hip → knee → ankle → toe) printed BEFORE the figure, so only its rim shows round the leg */
function legHalo(s:Sheet,c:Camera,pose:Pose,place:Place,build:Build,ink:string,g:number,cov=.8){
 if(g<=.02)return;const sk=solve(pose,build,place),js=[sk.rHip,sk.rKn,sk.rAn,sk.rToe],k=kAt(c,sk.pelvis);
 s.fill(ink,ribbon(js.map(j=>P(c,j)),(.26+.08*g)*k*g,{taper:.05,pressure:0,wobble:1,seed:72}),cov);}
const groundRing=(x:number,z:number,rx:number,rz=rx,n=24)=>{const o:V3[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;o.push([x+Math.cos(a)*rx,.02,z+Math.sin(a)*rz]);}return o;};
const ringPath=(c:Camera,pts:V3[])=>pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));
function ringAt(s:Sheet,c:Camera,x:number,z:number,r:number,ink:string,w:number,seed:number,cov=.95){const pp=ringPath(c,groundRing(x,z,r,r*.8));if(pp.length>2)s.fill(ink,ribbon(pp,w,{seed,close:true,wobble:1.2}),cov);}
/** the ball's flight as 3D points between two τ */
const flight=(tau0:number,tau1:number,n=16):V3[]=>Array.from({length:n+1},(_,i)=>{const b=ball3(lerp(tau0,tau1,i/n));return[b[0],Math.max(.05,b[1]),b[2]] as V3;});
/** Rossi's eye line: a dashed ribbon from his face to the ball */
function eyeLine(s:Sheet,c:Camera,sk:ReturnType<typeof solve>,b:V3,g:number,ink:string,seed:number){if(g<=.02)return;const a=P(c,sk.face),e=P(c,b),n=9,gaps:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.5)/n;gaps.push([u,u+.4/n]);}
 const pts:Pt[]=[a,[lerp(a[0],e[0],.5),lerp(a[1],e[1],.5)-12],e];s.fill(ink,ribbon(partial(pts,g),10,{seed,taper:0,pressure:.2,wobble:.6,gaps}),.95);}
const HERO3=new Set<AthleteStyle>([ROSSI,TARDELLI,GRAZIANI,JUNIOR,PERES]);
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),prevDt=tp-tau2(tt-1/12);frame(s);
  stadium(s,c,{t,lite:busy(1,t),cheer:.2+.9*sm(q.ti,q.ti+.4,t),flash:.1+.8*sm(q.ti,q.ti+.4,t),ita:sm(q.ti,q.ti+.6,t)});
  goals(s,c,PLAY3,tau);
  // "The corner": the corner's flight prints as a dashed yellow arc from the flag to the header
  const co=sm(q.co-.1,q.co+.9,tt,easeOut)*(1-sm(q.ta,q.mi,tt));if(co>.02)dash3(s,c,flight(G3.tK,G3.tH),13,Y,31,{progress:co,cov:.95});
  // "headed out": a yellow ring under the jumpers and the clearance's arc down to Tardelli
  const ho=sm(q.ho-.05,q.ho+.4,tt,easeOutBack)*(1-sm(q.mi,q.cr,tt));if(ho>.02){ringAt(s,c,G3.HP[0],G3.HP[1],1.1*ho,Y,11,32);dash3(s,c,flight(G3.tH,G3.tV),11,Y,33,{progress:sm(q.ho,q.ho+.8,tt),cov:.9});}
  // "Tardelli" / "mishits": a blue ring under him, a burst at the scuffed contact
  const ta=sm(q.ta-.1,q.ta+.35,tt,easeOutBack)*(1-sm(q.cr+.3,q.rn,tt));if(ta>.02){const p=TAR3;ringAt(s,c,p.x!,p.z!,.75*ta,B,10,34,.9);}
  // "a crowd of legs": navy rings under every body in the ball's lane, the shot's dashed line threading between them
  const cr=sm(q.cr-.1,q.cr+.4,tt,easeOutBack)*(1-sm(q.ey,q.re,tt));
  if(cr>.02){for(const a of PLAY3.cast){if(a.style===ROSSI||a.style===TARDELLI||a.style===PERES)continue;const p=a.at(tp).place,x=p.x??0,z=p.z??0;
    const d=((x-G3.TV[0])*(G3.RS[1]-G3.TV[1])-(z-G3.TV[1])*(G3.RS[0]-G3.TV[0]))/Math.hypot(G3.RS[0]-G3.TV[0],G3.RS[1]-G3.TV[1]);if(Math.abs(d)<3.2&&x>G3.TV[0]&&x<G3.RS[0]+2)ringAt(s,c,x,z,.55*cr,K,9,35+Math.round(x),.85);}
   dash3(s,c,flight(G3.tV,0),10,Y,36,{progress:sm(q.cr-.1,q.cr+.8,tt),cov:.9});}
  // Rossi: "Rossi never" an orange ring under him; "his eyes" … "the ball": the eye line, held until he reacts
  const r3=rossi3(tp),skR=solve(r3.pose,RB,r3.place);
  const rn=sm(q.rn-.1,q.rn+.35,tt,easeOutBack)*(1-sm(q.ti,q.ti+.5,tt));if(rn>.02)ringAt(s,c,r3.place.x??0,r3.place.z??0,.7*rn,O,11,37);
  // "He reacts first": his step arrow (orange) and the late movers' arrows (navy, short)
  const re=sm(q.re-.05,q.re+.45,tt,easeOut)*(1-sm(q.ti+.4,q.ti+1,tt));
  if(re>.02){const a=[R3READY.x!,.02,R3READY.z!] as V3,b=[G3.RS[0],.02,G3.RS[1]] as V3,pp=ringPath(c,[a,mix3(a,b,.5*re+.2),mix3(a,b,.2+.8*re)]);if(pp.length>1){s.fill(O,ribbon(pp,14,{seed:38,taper:.1,wobble:1}),.95);arrowTip(s,O,pp[pp.length-2],pp[pp.length-1],44);}
   for(const[x,z,dx,dz] of[[-.55,3.15,-.9,.2],[-5.2,3.9,.5,-.8],[-6.6,-.8,.6,.6]] as[number,number,number,number][]){const pp2=ringPath(c,[[x,.02,z],[x+dx*re,.02,z+dz*re]]);if(pp2.length>1){s.fill(K,ribbon(pp2,10,{seed:39,taper:.1,wobble:1}),.85);arrowTip(s,K,pp2[0],pp2[1],30,.85);}}}
  // "turns it in": the halo round the right leg, then the ball's line into the net
  const r3n=rossi3(tau);legHalo(s,c,r3n.pose,r3n.place,RB,Y,sm(q.ti-.25,q.ti+.1,tt,easeOut)*(1-sm(q.ti+.6,q.ti+1.2,tt)));
  const sh=sm(q.ti-.05,q.ti+.6,tt,easeOut)*(1-sm(q.end-1.2,q.end-.5,tt));if(sh>.02){dash3(s,c,flight(0,G3.tLine,8),12,Y,40,{progress:sh,cov:.95});ringAt(s,c,G3.LINE[0]+.3,G3.LINE[2],.45*sh,Y,10,41);}
  drawWorld(s,c,PLAY3,tau,tp,{ballMin:18,hero:true,prevDt,cap:busy(1,t),smear:true});
  // the eye line prints over the figures so it reads
  const ey=sm(q.ey-.1,q.ey+.5,tt,easeOut)*(1-sm(q.ti-.1,q.ti+.3,tt));eyeLine(s,c,skR,ball3(tp),ey,O,42);
  // the touch: a yellow burst at contact
  if(tp>-.03&&tp<.14){const p=P(c,ball3(Math.max(0,tp)));sparkBurst(s,Y,p[0],p[1],80+70*sm(-.03,.08,tp),{n:8,seed:44,g:1-sm(.08,.14,tp),width:10});}
  // the mishit: a smaller navy scuff burst
  if(tp>G3.tV-.03&&tp<G3.tV+.14){const p=P(c,ball3(Math.max(G3.tV,tp)));sparkBurst(s,K,p[0],p[1],50+40*sm(G3.tV-.03,G3.tV+.08,tp),{n:6,seed:45,g:1-sm(G3.tV+.08,G3.tV+.14,tp),width:8});}
 },
 aperture(t){const c=ch2Cam(t),p=ball3(tau2(t)),[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:0,
};
ch2.still=T(1,'turns it in')+.1;

// ================= chapter 3 (duotone lesson): poachers stay alert in the box, watch the ball, and react first =================
const ch3T=()=>({h:T(2,"Rossi's hat-trick"),k:T(2,'knocked Brazil out'),p:T(2,'Poachers'),a:T(2,'stay alert'),b:T(2,'in the box'),w:T(2,'watch the ball'),r:T(2,'react first'),end:SEC(2)});
/** lesson clock on τ of goal 3: alert and bouncing through "stay alert", the loose ball on "watch the ball", the touch on "react first" */
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,-1.6],[q.a,-1.45],[q.b+.3,-1.2],[q.w,-1.0],[q.r-.1,-.66],[q.r+.25,-.25],[q.r+.55,0],[q.r+1.1,.3],[q.end,.75]]),x=>x);};
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),tau=tau3(tt),tp=tau,cap=busy(2,t);
  // camera: low from the edge of the six-yard box, behind and to the left of Rossi; it pushes in on "react first" and turns with the touch
  const rz=rossi3(tau3(t)).place,g=sm(q.r,q.r+.9,t,easeIO);
  const pos:V3=[key(t,mono([[0,-10],[q.a,-9.8],[q.w,-9.4],[q.r,-8.8],[q.end,-8.6]])),key(t,mono([[0,1.7],[q.w,1.4],[q.r,1.25],[q.end,1.5]])),key(t,mono([[0,-2.4],[q.w,-2.8],[q.r,-3.2],[q.end,-3.6]]))];
  const c=cam(pos,mix3([(rz.x??0)-1.2,.85,(rz.z??0)-.4],[-.4,.8,-.6],g*.45),key(t,mono([[0,1300],[q.a,1450],[q.w,1500],[q.r,1750],[q.end,1500]])));frame(s);
  // the print: blue sky in bands, a navy floor with a stepped light pool; the box lines print on "in the box"; the goal in paper
  s.field(B,.3,.6);
  const hz=P(c,[c.eye[0]+c.f[0]*1e4,0,c.eye[2]+c.f[2]*1e4])[1],Bn=Math.max(s.W,s.H)*1.6;
  for(let i=0;i<4;i++)s.tone(B,polyPath([[-Bn,hz-120-i*170],[Bn,hz-120-i*170],[Bn,hz-40],[-Bn,hz-40]],true),.18);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-40],[20,0,-40],[20,0,40],[-60,0,40]]));s.knockout(floor);s.fill(K,floor,.72);
  const pool=(r:number)=>{const pa=new Path2D();addPoly(pa,clipPoly(c,groundRing(-4.6,1.6,r,r*.9,40)));return pa;};
  s.knockout(pool(3.6),.55);s.tone(B,pool(3.6),.25);s.tone(B,pool(2),.3);
  const bx=sm(q.b-.1,q.b+.6,tt,easeOut);if(bx>.02){const L=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(L,c,a,b,.16);
   Ln([0,-20.16],[-16.5*bx,-20.16]);Ln([-16.5,-20.16],[-16.5,-20.16+40.32*bx]);Ln([0,20.16],[-16.5*bx,20.16]);Ln([0,-9.16],[-5.5*bx,-9.16]);Ln([-5.5,-9.16],[-5.5,-9.16+18.32*bx]);Ln([0,9.16],[-5.5*bx,9.16]);Ln([0,-9],[0,9]);s.knockout(L,.9);}
  goal(s,c,0,1,PLAY3.bulge(tau),G3.BACK[2],G3.BACK[1]);
  // "Rossi's hat-trick": three balls stamp across the sky; "knocked Brazil out": a yellow disc drops off the print
  const hs=1-sm(q.p,q.a,tt);if(hs>.02){for(let i=0;i<3;i++){const u=sm(q.h+i*.22,q.h+i*.22+.35,tt,easeOutBack);if(u>.02)ball(s,-200+i*200,hz-300,56*u*hs,i*1.7);}
   const k=sm(q.k,q.k+.9,tt),dy=k*k*700;if(sm(q.h,q.h+.4,tt)>.02)s.fill(Y,polyPath(blob(420,hz-300+dy,46,46,95,{amp:.04,n:18}),true),.95*(1-sm(q.k+.6,q.k+1,tt)));}
  // "Poachers": a paper ring under Rossi; "stay alert": little bounce ticks at his feet
  const r3=rossi3(tp),sk=solve(r3.pose,RB,r3.place);
  const po=sm(q.p-.05,q.p+.4,tt,easeOutBack)*(1-sm(q.r+.8,q.end,tt));if(po>.02){const pp=ringPath(c,groundRing(r3.place.x??0,r3.place.z??0,.85*po,.7*po,28));if(pp.length>2)s.knockout(ribbon(pp,12,{seed:51,close:true,wobble:1.2}),.95);}
  const al=sm(q.a-.05,q.a+.3,tt)*(1-sm(q.w+.5,q.r,tt));if(al>.02){for(const f of[sk.lToe,sk.rToe]){const p=P(c,[f[0],.02,f[2]]),bb=.5+.5*Math.sin(TAU*tt*1.8);for(const dx of[-1,1])s.fill(Y,ribbon([[p[0]+dx*16,p[1]-4],[p[0]+dx*(30+10*bb),p[1]-20-10*bb]],7,{seed:52}),.95*al);}}
  // "watch the ball": the dashed eye line, paper on navy
  const wb=sm(q.w-.05,q.w+.5,tt,easeOut)*(1-sm(q.r+.2,q.r+.7,tt));
  // "react first": his step (yellow arrow) and a navy cross-out where each defender's late step lands
  const rf=sm(q.r-.05,q.r+.4,tt,easeOut)*(1-sm(q.end-1.2,q.end-.4,tt));
  if(rf>.02){const a=[R3READY.x!,.02,R3READY.z!] as V3,b=[G3.RS[0],.02,G3.RS[1]] as V3,pp=ringPath(c,[a,mix3(a,b,.5),mix3(a,b,.2+.8*rf)]);if(pp.length>1){s.knockout(ribbon(pp,16,{seed:53,taper:.1,wobble:1}),.95);arrowTip(s,Y,pp[pp.length-2],pp[pp.length-1],48);}
   const late=sm(q.r+.4,q.r+.8,tt,easeOutBack);if(late>.02)for(const[x,z] of[[-1.4,3.35],[-4.9,3.4]] as[number,number][]){const p=P(c,[x,.02,z]),r=30*late;s.fill(K,ribbon([[p[0]-r,p[1]-r*.6],[p[0]+r,p[1]+r*.6]],11,{seed:54}),.95);s.fill(K,ribbon([[p[0]+r,p[1]-r*.6],[p[0]-r,p[1]+r*.6]],11,{seed:55}),.95);}}
  // figures, depth sorted: the ghost defenders, keeper and Graziani, Rossi (the kicking-leg halo first), the ball
  const items:Item[]=[],dt=1/12,ghostPut=(st:AthleteStyle,f:(t:number)=>St)=>{const a=f(tp),b=f(tp-dt);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,GHOST(st),a.place,{prev:b,cap:cap?'mid':undefined})});};
  for(const a of PLAY3.cast)if(a.style===JUNIOR||a.style===PERES||a.style===GRAZIANI)ghostPut(a.style,a.at);
  const rp=rossi3(tp-dt);
  items.push({depth:depthOf(c,[r3.place.x??0,0,r3.place.z??0]),draw:()=>{legHalo(s,c,r3.pose,r3.place,RB,Y,sm(q.r+.2,q.r+.5,tt,easeOut)*(1-sm(q.r+1,q.r+1.5,tt)),.9);
   drawPlayer(s,r3.pose,c,ROSSI_DUO,r3.place,{prev:rp,smear:tp>-.5&&tp<.3,cap:cap?'mid':undefined});}});
  const bl=ball3(tau);items.push({depth:depthOf(c,bl)-.05,draw:()=>{const p=P(c,bl),r=Math.max(20,BALL_R*kAt(c,bl));ballShadow(s,c,bl,.4);ball(s,p[0],p[1],r,spinOf(PLAY3,tau));}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  if(wb>.02){const a=P(c,sk.face),e=P(c,bl),n=9,gaps:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.5)/n;gaps.push([u,u+.4/n]);}s.knockout(ribbon(partial([a,[lerp(a[0],e[0],.5),lerp(a[1],e[1],.5)-14],e],wb),12,{seed:56,taper:0,pressure:.2,wobble:.6,gaps}),.95);}
  if(tp>.02&&tp<G3.tLine+.1){const a=P(c,ball3(tp-.1)),b=P(c,ball3(tp));speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:58,len:200,width:9,cov:.8});}
  if(tp>G3.tNet-.02&&tp<G3.tNet+.3){const p=P(c,G3.BACK);sparkBurst(s,Y,p[0],p[1],140*easeOut(sm(G3.tNet,G3.tNet+.2,tp)),{n:9,seed:59,g:1-sm(G3.tNet+.15,G3.tNet+.3,tp),width:12});}
 },
 still:0,
};
ch3.still=T(2,'react first')+.5;

const story:RisoStory={
 id:'rossi-brazil-1982',format:'11v11',title:'Rossi’s hat-trick v Brazil, 1982',
 theme:'Poachers stay alert in the box, watch the ball, and react first.',
 ageNote:'World Cup second round, Italy 3–2 Brazil, Estadio de Sarrià, Barcelona, 5 July 1982. Paolo Rossi scored all three of Italy’s goals.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a quick orange eye line from the tap to a ball that pops in. Reduced motion: the line and the ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),a0=hash(seed,2)*TAU,e:Pt=[x+Math.cos(a0)*160*u,y+Math.sin(a0)*90*u];
  const n=6,gaps:[number,number][]=[];for(let i=0;i<n;i++){const v=(i+.5)/n;gaps.push([v,v+.4/n]);}
  s.fill(O,ribbon([[x,y],e],10,{seed,taper:0,wobble:.6,gaps}),.95);
  ball(s,e[0],e[1],34*easeOutBack(clamp(u)),age*6+hash(seed,3)*TAU);
  if(age>0&&age<.5)sparkBurst(s,Y,e[0],e[1],90*easeOutBack(clamp(age/.2)),{n:8,seed,g:1-clamp(age/.5),width:10});
 },
};
export default story;
