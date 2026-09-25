/** Sergey Zuev — "the keeper who plays like a fixo": a signature-move riso film (iconic plays, FUTSAL; Zuev is a goleiro, RUSSIA).
 *
 * WHO: Sergey Nikolayevich Zuev (b. 20 Feb 1980, Severouralsk), Russian futsal goalkeeper, ex ice-hockey goalie, VIZ-Sinara Yekaterinburg
 * 2001–14 and Dina Moscow 2014–17, Russia 2002–12 (63 caps, 1 goal), UMBRO/Futsal Planet world's best goalkeeper 2008. This matches the
 * card (lib/town/playerBios.json: Dina Moscow, Russia, best keeper 2008; lib/town/playerAppearance.json country "Russia").
 *
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "plays like a fixo", lesson "Use your feet to pass calmly so
 * your team keeps the ball" — not one match. No written source we could reach describes ONE dated Zuev build-up pass, so the film
 * follows the brief: the real-match chapter shows the big documented Zuev moment — the 2007/08 UEFA Futsal Cup final, VIZ-Sinara
 * Yekaterinburg 4–4 ElPozo Murcia, Sinara won 3–2 on penalties, Krylatskoye Sports Palace, Moscow, 27 April 2008 — where both Wikipedias
 * say Zuev was the hero of the shoot-out, saving three penalties. (No other futsal film uses this final; the Russia national-team finals
 * are taken, see the task note.) The signature itself is a separate, clearly labelled demonstration ("Now, how he did it"), in
 * training bibs in an empty arena, never staged inside that final.
 *  1  LIVE (broadcast camera, main stand, real time): the arena, the 4–4 score, the shoot-out; ONE penalty kick and Zuev's diving save
 *     (a recreation standing for his three; which kick, its side and its taker are NOT claimed); the scoreboard stamps three saves;
 *     Sinara run to Zuev: champions of Europe.
 *  2  HOW HE DID IT (demonstration; training bibs, empty arena; camera HIGH BEHIND THE PLAY looking at his goal, real time): Zuev steps
 *     out of his goal; a team-mate is pressed and passes back; Zuev stops it under his sole, looks up and passes wide to the free
 *     team-mate, like an outfield player (a red passing triangle).
 *  3  REPLAY (slow motion, LOW SIDE-ON from the near touchline — a set-up no other goleiro film uses): one touch under the sole (red
 *     ring), eyes up (red eye-line) to the free player (red ring; the marked one struck out in navy), the presser's run (navy arrow),
 *     a calm pass along the floor (red dashed line), ball kept (tick).
 *  4  PRACTISE (lesson from the entry's `lesson`): a friend passes back, the keeper stops it with the sole and passes calmly to a second
 *     friend; a tick.
 * Sources (written; fetched once with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Sergey Zuev" (raw, Sep 2026; wiki-zuev-en.txt): bio above; height 1.83 m; "In the semifinal Yekaterinburg competed with
 *    Kazakhstan Kairat and reached the final of the tournament, where they met with the Spanish El Pozo … he had to be determined in a
 *    penalty shootout. Sergey Zuev became the hero of that series, repulsing three penalties"; he scored a league goal for UPI in 1998/99.
 *    — https://en.wikipedia.org/wiki/Sergey_Zuev
 *  - Wikipedia (ru), "Зуев, Сергей Николаевич" (raw; ruwiki-zuev.txt): the same final, "Сергей Зуев стал героем этой серии, отразив три
 *    пенальти"; regular time produced no winner. — https://ru.wikipedia.org/wiki/Зуев,_Сергей_Николаевич
 *  - Wikipedia, "2007–08 UEFA Futsal Cup" (raw; wiki-2007-08-uefa-futsal-cup.txt): final four in Moscow (Krylatskoye Sports Palace),
 *    25–27 April 2008; final 27 April 2008, VIZ-Sinara 4–4 ElPozo Murcia (3–2 p); Makayev 6', Shayakhmetov 27', Prudnikov 35',
 *    Chistopolov 36'; Kike 18', Ciço 24', Vinicius 30', Mauricio 36'; attendance 3,500. — https://en.wikipedia.org/wiki/2007%E2%80%9308_UEFA_Futsal_Cup
 *  - Futsal Planet, UMBRO Futsal Awards 2010 goalkeeper page (cached futsalplanet-umbro-2010-gk.txt): "2008 -> Sergey Zuev (Viz-Sinara Ek.
 *    & Russia)" best goalkeeper of the world.
 *  - FIFA Futsal World Cup Brazil 2008 Technical Report (cached fifa-ffwc2008-tr.txt): Zuev (12) Russia's keeper, "comfortable in
 *    possession when under pressure" (Russia key points); the trend of "using the goalkeeper as a fifth player to increase possession …
 *    move the goalkeeper forward and form a triangle with two players on the wings" — the basis of the demonstration's triangle.
 * CONFIRMED: the match (2007/08 UEFA Futsal Cup final), date, city, venue, 4–4, the 3–2 shoot-out won by Sinara, Zuev saved three
 *  penalties and was its hero, attendance 3,500 (a part-filled arena); Zuev's height, clubs, caps, 2008 award; that he scored as a keeper;
 *  the futsal court (40×20 m, 3×2 m goals, 5 v 5, penalties from the 6 m mark).
 * INFERRED (not named in the narration): kits — Sinara red shirts / navy shorts, ElPozo yellow shirts / navy shorts, Zuev in a blue
 *  long-sleeved keeper kit, no numbers (none verified); which end the shoot-out used; the kick shown (its taker, run-up, side and height
 *  — his right, low) and that Zuev dived for it; the scoreboard's layout (the order of kicks is not shown: only the counts, 3 v 2, and
 *  three saves); team-mates waiting at halfway and running to him after the last kick; his hair (short, dark). The demonstration and
 *  practice are teaching illustrations of the signature, not footage. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the kick, the dive and the passes). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 *  Every kick and pass uses the RIGHT foot (library default); the ball meets the boot because each contact point is SOLVED from the
 *  strike pose (strikeBallB), the sole trap from the TRAP pose (trapBall), and the save from keeperDive at full stretch (gloveAt).
 * Timing: the SCRIPT's cues are estimated until the lead voices it; `authored()` maps each chapter's recorded clock back onto the
 *  authored choreography through the cue anchors. The demonstration runs on its own clock τ (makeDemo), which chapter 2 plays in real time
 *  and chapter 3 re-plays slowly from a second camera (the same play rotated onto a side-on court: sideCfg).
 * Inks: yellow (ElPozo, lights, ball trail), red (Sinara, "do this" diagrams), blue (Zuev, crowd scarves), navy (key line, shorts, stands,
 *  presser / "not this" marks). Wood court = yellow + red screens.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphenated words such as "team-mate"). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2008 final',text:'Moscow, 2008, the European final. Sinara and El Pozo draw four all, so it goes to penalties. Zuev dives. Saved! He stops three penalties, and Sinara are champions of Europe!',tail:2.2,
  cues:['Moscow','Sinara and','four all','goes to penalties','Zuev dives','Saved','He stops three','champions'],heads:{'Moscow':'Final 2008','four all':'4–4','Saved':'Saved','He stops three':'3 saves','champions':'Champions'}},
 {label:'How he did it',text:'Now, how he did it. Pressed, a team-mate passes back. Zuev stops it with his sole, looks up and passes wide, like an outfield player.',tail:2,
  cues:['Now','Pressed','passes back','Zuev stops','looks up','passes wide','like an outfield'],heads:{'Now':'How he did it','like an outfield':'Like an outfield player'}},
 {label:'Replay: eyes up',text:'Again, slowly. One touch to stop it. Eyes up: the free player. A calm, low pass. Ball kept!',tail:2,
  cues:['Again','One touch','Eyes up','the free','A calm','Ball kept'],heads:{'Again':'Replay','One touch':'One touch','Eyes up':'Eyes up','A calm':'Calm pass','Ball kept':'Ball kept'}},
 {label:'Practise it',text:'Try it with a friend. Use your feet to pass calmly, so your team keeps the ball!',tail:2.6,
  cues:['Try it','Use your feet','pass calmly','team keeps'],heads:{'Use your feet':'Use your feet','team keeps':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/zuev-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/zuev-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/zuev-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('zuev: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('zuev: no cue '+w);return c.at;};
const maps:number[][][]=[];
/** chapter time (recording) → authored scene time: piecewise linear through [0,0], each cue, the passage start and the end */
function authored(i:number,t:number){
 let m=maps[i];
 if(!m){const ch=CHAPTERS[i],Au=AUTH[i],raw:number[][]=[[0,0]];ch.cues.forEach((c,k)=>{if(Au.cues[k])raw.push([c.at,Au.cues[k].at]);});raw.push([ch.seconds-.65,Au.seconds-.65],[ch.seconds,Au.seconds]);
  m=[raw[0]];for(const p of raw.slice(1)){const q=m[m.length-1];if(p[0]>q[0]+.02&&p[1]>q[1]+.02&&p[0]<=ch.seconds&&(p[0]>=ch.seconds-.65||p[0]<ch.seconds-.65-.02))m.push(p);}maps[i]=m;}
 if(t<=0)return 0;for(let k=1;k<m.length;k++)if(t<=m[k][0])return m[k-1][1]+(m[k][1]-m[k-1][1])*(t-m[k-1][0])/(m[k][0]-m[k-1][0]);return m[m.length-1][1];
}
const clock=(i:number,t:number)=>({tt:authored(i,twos(t)),tc:authored(i,t)});
/** key() needs increasing times */
function mono(Kk:Key[],gap=.04):Key[]{const o:Key[]=[];for(const k of Kk){const t=o.length?Math.max(k[0] as number,(o[o.length-1][0] as number)+gap):k[0] as number;o.push([t,...k.slice(1)] as Key);}return o;}

// ---------------- camera: centre a 1566×1080 composition box on the canvas (card window or full screen) ----------------
const BOX_W=1566,BOX_H=1080;
function cam(s:Sheet,x:number,y:number,zoom:number,rot=0){
 const base=Math.min(s.W/BOX_W,s.H/BOX_H),S=zoom*base*s.arrival,c=Math.cos(rot),sn=Math.sin(rot),dx=(s.W/2-s.cx)/S,dy=(s.H/2-s.cy)/S;
 s.camera(x-(c*dx+sn*dy),y-(-sn*dx+c*dy),zoom*base/Math.max(.01,s.fit),rot);
}
function camPath(s:Sheet,t:number,K0:Key[],shake:Pt=[0,0]){const v=key(t,padKeys(mono(K0),[0,0,1,0]),easeInOutSine,true);cam(s,(v[0]||0)+shake[0],(v[1]||0)+shake[1],Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0);}

// ---------------- stage: a perspective camera over the court floor (metres → world units); X right, Y up, Z away ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
type Ball3={X:number;Y:number;Z:number;flying:boolean;moving?:boolean;spin:number};
const bez=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor quad (X,Z corners) clipped to just in front of the camera */
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a hand-drawn ring round a screen point (knocked out first); g grows it in */
function ring2(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g=1,cov=1){if(g<=.02)return;const p=ribbon(blob(c[0],c[1],rx*g,ry*g,seed,{n:22,amp:.06}),w,{seed:seed+1,close:true,wobble:1.1});s.knockout(p);s.fill(ink,p,cov);}
/** "not this": a navy dashed ellipse with a slash through it (the marked player: not the one to pass to) */
function notThis(s:Sheet,c:Pt,rx:number,ry:number,w:number,seed:number,g:number){if(g<=.02)return;const q=blob(c[0],c[1],rx,ry,seed,{n:26,amp:.05});
 const ring=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.2)});s.knockout(ring);s.fill(K,ring,.9);
 const a:Pt=[c[0]-rx*.72,c[1]+ry*.72],b:Pt=[c[0]+rx*.72,c[1]-ry*.72],sl=partial([a,[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)],b],g),sp=ribbon(sl,w*1.3,{seed:seed+3,taper:.2,wobble:1});if(sl.length>1){s.knockout(sp);s.fill(K,sp);}}
/** a big red tick with a navy misregistered echo */
function tick(s:Sheet,c:Pt,size:number,g:number,seed:number){if(g<=.02)return;const S=size*g,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+2,taper:.2,wobble:1}),.5);s.fill(R,tp);s.fill(Y,tp,.25);}
const circ=(c:Pt,r:number,n=12):Pt[]=>{const q:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;q.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r]);}return q;};

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const ZB:Build={height:1.83,bulk:1};
/** Sergey Zuev, 1.83 m (Wikipedia); blue long-sleeved keeper kit, paper gloves, no number (kit inferred) */
const ZUEV:AthleteStyle={shirt:B,shorts:K,socks:B,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:ZB,seed:23};
/** VIZ-Sinara: red shirts, navy shorts, red socks (inferred) */
const SIN=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:n%3===1?'bald':'short',build:{height:1.74+hash(n,3)*.12},seed:40+n});
/** ElPozo Murcia: yellow shirts, navy shorts, yellow socks (inferred) */
const POZ=(n:number):AthleteStyle=>({shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:60+n});
const KB:Build={height:1.78};
/** demonstration team-mates: paper training kit; pressers: navy-screen bibs — no team is claimed */
const MATE=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:n%2?'curly':'short',build:{height:1.76+hash(n,5)*.06},seed:80+n});
const FOE=(n:number):AthleteStyle=>({shirt:[K,.45],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:K,hairStyle:n%2?'short':'bald',build:{height:1.78},seed:90+n});
/** the practice friends (chapter 4): children in paper training kit */
const KID:Build={height:1.5,bulk:.95};
const FRIEND:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:'curly',build:KID,seed:77};
const FRIEND2:AthleteStyle={shirt:'paper',shorts:[R,.6],socks:R,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,hairStyle:'ponytail',build:KID,seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a right-foot strike's contact (our floor coords, relative to the stance place) */
function strikeBallB(yaw:number,build:Build,power=1):V3{const sk=solve(strike(STRIKE_CONTACT,{power}),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** the sole trap: right foot lifted, toe up, the sole resting on top of the ball; weight on the left leg, eyes on the ball */
const TRAP:Pose=posed({lHipF:8,lKnee:28,lAnk:-4,rHipF:40,rKnee:54,rAnk:-28,rHipR:6,lean:14,pitch:2,neckP:34,lShA:34,rShA:24,lShF:-10,rShF:12,lElb:38,rElb:40});
/** asking for the ball: one arm up and pointing at the floor in front of him */
const ASK:Pose=posed({lHipF:14,rHipF:10,lKnee:22,rKnee:18,lean:6,neckP:0,rShF:110,rShA:24,rElb:20,lShA:22,lElb:34});
/** where the ball sits under the sole in TRAP (floor X,Z) for a player placed at p facing yaw */
function trapBall(p:Pt,yaw:number,build:Build):Pt{const sk=solve(TRAP,build,placeAt(p[0],p[1],yaw)),toe=toMine(sk.rToe),hl=toMine(sk.rHeel);return[lerp(hl[0],toe[0],.62),lerp(hl[2],toe[2],.62)];}
const PASS_POW=.35;
/** the penalty dive: to his right, low; a futsal goal is 3 m wide so the sideways travel is cut (a quick collapse-and-reach) */
const DIVE_H=.3,DIVE_FULL=.55;
const dive=(u:number)=>{const p=keeperDive(u,{side:'r',height:DIVE_H});return{...p,dz:p.dz*.4,air:p.air*.7};};
/** the save point: between his gloves at full stretch (solved, so the ball meets the palms) */
function gloveAt(X:number,Z:number,yaw:number):V3{const sk=solve(dive(DIVE_FULL),ZB,placeAt(X,Z,yaw)),a=toMine(sk.lHa),b=toMine(sk.rHa);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];}
/** a saving keeper: set and bouncing → the dive fires at t0 → full stretch at tS (the save) → lands → gets up, arms up at `up` */
function keeperGen(X:number,Z:number,yaw:number,t0:number,tS:number,o:{up?:number}={}):Gen{
 return t=>{let pose=keeperSet(Math.min(t,t0)*1.5);
  if(t>=t0){const d=t<tS?DIVE_FULL*easeOut(clamp((t-t0)/(tS-t0))):lerp(DIVE_FULL,1,sm(tS,tS+.75,t,easeOut));pose=blendPose(pose,dive(d),sm(t0,t0+.05,t));}
  if(o.up!==undefined&&t>o.up){const u=sm(o.up,o.up+.6,t,easeIO);pose=blendPose(pose,celebrate((t-o.up)*1.1,{kind:'arms'}),u);}
  const upShift=o.up!==undefined&&t>o.up?sm(o.up,o.up+.6,t):0,side=[Math.cos(yaw+Math.PI/2),Math.sin(yaw+Math.PI/2)];// his right-hand side on our floor
  return{pose,yaw,X:X+side[0]*.9*upShift,Z:Z+side[1]*.9*upShift};};
}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;smear?:number;trail?:(u:number)=>Ball3;t0?:number;t?:number}={}){
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??9,kAt(st,b.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 let dir=0;
 if((b.flying||b.moving)&&o.trail&&o.t!==undefined&&o.t0!==undefined){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=o.trail(Math.max(o.t0,o.t-.18+k*.0225));tr.push(proj(st,q.X,q.Y,q.Z));}
  const a=tr[0],z=tr[tr.length-1];dir=Math.atan2(z[1]-a[1],z[0]-a[0]);
  if(Math.hypot(z[0]-a[0],z[1]-a[1])>r*.6){const trp=ribbon(tr,r*1.3,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying||b.moving?(o.smear??.4):0,dir});return{p,r};
}

// ---------------- the arena: wood court, crowd, lights ----------------
/** stepped navy rows, lit faces; red and blue scarves; `fillFrac` leaves empty seats (3,500 in a big arena); cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false,fillFrac=.62){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(empty){s.fill(Y,rectPath(-span,top-15*rowH-kw*.6,span*2,kw*.5),.35);return;}
 const heads=new Path2D(),red=new Path2D(),blu=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977;if(hash(i,9)>fillFrac)continue;const hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.36)red.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)blu.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(R,red);s.fill(B,blu);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wood court: a yellow + red screen floor with plank seams along `along` ('x' planks run across the screen, 'z' into it) */
function woodFloor(s:Sheet,st:Stage,wall:number,along:'x'|'z',zNear:number,zFar:number){
 const span=9000,floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.42);s.fill(R,floor,.3);
 const seams=new Path2D();
 if(along==='z'){for(let i=-24;i<=24;i++){const X=i*.6,a=proj(st,X,0,Math.max(zNear,st.cz+.4)),b=proj(st,X,0,zFar);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 else{for(let Z=Math.max(zNear,st.cz+.6);Z<zFar;Z+=Z<6?.6:1.2){const a=proj(st,-40,0,Z),b=proj(st,40,0,Z);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 s.stroke(K,seams,3,.28);
}
function boards(s:Sheet,st:Stage,wall:number,kw:number,step:number){const span=9000,board=.95*kw;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();const base=Math.floor(st.cx/step)*step;for(let i=-14;i<14;i++){const x0=(base+i*step+.3-st.cx)*kw,x1=(base+i*step+step*.8-st.cx)*kw;ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));return wall-board;}

// ---- SIDE court (camera outside the near touchline Z = 0, looking across at the far touchline Z = 20); a goal at X = +20 ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;empty?:boolean;keeper?:()=>void;board?:(top:number,kw:number)=>void}={}){
 const{cheer=0,flash=0,empty=false}=o,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 woodFloor(s,st,wall,'x',0,BOARDS);
 const run=polyPath(floorQuad(st,-24,-3,24,0),true);s.fill(K,run,.3);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,3);stands(s,top,kw,t,cheer,flash,st.cx,empty);o.board?.(top,kw);
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X+lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- END-ON court (camera looks along +Z): a goal at Z = gz with posts X = ±1.5, its net going away from the camera ----
function endGoalNet(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz+lerp(.95,.55,Yh/H));
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.018),.6);
}
function endPosts(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the court seen end-on: wood floor, paper lines (goal line + D at gz, optional halfway line + circle), boards + empty stands at wallZ */
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;gz:number;half?:number;flash?:number}){
 const{t,wallZ,gz,half,flash=0}=o,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const out=new Path2D();out.addPath(polyPath(floorQuad(st,-40,-40,-10,wallZ),true));out.addPath(polyPath(floorQuad(st,10,-40,40,wallZ),true));s.fill(K,out,.3);
 const lines=new Path2D(),zEnd=Math.min(wallZ-1,40);
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 const arcPts:Pt[]=[];// the D opens toward the play (−Z)
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,gz],[10,gz]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts.filter(p=>p[1]>st.cz+.5),.05),true));
 lines.addPath(polyPath(floorRing(st,0,gz-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,gz-10,.12,12),true));
 if(half!==undefined&&half>st.cz+.5){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,half+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,half],[10,half]],.05),true));lines.addPath(polyPath(floorStrip(st,cc.filter(p=>p[1]>st.cz+.5),.05),true));}
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,0,flash,st.cx,true);
}

// ================= chapter 1 — LIVE: the 2008 UEFA Futsal Cup final, Moscow: 4–4, penalties, a Zuev save, three saves, champions =================
const C1={moscow:A(0,'Moscow'),sinara:A(0,'Sinara and'),four:A(0,'four all'),pens:A(0,'goes to'),dives:A(0,'Zuev dives'),saved:A(0,'Saved'),stops:A(0,'He stops'),champ:A(0,'champions'),end:AUTH[0].seconds};
const KX=19.75,KZ=10,SPOT:[number,number]=[GOAL_X-6,10];
const SAVE1=gloveAt(KX,KZ,FACE_LEFT);
const YAW1=yawTo(SAVE1[0]-SPOT[0],SAVE1[2]-SPOT[1]),SB1=strikeBallB(YAW1,KB),PL1:[number,number]=[SPOT[0]-SB1[0],SPOT[1]-SB1[2]];
/** the kick: run-up on "Zuev dives", contact just before the word lands, the palm .3 s later (6 m at ≈ 20 m/s) */
const HIT1=C1.dives-.05,SAVE_T=HIT1+.3;
const kick1T=(t:number)=>key(t,[[0,0],[C1.pens+.6,.02],[HIT1-.4,.22],[HIT1,STRIKE_CONTACT],[HIT1+.55,1]],linear);
const DIR1:[number,number]=[Math.cos(YAW1),Math.sin(YAW1)];
const DROP:Pose=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150});
/** the ElPozo taker: waits behind the ball → short run-up → right-foot kick → hands to his head */
const taker:Gen=t=>{let pose=strike(kick1T(t));if(t<C1.pens+.9)pose=blendPose(stand(),pose,sm(C1.pens+.3,C1.pens+.9,t));
 if(t>SAVE_T+.4)pose=blendPose(pose,DROP,sm(SAVE_T+.4,SAVE_T+.9,t));
 const off=key(t,[[0,2.2],[C1.pens+.6,2.0],[HIT1-.4,0,easeOut]]);
 return{pose,yaw:YAW1,X:PL1[0]-DIR1[0]*off,Z:PL1[1]-DIR1[1]*off};};
const liveK=keeperGen(KX,KZ,FACE_LEFT,HIT1-.03,SAVE_T,{up:C1.stops});
const OUT1:V3=[18.2,BALL_R,6.4];
function liveBall(T:number):Ball3{
 if(T<HIT1)return{X:SPOT[0],Y:BALL_R,Z:SPOT[1],flying:false,spin:0};
 if(T<SAVE_T){const u=sm(HIT1,SAVE_T,T,linear),q=bez([SPOT[0],BALL_R,SPOT[1]],[lerp(SPOT[0],SAVE1[0],.5),SAVE1[1]*.8+.15,lerp(SPOT[1],SAVE1[2],.5)],SAVE1,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*10};}
 const u=sm(SAVE_T,SAVE_T+.8,T,easeOut),q=bez(SAVE1,[lerp(SAVE1[0],OUT1[0],.5),SAVE1[1]+.9,lerp(SAVE1[2],OUT1[2],.5)],OUT1,u);return{X:q[0],Y:q[1],Z:q[2],flying:u<1,spin:10+u*8};
}
/** Sinara wait near halfway → sprint to Zuev once the shoot-out is won → jump with him; ElPozo wait → heads drop */
const SIN0:[number,number][]=[[1.4,8.2],[1.8,9.6],[2.2,11.0],[2.6,12.4]],SING:[number,number][]=[[-1.1,-1.1],[-1.3,1.1],[-.2,1.8],[-2.1,.1]];
const zEnd=liveK(C1.champ+1);
const liveSin=(i:number):Gen=>T=>{const[x0,z0]=SIN0[i],[gx,gz]=SING[i],t0=C1.stops+.25+i*.12,go=sm(t0,C1.champ+.35,T,easeIO),tx=zEnd.X+gx,tz=zEnd.Z+gz;
 const X=lerp(x0,tx,go),Z=lerp(z0,tz,go);
 let pose=blendPose(stand(),posed({lShA:12,rShA:12,lElb:10,rElb:10,lean:4,neckP:-4}),.6);
 pose=blendPose(pose,posed({lHipF:10,rHipF:10,lKnee:16,rKnee:16,lean:18,neckP:-10,lShF:40,rShF:40,lElb:90,rElb:90}),sm(HIT1-.2,HIT1+.1,T)*(1-sm(t0-.2,t0,T)));
 if(T>=t0&&T<C1.champ+.5)pose=blendPose(pose,celebrate((T-t0)*1.4,{kind:'run'}),sm(t0,t0+.25,T)*(1-sm(C1.champ+.2,C1.champ+.5,T)));
 if(T>=C1.champ+.2)pose=blendPose(pose,celebrate((T-C1.champ)*1.2+i*.21,{kind:'arms'}),sm(C1.champ+.2,C1.champ+.5,T));
 const yaw=T<t0?FACE_RIGHT:go<1?yawTo(tx-x0,tz-z0):yawTo(zEnd.X-tx,zEnd.Z-tz);
 return{pose,yaw,X,Z};};
const POZ0:[number,number][]=[[-.9,8.6],[-1.3,10.2],[-1.7,11.8]];
const livePoz=(i:number):Gen=>T=>{const[x0,z0]=POZ0[i];let pose=blendPose(stand(),posed({lShA:10,rShA:10,lElb:12,rElb:12,lean:5,neckP:0}),.6);
 pose=blendPose(pose,i===1?DROP:posed({lHipF:30,rHipF:30,lKnee:40,rKnee:40,lean:40,neckP:36,lShF:40,rShF:40,lElb:30,rElb:30}),sm(C1.stops+.3,C1.stops+1.1,T));
 return{pose,yaw:FACE_RIGHT+(i-1)*.25,X:x0,Z:z0};};
/** the scoreboard hung over the far stands (no text): 4 red v 4 yellow pips; at "He stops three" a shoot-out row prints: 3 red v 2 yellow,
 * and three blue "saved" marks stamp one by one (counts only — the order of the kicks is not shown) */
const SBX=15.2;
function scoreboard(s:Sheet,st:Stage,T:number,top:number,kw:number){
 const cx=(SBX-st.cx)*kw,w=8*kw,h=2.9*kw,y=top-6.4*.55*kw,pn=polyPath([[cx-w/2,y-h/2],[cx+w/2,y-h/2],[cx+w/2,y+h/2],[cx-w/2,y+h/2]],true);
 s.knockout(pn);s.fill(K,pn,.92);
 const pp=pulse(T,C1.four,1.2),pip=(x:number,yy:number,ink:string,r:number)=>{s.knockout(circlePath(x,yy,r*1.25));s.fill(ink,circlePath(x,yy,r));};
 const r0=h*.085*(1+.3*pp),y0=y-h*.24;
 for(let k=0;k<4;k++){pip(cx-w*.42+k*w*.085,y0,R,r0);pip(cx+w*.13+k*w*.085,y0,Y,r0);}
 const sep=new Path2D();sep.rect(cx-w*.015,y0-h*.1,w*.03,h*.2);s.fill(Y,sep,.5);
 const so=sm(C1.stops-.1,C1.stops+.2,T);
 if(so>0){const y1=y+h*.2,r1=h*.07;for(let k=0;k<3;k++)pip(cx-w*.42+k*w*.085,y1,R,r1*so);for(let k=0;k<2;k++)pip(cx+w*.13+k*w*.085,y1,Y,r1*so);
  for(let k=0;k<3;k++){const g=easeOutBack(sm(C1.stops+.2+k*.28,C1.stops+.5+k*.28,T));if(g<=.02)continue;const x=cx+w*.13+(k+2)*w*.085,rr=r1*1.3*g;
   s.knockout(circlePath(x,y1,rr*1.2));const rg=ribbon(blob(x,y1,rr,rr,500+k,{n:16,amp:.05}),Math.max(3,rr*.3),{seed:510+k,close:true,wobble:.4});s.fill(B,rg);
   const sl=ribbon([[x-rr*.7,y1+rr*.7],[x+rr*.7,y1-rr*.7]],Math.max(3,rr*.3),{seed:520+k,taper:.1,wobble:.3});s.fill(B,sl);}}
 if(T>=C1.champ&&T<C1.champ+1){sparkBurst(s,Y,cx,y-h*.6,w*.6,{n:12,seed:111,g:easeOut(sm(C1.champ,C1.champ+.3,T))*(1-sm(C1.champ+.6,C1.champ+1,T))});}
}
const liveCam=(T:number)=>({x:key(T,mono([[0,6.2],[C1.sinara,7.4],[C1.pens,15],[C1.dives,17.3],[C1.saved,17.6],[C1.stops,16.4],[C1.champ,16.9],[C1.end,17.1]]),easeInOutSine),
 zoom:key(T,mono([[0,.54],[C1.four,.56],[C1.pens,.68],[C1.dives,.86],[C1.saved,.92],[C1.stops,.66],[C1.champ,.74],[C1.end,.8]]),easeInOutSine),
 y:key(T,mono([[0,1000],[C1.four,960],[C1.pens,1080],[C1.saved,1110],[C1.stops+.1,860],[C1.champ+.2,1000],[C1.end,1060]]),easeInOutSine)});
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom,0);
 const b=liveBall(T),joy=sm(C1.champ,C1.champ+.4,T),hit=pulse(Tc,SAVE_T,.35);
 if(hit>0)cam(s,6*hit*Math.sin(Tc*90),c.y+4*hit*Math.cos(Tc*80),c.zoom);
 courtSide(s,st,T,{cheer:.12+.35*pulse(T,SAVE_T,1.3)+.6*joy,flash:pulse(T,SAVE_T,1)+.8*pulse(T,C1.champ,1.3),board:(top,kw)=>scoreboard(s,st,T,top,kw),
  keeper:()=>{const k=liveK(T),g=proj(st,k.X,0,k.Z),h=1.83*kAt(st,k.Z);
   // "goes to penalties": a red ring picks out the keeper on his line
   ring2(s,R,[g[0],g[1]-h*.5],h*.42,h*.62,8,121,easeOutBack(sm(C1.pens,C1.pens+.4,T))*(1-sm(C1.dives-.3,C1.dives,T)),1);
   athlete(s,st,liveK,T,ZUEV,{detail:'auto',smear:T>HIT1&&T<SAVE_T+.2?.12:0});
   if(T>=SAVE_T&&T<SAVE_T+.8){const p=proj(st,SAVE1[0],SAVE1[1],SAVE1[2]);sparkBurst(s,Y,p[0],p[1],120,{n:11,seed:131,g:easeOut(sm(SAVE_T,SAVE_T+.25,T))*(1-sm(SAVE_T+.45,SAVE_T+.8,T))});}
   // "Saved!": a red ring stamps round his gloves
   const sv=easeOutBack(sm(C1.saved,C1.saved+.35,T))*(1-sm(C1.stops-.2,C1.stops+.2,T));if(sv>.02){const p=proj(st,SAVE1[0],SAVE1[1],SAVE1[2]),k2=kAt(st,SAVE1[2]);ring2(s,R,p,.55*k2,.5*k2,9,138,sv,1);}}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SIN0.forEach((_,i)=>{const g=liveSin(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SIN(i),{detail:T>C1.champ-.4?'auto':'low'})});});
 POZ0.forEach((_,i)=>{const g=livePoz(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POZ(i),{detail:'low'})});});
 items.push({z:taker(T).Z,draw:()=>athlete(s,st,taker,T,POZ(7),{detail:'auto',smear:T>HIT1-.25&&T<HIT1+.15?.12:0})});
 items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b,16,{trail:liveBall,t0:HIT1,t:T});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a player's chest ring in a stage (the passage enters Zuev's blue shirt → the demonstration) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,build=ZB):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]);return circ(p,r*kAt(st,ch[2]));}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveK(tt),.16));},still:C1.saved+.1};

// ================= the demonstration: one play on its own clock τ, built from a layout (used end-on in ch2, side-on in ch3, small in ch4) =================
type Runner={keys:Key[];look:Pt};
type DemoCfg={K0:Pt;KS:Pt;P:Pt;R:Pt;out:[number,number];arr:number;pass:number;v1:number;v2:number;face:number;pb?:Build;rb?:Build;runners?:Runner[];standers?:{at:Pt;look:Pt}[]};
type Demo={cfg:DemoCfg;keeper:Gen;passer:Gen;receiver:Gen;runners:Gen[];standers:Gen[];ball:(t:number)=>Ball3;tBP:number;arr:number;pass:number;rec:number;BT:Pt;BP:Pt;BR:Pt};
const ease1=(x:number)=>x*(1.3-.3*x);// a rolling pass: quick off the boot, a touch slower on arrival
function runnerGen(r:Runner,seed:number):Gen{
 return t=>{const p=key(t,r.keys,easeInOutSine,true),q=key(t-.1,r.keys,easeInOutSine,true),dx=p[0]-q[0],dz=p[1]-q[1],v=Math.hypot(dx,dz)/.1,sp=clamp(v/7);
  const pose=blendPose(stand(),runCycle(t*runCadence(sp)+seed*.37,{speed:sp}),clamp(v/1.5));
  return{pose,yaw:v>.6?yawTo(dx,dz):yawTo(r.look[0]-p[0],r.look[1]-p[1]),X:p[0],Z:p[1]};};
}
function makeDemo(c:DemoCfg):Demo{
 const pb=c.pb??KB,rb=c.rb??KB;
 const yT=yawTo(c.P[0]-c.KS[0],c.P[1]-c.KS[1]),BT=trapBall(c.KS,yT,ZB);
 const yP=yawTo(c.R[0]-c.KS[0],c.R[1]-c.KS[1]),sbP=strikeBallB(yP,ZB,PASS_POW),BP:Pt=[c.KS[0]+sbP[0],c.KS[1]+sbP[2]];
 const yR=yawTo(BP[0]-c.R[0],BP[1]-c.R[1]),BR=trapBall(c.R,yR,rb);
 const yB=yawTo(BT[0]-c.P[0],BT[1]-c.P[1]),sbB=strikeBallB(yB,pb,PASS_POW),PLp:Pt=[c.P[0]-sbB[0],c.P[1]-sbB[2]],dB:Pt=[Math.cos(yB),Math.sin(yB)];
 const d1=Math.hypot(BT[0]-c.P[0],BT[1]-c.P[1]),tBP=c.arr-d1/c.v1,d2=Math.hypot(BR[0]-BP[0],BR[1]-BP[1]),rec=c.pass+d2/c.v2,{arr,pass}=c;
 const keeper:Gen=t=>{const[o0,o1]=c.out,u=sm(o0,o1,t,easeIO);
  let pose=keeperSet(t*1.3);
  if(t>o0)pose=blendPose(pose,stand(),sm(o0,o0+.3,t));
  if(t>o0&&t<o1+.2)pose=blendPose(pose,runCycle(t*runCadence(.4),{speed:.4}),Math.sin(Math.PI*u)*.9);
  const wT=sm(arr-.32,arr-.02,t)*(1-sm(arr+.9,pass-.45,t));if(wT>0)pose=blendPose(pose,TRAP,wT);
  if(t>arr+.35){pose={...pose,neckP:lerp(pose.neckP,-.08,sm(arr+.35,arr+.6,t)*(1-sm(pass-.3,pass,t)))};}
  const wS=sm(pass-.55,pass-.4,t)*(1-sm(pass+.6,pass+1,t));if(wS>0)pose=blendPose(pose,strike(key(t,[[pass-.55,.18],[pass,STRIKE_CONTACT],[pass+.6,.95]],linear),{power:PASS_POW}),wS);
  const X=lerp(c.K0[0],c.KS[0],u),Z=lerp(c.K0[1],c.KS[1],u);
  const yaw=t<o1?c.face:t<arr-.5?lerp(c.face,yT,sm(o1,arr-.5,t)):lerp(yT,yP,sm(arr+.55,pass-.5,t,easeIO));
  return{pose,yaw,X,Z};};
 const passer:Gen=t=>{const off=key(t,[[0,1.1],[tBP-.9,1],[tBP-.35,0,easeOut]]);
  let pose=blendPose(stand(),runCycle(t*runCadence(.15),{speed:.15}),.35);
  const w=sm(tBP-.9,tBP-.6,t)*(1-sm(tBP+.7,tBP+1.1,t));if(w>0)pose=blendPose(pose,strike(key(t,[[tBP-.9,.04],[tBP-.35,.22],[tBP,STRIKE_CONTACT],[tBP+.6,1]],linear),{power:PASS_POW}),w);
  return{pose,yaw:yB,X:PLp[0]-dB[0]*off,Z:PLp[1]-dB[1]*off};};
 const receiver:Gen=t=>{let pose=stand();
  pose=blendPose(pose,ASK,sm(arr+.4,arr+.8,t)*(1-sm(rec-.45,rec-.2,t)));
  pose=blendPose(pose,TRAP,sm(rec-.3,rec-.02,t)*(1-sm(rec+.7,rec+1.1,t)));
  return{pose,yaw:yR,X:c.R[0],Z:c.R[1]};};
 const ball=(t:number):Ball3=>{
  if(t<tBP)return{X:c.P[0],Y:BALL_R,Z:c.P[1],flying:false,spin:0};
  if(t<arr){const u=ease1(sm(tBP,arr,t,linear));return{X:lerp(c.P[0],BT[0],u),Y:BALL_R,Z:lerp(c.P[1],BT[1],u),flying:false,moving:true,spin:u*d1/BALL_R*.2};}
  const s0=d1/BALL_R*.2;
  if(t<pass-.12){const u=sm(arr+.9,pass-.45,t,easeIO);return{X:lerp(BT[0],BP[0],u),Y:BALL_R,Z:lerp(BT[1],BP[1],u),flying:false,spin:s0+u};}
  if(t<pass)return{X:BP[0],Y:BALL_R,Z:BP[1],flying:false,spin:s0+1};
  if(t<rec){const u=ease1(sm(pass,rec,t,linear));return{X:lerp(BP[0],BR[0],u),Y:BALL_R,Z:lerp(BP[1],BR[1],u),flying:false,moving:true,spin:s0+1+u*d2/BALL_R*.2};}
  return{X:BR[0],Y:BALL_R,Z:BR[1],flying:false,spin:s0+1+d2/BALL_R*.2};};
 const runners=(c.runners??[]).map((r,i)=>runnerGen(r,i+1));
 const standers=(c.standers??[]).map((q,i):Gen=>t=>({pose:blendPose(stand(),keeperSet(t*.8+i*.3),.25),yaw:yawTo(q.look[0]-q.at[0],q.look[1]-q.at[1]),X:q.at[0]+.08*Math.sin(t*2.1+i),Z:q.at[1]}));
 return{cfg:c,keeper,passer,receiver,runners,standers,ball,tBP,arr,pass,rec,BT,BP,BR};
}
/** the chapter-2 play (end-on court: goal line Z = GZ, posts X = ±1.5, play coming toward the camera at −Z). T3 (left) is marked by P2;
 * the presser P1 closes the passer, then curves at Zuev too late; T2 (right) is free. */
const GZ=14;
const D_ARR=4.3,D_PASS=5.65;
const CFG2:DemoCfg={K0:[0,GZ-.7],KS:[.4,GZ-3.4],P:[-3.2,4.8],R:[6.4,6.8],out:[.9,2.1],arr:D_ARR,pass:D_PASS,v1:7,v2:8,face:FACE_CAMERA,
 runners:[{keys:[[0,-5.4,5.9],[2.2,-5.2,5.8],[3.35,-4.3,3.9],[D_PASS+.2,-.5,8.4],[D_PASS+1.4,-.1,9]],look:[.4,GZ-3.4]}],
 standers:[{at:[-6.8,8.8],look:[-3.2,4.8]},{at:[-6.1,7.9],look:[-6.8,8.8]}]};
const D2=makeDemo(CFG2);
/** the same play turned onto the side-on court for the replay: goal centre (0,GZ) → (GOAL_X,10), out (−Z) → (−X) */
const toSide=(p:Pt):Pt=>[GOAL_X+(p[1]-GZ),10-p[0]];
function sideCfg(c:DemoCfg):DemoCfg{const rk=(ks:Key[])=>ks.map(k=>{const q=toSide([k[1] as number,k[2] as number]);return[k[0] as number,q[0],q[1]] as Key;});
 return{...c,K0:toSide(c.K0),KS:toSide(c.KS),P:toSide(c.P),R:toSide(c.R),face:c.face-Math.PI/2,runners:(c.runners??[]).map(r=>({keys:rk(r.keys),look:toSide(r.look)})),standers:(c.standers??[]).map(q=>({at:toSide(q.at),look:toSide(q.look)}))};}
const D3=makeDemo(sideCfg(CFG2));
type Marks={keeper?:(k:ReturnType<Gen>)=>void};
/** draw one demo frame: all figures + the ball, far to near; returns nothing (marks drawn by the scenes) */
function drawDemo(s:Sheet,st:Stage,d:Demo,tau:number,o:{goal?:()=>void;goalZ?:number;detail?:'auto'|'low'|'mid'|'high';keeperDetail?:'auto'|'mid'|'high';mates?:AthleteStyle[];kstyle?:AthleteStyle;extras?:boolean;marks?:Marks}={}){
 const its:{z:number;draw:()=>void}[]=[],det=o.detail??'auto',mates=o.mates??[MATE(1),MATE(2),MATE(3)],kst=o.kstyle??ZUEV;
 const k=d.keeper(tau),b=d.ball(tau),trapping=tau>d.arr-.35&&tau<d.pass-.3;
 if(o.goal)its.push({z:o.goalZ??99,draw:o.goal});
 its.push({z:k.Z,draw:()=>{athlete(s,st,d.keeper,tau,kst,{detail:o.keeperDetail??det,smear:tau>d.pass-.2&&tau<d.pass+.25?.12:0});o.marks?.keeper?.(k);}});
 its.push({z:d.passer(tau).Z,draw:()=>athlete(s,st,d.passer,tau,mates[0],{detail:det,smear:tau>d.tBP-.2&&tau<d.tBP+.2?.12:0})});
 its.push({z:d.receiver(tau).Z,draw:()=>athlete(s,st,d.receiver,tau,mates[1],{detail:det})});
 if(o.extras!==false){d.runners.forEach((g,i)=>its.push({z:g(tau).Z,draw:()=>athlete(s,st,g,tau,FOE(i),{detail:det})}));
  if(d.standers[0])its.push({z:d.standers[0](tau).Z,draw:()=>athlete(s,st,d.standers[0],tau,mates[2],{detail:'low'})});
  if(d.standers[1])its.push({z:d.standers[1](tau).Z,draw:()=>athlete(s,st,d.standers[1],tau,FOE(5),{detail:'low'})});}
 its.push({z:trapping?k.Z+.02:b.Z-.02,draw:()=>{ballOn(s,st,b,211,{min:9,trail:d.ball,t0:d.tBP,t:tau});}});
 its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
}
const headOf=(g:ReturnType<Gen>,build:Build=KB):V3=>toMine(solve(g.pose,build,placeAt(g.X,g.Z,g.yaw)).head);
const chestOf=(g:ReturnType<Gen>,build:Build=KB):V3=>toMine(solve(g.pose,build,placeAt(g.X,g.Z,g.yaw)).chest);

// ================= chapter 2 — HOW HE DID IT (demonstration, training bibs, empty arena): real time, HIGH BEHIND THE PLAY looking at his goal =================
const C2={now:A(1,'Now'),pressed:A(1,'Pressed'),back:A(1,'passes back'),stops:A(1,'Zuev stops'),looks:A(1,'looks up'),wide:A(1,'passes wide'),like:A(1,'like an'),end:AUTH[1].seconds};
/** chapter time → the play's clock τ (≈ real time; each action lands on its word) */
const tau2=(t:number)=>key(t,mono([[0,0],[C2.now,.25],[C2.pressed,2.2],[C2.back,D2.tBP],[C2.stops,D2.arr],[C2.looks,D2.arr+.55],[C2.wide,D2.pass],[C2.like,D2.rec+.2],[C2.end,D2.rec+1.6]]),linear);
const st2:Stage={F:1400,eye:3.6,cx:.8,cz:-5};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,tau=tau2(tt),tc=tau2(t);
  camPath(s,t,[[0,-40,230,2],[C2.now,-40,230,2.1],[C2.pressed,-330,380,1.5],[C2.back,-300,380,1.5],[C2.stops,-120,330,1.6],[C2.looks,150,330,1.45],[C2.wide,320,340,1.5],[C2.like,50,380,1.2],[C2.end,50,380,1.22]]);
  endArena(s,st,{t:tt,wallZ:GZ+2.6,gz:GZ,half:GZ-20});
  const kz=(Z:number)=>kAt(st,Z);
  drawDemo(s,st,D2,tau,{goalZ:GZ+.01,goal:()=>{endGoalNet(s,st,GZ);endPosts(s,st,GZ);},marks:{keeper:k=>{
   // "Now, how he did it": a red ring picks out Zuev
   const g=proj(st,k.X,0,k.Z),h=1.83*kz(k.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.42,h*.62,8,221,easeOutBack(sm(C2.now,C2.now+.4,tt))*(1-sm(C2.pressed-.3,C2.pressed+.1,tt)),1);}}});
  // "Pressed": a navy dashed arrow along the presser's run
  const pr=sm(C2.pressed,C2.pressed+.7,tt,easeOut)*(1-sm(C2.stops,C2.stops+.4,tt));
  if(pr>.02){const rk=(CFG2.runners as Runner[])[0].keys,pts:Pt[]=[1,2,3].map(i=>proj(st,rk[i][1] as number,.02,rk[i][2] as number));dashed(s,K,pts,9,231,{dash:30,progress:pr});if(pr>.9)arrowHead(s,K,pts,28,232);}
  // "Zuev stops it": a red ring on the sole and the ball
  const sv=easeOutBack(sm(C2.stops,C2.stops+.35,tt))*(1-sm(C2.looks+.2,C2.looks+.6,tt));if(sv>.02){const p=proj(st,D2.BT[0],.12,D2.BT[1]),k2=kz(D2.BT[1]);ring2(s,R,p,.42*k2,.3*k2,7,233,sv,1);}
  // "looks up": a red dashed eye-line from his head to the free team-mate
  const lk=sm(C2.looks,C2.looks+.5,tt,easeOut)*(1-sm(C2.wide,C2.wide+.4,tt));
  if(lk>.02){const h=headOf(D2.keeper(tau),ZB),hp=proj(st,h[0],h[1]+.05,h[2]),r=chestOf(D2.receiver(tau)),rp=proj(st,r[0],r[1],r[2]);dashed(s,R,[hp,[lerp(hp[0],rp[0],.5),lerp(hp[1],rp[1],.5)-40],rp],8,234,{dash:28,progress:lk});}
  // "like an outfield player": a red passing triangle, Zuev ↔ the two team-mates
  const tri=sm(C2.like,C2.like+.8,tt,easeOut);
  if(tri>.02){const a=proj(st,D2.cfg.KS[0],.02,D2.cfg.KS[1]),b=proj(st,D2.cfg.R[0],.02,D2.cfg.R[1]),c=proj(st,D2.cfg.P[0],.02,D2.cfg.P[1]);dashed(s,R,[a,b,c,a],9,236,{dash:30,progress:tri});
   ring2(s,R,a,.5*kz(D2.cfg.KS[1]),.22*kz(D2.cfg.KS[1]),7,237,tri,1);}
  if(tc>=D2.pass&&tc<D2.pass+.5){const p=proj(st,D2.BP[0],.1,D2.BP[1]);sparkBurst(s,Y,p[0],p[1],60,{n:8,seed:238,g:easeOut(sm(D2.pass,D2.pass+.2,tc))*(1-sm(D2.pass+.3,D2.pass+.5,tc))});}
 },
 aperture(t0){const{tt}=clock(1,t0),b=D2.ball(tau2(tt)),p=proj(st2,b.X,b.Y,b.Z),r=Math.max(10,kAt(st2,b.Z)*BALL_R)*1.3;return aperture(circ(p,r));},
 still:C2.looks+.2,
};

// ================= chapter 3 — REPLAY: slow motion, LOW SIDE-ON from the near touchline: one touch, eyes up, the free player, a calm pass =================
const C3={again:A(2,'Again'),touch:A(2,'One touch'),eyes:A(2,'Eyes up'),free:A(2,'the free'),calm:A(2,'A calm'),kept:A(2,'Ball kept'),end:AUTH[2].seconds};
const tau3=(t:number)=>key(t,mono([[0,D3.arr-1.1],[C3.again,D3.arr-.95],[C3.touch,D3.arr+.02],[C3.eyes,D3.arr+.5],[C3.free,D3.arr+.8],[C3.calm,D3.pass-.05],[C3.kept,D3.rec],[C3.end,D3.rec+.6]]),linear);
const st3:Stage={F:2000,eye:1.35,cx:14,cz:-3};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,tau=tau3(tt);
  camPath(s,t,[[0,380,190,1.7],[C3.again,390,170,1.8],[C3.touch,413,160,2.2],[C3.eyes,120,200,1.02],[C3.free,20,230,.96],[C3.calm,40,250,.98],[C3.kept,-60,300,1.08],[C3.end,-40,300,1.06]]);
  courtSide(s,st,tt,{empty:true});
  const kz=(Z:number)=>kAt(st,Z),k=D3.keeper(tau),r=D3.receiver(tau);
  // the presser's run (navy dashed arrow on the floor) — the danger the calm touch beats
  const pr=sm(C3.again,C3.again+.8,tt,easeOut)*(1-sm(C3.calm,C3.calm+.5,tt));
  if(pr>.02){const ks=(CFG2.runners as Runner[])[0].keys.slice(1,4).map(q=>toSide([q[1] as number,q[2] as number]));const pts:Pt[]=ks.map(q=>proj(st,q[0],.02,q[1]));dashed(s,K,pts,14,301,{dash:40,progress:pr});if(pr>.9)arrowHead(s,K,pts,40,302);}
  // "A calm, low pass": a red dashed line from the ball to the free player, growing with the ball
  const cp=sm(C3.calm-.2,C3.calm+.4,tt,easeOut);
  if(cp>.02){const a=proj(st,D3.BP[0],.02,D3.BP[1]),b=proj(st,D3.BR[0],.02,D3.BR[1]);const pts:Pt[]=[a,[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)+6],b];dashed(s,R,pts,15,303,{dash:44,progress:cp});if(cp>.9)arrowHead(s,R,pts,44,304);}
  drawDemo(s,st,D3,tau,{detail:'mid',keeperDetail:'high',marks:{keeper:kk=>{
   // "One touch to stop it": a red ring round the sole on the ball
   const tr=easeOutBack(sm(C3.touch,C3.touch+.4,tt))*(1-sm(C3.eyes+.3,C3.eyes+.7,tt));if(tr>.02){const p=proj(st,D3.BT[0],.14,D3.BT[1]),k2=kz(D3.BT[1]);ring2(s,R,p,.4*k2,.28*k2,9,305,tr,1);}
   if(tau>D3.arr-.05&&tau<D3.arr+.25){const p=proj(st,D3.BT[0],.12,D3.BT[1]);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:306,g:easeOut(sm(D3.arr-.05,D3.arr+.1,tau))*(1-sm(D3.arr+.15,D3.arr+.25,tau))});}
   void kk;}}});
  // "Eyes up": a red dashed eye-line from his head to the free player
  const lk=sm(C3.eyes,C3.eyes+.5,tt,easeOut)*(1-sm(C3.calm+.3,C3.calm+.7,tt));
  if(lk>.02){const h=headOf(k,ZB),hp=proj(st,h[0],h[1]+.05,h[2]),c=chestOf(r),rp=proj(st,c[0],c[1]+.1,c[2]);dashed(s,R,[hp,[lerp(hp[0],rp[0],.5),lerp(hp[1],rp[1],.5)-50],rp],11,307,{dash:36,progress:lk});}
  // "the free player": a red ring at his feet; the marked team-mate struck out in navy
  const fr=easeOutBack(sm(C3.free,C3.free+.4,tt))*(1-sm(C3.kept+.4,C3.kept+.8,tt));
  if(fr>.02){const g=proj(st,r.X,0,r.Z),k2=kz(r.Z);ring2(s,R,g,.75*k2,.28*k2,10,308,fr,1);
   const m=D3.standers[0](tau),mc=chestOf(m),mp=proj(st,mc[0],mc[1],mc[2]),k3=kz(m.Z);notThis(s,mp,.5*k3,.62*k3,8,309,fr);}
  // "Ball kept!": a tick beside the free player
  const tk=easeOutBack(sm(C3.kept,C3.kept+.35,tt));if(tk>.02){const g=proj(st,r.X,0,r.Z),h=1.78*kz(r.Z);tick(s,[g[0]+h*.55,g[1]-h*.95],h*.32,tk,310);}
  if(tau>=D3.pass&&tau<D3.pass+.6)speedLines(s,Y,proj(st,D3.BP[0],.3,D3.BP[1])[0]+60,proj(st,D3.BP[0],.3,D3.BP[1])[1],0,{n:4,seed:311,len:120*sm(D3.pass,D3.pass+.2,tau),spread:90,width:7});
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,D3.receiver(tau3(tt)),.18,KB));},
 still:C3.free+.3,
};

// ================= chapter 4 — PRACTISE: a friend passes back, the keeper stops it with the sole and passes calmly to a second friend; a tick =================
const C4={try:A(3,'Try'),feet:A(3,'Use your'),calm:A(3,'pass calmly'),keeps:A(3,'team keeps'),end:AUTH[3].seconds};
const GZ4=12;
const D4=makeDemo({K0:[0,GZ4-.7],KS:[.3,GZ4-2.4],P:[-2.2,6.8],R:[2.6,7.4],out:[.3,1.2],arr:C4.feet+.35,pass:C4.calm+.3,v1:6.5,v2:6.5,face:FACE_CAMERA,pb:KID,rb:KID});
const st4:Stage={F:1700,eye:1.7,cx:.5,cz:-1};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,kz=(Z:number)=>kAt(st,Z);
  camPath(s,t,[[0,-330,240,1.2],[C4.try,-330,240,1.2],[C4.feet,-120,220,1.3],[C4.calm,80,240,1.2],[C4.keeps,160,250,1.25],[C4.end,120,250,1.2]]);
  endArena(s,st,{t:tt,wallZ:GZ4+2.6,gz:GZ4,flash:pulse(tt,D4.rec,1.2)});
  drawDemo(s,st,D4,tt,{goalZ:GZ4+.01,goal:()=>{endGoalNet(s,st,GZ4);endPosts(s,st,GZ4);},detail:'high',mates:[FRIEND,FRIEND2,FRIEND],extras:false,marks:{keeper:()=>{
   // "Use your feet": a red ring round the sole on the ball
   const u=easeOutBack(sm(C4.feet,C4.feet+.4,tt))*(1-sm(C4.calm+.2,C4.calm+.6,tt));if(u>.02){const p=proj(st,D4.BT[0],.12,D4.BT[1]),k2=kz(D4.BT[1]);ring2(s,R,p,.42*k2,.3*k2,9,401,u,1);}}}});
  // "pass calmly": a red dashed line along the floor to the friend
  const cp=sm(C4.calm,C4.calm+.5,tt,easeOut);
  if(cp>.02){const a=proj(st,D4.BP[0],.02,D4.BP[1]),b=proj(st,D4.BR[0],.02,D4.BR[1]),pts:Pt[]=[a,[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)+8],b];dashed(s,R,pts,12,402,{dash:38,progress:cp});if(cp>.9)arrowHead(s,R,pts,36,403);}
  // "so your team keeps the ball": a big red tick beside the friend
  const r=D4.receiver(tt),g=proj(st,r.X,0,r.Z),h=1.5*kz(r.Z);tick(s,[g[0]+h*.7,g[1]-h*.95],h*.4,easeOutBack(sm(C4.keeps+.1,C4.keeps+.45,tt)),409);
 },
 still:C4.calm+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'zuev-futsal-signature',format:'futsal',title:'Zuev, the keeper who plays like a fixo',theme:'Use your feet to pass calmly so your team keeps the ball.',
 ageNote:'For players aged 7–12: the 2008 European club final, its 4–4 score and Zuev’s three shoot-out saves are real; the passing play shows how he did it, not a filmed moment. Practise with a friend and a soft ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in and stops dead under a navy sole, a red ring snaps; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=easeOut(clamp(age/.3)),bx=x-170*(1-u);
  if(age>.3){const v=clamp((age-.3)/.5);ring2(s,R,[x,y],r*(1.2+1.6*v),r*(1+1.3*v),8*(1-v)+2,seed,1,1);}
  ball(s,bx,y,r,seed,{rot:u*5});
  const sole=sm(.18,.3,age,easeOutBack)*(1-sm(.6,.85,age));if(sole>.02){const g=blob(x+r*.1,y-r*(1.05+.4*(1-sole)),r*1.1,r*.32,seed+3,{n:18});s.knockout(polyPath(g,true));s.fill(K,polyPath(g,true),.85);}
 },
};
export default film;
