/**
 * The six Petr Čech pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/cech/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is safety and courage: a shirt flip, a clean-sheet scoreboard, a lifted cloud, a headguard, saves and three flaps.
 * The head injury is never drawn: a medic walks him off and a rain cloud covers a quiet home. Kits are colour only.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,backdrop,plates,ballPair} from '../spreadKit';

const K='cech-';
const P=plates(K),{sp}=P;
const PC={skin:'#f1b88f',hair:'short' as const,hairColor:'#3b2a22'};
const BLUE=[INK.blue,INK.white,'#2f5fa8',INK.blue];
const RED=[INK.red,INK.white,'#b8423a',INK.red];

/* ───────────── Čech-only plates ───────────── */
const shirt=(key:string,w:number,h:number,c:string,trim:string,label:string)=>sp(key,w,h,k=>{const p=`M${w*.3} 0 L${w*.7} 0 L${w} ${h*.22} L${w*.86} ${h*.4} L${w*.78} ${h*.34} L${w*.78} ${h} L${w*.22} ${h} L${w*.22} ${h*.34} L${w*.14} ${h*.4} L0 ${h*.22} Z`;
 k.fill(p,c);k.dots(p,INK.navy,.035,.25);k.key(p,.016);k.key(`M${w*.4} 0 Q${w/2} ${h*.12} ${w*.6} 0`,.02,trim);k.text(label,w/2,h*.66,h*.13,trim,{weight:900,max:w*.52});},{rim:.016});
const guard=(key:string,s:number)=>sp(key,s,s*.7,k=>{const p=`M0 ${s*.68} L0 ${s*.32} Q0 0 ${s/2} 0 Q${s} 0 ${s} ${s*.32} L${s} ${s*.68} L${s*.84} ${s*.68} L${s*.84} ${s*.42} L${s*.16} ${s*.42} L${s*.16} ${s*.68} Z`;k.fill(p,'#2b2b33');k.key(p,.014,INK.white);
 for(const x of [.3,.5,.7])k.key(`M${s*x} ${s*.05} L${s*x} ${s*.32}`,.016,'#8d8a86');const band=rect(s*.04,s*.3,s*.92,s*.1);k.fill(band,'#8d8a86');k.key(band,.01,INK.white);
 for(const x of [0,s*.84]){const e=rect(x,s*.42,s*.16,s*.26);k.fill(e,'#5d5d6b');k.key(e,.01,INK.white);}},{rim:.014});
const pic=(key:string,w:number,h:number,kind:'hockey'|'drums'|'gloves')=>P.frame(key,w,h,k=>{k.fill(rect(w*.08,h*.08,w*.84,h*.84),kind==='hockey'?'#dceef6':kind==='drums'?'#f6e2b8':'#d9efd0');
 if(kind==='hockey'){k.key(`M${w*.3} ${h*.2} L${w*.55} ${h*.72} L${w*.75} ${h*.72}`,.05,INK.wood);k.fill(ell(w*.5,h*.8,w*.1,h*.04),'#1a1a1a');k.text('ICE HOCKEY',w/2,h*.2,h*.1,INK.navy,{weight:900,max:w*.8});}
 else if(kind==='drums'){const d=ell(w*.5,h*.62,w*.2,h*.16);k.fill(d,INK.red);k.key(d,.012);k.fill(ell(w*.25,h*.48,w*.1,h*.05),INK.gold);k.fill(ell(w*.76,h*.46,w*.1,h*.05),INK.gold);k.key(`M${w*.3} ${h*.3} L${w*.44} ${h*.5} M${w*.7} ${h*.3} L${w*.56} ${h*.5}`,.025,INK.wood);k.text('DRUMS',w/2,h*.2,h*.1,INK.navy,{weight:900,max:w*.8});}
 else{for(const x of [.32,.62]){const g=`M${w*(x-.1)} ${h*.8} L${w*(x-.1)} ${h*.42} Q${w*(x-.12)} ${h*.3} ${w*(x-.04)} ${h*.32} L${w*(x+.1)} ${h*.32} Q${w*(x+.14)} ${h*.4} ${w*(x+.1)} ${h*.8} Z`;k.fill(g,INK.green);k.key(g,.012);}k.text('GOALKEEPER',w/2,h*.2,h*.1,INK.navy,{weight:900,max:w*.8});}});
const homeWin=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,'#f2d3a0');k.dots(b,INK.brown,.035,.18);k.key(b,.014);k.fill(poly([[-.06,h*.22],[w/2,0],[w+.06,h*.22]]),INK.blue);k.key(poly([[-.06,h*.22],[w/2,0],[w+.06,h*.22]]),.012);
 const g=rect(w*.18,h*.34,w*.64,h*.44);k.fill(g,'#fff1c2');k.key(g,.012);k.key(`M${w/2} ${h*.34} L${w/2} ${h*.78} M${w*.18} ${h*.56} L${w*.82} ${h*.56}`,.02,INK.white);k.text('REST',w/2,h*.92,h*.08,INK.navy,{weight:900});},{rim:.014});

/* ───────────── 1 · From striker to goalkeeper (leg) ───────────── */
const leg:SpreadDef={id:'leg',rest:20.9,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'PLZEŇ · BORN 1982','A STRIKER AT SEVEN · A BROKEN LEG AT TEN',INK.blue,INK.navy,.4);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'A NEW POSITION','HE SWITCHED TO PLAYING IN GOAL',INK.green);},
 build:B=>{
  const bd=backdrop(B,K+'l-bd',k=>{daySky(k,4.5,3);roofs(k,0,4.5,2.0,1);k.fill(rect(0,2.0,4.5,1),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'l-sun',.3),'L',3.6,2.0,{out:.012});
  B.stand(S.goal(K+'l-goal',1.6,.85),-2.4,-1.7,{layer:1});
  const P1=B.person(K+'l-p',-2.6,.5,1.0,{shirt:'casual',...PC,legs:'kick',face:'grin',layer:3});
  const seven=B.stand(S.flipCard(K+'l-7',1.4,.32,'STRIKER · AGED 7',INK.yellow,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  B.stand(S.bench(K+'l-bench',1.3,.5),-4.0,-.4,{layer:2});
  const sit=B.person(K+'l-sit',-4.0,-.5,1.0,{shirt:'casual',...PC,face:'sad',layer:2});
  const rest=B.stand(S.flipCard(K+'l-rest',1.5,.32,'WEEKS OF REST',INK.sky,INK.navy),-1.5,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'l-post',1.3,1.4,INK.white),1.4,-1.0,{layer:1});
  post.add(shirt(K+'l-gk',1.1,1.0,'#52a86a','#e9e24a','GOAL'),0,.2,{z:.012});
  const front=post.flap(shirt(K+'l-st',1.1,1.0,INK.orange,INK.navy,'STRIKER'),0,1.2,{z:.03});
  B.stand(S.goal(K+'l-goalR',1.7,.9),3.4,-1.6,{layer:1});
  const keep=B.person(K+'l-keep',3.4,-1.2,1.05,{shirt:'keeper',...PC,face:'grin',layer:2,holdL:'glove',holdR:'glove'});
  const love=B.stand(S.flipCard(K+'l-love',1.5,.32,'HE LOVED IT',INK.pink),3.4,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'l-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.9):b.t;
   sun.dy=.3*beat(t,0,2);P1.body.s=beat(t,9,9.8)*(1-beat(t,13.8,14.6));seven.s=beat(t,9.6,10.4);
   const k1=maxOf([10.6,12].map(a=>pulse(t,a-.3,a+.3)));P1.leg!.rot=-1.1*k1;
   let [bx,bz,by]=[-2.3,.65,0];for(const a of [10.6,12])if(t>a&&t<a+1.2)[bx,bz,by]=track(t,[[a,-2.3,.65,0],[a+.6,-2.2+(a%2)*.4,-1.5,.3],[a+1.2,-2.2,-1.5,0]]);
   sit.body.s=beat(t,14,14.8);rest.s=beat(t,17,17.8);
   // Flip the shirt: striker becomes goalkeeper.
   const flip=manual?beat(act,0,.6):beat(t,21.4,22.6);front.flip=-3.2*flip;
   keep.body.s=Math.max(beat(t,23.2,24),manual?beat(act,.4,.8):0);const save=pulse(t,25,26.2);keep.body.rot=-.8*save;keep.body.dx=.3*save;
   if(t>24.6&&t<26.4)[bx,bz,by]=track(t,[[24.6,2.4,.6,0],[25.6,3.0,-1.0,.3],[26.4,2.6,-.4,0]]);ball(bx,bz,by,t>9.4&&(t<13.8||t>24.6));
   love.s=Math.max(beat(t,28.2,29),manual?beat(act,.7,1):0);cheer(keep,Math.max(beat(t,28.6,29.2),manual?beat(act,.8,1):0));sit.body.yaw=.3*beat(t,27,28);
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,20.6,21.6):0;
  };
 }};

/* ───────────── 2 · A wall in goal (wall) ───────────── */
const wall:SpreadDef={id:'wall',rest:19.3,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.1)} L-1.4 ${Z(-1.1)} L-1.4 ${Z(-2.1)}`);caption(k,-2.5,'LONDON · 2004','CHELSEA CHAMPIONS 2005',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'1,025 MINUTES','WITHOUT LETTING IN A GOAL · MARCH 2005',INK.navy,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'w-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,BLUE,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,BLUE,3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  B.stand(S.goal(K+'w-goal',1.7,.9),-2.5,-1.75,{layer:1});
  const keep=B.person(K+'w-keep',-2.5,-1.45,1.4,{shirt:'keeper',...PC,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const shooters=[[-3.8,.6],[-1.3,.8]].map(([x,z],i)=>B.person(K+`w-s${i}`,x,z,1.2,{shirt:'coach',hair:i?'curly':'bald',skin:SKINS[i*2+1],adult:true,legs:'kick',face:'open',layer:3}));
  const cup=B.stand(S.trophy(K+'w-cup',.5,.7),-4.4,-1.5,{layer:1,s:0});
  const champ=B.stand(S.flipCard(K+'w-champ',1.6,.32,'LEAGUE CHAMPIONS',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'w-board',1.9,1.4,'CLEAN SHEET'),2.4,-1.5,{layer:1});
  board.add(S.flipCard(K+'w-1025',1.5,.6,'1,025 MIN',INK.yellow,INK.navy),0,.36,{z:.012});
  const cover=board.flap(S.flipCard(K+'w-0',1.5,.6,'0 GOALS',INK.blue),0,.96,{z:.026});
  const keepR=B.person(K+'w-kr',1.4,.6,1.4,{shirt:'keeper',...PC,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const eleven=B.stand(S.flipCard(K+'w-11',1.6,.32,'11+ WHOLE MATCHES',INK.pink),2.4,1.95,{layer:3,s:0,tab:false});
  const ready=B.stand(S.flipCard(K+'w-ready',1.4,.32,'ALWAYS READY',INK.sky,INK.navy),4.1,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'w-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.3):b.t;
   keep.body.s=beat(t,2,2.8);shooters.forEach((p,i)=>{p.body.s=beat(t,5.8+i*.4,6.6+i*.4);});
   const shots=[7.4,9.4,11.4,13.4];shooters.forEach((p,i)=>{p.leg!.rot=-1.1*maxOf(shots.filter((_,j)=>j%2===i).map(a=>pulse(t,a-.3,a+.3)));});
   let [bx,bz,by]=[-1.0,.9,0],on=false;for(const [j,a] of shots.entries())if(t>a&&t<a+1.6){on=true;const x0=j%2?-1.0:-3.5;[bx,bz,by]=track(t,[[a,x0,.9,0],[a+.7,-2.5+(j%2?.4:-.4),-1.3,.5],[a+1.6,x0*.9,.2,0]]);}
   keep.body.rot=(.6)*maxOf(shots.map((a,j)=>pulse(t,a+.2,a+1)*(j%2?1:-1)));ball(bx,bz,by,on);
   cup.s=beat(t,16.6,17.4);champ.s=beat(t,17.2,18);
   // Flip the scoreboard: 0 goals, 1,025 minutes.
   cover.flip=-3.2*(manual?beat(act,0,.6):beat(t,19.8,21));keepR.body.s=Math.max(beat(t,21.6,22.4),manual?beat(act,.4,.8):0);eleven.s=Math.max(beat(t,21,21.8),manual?beat(act,.6,1):0);
   ready.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.8,1):0);keepR.body.dx=.5*Math.sin(t*1.5)*(t>27.6&&t<32.6?1:0);cheer(keepR,Math.max(beat(t,33,33.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,19.6,20.6):0;
  };
 }};

/* ───────────── 3 · A serious head injury (injury) ───────────── */
const injury:SpreadDef={id:'injury',rest:16.9,
 left:k=>{pitch(k,-5,0,'#7fa86a',INK.navy,.85);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'14 OCTOBER 2006','A SERIOUS HEAD INJURY · AN OPERATION',INK.navy);},
 right:k=>{floor(k,0,5,'#e4dccb','#b9ae96');caption(k,2.5,'ABOUT THREE MONTHS','BUMPED YOUR HEAD? STOP AND TELL A GROWN-UP',INK.pink,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'i-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.3);crowd(k,4.5,1.3,2.4,[INK.blue,'#5d5d6b',INK.white],2);k.fill(rect(0,2.4,4.5,.6),'#7fa86a');},
   k=>{wash(k,4.5,3,'#f3e6c8',INK.orange,y=>.15);k.fill(rect(.6,.5,1.2,.9),INK.sky2);k.key(rect(.6,.5,1.2,.9),.014);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const keep=B.person(K+'i-keep',-2.4,.2,1.36,{shirt:'keeper',...PC,face:'shy',layer:2});
  const medic=B.person(K+'i-medic',-1.5,.4,1.6,{shirt:'coach',hair:'short',skin:SKINS[2],adult:true,face:'smile',layer:3});
  const hurt=B.stand(S.flipCard(K+'i-hurt',1.6,.32,'HEAD BADLY HURT',INK.sky,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const danger=B.stand(P.lineCard('i-danger',1.6,.62,['VERY','DANGEROUS'],'#c9b9d6'),-1.3,-1.6,{layer:1,s:0});
  const home=B.stand(homeWin(K+'i-home',1.6,1.5),1.6,-1.4,{layer:1});
  const cloud=home.flap(P.rainCloud('i-cloud',1.7,1.2),0,1.42,{z:.03});
  const sun=bd.add(S.sun(K+'i-sun',.3),'R',2.1,1.5,{out:.012});
  const months=[0,1,2].map(i=>bd.add(P.segment(`i-mo${i}`,.9,.36,['MONTH 1','MONTH 2','MONTH 3'][i],[INK.sky,INK.yellow,INK.grass][i]),'R',3.3,1.0+i*.46,{out:.03}));
  const PR=B.person(K+'i-pr',2.2,.7,1.3,{shirt:'casual',...PC,face:'smile',layer:3});
  const doc=B.person(K+'i-doc',3.5,.6,1.6,{shirt:'navy',hair:'bun',hairColor:'#5b3a2a',skin:SKINS[0],adult:true,face:'smile',layer:3});
  const tell=B.stand(S.flipCard(K+'i-tell',1.8,.32,'STOP · TELL A GROWN-UP',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.9):b.t;
   keep.body.s=beat(t,2.2,3);medic.body.s=beat(t,9.2,10);hurt.s=beat(t,9.6,10.4);danger.s=beat(t,13.6,14.4);
   const walk=beat(t,10.4,16);keep.body.x=-2.4-1.2*walk;medic.body.x=-1.5-1.2*walk;medic.armL.rot=-.12-.9*beat(t,10,10.8);
   // Lift the rain cloud: time to heal at home.
   const lift=manual?beat(act,0,.6):beat(t,17.4,18.6);cloud.flip=-2.7*lift;sun.dy=.5*lift;
   months.forEach((m,i)=>pop(m,Math.max(beat(t,19.4+i*.8,20+i*.8),manual?beat(act,.3+i*.15,.5+i*.15):0)));
   PR.body.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.6,.9):0);doc.body.s=Math.max(beat(t,28.6,29.4),manual?beat(act,.7,1):0);doc.armR.rot=.12+1.1*pulse(t,29.4,32);
   tell.s=Math.max(beat(t,33.4,34.2),manual?beat(act,.85,1):0);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,17,18):0;
  };
 }};

/* ───────────── 4 · Back, in a headguard (headguard) ───────────── */
const headguard:SpreadDef={id:'headguard',rest:20.2,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'20 JANUARY 2007','BACK, AGAINST LIVERPOOL',INK.blue);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'SAFE AND READY','HIS TRADEMARK · NOW IN CHELSEA’S MUSEUM',INK.navy,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'h-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,RED.concat(BLUE),1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,BLUE,4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const ref=B.person(K+'h-ref',-3.4,.2,1.5,{shirt:'bib',hair:'bald',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const okay=ref.body.add(S.icon(K+'h-ok',.4,'tick'),.4,ref.h*.98,{z:.02});
  const rugby=B.stand(P.lineCard('h-rugby',1.5,.62,['PADDED','LIKE RUGBY KIT'],INK.white),-1.6,-1.5,{layer:1,s:0});
  const keepL=B.person(K+'h-kl',-2.0,.5,1.36,{shirt:'keeper',...PC,face:'smile',layer:3,holdL:'glove',holdR:'glove'});
  const gL=keepL.body.add(guard(K+'h-gl',.5),0,keepL.h*.76,{z:.02});
  const brave=B.stand(S.flipCard(K+'h-brave',1.3,.32,'COURAGE',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const keep=B.person(K+'h-k',2.0,.5,1.5,{shirt:'keeper',...PC,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const g=keep.body.add(guard(K+'h-g',.54),0,keep.h*.76,{z:.02});
  const safe=B.stand(S.flipCard(K+'h-safe',1.4,.32,'SAFE AND READY',INK.green),1.6,1.95,{layer:3,s:0,tab:false});
  const mus=B.stand(S.post(K+'h-post',1.3,1.3,INK.white),3.8,-1.3,{layer:1,s:0});
  mus.add(P.frame('h-mus',1.16,.9,k=>{k.fill(rect(.08,.08,1.0,.74),'#e9e2cf');k.text('MUSEUM',.58,.28,.1,INK.blue,{weight:900});k.fill(ell(.58,.58,.22,.14),'#2b2b33');k.key(ell(.58,.58,.22,.14),.01);}),0,.14,{z:.012});
  const smart=B.stand(S.flipCard(K+'h-smart',1.6,.32,'SMART, NOT SILLY',INK.yellow,INK.navy),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.2):b.t;
   keepL.body.s=beat(t,2.2,3);pop(gL,beat(t,8,8.8));rugby.s=beat(t,9.6,10.4);ref.body.s=beat(t,13,13.8);ref.armR.rot=.12+1.2*pulse(t,13.6,15.6);pop(okay,beat(t,14.6,15.2));brave.s=beat(t,16,16.8);
   keep.body.s=Math.max(beat(t,16.4,17.2),manual?1:0);
   // Put on the headguard: it slides down onto his head.
   const on=manual?beat(act,0,.6):beat(t,20.8,22);g.dy=.9*(1-on);pop(g,Math.max(.05,Math.min(1,on*3)));
   safe.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.6,1):0);cheer(keep,Math.max(beat(t,23,23.6)*(1-beat(t,27,28)),manual?beat(act,.7,1):0));
   mus.s=Math.max(beat(t,27.4,28.2),manual?beat(act,.8,1):0);smart.s=beat(t,34.4,35.2);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.2,17.2):0;
  };
 }};

/* ───────────── 5 · Saves in the big final (munich) ───────────── */
const munich:SpreadDef={id:'munich',rest:16.7,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'MUNICH · 2012','EXTRA TIME · A PENALTY SAVED',INK.yellow,INK.white);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M1.4 ${Z(-2.1)} L1.4 ${Z(-1.0)} L3.6 ${Z(-1.0)} L3.6 ${Z(-2.1)}`);caption(k,2.5,'THE SHOOTOUT','CHELSEA WIN THE CHAMPIONS LEAGUE',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'m-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,RED,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,RED.concat(BLUE),4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'m-fw1',.44,INK.yellow),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'m-fw2',.4,INK.sky),'R',3.4,2.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'m-conf',3.6,1.4,4),'R',.4,1.1,{out:.04});
  B.stand(S.goal(K+'m-goalL',1.7,.9),-2.5,-1.75,{layer:1});
  const kL=B.person(K+'m-kl',-2.5,-1.45,1.4,{shirt:'keeper',...PC,face:'open',layer:1,holdL:'glove',holdR:'glove'});kL.body.add(guard(K+'m-gl',.5),0,kL.h*.76,{z:.02});
  const taker=B.person(K+'m-tk',-2.2,.6,1.3,{shirt:'coach',hair:'bald',skin:SKINS[0],adult:true,legs:'kick',face:'open',layer:3});
  const fav=B.stand(P.lineCard('m-fav',1.5,.62,['BAYERN’S','OWN STADIUM'],INK.white),-4.2,-.6,{layer:2,s:0});
  const saved=B.stand(S.flipCard(K+'m-saved',1.4,.32,'SAVED!',INK.pink),-3.4,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'m-goalR',1.7,.9),2.5,-1.75,{layer:1});
  const kR=B.person(K+'m-kr',2.5,-1.45,1.4,{shirt:'keeper',...PC,face:'grin',layer:1,holdL:'glove',holdR:'glove'});kR.body.add(guard(K+'m-gr',.5),0,kR.h*.76,{z:.02});
  const marks=['SAVE','SAVE','CHAMPIONS'].map((l,i)=>B.stand(S.flipCard(K+`m-c${i}`,i===2?1.4:.9,.32,l,[INK.pink,INK.pink,INK.yellow][i],i===2?INK.navy:INK.white),[1.2,2.3,3.8][i],1.95,{layer:3,s:0,tab:false}));
  const cup=B.stand(S.trophy(K+'m-cup',.5,.7),4.4,-.6,{layer:2,s:0});
  const ball=ballPair(B,K+'m-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.7):b.t;
   kL.body.s=beat(t,2.2,3);taker.body.s=beat(t,7.4,8.2);kR.body.s=beat(t,2.6,3.4);
   const p=10.2;taker.leg!.rot=-1.1*pulse(t,p-.3,p+.3);const dv=pulse(t,p+.1,p+1.4);kL.body.rot=.8*dv;kL.body.dx=-.3*dv;saved.s=beat(t,11,11.8);fav.s=beat(t,13,13.8);
   // Dive for the save: three dives, left, right, left.
   const dives=[0,1,2].map(i=>manual?pulse(act,i/3,(i+.9)/3):pulse(t,19.4+i*1.6,20.6+i*1.6));const side=[1,-1,1];
   kR.body.rot=dives.reduce((a,v,i)=>a+.85*v*side[i],0);kR.body.dx=dives.reduce((a,v,i)=>a-.35*v*side[i],0);
   marks.forEach((m,i)=>{m.s=Math.max(beat(t,[20,21.6,23.6][i],[20.8,22.4,24.4][i]),manual?beat(act,(i+.5)/3,(i+.9)/3):0);});
   let bx=-1.9,bz=.75,by=0,on=t>7.4&&t<p+1.6;if(t>p)[bx,bz,by]=track(t,[[p,-1.9,.75,0],[p+.6,-2.9,-1.2,.3],[p+1.6,-3.4,-.4,0]]);
   const di=dives.findIndex(v=>v>.05);if(di>=0){on=true;const v=dives[di];[bx,bz,by]=[2.5-.9*side[di]*v,-.2-1.1*v,.3*v];}ball(bx,bz,by,on);
   cup.s=Math.max(beat(t,23.8,24.6),manual?beat(act,.9,1):0);cheer(kR,Math.max(beat(t,24,24.6),manual?beat(act,.95,1):0));
   fw.forEach((q,i)=>{pop(q,Math.max(beat(t,24+i*.4,25+i*.4),manual?beat(act,.9,1):0));q.rot=t*.2;});pop(conf,Math.max(beat(t,24.2,25.4),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.8,17.8):0;
  };
 }};

/* ───────────── 6 · Still learning new things (new) ───────────── */
const newS:SpreadDef={id:'new',rest:12.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'2019 · 202 CLEAN SHEETS','THE PREMIER LEAGUE RECORD',INK.blue);},
 right:k=>{floor(k,0,5);caption(k,2.5,'A BEGINNER AGAIN','ICE HOCKEY · DRUMS · AND MORE',INK.pink);},
 build:B=>{
  const bd=backdrop(B,K+'n-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,BLUE,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{wash(k,4.5,3,'#e7dcef',INK.pink,y=>.12);for(let x=.15;x<4.5;x+=.45)k.key(`M${x} 0 L${x} 2.4`,.012,'#d9c9e6');k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const board=B.stand(S.scoreboard(K+'n-board',1.7,1.3,'CLEAN SHEETS'),-3.6,-1.5,{layer:1});board.add(S.flipCard(K+'n-202',1.4,.6,'202',INK.yellow,INK.navy),0,.36,{z:.012});
  const keep=B.person(K+'n-k',-2.0,.4,1.45,{shirt:'keeper',...PC,adult:true,face:'grin',layer:3,holdL:'glove',holdR:'glove'});keep.body.add(guard(K+'n-g',.52),0,keep.h*.76,{z:.02});
  const rec=B.stand(S.flipCard(K+'n-rec',1.5,.32,'A RECORD',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const kinds=['hockey','drums','gloves'] as const;
  const frames=kinds.map((kd,i)=>B.stand(pic(K+`n-p${i}`,1.2,1.0,kd),1.1+i*1.4,-1.0,{layer:1}));
  const covers=frames.map((f,i)=>f.flap(P.lineCard(`n-c${i}`,1.14,.94,['?'],[INK.sky,INK.yellow,INK.pink][i]),0,.97,{z:.03}));
  const PR=B.person(K+'n-pr',2.5,.8,1.3,{shirt:'casual',...PC,adult:true,face:'grin',layer:3});
  const fun=B.stand(S.flipCard(K+'n-fun',1.6,.32,'BRAVE, AND FUN',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,12.4):b.t;
   keep.body.s=beat(t,2,2.8);keep.armR.rot=.12+1.6*pulse(t,3,5.4);rec.s=beat(t,9,9.8);
   // Lift the three flaps: ice hockey, drums, and the gloves he still loves.
   const lifts=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,[13.2,17.2,20.4][i],[14.2,18.2,21.4][i]));covers.forEach((c,i)=>{c.flip=-2.8*lifts[i];});
   PR.body.s=Math.max(beat(t,15,15.8),manual?beat(act,.2,.5):0);fun.s=Math.max(beat(t,23,23.8),manual?beat(act,.9,1):0);
   cheer(PR,Math.max(beat(t,23.4,24),manual?beat(act,.95,1):0));cheer(keep,beat(t,27,27.6));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,12.6,13.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={leg,wall,injury,headguard,munich,new:newS};
