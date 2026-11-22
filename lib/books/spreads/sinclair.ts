/**
 * The six Christine Sinclair pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/sinclair/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The thread is "heartbreak, then gold": a hat-trick and a loss under a rain cloud, two bronze steps, a goal bar, a gold medal.
 * Kits are colour only (Canada orange-red, USA navy). The 2012 semi-final is the same match as the Morgan book's London spread.
 */
import {INK,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,daySky,crowd,nightSky,lightRig,hills,roofs,skyline,backdrop,plates} from '../spreadKit';

const K='sinclair-';
const P=plates(K),{sp}=P;
const CS={skin:SKINS[0],hair:'long' as const,hairColor:'#4a3222'};
const CAN=[INK.red,INK.white,INK.red,INK.orange];
const BRONZE='#c98a4b';

/* ───────────── Sinclair-only plates ───────────── */
const step=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.18);k.key(b,.014);k.text(label,w/2,h*.34,Math.min(.16,h*.2),INK.navy,{weight:900,max:w*.9});},{rim:.016});
const ribbon=(key:string,s:number)=>sp(key,s*.7,s,k=>{const w=s*.7;k.fill(`M${w*.5} ${s*.16} C${w*.05} ${s*-.06} ${w*.02} ${s*.38} ${w*.5} ${s*.58} L${w*.12} ${s} L${w*.3} ${s} L${w*.5} ${s*.7} L${w*.7} ${s} L${w*.88} ${s} L${w*.5} ${s*.58} C${w*.98} ${s*.38} ${w*.95} ${s*-.06} ${w*.5} ${s*.16} Z`,INK.orange);k.key(`M${w*.5} ${s*.16} C${w*.05} ${s*-.06} ${w*.02} ${s*.38} ${w*.5} ${s*.58} C${w*.98} ${s*.38} ${w*.95} ${s*-.06} ${w*.5} ${s*.16} Z`,.012);},{rim:.012});
const threeBalls=(key:string)=>sp(key,.9,.3,k=>{for(let i=0;i<3;i++){const x=.15+i*.3;k.fill(ell(x,.15,.12,.12),INK.white);k.key(ell(x,.15,.12,.12),.012);k.keyFill(ell(x,.15,.04,.04));}},{rim:.012});

/* ───────────── 1 · A football family (family) ───────────── */
const family:SpreadDef={id:'family',rest:18.1,
 left:k=>{paving(k,-5,0,'#e3d6bb','#b2a283');k.fill(rect(-5,Z(.4),5,2.8),INK.grass,.6);caption(k,-2.5,'BURNABY · CANADA · 1983','HER FATHER AND TWO UNCLES ALL PLAYED',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'AGED FOUR','ON A TEAM FOR CHILDREN UP TO SEVEN',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.5,'#7fa37a');roofs(k,.2,4.3,2.3,1);k.fill(rect(0,2.3,4.5,.7),'#9dbd78');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#86ad78');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'f-sun',.3),'L',3.7,2.1,{out:.012});
  B.stand(S.house(K+'f-house',1.5,1.4),-3.9,-1.6,{layer:1});B.stand(S.tree(K+'f-tree',1.0,1.6,'pine'),-1.0,-1.7,{layer:1});
  const baby=B.stand(S.flipCard(K+'f-1983',1.0,.3,'BORN 1983',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const fam=[[-3.2,.0,'short',SKINS[0]],[-2.3,-.4,'bald',SKINS[2]],[-1.5,.1,'curly',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`f-a${i}`,x as number,z as number,1.62,{shirt:i?'ger':'navy',hair:h as 'short',skin:sk as string,adult:true,face:'smile',layer:2}));
  const famC=B.stand(S.flipCard(K+'f-fam',1.6,.3,'A FOOTBALL FAMILY',INK.red),-1.9,1.95,{layer:3,s:0,tab:false});
  const C=B.person(K+'f-c',-2.6,.9,.86,{shirt:'casual',...CS,face:'grin',layer:3,holdR:'ball'});
  B.stand(S.goal(K+'f-goal',1.7,.9),3.9,-1.5,{layer:1});
  const keeper=B.person(K+'f-keep',3.9,-1.2,1.18,{shirt:'keeper',hair:'curly',skin:SKINS[3],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const big=[[2.0,-.2,'short',SKINS[1]],[3.0,.4,'bun',SKINS[4]]].map(([x,z,h,sk],i)=>B.person(K+`f-b${i}`,x as number,z as number,1.3,{shirt:'fan',hair:h as 'short',skin:sk as string,face:'open',layer:2}));
  const CR=B.person(K+'f-cr',.9,.9,.88,{shirt:'casual',...CS,legs:'kick',face:'grin',layer:3});
  const cards=['QUICK','CLEVER'].map((l,i)=>B.stand(S.flipCard(K+`f-q${i}`,1.1,.3,l,[INK.yellow,INK.pink][i],INK.navy),2.2+i*1.5,1.95,{layer:3,s:0,tab:false}));
  B.slot(1.2,.9,3.7,-1.3);
  const ball=B.stand(S.ball(K+'f-ball',.1),1.2,.95,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.1):b.t;
   sun.dy=.3*beat(t,0,2);baby.s=beat(t,3,3.8);C.body.s=beat(t,2.4,3.2)*(1-beat(t,13.4,14))+0;
   fam.forEach((p,i)=>{p.body.s=beat(t,7.8+i*.5,8.6+i*.5);});famC.s=beat(t,10,10.8);fam.forEach((p,i)=>{p.armR.rot=.12+1.2*pulse(t,11+i*.4,13+i*.4);});
   CR.body.s=Math.max(beat(t,13.6,14.4),manual?1:0);big.forEach((p,i)=>{p.body.s=beat(t,14.2+i*.4,15+i*.4);});keeper.body.s=beat(t,14.6,15.4);
   // Kick the ball: past the bigger children, into the goal.
   const kick=manual?beat(act,0,.7):beat(t,19.2,20.6);CR.leg!.rot=-1.2*(manual?pulse(act,0,.3):pulse(t,18.9,19.5));
   const [bx,bz,by]=kick>0?track(kick,[[0,1.2,.95,0],[.5,2.5,-.3,.5],[1,3.7,-1.45,.15]]):[1.2,.95,0];ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>13.8||manual;
   keeper.body.rot=.6*(manual?pulse(act,.3,.9):pulse(t,19.6,21));cheer(CR,Math.max(beat(t,20.8,21.4)*(1-beat(t,24.6,25.2)),manual?beat(act,.9,1):0));
   big.forEach((p,i)=>{p.body.rot=.25*pulse(t,21+i*.8,22.4+i*.8)*(i?1:-1);});
   cards.forEach((c,i)=>{c.s=beat(t,27+i*1.4,27.8+i*1.4);});cheer(CR,beat(t,31,31.6));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,13.4,14.4):0;
  };
 }};

/* ───────────── 2 · Three goals at sixteen (debut) ───────────── */
const debut:SpreadDef={id:'debut',rest:18.1,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.9 ${Z(-2.1)} L-3.9 ${Z(-.9)} L-1.1 ${Z(-.9)} L-1.1 ${Z(-2.1)}`);caption(k,-2.5,'ALGARVE CUP · PORTUGAL · 2000','HER FIRST TOURNAMENT FOR CANADA, AGED 16',INK.red,INK.navy,.36);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'THREE GOALS','THE START OF A LONG JOURNEY',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'d-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.4,2.45,CAN,1);k.fill(rect(0,2.45,4.5,.55),'#9dbd78');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#9cb07a');roofs(k,.2,4.3,2.3,3);k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'d-sun',.34),'R',3.6,2.1,{out:.012});
  B.stand(S.goal(K+'d-goal',1.8,.95),-2.5,-1.8,{layer:1});
  const keeper=B.person(K+'d-keep',-2.5,-1.5,1.3,{shirt:'keeper',hair:'bun',skin:SKINS[2],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const C=B.person(K+'d-c',-2.4,.6,1.08,{shirt:'casual',...CS,legs:'kick',face:'grin',layer:3});
  const grown=[[-4.0,-.2,'bun',SKINS[1]],[-1.0,.0,'long',SKINS[3]]].map(([x,z,h,sk],i)=>B.person(K+`d-g${i}`,x as number,z as number,1.34,{shirt:'navy',hair:h as 'long',skin:sk as string,face:'open',layer:2}));
  const young=B.stand(S.flipCard(K+'d-young',1.5,.3,'ONE OF THE YOUNGEST',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const balls=B.stand(threeBalls(K+'d-three'),-4.0,1.25,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'d-board',1.6,1.25,'ALGARVE CUP'),2.4,-1.4,{layer:1});
  board.add(S.scoreFlap(K+'d-sc',1.3,.56,'SINCLAIR','3','GOALS'),0,.34,{z:.012});
  const cover=board.flap(S.flipCard(K+'d-cover',1.34,.6,'GOALS?',INK.yellow,INK.navy),0,.92,{z:.03});
  const CR=B.person(K+'d-cr',1.2,.6,1.1,{shirt:'casual',...CS,face:'grin',layer:3});
  const mates=[[3.6,.3,'bun',SKINS[4]],[4.4,-.4,'short',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`d-m${i}`,x as number,z as number,1.24,{shirt:'casual',hair:h as 'bun',skin:sk as string,face:'grin',layer:2}));
  const road=['GREAT JOY','SOME HARD DAYS'].map((l,i)=>B.stand(S.flipCard(K+`d-r${i}`,1.4,.3,l,[INK.yellow,INK.pink][i],INK.navy),1.6+i*1.8,1.95,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'d-ball',.1),-2.4,-.1,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.1):b.t;
   sun.dy=.3*beat(t,0,2);C.body.s=beat(t,2.6,3.4);keeper.body.s=beat(t,3,3.8);grown.forEach((p,i)=>{p.body.s=beat(t,13+i*.4,13.8+i*.4);});young.s=beat(t,14,14.8);
   // Three shots, three goals.
   const shots=[10.6,11.6,12.6];C.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.25,a+.25)));let [bx,bz,by]=[-2.4,-.1,0];
   for(const [i,a] of shots.entries())if(t>a&&t<a+.9)[bx,bz,by]=track(t,[[a,-2.4,-.1,0],[a+.5,-2.5+(i-1)*.6,-1.6,.35],[a+.9,-2.4,-.1,0]]);
   ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>9.8&&t<14;keeper.body.rot=.5*maxOf(shots.map((a,i)=>pulse(t,a+.1,a+.8)*(i%2?1:-1)));balls.s=beat(t,12.8,13.6);cheer(C,beat(t,13.2,13.8));
   // Flip the scoreboard: the cover turns up, three goals underneath.
   const flip=manual?beat(act,0,.6):beat(t,19.2,20.4);cover.flip=-3.0*flip;
   CR.body.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.4,.8):0);mates.forEach((p,i)=>{p.body.s=Math.max(beat(t,20.2+i*.4,21+i*.4),manual?beat(act,.5,.9):0);});
   cheer(CR,Math.max(beat(t,20.6,21.2)*(1-beat(t,26,26.6)),manual?beat(act,.9,1):0));mates.forEach((p,i)=>cheer(p,beat(t,21+i*.3,21.6+i*.3)*(1-beat(t,26,26.6))));
   road.forEach((c,i)=>{c.s=beat(t,[23.4,26.6][i],[24.2,27.4][i]);});
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,18.4,19.4):0;
  };
 }};

/* ───────────── 3 · Three goals, and still a loss (london) ───────────── */
const london:SpreadDef={id:'london',rest:17.6,
 left:k=>{pitchLines(k,-5,0,-2.5,'#6f9f5e',INK.green);caption(k,-2.5,'LONDON 2012 · SEMI-FINAL','CANADA AND THE UNITED STATES',INK.red,INK.navy,.4);},
 right:k=>{pitchLines(k,0,5,2.6,'#6f9f5e',INK.green);caption(k,2.5,'A FEW DAYS LATER','CANADA WIN THE BRONZE MEDAL',INK.orange,INK.navy);},
 build:B=>{
  const dusk=(k:Parameters<SpreadDef['left']>[0],seed:number)=>{const p=rect(0,0,4.5,3);k.fill(p,'#f2a77a');k.dots(p,INK.pink,.06,(x,y)=>.5-y/3*.4);crowd(k,4.5,1.2,2.45,[...CAN,INK.navy],seed);lightRig(k,.8,.3);lightRig(k,3.8,.3);k.fill(rect(0,2.45,4.5,.55),'#6f9f5e');};
  const bd=backdrop(B,K+'l-bd',k=>dusk(k,1),k=>dusk(k,4));
  B.stand(S.goal(K+'l-goal',1.8,.95),-3.6,-1.8,{layer:1});
  const keeper=B.person(K+'l-keep',-3.6,-1.5,1.3,{shirt:'keeper',hair:'bun',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const C=B.person(K+'l-c',-3.2,.6,1.2,{shirt:'casual',...CS,legs:'kick',face:'grin',layer:3});
  const usa=B.person(K+'l-usa',-1.8,-.2,1.22,{shirt:'navy',hair:'long',hairColor:'#7a4d35',skin:SKINS[0],face:'open',layer:2});
  const hat=B.stand(threeBalls(K+'l-three'),-4.1,1.25,{layer:3,s:0,tab:false});const hatC=B.stand(S.flipCard(K+'l-hat',1.2,.3,'A HAT-TRICK',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'l-post',1.7,1.3,INK.white),-1.2,-1.3,{layer:1});
  post.add(S.scoreFlap(K+'l-sc',1.56,.9,'CAN','3–4','USA'),0,.15,{z:.012});const cloud=post.flap(P.rainCloud('l-cloud',1.6,1.1),0,1.22,{z:.03});
  const lastMin=B.stand(S.flipCard(K+'l-last',1.7,.3,'THE VERY END OF EXTRA TIME',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const team=[[1.1,.5,'bun',SKINS[2]],[2.3,.9,'curly',SKINS[4]],[3.5,.4,'short',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`l-t${i}`,x as number,z as number,1.2,{shirt:'casual',hair:h as 'bun',skin:sk as string,face:'sad',layer:3}));
  const CR=B.person(K+'l-cr',4.4,.9,1.2,{shirt:'casual',...CS,face:'sad',layer:3});
  const sadC=B.stand(S.flipCard(K+'l-sad',1.5,.3,'A VERY SAD DAY',INK.sky,INK.navy),2.2,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'l-pole',.14,1.3,INK.stock),3.0,-.9,{layer:2,tab:false});const medal=pole.add(P.medal('l-medal',.6,BRONZE,INK.red),0,.3,{z:.03,anchor:'center'});
  const up=B.stand(S.flipCard(K+'l-up',1.6,.3,'PICK YOURSELVES UP',INK.yellow,INK.navy),4.0,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'l-ball',.1),-3.0,-.1,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.6):b.t;
   C.body.s=beat(t,2.8,3.6);keeper.body.s=beat(t,3.2,4);usa.body.s=beat(t,4.4,5.2);
   const shots=[8.6,9.6,10.6];C.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.25,a+.25)));let [bx,bz,by]=[-3.0,-.1,0];
   for(const [i,a] of shots.entries())if(t>a&&t<a+.9)[bx,bz,by]=track(t,[[a,-3.0,-.1,0],[a+.5,-3.6+(i-1)*.6,-1.6,.35],[a+.9,-3.0,-.1,0]]);
   ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>8&&t<11.6;keeper.body.rot=.5*maxOf(shots.map((a,i)=>pulse(t,a+.1,a+.8)*(i%2?-1:1)));
   hat.s=beat(t,10.8,11.6);hatC.s=beat(t,11.2,12);cheer(C,beat(t,11,11.6)*(1-beat(t,13.6,14.4)));lastMin.s=beat(t,13.6,14.4);usa.armR.rot=.12+2.2*pulse(t,14.2,17);
   // Lift the rain cloud: the score is underneath. Then the team gets up again for the bronze.
   const lift=manual?beat(act,0,.5):beat(t,18.6,19.8);cloud.flip=-2.7*lift;
   team.forEach((p,i)=>{p.body.s=Math.max(beat(t,20.6+i*.3,21.4+i*.3),manual?1:0);});CR.body.s=Math.max(beat(t,20.8,21.6),manual?1:0);sadC.s=beat(t,21.4,22.2)*(1-beat(t,24.4,25));
   const bronze=manual?beat(act,.5,1):beat(t,25,26.4);medal.dy=-.2+.9*bronze;pop(medal,Math.min(1,bronze*2));
   [...team,CR].forEach((p,i)=>cheer(p,beat(t,26.4+i*.2,27+i*.2)*.7+(manual?beat(act,.85,1)*.3:0)));up.s=Math.max(beat(t,30,30.8),manual?beat(act,.9,1):0);
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,20.2,21.2):0;
  };
 }};

/* ───────────── 4 · Climbing back (rio) ───────────── */
const rio:SpreadDef={id:'rio',rest:17.8,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'RIO 2016 · BRAZIL','THE BRONZE MEDAL MATCH · A HUGE HOME CROWD',INK.green,INK.navy,.4);},
 right:k=>{paving(k,0,5,'#efe0c0','#c2ab82');caption(k,2.5,'BRONZE AGAIN','CHRISTINE SCORED THE WINNING GOAL',INK.orange);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.1,2.45,[INK.yellow,INK.green,INK.yellow,INK.blue],2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.5,'#5f8f6a');skyline(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#efe0c0');});
  const noise=[0,1,2].map(i=>bd.add(S.bubble(K+`r-n${i}`,.5,.42,'dots'),'L',.8+i*1.4,2.2-(i%2)*.3,{out:.04}));
  B.stand(S.cityBlock(K+'r-city',1.5,1.4),-4.1,-1.7,{layer:1});
  const bra=[[-3.4,.1,'long',SKINS[3]],[-1.6,-.3,'bun',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`r-b${i}`,x as number,z as number,1.22,{shirt:'bib',hair:h as 'long',hairColor:'#1d1512',skin:sk as string,face:'open',layer:2}));
  const C=B.person(K+'r-c',-2.5,.9,1.2,{shirt:'casual',...CS,face:'smile',layer:3});
  const loud=B.stand(S.flipCard(K+'r-loud',1.4,.3,'SO LOUD!',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const steps=[['LONDON 2012',.45],['TRY AGAIN',.8],['RIO 2016',1.15]].map(([l,h],i)=>B.stand(step(K+`r-s${i}`,1.05,h as number,l as string,[INK.sky,INK.yellow,BRONZE][i]),1.0+i*1.1,-.6,{layer:2}));
  const CR=B.person(K+'r-cr',.4,.4,1.14,{shirt:'casual',...CS,legs:'kick',face:'grin',layer:3});
  const medal=B.stand(P.medal('r-medal',.6,BRONZE,INK.red),4.4,.6,{layer:3,s:0,tab:false});
  const bounce=B.stand(S.flipCard(K+'r-bounce',1.6,.3,'BOUNCE BACK',INK.pink),3.0,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'r-ball',.1),-2.2,.95,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.8):b.t;
   C.body.s=beat(t,2,2.8)*(1-beat(t,17,17.6));bra.forEach((p,i)=>{p.body.s=beat(t,9.2+i*.4,10+i*.4);});noise.forEach((q,i)=>pop(q,beat(t,14.4+i*.4,15+i*.4)));loud.s=beat(t,15,15.8);
   ball.x=-2.2+.4*Math.sin(t*1.4);ball.visible=t>2.4&&t<17;
   // Climb the steps: three taps, three steps up.
   const st=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,18.8+i*1.2,19.6+i*1.2));
   CR.body.s=Math.max(beat(t,17.4,18.2),manual?1:0);const n=st.reduce((a,v)=>a+v,0);
   CR.body.x=.4+1.1*n;CR.body.dy=[0,.45,.8,1.15][Math.floor(n)]+(n%1)*(([.45,.8,1.15,1.15][Math.floor(n)])-([0,.45,.8,1.15][Math.floor(n)]))+.25*Math.sin((n%1)*Math.PI);CR.body.z=.4-.75*Math.min(1,n);
   steps.forEach((q,i)=>{q.rot=.04*pulse(st[i],.3,.9);});pop(medal,Math.max(beat(t,21.4,22.2),manual?beat(act,.85,1):0));
   cheer(CR,Math.max(beat(t,22,22.6),manual?beat(act,.9,1):0));bounce.s=beat(t,29.2,30);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.2,18.2):0;
  };
 }};

/* ───────────── 5 · More goals than anyone (record) ───────────── */
const record:SpreadDef={id:'record',rest:20.6,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'JANUARY 2020 · GOAL 185','MORE THAN ANY PLAYER, MAN OR WOMAN',INK.red,INK.navy,.4);},
 right:k=>{floor(k,0,5);caption(k,2.5,'SHE FINISHED WITH 190','AND RAISED MONEY FOR MS RESEARCH',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.45,CAN,3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f6e2b8');k.dots(p,INK.orange,.05,.14);for(let i=0;i<3;i++){const f=rect(.5+i*1.3,.5,.9,.7);k.fill(f,INK.white);k.key(f,.012);k.fill(rect(.6+i*1.3,.6,.7,.5),[INK.sky2,INK.grass,INK.sky][i]);}k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const board=B.stand(S.scoreboard(K+'g-board',1.6,1.25,'GOALS FOR CANADA'),-3.6,-1.4,{layer:1});
  const n185=board.add(S.noteCard(K+'g-185',1.2,.56,['185']),0,.32,{z:.012}),n190=board.add(S.noteCard(K+'g-190',1.2,.56,['190']),0,.32,{z:.02});
  B.stand(S.goal(K+'g-goal',1.7,.9),-1.4,-1.7,{layer:1});
  const C=B.person(K+'g-c',-2.0,.5,1.2,{shirt:'casual',...CS,legs:'kick',face:'grin',layer:3});
  const most=B.stand(S.flipCard(K+'g-most',1.6,.3,'NO ONE HAD SCORED MORE',INK.yellow,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const yrs=B.stand(S.flipCard(K+'g-yrs',1.2,.3,'20 YEARS',INK.pink),-1.2,1.95,{layer:3,s:0,tab:false});
  const bar=B.stand(P.barFrame('g-bar',2.4,1.1,'GOAL BAR'),1.6,.9,{layer:3});
  const segs=['100','150','185'].map((l,i)=>bar.add(P.segment(`g-s${i}`,.7,.38,l,[INK.yellow,INK.grass,INK.pink][i]),-.75+i*.75,.33,{z:.02,anchor:'bottom'}));
  const mum=B.person(K+'g-mum',3.4,-.4,1.62,{shirt:'casual',hair:'bun',hairColor:'#8a6a4a',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const CR=B.person(K+'g-cr',4.3,-.2,1.22,{shirt:'casual',...CS,face:'smile',layer:2});
  const rib=B.stand(ribbon(K+'g-rib',.5),3.9,.7,{layer:3,s:0,tab:false});
  const help=B.stand(S.flipCard(K+'g-help',1.6,.3,'HELPING OTHER FAMILIES',INK.orange,INK.navy),3.8,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'g-ball',.1),-1.8,.6,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.6):b.t;
   C.body.s=beat(t,2.2,3);pop(n185,beat(t,5,5.8));pop(n190,beat(t,15,15.8));most.s=beat(t,9,9.8);yrs.s=beat(t,18,18.8);
   const pk=5;C.leg!.rot=-1.1*pulse(t,pk-.3,pk+.3);const [bx,bz,by]=t<pk?[-1.8,.6,0]:track(t,[[pk,-1.8,.6,0],[pk+.6,-1.4,-1.5,.35],[pk+1.2,-1.4,-1.5,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>2.6&&t<9;cheer(C,beat(t,6,6.6)*(1-beat(t,12,12.6))+beat(t,15,15.6)*.6);
   // Fill the goal bar: three taps.
   const fills=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,21.8+i*.8,22.4+i*.8));segs.forEach((q,i)=>pop(q,fills[i]));
   mum.body.s=Math.max(beat(t,24.6,25.4),manual?beat(act,.8,1):0);CR.body.s=Math.max(beat(t,24.8,25.6),manual?beat(act,.8,1):0);pop(rib,beat(t,26,26.8));help.s=beat(t,28.6,29.4);
   const hug=beat(t,29.6,30.6);mum.armL.rot=-.12-1.0*hug;CR.armR.rot=.12+1.0*hug;
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,20.8,21.8):0;
  };
 }};

/* ───────────── 6 · Gold at last (tokyo) ───────────── */
const tokyo:SpreadDef={id:'tokyo',rest:19.2,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'TOKYO · 2021 · SEMI-FINAL','CANADA 1, UNITED STATES 0',INK.yellow,INK.white);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'OLYMPIC GOLD','THE FINAL: 1–1, THEN CANADA WIN ON PENALTIES',INK.yellow,INK.white,.4);},
 build:B=>{
  const bd=backdrop(B,K+'t-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.3,2.5,[INK.navy,INK.blue,INK.grey],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.3,2.5,[INK.navy,INK.blue,INK.grey],5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const conf=bd.add(S.confetti(K+'t-conf',3.6,1.4,3),'R',.4,1.1,{out:.04}),fw=[bd.add(S.firework(K+'t-fw1',.4,INK.yellow),'R',.9,2.0,{out:.03}),bd.add(S.firework(K+'t-fw2',.36,INK.red),'R',3.6,2.1,{out:.03})];
  const board=B.stand(S.scoreboard(K+'t-board',1.5,1.2,'SEMI-FINAL'),-3.8,-1.5,{layer:1,s:0});board.add(S.scoreFlap(K+'t-sc',1.2,.54,'CAN','1–0','USA'),0,.32,{z:.012});
  const nine=B.stand(S.flipCard(K+'t-nine',1.6,.3,'NINE YEARS AFTER LONDON',INK.sky,INK.navy),-3.7,1.95,{layer:3,s:0,tab:false});
  const C=B.person(K+'t-c',-2.2,.5,1.22,{shirt:'casual',...CS,face:'grin',layer:3});
  const old=[[-1.2,-.2,'bun',SKINS[1]],[-.6,.7,'curly',SKINS[4]]].map(([x,z,h,sk],i)=>B.person(K+`t-o${i}`,x as number,z as number,1.2,{shirt:'casual',hair:h as 'bun',skin:sk as string,face:'grin',layer:2}));
  const final=B.stand(S.scoreboard(K+'t-final',1.5,1.2,'FINAL'),1.4,-1.5,{layer:1,s:0});final.add(S.scoreFlap(K+'t-fsc',1.2,.54,'CAN','1–1','SWE'),0,.32,{z:.012});
  const pens=B.stand(S.flipCard(K+'t-pens',1.3,.3,'PENALTIES',INK.yellow,INK.navy),1.4,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'t-pole',.14,1.3,INK.stock),3.0,-.3,{layer:2,tab:false});const gold=pole.add(P.medal('t-gold',.7,INK.gold,INK.red),0,.3,{z:.03,anchor:'center'});
  const CR=B.person(K+'t-cr',2.4,.6,1.24,{shirt:'casual',...CS,face:'grin',layer:3});
  const team=[[3.6,.9,'short',SKINS[2]],[4.4,.1,'long',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`t-t${i}`,x as number,z as number,1.2,{shirt:'casual',hair:h as 'short',skin:sk as string,face:'grin',layer:3}));
  const first=B.stand(S.flipCard(K+'t-first',1.6,.3,'CANADA’S FIRST GOLD',INK.gold,INK.navy),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.2):b.t;
   C.body.s=beat(t,2.2,3);board.s=beat(t,5.8,6.6);nine.s=beat(t,9,9.8);cheer(C,beat(t,12.8,13.4)*(1-beat(t,19,19.6)));old.forEach((p,i)=>{p.body.s=beat(t,15.8+i*.4,16.6+i*.4);cheer(p,beat(t,17+i*.3,17.6+i*.3)*(1-beat(t,19,19.6)));});
   // Lift the gold medal.
   const raise=manual?beat(act,0,.6):beat(t,20.4,21.8);gold.dy=-.2+1.0*raise;pop(gold,Math.min(1,.2+raise*2));
   CR.body.s=Math.max(beat(t,19.6,20.4),manual?1:0);cheer(CR,raise);final.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.4,.8):0);pens.s=Math.max(beat(t,25,25.8),manual?beat(act,.5,.9):0);
   team.forEach((p,i)=>{p.body.s=Math.max(beat(t,26+i*.4,26.8+i*.4),manual?beat(act,.6,1):0);cheer(p,Math.max(beat(t,28+i*.3,28.6+i*.3),manual?beat(act,.8,1):0));});
   pop(conf,Math.max(beat(t,28,29.2),manual?beat(act,.6,1):0));fw.forEach((q,i)=>{pop(q,beat(t,28.4+i*.5,29.4+i*.5));q.rot=t*.2;});first.s=Math.max(beat(t,29,29.8),manual?beat(act,.9,1):0);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,19.4,20.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={family,debut,london,rio,record,tokyo};
