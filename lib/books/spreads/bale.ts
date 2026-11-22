/**
 * The six Gareth Bale pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/bale/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is that bad runs end: a six-a-side kick, three right-foot taps, a shirt, a lifted rain cloud,
 * a scoreboard that moves him to the wing, and a banner for Wales. Kits are colour only; no crests.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,dash,pitch,pitchLines,paving,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,skyline,backdrop,plates} from '../spreadKit';

const K='bale-';
const P=plates(K),{sp}=P;
const GB={skin:'#f1b88f',hair:'short' as const,hairColor:'#5a3a22'};
const WAL=[INK.red,INK.white,INK.green,INK.red];
const SPURS=[INK.white,INK.navy,INK.white,'#8f95ad'];

/* ───────────── Bale-only plates ───────────── */
const shirtPlate=(key:string,w:number,h:number,c:string,label:string,ink:string=INK.white)=>sp(key,w,h,k=>{const p=poly([[w*.2,0],[w*.8,0],[w,h*.22],[w*.86,h*.36],[w*.78,h*.3],[w*.78,h],[w*.22,h],[w*.22,h*.3],[w*.14,h*.36],[0,h*.22]]);k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.013);k.text(label,w/2,h*.66,h*.16,ink,{weight:900,max:w*.5});},{rim:.014});
const cage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(rect(.02,.02,w-.04,h-.04),.03,INK.grey);for(let x=.1;x<w;x+=.12)k.key(`M${x} .02 L${x} ${h-.02}`,.008,'#8f95ad');for(let y=.1;y<h;y+=.12)k.key(`M.02 ${y} L${w-.02} ${y}`,.008,'#8f95ad');},{rim:0,grain:.4});
const ruleCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.navy,.035,.1);k.key(b,.014);k.text('SPECIAL RULES',w/2,h*.2,h*.12,INK.pink,{weight:900});
 k.fill(ell(w*.27,h*.6,h*.2,h*.2),INK.yellow);k.key(ell(w*.27,h*.6,h*.2,h*.2),.01);k.text('1',w*.27,h*.68,h*.22,INK.navy,{weight:900});k.text('TOUCH',w*.27,h*.94,h*.09,INK.navy,{weight:900});
 const bx=w*.73,by=h*.6;k.fill(`M${bx-.16} ${by-.06} L${bx+.02} ${by-.06} L${bx+.04} ${by+.06} L${bx+.16} ${by+.08} L${bx+.16} ${by+.14} L${bx-.16} ${by+.14} Z`,INK.navy);k.key(`M${bx-.2} ${by-.18} L${bx+.2} ${by+.22} M${bx+.2} ${by-.18} L${bx-.2} ${by+.22}`,.03,INK.red);k.text('NO LEFT FOOT',bx,h*.94,h*.09,INK.navy,{weight:900});},{rim:.016});
const tallyBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.night);k.key(b,.014);k.text('GAMES',w*.28,h*.3,h*.13,INK.white,{weight:900});k.text('WINS',w*.72,h*.3,h*.13,INK.white,{weight:900});
 k.text('24',w*.28,h*.78,h*.38,INK.yellow,{weight:900});k.text('0',w*.72,h*.78,h*.38,INK.pink,{weight:900});k.key(`M${w/2} ${h*.15} L${w/2} ${h*.9}`,.01,INK.grey);},{rim:.014});
const cups=(key:string,w:number,h:number,n:number)=>sp(key,w,h,k=>{for(let i=0;i<n;i++){const x=w*(.1+i*.2);k.fill(`M${x-.1} ${h*.15} L${x+.1} ${h*.15} Q${x+.1} ${h*.6} ${x} ${h*.62} Q${x-.1} ${h*.6} ${x-.1} ${h*.15} Z`,INK.gold);k.key(`M${x-.1} ${h*.15} L${x+.1} ${h*.15} Q${x+.1} ${h*.6} ${x} ${h*.62} Q${x-.1} ${h*.6} ${x-.1} ${h*.15} Z`,.01);k.fill(rect(x-.02,h*.62,.04,h*.15),INK.gold);k.fill(rect(x-.07,h*.77,.14,h*.08),INK.brown)}},{rim:.012});

/* ───────────── 1 · Spotted at six-a-side (cardiff) ───────────── */
const cardiff:SpreadDef={id:'cardiff',rest:18.2,
 left:k=>{paving(k,-5,0,'#c9cbd8','#8f95ad');caption(k,-2.5,'CARDIFF · WALES','BORN 1989 · SIX-A-SIDE AT CARDIFF CIVIL SERVICE',INK.red,INK.navy,.42);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'AGED 9 · SPOTTED!','SOUTHAMPTON INVITED HIM TO TRAIN',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'c-bd',k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.2,3);k.fill(rect(0,2.2,4.5,.8),'#c9cbd8');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae62');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'c-sun',.3),'R',3.7,2.1,{out:.012});
  B.stand(cage(K+'c-cage',4.0,1.1),-2.5,-1.5,{layer:1,tab:false});
  const born=B.stand(S.flipCard(K+'c-born',1.3,.32,'BORN 1989',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const kids=[[-3.8,.0,'curly'],[-1.2,.2,'short'],[-2.2,-.6,'bun']].map(([x,z,h],i)=>B.person(K+`c-k${i}`,x as number,z as number,.92,{shirt:i===1?'bib':'fan',hair:h as 'curly',skin:SKINS[i*2%5],face:'grin',layer:2}));
  const G=B.person(K+'c-g',-3.2,.7,.94,{shirt:'casual',...GB,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'c-ball',.09),-2.9,.85,{layer:3,tab:false});
  const scouts=[[-.6,-1.6],[-.2,-1.1]].map(([x,z],i)=>B.person(K+`c-s${i}`,x,z,1.58,{shirt:'navy',hair:i?'bald':'cap',skin:SKINS[i],adult:true,face:'open',layer:1}));
  const note=scouts[1].body.add(S.noteCard(K+'c-note',.6,.42,['QUICK!','']),.34,scouts[1].h*.6,{z:.03});
  const run=B.stand(S.flipCard(K+'c-run',1.6,.32,'LOVES TO RUN WITH IT',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const GR=B.person(K+'c-gr',1.0,.5,.96,{shirt:'casual',...GB,legs:'kick',face:'grin',layer:3});
  B.slot(1.35,.6,4.0,-.6);
  const ballR=B.stand(S.ball(K+'c-ballR',.09),1.35,.6,{layer:3,tab:false});
  B.stand(S.goal(K+'c-goal',1.0,.7),4.2,-.9,{layer:1,yaw:-1.0});
  const inv=B.stand(S.sign(K+'c-inv',1.6,1.2,'COME AND TRAIN!',INK.yellow),2.4,-1.6,{layer:1,s:0});
  const journey=B.stand(S.arrow(K+'c-arrow',1.4,.5),2.6,.3,{layer:2,s:0,tab:false});
  const school=B.stand(S.flipCard(K+'c-school',1.8,.32,'A SCHOOLBOY WHO TRAINED',INK.sky,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.2):b.t;
   sun.dy=.3*beat(t,0,2);born.s=beat(t,2.6,3.4);kids.forEach((q,i)=>{q.body.s=beat(t,7.2+i*.3,8+i*.3);});G.body.s=beat(t,7.6,8.4);
   scouts.forEach((q,i)=>{q.body.s=beat(t,10+i*.4,10.8+i*.4);});pop(note,beat(t,15.4,16.2));
   const r=t>15.2?((t-15.2)*.3)%1:0;const [gx,gz]=track(r,[[0,-3.2,.7],[.5,-1.4,.6],[1,-3.2,.7]]);G.body.x=gx;G.body.z=gz;G.leg!.rot=-.6*Math.abs(Math.sin(t*5))*(t>15.2?1:0);ball.x=gx+.3;ball.z=gz+.15;run.s=beat(t,15.6,16.4);
   // Kick the ball: along the slot into the little goal.
   const k=manual?beat(act,0,.6):beat(t,18.9,20);GR.leg!.rot=-1.1*(manual?pulse(act,0,.25):pulse(t,18.6,19.2));const [bx,bz,by]=track(k,[[0,1.35,.6,0],[1,4.0,-.6,.2]]);ballR.x=bx;ballR.z=bz;ballR.dy=by;
   inv.s=Math.max(beat(t,20.4,21.2),manual?beat(act,.5,.8):0);cheer(GR,Math.max(beat(t,20.6,21.2),manual?beat(act,.6,.9):0));
   journey.s=Math.max(beat(t,24,24.8),manual?beat(act,.7,1):0);school.s=Math.max(beat(t,26.8,27.6),manual?beat(act,.85,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18.1,19.1):0;
  };
 }};

/* ───────────── 2 · Special rules (rules) ───────────── */
const rules:SpreadDef={id:'rules',rest:18.4,
 left:k=>{paving(k,-5,0,'#d9d3c4','#a9a08c');dash(k,-4.6,Z(.2),-.4,Z(.2),.03,INK.yellow);caption(k,-2.5,'SCHOOL FOOTBALL','HIS PE TEACHER, GWYN MORRIS',INK.red,INK.navy,.42);},
 right:k=>{paving(k,0,5,'#d9d3c4','#a9a08c');dash(k,.4,Z(.2),4.6,Z(.2),.03,INK.yellow);caption(k,2.5,'ONE TOUCH · RIGHT FOOT','FAIR FOR EVERYONE · NEW SKILLS',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);const sch=rect(.4,.9,3.6,1.4);k.fill(sch,'#d98a6a');k.dots(sch,INK.navy,.03,.2);k.key(sch,.014);for(let i=0;i<6;i++)k.fill(rect(.6+i*.58,1.15,.36,.4),INK.sky2);k.fill(rect(0,2.3,4.5,.7),'#d9d3c4');},
   k=>{daySky(k,4.5,3);k.fill(rect(0,2.0,4.5,.3),INK.grey);k.fill(rect(0,2.3,4.5,.7),'#d9d3c4');});
  const T=B.person(K+'r-t',-3.4,-.2,1.64,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const card=B.stand(ruleCard(K+'r-card',1.6,1.1),-1.6,-1.3,{layer:1,s:0});
  const G=B.person(K+'r-g',-2.4,.7,1.0,{shirt:'casual',...GB,face:'open',layer:3});
  const fair=B.stand(S.flipCard(K+'r-fair',1.8,.32,'FAIRER FOR THE OTHERS',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const GR=B.person(K+'r-gr',1.2,.5,1.0,{shirt:'casual',...GB,legs:'kick',face:'grin',layer:3});
  const mates=[[2.6,-.5,'curly'],[3.6,.4,'bun'],[4.4,-.3,'short']].map(([x,z,h],i)=>B.person(K+`r-m${i}`,x as number,z as number,.98,{shirt:(['bib','fan','bib'] as const)[i],hair:h as 'curly',skin:SKINS[(i*2+1)%5],face:'grin',layer:2}));
  const ball=B.stand(S.ball(K+'r-ball',.09),1.55,.6,{layer:3,tab:false});
  const taps=[0,1,2].map(i=>B.stand(S.flipCard(K+`r-tap${i}`,.8,.3,['ONE','TOUCH','PASS!'][i],[INK.yellow,INK.sky,INK.pink][i],i===2?INK.white:INK.navy),1.6+i*1.1,1.95,{layer:3,s:0,tab:false}));
  const skills=B.stand(S.flipCard(K+'r-sk',1.6,.32,'NEW SKILLS!',INK.yellow,INK.navy),3.8,1.6,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.4):b.t;
   T.body.s=beat(t,2,2.8);G.body.s=beat(t,2.4,3.2);card.s=beat(t,8.8,9.6);T.armR.rot=.12+1.1*beat(t,9,9.8)*(1-beat(t,14,15));fair.s=beat(t,15.4,16.2);
   mates.forEach((m,i)=>{m.body.s=beat(t,15.6+i*.3,16.4+i*.3);});GR.body.s=beat(t,15.4,16.2);
   // Tap the ball three times: one touch each, right foot, to a different friend.
   const tapT=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,19+i*.7,19.5+i*.7));
   const cur=tapT.reduce((a,v,i)=>v>0?i:a,-1);const v=cur<0?0:tapT[cur];const tgt=mates[Math.max(0,cur)];
   const from:[number,number]=cur<=0?[1.55,.6]:[mates[cur-1].body.x,mates[cur-1].body.z+.1];
   ball.x=from[0]+(tgt.body.x-from[0])*v;ball.z=from[1]+(tgt.body.z+.1-from[1])*v;ball.dy=.15*Math.sin(v*Math.PI);
   GR.leg!.rot=-1.0*maxOf([0,1,2].map(i=>manual?pulse(act,i/3,(i+.4)/3):pulse(t,18.9+i*.7,19.3+i*.7)));
   taps.forEach((q,i)=>{q.s=tapT[i];});skills.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.9,1):0);
   const c=Math.max(beat(t,27,27.6),manual?beat(act,.95,1):0);cheer(GR,c);mates.forEach(m=>cheer(m,c*.8));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18.3,19.3):0;
  };
 }};

/* ───────────── 3 · The youngest for Wales (young) ───────────── */
const young:SpreadDef={id:'young',rest:20.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'2006 · AGED 16','FIRST GAME FOR SOUTHAMPTON · YOUNGEST FOR WALES',INK.red,INK.navy,.42);},
 right:k=>{paving(k,0,5,'#d9d3c4','#a9a08c');caption(k,2.5,'2007 · TOTTENHAM, LONDON','A BIG NEW CITY · A BIG NEW CLUB',INK.navy,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'y-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,WAL,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);skyline(k,4.5,2.2);k.fill(rect(0,2.2,4.5,.8),'#d9d3c4');});
  const G=B.person(K+'y-g',-3.6,.6,1.22,{shirt:'casual',...GB,legs:'kick',face:'grin',layer:3});
  const april=B.stand(P.lineCard('y-apr',1.4,.58,['APRIL 2006','FIRST GAME'],INK.yellow),-4.1,-1.4,{layer:1,s:0});
  const youngest=B.stand(P.lineCard('y-16',1.6,.62,['YOUNGEST FOR WALES','16 YEARS 315 DAYS'],INK.pink,INK.white),-1.4,-1.4,{layer:1,s:0});
  const GW=B.person(K+'y-gw',-2.0,.2,1.22,{shirt:'coach',...GB,legs:'kick',face:'grin',layer:2});
  const lb=B.stand(S.flipCard(K+'y-lb',1.6,.32,'LEFT-BACK: UP AND DOWN',INK.sky,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'y-post',1.4,1.5,INK.white),1.4,-1.0,{layer:1});
  post.add(shirtPlate(K+'y-spurs',1.1,1.1,INK.white,'LONDON',INK.navy),0,.3,{z:.012});
  const fl=post.flap(shirtPlate(K+'y-saints',1.1,1.1,INK.red,'2006'),0,1.42,{z:.03});
  const GR=B.person(K+'y-gr',2.8,.5,1.26,{shirt:'ger',...GB,adult:true,face:'grin',layer:3,holdR:'suitcase'});
  const bus=B.stand(S.cityBlock(K+'y-city',1.4,1.4),4.2,-1.4,{layer:1,s:0});
  const big=B.stand(S.flipCard(K+'y-big',1.8,.32,'BIG CITY · BIG CLUB',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.4):b.t;
   G.body.s=beat(t,2.4,3.2);april.s=beat(t,3,3.8);youngest.s=beat(t,10.4,11.2);GW.body.s=beat(t,9.6,10.4);G.body.s*=1-beat(t,9.2,9.8);
   const up=t>17.2?Math.sin((t-17.2)*1.4):0;GW.body.x=-2.0-1.6*(up*.5+.5)*(t>17.2?1:0);GW.leg!.rot=-.6*Math.abs(Math.sin(t*5))*(t>17.2?1:0);lb.s=beat(t,17.4,18.2);
   // Flip the shirt: Southampton red over to Tottenham white.
   const flip=manual?beat(act,0,.5):beat(t,21,22.2);fl.flip=-3.1*flip;
   GR.body.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.4,.8):0);bus.s=Math.max(beat(t,23.2,24),manual?beat(act,.5,.9):0);
   big.s=Math.max(beat(t,27.4,28.2),manual?beat(act,.8,1):0);cheer(GR,Math.max(beat(t,32.2,32.8),manual?beat(act,.95,1):0)*.6);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,20.4,21.4):0;
  };
 }};

/* ───────────── 4 · The unlucky run (jinx) ───────────── */
const jinx:SpreadDef={id:'jinx',rest:20.1,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'TOTTENHAM · 2007 TO 2009','24 PREMIER LEAGUE GAMES · NO WINS',INK.navy,INK.navy,.42);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'NOT HIS FAULT','HE KEPT TRAINING · HE KEPT PLAYING',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'j-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);crowd(k,4.5,1.2,2.45,SPURS,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#9dbd78');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const drops=bd.add(S.drops(K+'j-drops',3.6,1.0),'L',.4,1.9,{out:.02});
  const sun=bd.add(S.sun(K+'j-sun',.3),'R',3.6,2.0,{out:.012});
  const board=B.stand(tallyBoard(K+'j-tally',1.6,1.0),-2.5,-1.5,{layer:1,s:0});
  const G=B.person(K+'j-g',-2.5,.5,1.26,{shirt:'ger',...GB,adult:true,face:'sad',layer:3});
  const talk=[[-4.2,-.2],[-.8,-.3]].map(([x,z],i)=>B.person(K+`j-p${i}`,x,z,1.5,{shirt:i?'casual':'fan',hair:i?'bun':'cap',skin:SKINS[i*2],adult:true,face:'open',layer:2}));
  const notes=talk.map((p,i)=>p.body.add(S.noteCard(K+`j-n${i}`,.62,.42,['UN-','LUCKY?']),i?-.34:.34,p.h*.62,{z:.03}));
  const fault=B.stand(S.flipCard(K+'j-fault',1.6,.32,'NOT HIS FAULT',INK.sky,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const cloud=bd.add(P.rainCloud('j-cloud',2.2,1.1),'R',1.2,.9,{out:.05});
  const GR=B.person(K+'j-gr',2.2,.3,1.26,{shirt:'ger',...GB,adult:true,legs:'kick',face:'grin',layer:2});
  const cones=[0,1,2].map(i=>B.stand(S.cone(K+'j-cone',.3),1.2+i*.8,-.9+(i%2)*.3,{layer:1}));void cones;
  const ball=B.stand(S.ball(K+'j-ball',.1),2.55,.45,{layer:3,tab:false});
  const keep=B.stand(S.flipCard(K+'j-keep',1.4,.32,'KEEP GOING',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  const hard=B.stand(S.flipCard(K+'j-hard',1.6,.32,'IT IS HARD',INK.pink),4.1,1.6,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.1):b.t;
   pop(drops,beat(t,1.8,3));G.body.s=beat(t,2,2.8);board.s=beat(t,5.4,6.2);
   talk.forEach((p,i)=>{p.body.s=beat(t,11.2+i*.4,12+i*.4);});notes.forEach((n,i)=>pop(n,beat(t,12+i*.4,12.8+i*.4)));fault.s=beat(t,16.6,17.4);G.body.lean=.1*beat(t,12,13);
   // Lift the rain cloud: behind it, he is still training.
   const lift=manual?beat(act,0,.6):beat(t,20.6,21.8);pop(cloud,beat(t,16.6,17.6)*(1-beat(lift,.7,1)));cloud.dy=1.0*lift;GR.body.s=Math.max(beat(t,20.8,21.6),manual?beat(act,.3,.6):0);
   hard.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.4,.7):0);
   const dr=t>26&&t<32?Math.abs(Math.sin(t*2.4)):manual?Math.abs(Math.sin(act*8)):0;GR.leg!.rot=-.8*dr;ball.x=2.55+.4*dr;ball.dy=.1*dr;
   keep.s=Math.max(beat(t,26,26.8),manual?beat(act,.7,1):0);cheer(GR,Math.max(beat(t,29.4,30),manual?beat(act,.95,1):0)*.6);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,20,21):0;
  };
 }};

/* ───────────── 5 · The run is over (burnley) ───────────── */
const burnley:SpreadDef={id:'burnley',rest:16.3,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'SEPTEMBER 2009 · v BURNLEY','ON AS A SUBSTITUTE · TOTTENHAM WIN 5–0',INK.navy,INK.navy,.42);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M.3 ${Z(.9)} L4.7 ${Z(.9)}`);caption(k,2.5,'FROM LEFT-BACK TO THE WING','PLAYER OF THE YEAR 2011 · 2013',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,SPURS,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,SPURS,5);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const conf=bd.add(S.confetti(K+'b-conf',3.6,1.4,2),'L',.4,1.1,{out:.04});
  const sb=B.stand(S.scoreboard(K+'b-sb',1.6,1.3,'FULL TIME'),-4.0,-1.6,{layer:1,s:0});sb.add(S.scoreFlap(K+'b-sf',1.3,.6,'TOT','5–0','BUR'),0,.36,{z:.012});
  const G=B.person(K+'b-g',-2.5,.4,1.26,{shirt:'ger',...GB,adult:true,face:'grin',layer:2});
  const mates=[[-3.8,.9,'curly'],[-1.2,.9,'bald']].map(([x,z,h],i)=>B.person(K+`b-m${i}`,x as number,z as number,1.24,{shirt:'ger',hair:h as 'curly',skin:SKINS[i*3],adult:true,face:'grin',layer:3}));
  const over=B.stand(S.flipCard(K+'b-over',1.7,.32,'AT LAST, IT IS OVER!',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const sub=B.stand(S.flipCard(K+'b-sub',1.6,.32,'NEAR THE END: ON!',INK.sky,INK.navy),-1.2,-1.4,{layer:1,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'b-board',1.8,1.4,'NEW POSITION'),1.2,-1.5,{layer:1});
  board.add(P.lineCard('b-wing',1.5,.6,['THE WING'],INK.yellow),0,.38,{z:.012});
  const cover=board.flap(P.lineCard('b-lb',1.54,.64,['LEFT-BACK'],INK.sky),0,1.0,{z:.03});
  const GR=B.person(K+'b-gr',2.4,.9,1.28,{shirt:'ger',...GB,adult:true,legs:'kick',face:'grin',layer:3});
  const arrow=B.stand(S.arrow(K+'b-arrow',1.2,.42),3.2,.2,{layer:2,s:0,tab:false,yaw:-.3});
  const poty=B.stand(P.lineCard('b-poty',1.6,.62,['PLAYER OF THE YEAR','2011 · 2013'],INK.pink,INK.white),3.9,-1.3,{layer:1,s:0});
  const shine=B.stand(S.flipCard(K+'b-shine',1.6,.32,'A SMALL CHANGE',INK.pink),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.3):b.t;
   sub.s=beat(t,2.2,3)*(1-beat(t,8.6,9.2));G.body.s=beat(t,4,4.8);sb.s=beat(t,9.2,10);mates.forEach((m,i)=>{m.body.s=beat(t,9.6+i*.4,10.4+i*.4);});
   over.s=beat(t,11.6,12.4);pop(conf,beat(t,11.6,12.8));cheer(G,beat(t,11.8,12.4));
   const hug=beat(t,14,15);mates.forEach((m,i)=>{m.body.x=[-3.8,-1.2][i]+(i?-.5:.5)*hug;m.armL.rot=-.12-1.1*hug;m.armR.rot=.12+1.1*hug;});
   // Flip the scoreboard: left-back becomes the wing.
   const flip=manual?beat(act,0,.5):beat(t,17,18.2);cover.flip=-3.1*flip;
   const mv=Math.max(beat(t,18.8,21.4),manual?beat(act,.3,.8):0);GR.body.z=.9-2.0*mv;GR.body.x=2.4+1.2*mv;GR.leg!.rot=-.6*Math.abs(Math.sin(t*5))*(mv>0&&mv<1?1:0);arrow.s=Math.max(beat(t,18.8,19.6),manual?beat(act,.3,.6):0)*(1-beat(mv,.9,1));
   poty.s=Math.max(beat(t,26.4,27.2),manual?beat(act,.75,1):0);shine.s=Math.max(beat(t,32.6,33.4),manual?beat(act,.9,1):0);cheer(GR,Math.max(beat(t,26.8,27.4),manual?beat(act,.85,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16.2,17.2):0;
  };
 }};

/* ───────────── 6 · A hero for Wales (wales) ───────────── */
const wales:SpreadDef={id:'wales',rest:19.0,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'REAL MADRID · 2013','5 CHAMPIONS LEAGUES · EURO 2016 SEMI-FINAL',INK.yellow,INK.white,.4);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);caption(k,2.5,'WALES AT THE WORLD CUP','2022 · THE FIRST TIME SINCE 1958',INK.yellow,INK.white,.42);},
 build:B=>{
  const bd=backdrop(B,K+'w-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.white,INK.gold,INK.white,'#8f95ad'],1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,WAL,4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'w-fw1',.42,INK.red),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'w-fw2',.38,INK.green),'R',3.4,2.0,{out:.03})];
  const G=B.person(K+'w-g',-2.6,.4,1.3,{shirt:'ger',...GB,adult:true,legs:'kick',face:'grin',layer:3});
  const fee=B.stand(P.lineCard('w-fee',1.5,.6,['A WORLD-RECORD','FEE'],INK.yellow),-4.1,-1.4,{layer:1,s:0});
  const five=B.stand(cups(K+'w-cups',1.6,.7,5),-1.5,-1.4,{layer:1,s:0,tab:false});
  const semi=B.stand(S.flipCard(K+'w-semi',1.6,.32,'EURO 2016 SEMI-FINAL',INK.pink),-3.8,1.95,{layer:3,s:0,tab:false});
  const finals=B.stand(S.flipCard(K+'w-fin',1.7,.32,'BIG GOALS IN BIG FINALS',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const pL=B.stand(S.post(K+'w-pl',.1,1.9,INK.wood),1.0,-1.2,{layer:1,tab:false}),pR=B.stand(S.post(K+'w-pr',.1,1.9,INK.wood),4.0,-1.2,{layer:1,tab:false});void pL;void pR;
  const ban=B.stand(S.banner(K+'w-ban',2.9,.6,'FOR WALES!',INK.red,INK.white),2.5,-1.15,{layer:1,tab:false});
  const bunt=B.stand(S.bunting(K+'w-bunt',2.9,.4,WAL),2.5,-1.9,{layer:1,s:0,tab:false});
  const GR=B.person(K+'w-gr',2.5,.4,1.3,{shirt:'coach',...GB,adult:true,face:'grin',layer:2});
  const mates=[[1.3,.9,'curly'],[3.7,.9,'short']].map(([x,z,h],i)=>B.person(K+`w-m${i}`,x as number,z as number,1.24,{shirt:'coach',hair:h as 'curly',skin:SKINS[i*2],adult:true,face:'grin',layer:3}));
  const years=B.stand(S.noteCard(K+'w-years',1.0,.56,['1958','→ 2022']),4.3,.1,{layer:2,s:0});
  const thanks=B.stand(S.flipCard(K+'w-thx',1.8,.32,'JANUARY 2023 · THANK YOU',INK.sky,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19):b.t;
   G.body.s=beat(t,2.2,3);fee.s=beat(t,3,3.8);five.s=beat(t,6.4,7.2);semi.s=beat(t,10,10.8);G.leg!.rot=-1.0*pulse(t,15.6,16.2);finals.s=beat(t,15.8,16.6);cheer(G,beat(t,16.4,17));
   // Raise the banner: for Wales!
   const raise=manual?beat(act,0,.6):beat(t,19.6,21);ban.dy=-1.2+1.5*raise;pop(ban,Math.min(1,.2+raise*2));
   GR.body.s=Math.max(beat(t,21.2,22),manual?beat(act,.3,.7):0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,21.6+i*.4,22.4+i*.4),manual?beat(act,.4,.8):0);});
   years.s=Math.max(beat(t,23.4,24.2),manual?beat(act,.5,.9):0);bunt.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.5,.9):0);
   const c=Math.max(beat(t,24,24.6),manual?beat(act,.6,1):0);cheer(GR,c);mates.forEach((m,i)=>cheer(m,Math.max(beat(t,24.2+i*.3,24.8+i*.3),manual?beat(act,.65,1):0)));
   fw.forEach((q,i)=>{pop(q,Math.max(beat(t,24+i*.4,25+i*.4),manual?beat(act,.7,1):0));q.rot=t*.2;});
   thanks.s=Math.max(beat(t,27.9,28.7),manual?beat(act,.85,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,19,20):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={cardiff,rules,young,jinx,burnley,wales};
