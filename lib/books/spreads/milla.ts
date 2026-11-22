/**
 * The six Roger Milla pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/milla/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is "never too old": a paper train, a scoreboard, a suitcase to an island, a telephone,
 * a swinging corner flag and a trophy. Kits are colour only (Cameroon green); no crests.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,cheer,pop,chalk,pitch,pitchLines,paving,caption,daySky,crowd,nightSky,lightRig,hills,roofs,sea,palms,road,backdrop,plates} from '../spreadKit';

const K='milla-';
const P=plates(K),{sp}=P;
const RM={skin:'#5b3a2a',hair:'short' as const,hairColor:'#1d1512'};
const CMR=[INK.green,INK.red,INK.yellow,INK.green];

/* ───────────── Milla-only plates ───────────── */
const train=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cars=3,cw=w/cars;for(let i=0;i<cars;i++){const x=i*cw,b=rect(x+.03,h*.2,cw-.06,h*.6);k.fill(b,[INK.red,INK.yellow,INK.green][i]);k.dots(b,INK.navy,.03,.2);k.key(b,.012);
  for(const wx of [x+cw*.25,x+cw*.75]){k.fill(ell(wx,h*.86,h*.13,h*.13),INK.navy);k.circle(wx,h*.86,h*.05,INK.grey,true);}
  if(i){k.fill(rect(x+cw*.2,h*.3,cw*.25,h*.2),INK.sky2);k.fill(rect(x+cw*.55,h*.3,cw*.25,h*.2),INK.sky2);}else{k.fill(rect(x+cw*.6,0,cw*.16,h*.22),INK.navy);k.fill(rect(x+cw*.1,h*.3,cw*.3,h*.24),INK.sky2);}}},{rim:.016});
const tracks=(k:Parameters<SpreadDef['left']>[0],x0:number,x1:number,y:number)=>{k.key(`M${x0} ${y-.08} L${x1} ${y-.08} M${x0} ${y+.08} L${x1} ${y+.08}`,.018,INK.brown);for(let x=x0+.1;x<x1;x+=.22)k.key(`M${x} ${y-.13} L${x} ${y+.13}`,.03,INK.wood);};
const phone=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.red);k.dots(b,INK.navy,.03,.2);k.key(b,.014);
 k.fill(`M${w*.16} ${h*.3} Q${w*.5} ${h*.1} ${w*.84} ${h*.3} L${w*.76} ${h*.42} Q${w*.5} ${h*.3} ${w*.24} ${h*.42} Z`,INK.navy);
 const d=ell(w/2,h*.64,w*.2,w*.2);k.fill(d,INK.white);k.key(d,.01);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.circle(w/2+Math.cos(a)*w*.13,h*.64+Math.sin(a)*w*.13,.025,INK.navy,true);}
 k.text('RING RING!',w/2,h*.95,h*.08,INK.white,{weight:900});},{rim:.016});
const bus=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h*.85} L0 ${h*.2} Q0 ${h*.06} ${w*.08} ${h*.06} L${w*.92} ${h*.06} Q${w} ${h*.06} ${w} ${h*.2} L${w} ${h*.85} Z`;k.fill(b,INK.green);k.dots(b,INK.navy,.03,.2);k.key(b,.014);
 for(let i=0;i<5;i++){const wdw=rect(w*(.06+i*.18),h*.16,w*.14,h*.26);k.fill(wdw,INK.sky2);k.key(wdw,.008);}k.fill(rect(0,h*.52,w,h*.1),INK.yellow);k.fill(rect(0,h*.62,w,h*.08),INK.red);
 k.text('CAMEROON',w/2,h*.8,h*.12,INK.white,{weight:900});for(const x of [w*.2,w*.8]){k.fill(ell(x,h*.88,h*.1,h*.1),INK.navy);k.circle(x,h*.88,h*.04,INK.grey,true);}},{rim:.016});
const subBoard=(key:string,s:number)=>sp(key,s*1.3,s,k=>{const b=rect(0,0,s*1.3,s*.8);k.fill(b,INK.night);k.key(b,.014);k.text('ON',s*.65,s*.36,s*.24,INK.grass,{weight:900});k.text('▲',s*.65,s*.66,s*.22,INK.grass);k.keyFill(rect(s*.6,s*.8,s*.1,s*.2),INK.grey);},{rim:.014});
const cornerFlag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.05,h),INK.white);const f=poly([[.05,0],[w,h*.12],[.05,h*.3]]);k.fill(f,INK.yellow);k.hatch(f,INK.red,.05,.6,.012);k.key(f,.012);},{rim:.01});

/* ───────────── 1 · Always on the move (railway) ───────────── */
const railway:SpreadDef={id:'railway',rest:20.9,
 left:k=>{paving(k,-5,0,'#e3cfa7','#b9a27a');caption(k,-2.5,'YAOUNDÉ · CAMEROON','BORN 1952 · HIS FATHER WORKED ON THE RAILWAYS',INK.green,INK.navy,.42);},
 right:k=>{pitch(k,0,5,'#c9b27a','#a98455',.8);tracks(k,.2,4.8,Z(-.9));caption(k,2.5,'DOUALA · BY THE SEA','NEW FRIENDS · NEW PLACES TO PLAY',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae62');roofs(k,.2,4.3,2.25,1);k.fill(rect(0,2.25,4.5,.75),'#e3cfa7');},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.5,.5);palms(k,4.5,2.2,5);k.fill(rect(0,2.2,4.5,.8),'#c9b27a');});
  const sun=bd.add(S.sun(K+'r-sun',.3),'L',3.7,2.1,{out:.012});
  const born=B.stand(S.flipCard(K+'r-born',1.3,.32,'BORN 1952',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const dad=B.person(K+'r-dad',-3.4,-.3,1.62,{shirt:'navy',hair:'cap',skin:RM.skin,adult:true,face:'smile',layer:2});
  const R=B.person(K+'r-r',-2.4,.6,.94,{shirt:'casual',...RM,face:'grin',layer:3});
  const mum=B.person(K+'r-mum',-1.4,-.2,1.56,{shirt:'casual',hair:'bun',hairColor:'#1d1512',skin:SKINS[4],adult:true,face:'smile',layer:2,holdR:'suitcase'});
  const doua=B.stand(S.sign(K+'r-doua',1.4,1.2,'TO DOUALA',INK.yellow),-1.0,-1.6,{layer:1,s:0});
  const eleven=B.stand(S.flipCard(K+'r-11',1.3,.32,'AGED 11',INK.sky,INK.navy),-2.4,1.95,{layer:3,s:0,tab:false});
  const again=B.stand(S.flipCard(K+'r-again',1.8,.32,'MOVING AGAIN AND AGAIN',INK.pink),-1.2,1.6,{layer:3,s:0,tab:false});
  B.slot(.6,-.9,4.4,-.9);
  const tr=B.stand(train(K+'r-train',1.8,.6),.9,-.9,{layer:2});
  const kids=[[1.4,.6,'curly'],[3.4,.5,'short'],[4.3,1.0,'bun']].map(([x,z,h],i)=>B.person(K+`r-k${i}`,x as number,z as number,.94,{shirt:(['bib','fan','casual'] as const)[i],hair:h as 'curly',hairColor:'#1d1512',skin:SKINS[(i+3)%5],face:'grin',layer:3}));
  const RR=B.person(K+'r-rr',2.4,.8,.96,{shirt:'casual',...RM,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'r-ball',.09),2.75,.95,{layer:3,tab:false});
  const found=B.stand(S.flipCard(K+'r-found',1.6,.32,'HE FOUND A GAME',INK.yellow,INK.navy),2.4,1.95,{layer:3,s:0,tab:false});
  const anyw=B.stand(S.flipCard(K+'r-any',1.6,.32,'WHEREVER HE COULD',INK.pink),4.2,1.6,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.9):b.t;
   sun.dy=.3*beat(t,0,2);born.s=beat(t,2.4,3.2);R.body.s=beat(t,2.8,3.6);dad.body.s=beat(t,7.4,8.2);mum.body.s=beat(t,12,12.8);doua.s=beat(t,12.6,13.4);eleven.s=beat(t,12.2,13);again.s=beat(t,17.2,18);
   // Pull the tab: the paper train rolls along its track.
   const pull=manual?beat(act,0,.6):beat(t,21.4,23.4);tr.x=.9+2.6*pull;
   kids.forEach((q,i)=>{q.body.s=Math.max(beat(t,23+i*.4,23.8+i*.4),manual?beat(act,.4,.8):0);});
   RR.body.s=Math.max(beat(t,27.2,28),manual?beat(act,.6,.9):0);const j=t>28&&t<32?Math.abs(Math.sin(t*3)):0;RR.leg!.rot=-.8*j;ball.dy=.2*j;ball.visible=RR.body.s>.4;
   found.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.7,1):0);anyw.s=Math.max(beat(t,29.8,30.6),manual?beat(act,.85,1):0);
   kids.forEach((q,i)=>cheer(q,Math.max(beat(t,32.2+i*.2,32.8+i*.2),manual?beat(act,.95,1):0)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,20.8,21.8):0;
  };
 }};

/* ───────────── 2 · Learning at home (home) ───────────── */
const home:SpreadDef={id:'home',rest:14.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'LÉOPARD DOUALA · TONNERRE YAOUNDÉ','LEAGUE TITLES AT HOME',INK.green,INK.navy,.34);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'1976','AFRICAN FOOTBALLER OF THE YEAR',INK.gold,INK.navy,.46);},
 build:B=>{
  const bd=backdrop(B,K+'h-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,CMR,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,CMR,4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const s1=B.stand(S.sign(K+'h-s1',1.4,1.1,'LÉOPARD DOUALA',INK.yellow),-4.0,-1.6,{layer:1,s:0});
  const s2=B.stand(S.sign(K+'h-s2',1.4,1.1,'TONNERRE YAOUNDÉ',INK.white),-1.2,-1.6,{layer:1,s:0});
  const R=B.person(K+'h-r',-3.6,.6,1.28,{shirt:'keeper',...RM,adult:true,legs:'kick',face:'grin',layer:3});
  const def=B.person(K+'h-d',-2.4,.0,1.24,{shirt:'ger',hair:'short',skin:SKINS[3],adult:true,face:'open',layer:2});
  B.stand(S.goal(K+'h-goal',1.5,.95),-1.1,-.7,{layer:1});
  const ball=B.stand(S.ball(K+'h-ball',.1),-3.3,.75,{layer:3,tab:false});
  const quick=B.stand(S.flipCard(K+'h-quick',1.7,.32,'QUICK · STRONG · TRICKS',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'h-board',2.0,1.6,'AFRICA’S BEST'),2.5,-1.4,{layer:1});
  board.add(P.lineCard('h-name',1.7,.7,['1976','ROGER MILLA'],INK.yellow),0,.4,{z:.012});
  const cover=board.flap(P.lineCard('h-cover',1.74,.74,['WHO WILL','IT BE?'],INK.sky),0,1.12,{z:.03});
  const star=B.stand(S.stars(K+'h-star',1.6,.5,5),2.5,-.2,{layer:2,s:0,tab:false});
  const RR=B.person(K+'h-rr',1.6,.6,1.3,{shirt:'keeper',...RM,adult:true,face:'grin',layer:3});
  const fans=[[3.4,.9,'curly'],[4.3,.4,'cap']].map(([x,z,h],i)=>B.person(K+`h-f${i}`,x as number,z as number,1.1,{shirt:i?'bib':'casual',hair:h as 'curly',skin:SKINS[(i+3)%5],face:'grin',layer:3}));
  const big=B.stand(S.flipCard(K+'h-big',1.8,.32,'ONE OF AFRICA’S BIGGEST PRIZES',INK.pink),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.4):b.t;
   s1.s=beat(t,2.2,3);s2.s=beat(t,5.6,6.4);R.body.s=beat(t,2.6,3.4);def.body.s=beat(t,3,3.8);
   const run=beat(t,10,12.6);R.body.x=-3.6+1.4*run;R.body.z=.6-.3*run;R.leg!.rot=-.7*Math.abs(Math.sin(run*Math.PI*3))-1.0*pulse(t,12.6,13.1);def.body.yaw=.7*beat(t,11,12);
   const shot=beat(t,12.8,13.6);const [bx,bz,by]=t<12.8?[R.body.x+.3,R.body.z+.15,0]:track(shot,[[0,-1.9,.45,0],[1,-1.1,-.6,.35]]);ball.x=bx;ball.z=bz;ball.dy=by;quick.s=beat(t,10.2,11);
   // Flip the scoreboard: Africa's best, 1976.
   const flip=manual?beat(act,0,.5):beat(t,15,16.2);cover.flip=-3.1*flip;
   star.s=Math.max(beat(t,16.8,17.6),manual?beat(act,.4,.8):0);RR.body.s=Math.max(beat(t,17,17.8),manual?beat(act,.4,.8):0);cheer(RR,Math.max(beat(t,18,18.6),manual?beat(act,.6,.9):0));
   fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,21.6+i*.4,22.4+i*.4),manual?beat(act,.6,1):0);cheer(f,Math.max(beat(t,22.4+i*.3,23+i*.3),manual?beat(act,.8,1):0));});
   big.s=Math.max(beat(t,21.8,22.6),manual?beat(act,.7,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,14.4,15.4):0;
  };
 }};

/* ───────────── 3 · Far from home (france) ───────────── */
const france:SpreadDef={id:'france',rest:19.6,
 left:k=>{paving(k,-5,0,'#d9d3c4','#a9a08c');caption(k,-2.5,'1977 · TO FRANCE','MONACO · SAINT-ÉTIENNE · MONTPELLIER',INK.blue,INK.navy,.42);},
 right:k=>{paving(k,0,5,'#ecd29a','#c9a96a');caption(k,2.5,'1989 · RÉUNION','AN ISLAND IN THE INDIAN OCEAN',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{daySky(k,4.5,3);sea(k,4.5,1.5,.5);roofs(k,.2,4.3,2.25,4);k.fill(rect(0,2.25,4.5,.75),'#d9d3c4');},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.3,1.0);k.fill(`M.8 2.3 Q1.6 1.5 2.4 1.7 Q3.2 1.5 3.8 2.3 Z`,'#7fae62');palms(k,4.5,2.3,4);k.fill(rect(0,2.3,4.5,.7),INK.sand);});
  const pl=bd.add(S.plane(K+'f-pl',.7,.35),'L',3.6,2.2,{out:.03});
  const R=B.person(K+'f-r',-3.8,.3,1.3,{shirt:'casual',...RM,adult:true,face:'smile',layer:3,holdR:'suitcase'});
  const clubs=['MONACO','SAINT-ÉTIENNE','MONTPELLIER'].map((c,i)=>B.stand(S.flipCard(K+`f-c${i}`,1.4,.32,c,[INK.red,INK.green,INK.blue][i]),-2.2+(i%2)*.6,-1.4+i*.55,{layer:1+Math.min(i,1),s:0,tab:false}));
  const bub=B.stand(S.bubble(K+'f-bub',.6,.5,'dots'),-3.3,-.7,{layer:2,s:0});
  const newL=B.stand(S.flipCard(K+'f-new',1.9,.32,'NEW LANGUAGE · NEW WEATHER',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const suit=B.stand(P.suitcase('f-case',1.3,.9,'RÉUNION',INK.red),1.4,.7,{layer:3});
  const lid=suit.flap(P.lineCard('f-lid',1.3,.72,['OPEN','ME'],INK.yellow),0,.9,{z:.03});
  const sign=B.stand(S.sign(K+'f-sign',1.5,1.2,'RÉUNION',INK.yellow),3.0,-1.5,{layer:1,s:0});
  const doubt=[[2.6,-.2],[3.4,-.4]].map(([x,z],i)=>B.person(K+`f-d${i}`,x,z,1.5,{shirt:i?'navy':'ger',hair:i?'bald':'short',skin:SKINS[i],adult:true,face:'open',layer:2}));
  const note=B.stand(S.noteCard(K+'f-note',1.1,.56,['BEST DAYS','BEHIND HIM?']),3.0,.7,{layer:2,s:0});
  const RR=B.person(K+'f-rr',4.1,.8,1.3,{shirt:'keeper',...RM,adult:true,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'f-ball',.1),3.75,.95,{layer:3,tab:false});
  const love=B.stand(S.flipCard(K+'f-love',1.6,.32,'STILL LOVED TO PLAY',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   R.body.s=beat(t,2,2.8);pl.dx=-2.6*beat(t,2.4,5);pop(pl,beat(t,2.2,2.6)*(1-beat(t,5,5.4)));
   clubs.forEach((c,i)=>{c.s=beat(t,8.6+i*1.4,9.4+i*1.4);});pop(bub,beat(t,14.2,15));newL.s=beat(t,14.6,15.4);
   // Open the suitcase: next stop, an island.
   const open=manual?beat(act,0,.5):beat(t,20.2,21.4);lid.flip=-2.6*open;
   sign.s=Math.max(beat(t,22.2,23),manual?beat(act,.3,.7):0);
   doubt.forEach((d,i)=>{d.body.s=Math.max(beat(t,28.4+i*.3,29.2+i*.3),manual?beat(act,.5,.8):0);});note.s=Math.max(beat(t,28.8,29.6),manual?beat(act,.55,.85):0)*(1-Math.max(beat(t,32,32.6),manual?beat(act,.85,.95):0));
   RR.body.s=Math.max(beat(t,31.9,32.6),manual?beat(act,.7,1):0);const j=t>32.6?Math.abs(Math.sin(t*3)):manual?Math.abs(Math.sin(act*9)):0;RR.leg!.rot=-.8*j;ball.dy=.24*j;ball.visible=RR.body.s>.4;
   love.s=Math.max(beat(t,32.2,33),manual?beat(act,.85,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,19.5,20.5):0;
  };
 }};

/* ───────────── 4 · A surprise call (call) ───────────── */
const call:SpreadDef={id:'call',rest:17.3,
 left:k=>{paving(k,-5,0,INK.sand,'#c9a96a');caption(k,-2.5,'1988 · HE STOPPED PLAYING FOR CAMEROON','THEN, BEFORE THE 1990 WORLD CUP …',INK.blue,INK.navy,.32);},
 right:k=>{paving(k,0,5,'#d9d3c4','#a9a08c');road(k,0,5,Z(.9));caption(k,2.5,'“YES!” · AGED 38','BRAVE, EVEN WHEN UNSURE',INK.green,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'c-bd',k=>{daySky(k,4.5,3);sea(k,4.5,1.4,.8);palms(k,4.5,2.2,5);k.fill(rect(0,2.2,4.5,.8),INK.sand);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.9,'#7fae62');roofs(k,.2,4.3,2.3,6);k.fill(rect(0,2.3,4.5,.7),'#d9d3c4');});
  const y88=B.stand(P.lineCard('c-88',1.3,.58,['1988','LAST GAME?'],'#c9b9d6'),-4.1,-1.3,{layer:1,s:0});
  const R=B.person(K+'c-r',-2.8,.5,1.3,{shirt:'casual',...RM,adult:true,legs:'kick',face:'smile',layer:3});
  const ball=B.stand(S.ball(K+'c-ball',.1),-2.45,.65,{layer:3,tab:false});
  const ask=B.stand(P.lineCard('c-ask',1.6,.62,['“PLEASE','COME BACK”'],INK.yellow),-1.3,-1.2,{layer:1,s:0});
  const quiet=B.stand(S.flipCard(K+'c-quiet',1.6,.32,'A QUIET ISLAND',INK.sky,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'c-post',2.2,1.3,INK.white),2.5,-1.1,{layer:1});
  post.add(bus(K+'c-bus',2.0,1.0),0,.15,{z:.012});
  const ph=post.flap(phone(K+'c-phone',2.1,1.2),0,1.27,{z:.03});
  const RR=B.person(K+'c-rr',1.4,.6,1.3,{shirt:'keeper',...RM,adult:true,face:'grin',layer:3});
  const yes=B.stand(S.flipCard(K+'c-yes',1.2,.32,'YES!',INK.yellow,INK.navy),1.4,1.95,{layer:3,s:0,tab:false});
  const age=B.stand(P.lineCard('c-38',1.1,.58,['AGED','38'],INK.pink,INK.white),4.2,.2,{layer:2,s:0});
  const legs=B.stand(S.flipCard(K+'c-legs',1.8,.32,'ARE MY LEGS READY?',INK.pink),3.5,1.95,{layer:3,s:0,tab:false});
  const bub=B.stand(S.bubble(K+'c-bub',.6,.5,'dots'),2.1,-.1,{layer:2,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.3):b.t;
   y88.s=beat(t,2.2,3);ask.s=beat(t,6.8,7.6);ph.rot=.04*Math.sin(t*30)*(t>6.4&&t<12&&!manual?1:0);
   R.body.s=beat(t,12.6,13.4);const j=t>13.4&&t<17.4?Math.abs(Math.sin(t*2.6)):0;R.leg!.rot=-.7*j;ball.dy=.2*j;ball.visible=R.body.s>.4;quiet.s=beat(t,13,13.8);
   // Lift the flap: the phone call, and the team bus behind it.
   const lift=manual?beat(act,0,.6):beat(t,17.8,19);ph.flip=-2.9*lift;
   RR.body.s=Math.max(beat(t,19.2,20),manual?beat(act,.4,.8):0);yes.s=Math.max(beat(t,19.4,20.2),manual?beat(act,.5,.85):0);cheer(RR,Math.max(beat(t,19.6,20.2),manual?beat(act,.5,.85):0)*(1-beat(t,25.6,26.4)));
   age.s=Math.max(beat(t,21.4,22.2),manual?beat(act,.65,.95):0);pop(bub,Math.max(beat(t,25.8,26.6),manual?beat(act,.75,1):0)*(1-beat(t,30,30.6)));legs.s=Math.max(beat(t,26,26.8),manual?beat(act,.8,1):0);
   cheer(RR,Math.max(beat(t,30.2,30.8),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.2,18.2):0;
  };
 }};

/* ───────────── 5 · Dancing at the corner flag (dance) ───────────── */
const dance:SpreadDef={id:'dance',rest:16.8,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'ITALIA 90 · ON AS A SUBSTITUTE','4 GOALS: 2 v ROMANIA, 2 v COLOMBIA',INK.green,INK.navy,.4);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)} M4.6 ${Z(-2.1)} Q4.5 ${Z(-1.75)} 4.8 ${Z(-1.75)}`);caption(k,2.5,'THE FIRST AFRICAN TEAM','IN A WORLD CUP QUARTER-FINAL',INK.green,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'d-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,CMR,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,CMR,5);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const bunt=bd.add(S.bunting(K+'d-bunt',3.8,.4,CMR),'R',.4,1.0,{out:.02});
  const board=B.stand(subBoard(K+'d-sub',.8),-4.2,-1.2,{layer:1,s:0});
  const R=B.person(K+'d-r',-3.6,.6,1.3,{shirt:'keeper',...RM,adult:true,legs:'kick',face:'grin',layer:3});
  B.stand(S.goal(K+'d-goal',1.6,1.0),-1.1,-1.3,{layer:1});
  const keep=B.person(K+'d-keep',-1.1,-1.0,1.2,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const ball=B.stand(S.ball(K+'d-ball',.1),-3.2,.7,{layer:3,tab:false});
  const tallyC=[['ROMANIA','2'],['COLOMBIA','2']].map(([c,n],i)=>B.stand(P.lineCard(`d-t${i}`,1.2,.58,[`v ${c}`,`${n} GOALS`],[INK.yellow,INK.sky][i]),-2.9+i*1.5,-1.6,{layer:1,s:0}));
  const four=B.stand(S.flipCard(K+'d-4',1.3,.32,'4 GOALS!',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const flagB=B.stand(S.post(K+'d-fb',.08,.3,INK.white),4.4,-1.4,{layer:1,tab:false});
  const flag=flagB.arm(cornerFlag(K+'d-flag',.6,1.4),0,.05,{z:.03});
  const RR=B.person(K+'d-rr',3.4,-.6,1.32,{shirt:'keeper',...RM,adult:true,face:'grin',layer:2});
  const fans=[[1.2,.9,'curly'],[2.2,.6,'bun'],[3.3,1.0,'short']].map(([x,z,h],i)=>B.person(K+`d-f${i}`,x as number,z as number,1.05,{shirt:(['casual','bib','fan'] as const)[i],hair:h as 'curly',hairColor:'#1d1512',skin:SKINS[(i*2+1)%5],face:'grin',layer:3}));
  const qf=B.stand(S.flipCard(K+'d-qf',1.6,.32,'QUARTER-FINAL!',INK.pink),1.8,1.95,{layer:3,s:0,tab:false});
  const copy=B.stand(S.flipCard(K+'d-copy',1.6,.32,'EVERYONE DANCES',INK.yellow,INK.navy),4.0,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.8):b.t;
   board.s=beat(t,2.6,3.4)*(1-beat(t,6,6.6));R.body.s=beat(t,3.4,4.2);keep.body.s=beat(t,3,3.8);
   // Four goals: four quick shots.
   const shots=[6.6,8.0,9.4,10.8];const cur=shots.reduce((a,s,i)=>t>=s?i:a,-1);const sk=cur<0?0:beat(t,shots[cur],shots[cur]+.6);
   const [bx,bz,by]=cur<0?[-3.2,.7,0]:track(sk,[[0,-3.2,.7,0],[1,-1.0+((cur%2)-.5)*.6,-1.2,.4]]);ball.x=bx;ball.z=bz;ball.dy=by;R.leg!.rot=-1.0*maxPulse(t,shots);keep.body.rot=(cur%2?.5:-.5)*sk;
   tallyC.forEach((c,i)=>{c.s=beat(t,7.4+i*2.8,8.2+i*2.8);});four.s=beat(t,11.6,12.4);
   const toFlag=beat(t,12.8,15);RR.body.s=Math.max(toFlag>0?1:0,manual?1:0);RR.body.visible=toFlag>.01||manual;
   RR.body.x=1.6+1.8*(manual?1:toFlag);RR.body.z=.4-1.0*(manual?1:toFlag);
   // Swing the corner flag, and dance!
   const sw=manual?beat(act,0,.3):beat(t,17.4,18.2);const wag=Math.sin((manual?act*14:t*5))*sw;flag.rot=.5*wag;
   const dz=Math.max(beat(t,17.6,18.4),manual?beat(act,.1,.4):0);RR.body.rot=.12*Math.sin(t*6)*dz;RR.armL.rot=-.6-.9*dz*(.5+.5*Math.sin(t*6));RR.armR.rot=.6+.9*dz*(.5-.5*Math.sin(t*6));
   pop(bunt,Math.max(beat(t,19.4,20.4),manual?beat(act,.5,.9):0));qf.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.5,.9):0);
   fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,25+i*.3,25.8+i*.3),manual?beat(act,.7,1):0);const d=Math.max(beat(t,25.8,26.4),manual?beat(act,.8,1):0);f.body.rot=.12*Math.sin(t*6+i)*d;f.armL.rot=-.6-.8*d;f.armR.rot=.6+.8*d;});
   copy.s=Math.max(beat(t,25.4,26.2),manual?beat(act,.8,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16.8,17.8):0;
  };
 }};
const maxPulse=(t:number,starts:number[])=>starts.reduce((a,s)=>Math.max(a,pulse(t,s-.3,s+.2)),0);

/* ───────────── 6 · The oldest goalscorer (oldest) ───────────── */
const oldest:SpreadDef={id:'oldest',rest:18.3,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1994 WORLD CUP · USA','A GOAL v RUSSIA · AGED 42',INK.green,INK.navy,.42);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'NEVER TOO OLD','AFRICAN FOOTBALLER OF THE YEAR 1976 · 1990',INK.gold,INK.navy,.44);},
 build:B=>{
  const bd=backdrop(B,K+'o-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,CMR,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,CMR,3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const conf=bd.add(S.confetti(K+'o-conf',3.6,1.4,5),'R',.4,1.1,{out:.04});
  const sun=bd.add(S.sun(K+'o-sun',.3),'L',3.8,2.2,{out:.012});
  B.stand(S.goal(K+'o-goal',1.6,1.0),-1.1,-1.3,{layer:1});
  const keep=B.person(K+'o-keep',-1.1,-1.0,1.2,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const R=B.person(K+'o-r',-3.2,.5,1.3,{shirt:'keeper',...RM,adult:true,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'o-ball',.1),-2.85,.65,{layer:3,tab:false});
  const n42=B.stand(S.noteCard(K+'o-42',.9,.7,['AGED','42']),-4.2,-1.0,{layer:2,s:0});
  const oldestC=B.stand(S.flipCard(K+'o-old',1.8,.32,'OLDEST WORLD CUP SCORER',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const amazed=B.stand(S.bubble(K+'o-wow',.7,.55,'star'),-2.0,-.6,{layer:2,s:0});
  const pole=B.stand(S.post(K+'o-pole',.14,1.3,INK.stock),2.5,.5,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'o-cup',.6,.8),0,.3,{z:.03});
  const RR=B.person(K+'o-rr',2.9,.2,1.32,{shirt:'keeper',...RM,adult:true,face:'grin',layer:2});
  const c90=B.stand(P.lineCard('o-90',1.5,.62,['1990','AFRICA’S BEST AGAIN'],INK.yellow),1.2,-1.4,{layer:1,s:0});
  const c07=B.stand(P.lineCard('o-07',1.6,.62,['2007 · BEST OF','THE PAST 50 YEARS'],INK.sky),3.8,-1.4,{layer:1,s:0});
  const never=B.stand(S.flipCard(K+'o-never',1.6,.32,'NEVER TOO OLD!',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.3):b.t;
   sun.dy=.3*beat(t,0,2);R.body.s=beat(t,2.4,3.2);keep.body.s=beat(t,2.8,3.6);
   R.leg!.rot=-1.1*pulse(t,6.4,7);const k=beat(t,6.6,7.6);const [bx,bz,by]=track(k,[[0,-2.85,.65,0],[1,-.8,-1.2,.45]]);ball.x=bx;ball.z=bz;ball.dy=by;keep.body.rot=-.5*k;cheer(R,beat(t,7.6,8.2));
   n42.s=beat(t,9.8,10.6);oldestC.s=beat(t,10.4,11.2);pop(amazed,beat(t,14.4,15.2));
   // Raise the trophy: never too old.
   const raise=manual?beat(act,0,.6):beat(t,18.8,20.2);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));RR.body.s=Math.max(beat(t,18.6,19.4),manual?1:0);cheer(RR,raise);
   c90.s=Math.max(beat(t,20.8,21.6),manual?beat(act,.4,.8):0);c07.s=Math.max(beat(t,26,26.8),manual?beat(act,.6,.9):0);
   pop(conf,Math.max(beat(t,20,21.2),manual?beat(act,.5,.9):0));never.s=Math.max(beat(t,31.8,32.6),manual?beat(act,.85,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18.2,19.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={railway,home,france,call,dance,oldest};
