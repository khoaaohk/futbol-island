/**
 * The six Homare Sawa pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/sawa/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is courage and hope: a kick with the boys, steps, a suitcase, a banner for home, a penalty and a photo frame.
 * The 2011 disaster is shown as a calm sea and a rain cloud over quiet homes (no damage drawn). Kits are colour only.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,skyline,sea,backdrop,plates,ballPair} from '../spreadKit';

const K='sawa-';
const P=plates(K),{sp}=P;
const HS={skin:'#f1c6a0',hair:'short' as const,hairColor:'#1d1512'};
const JPN=[INK.navy,INK.blue,INK.white,'#3d5da0'];

/* ───────────── Sawa-only plates ───────────── */
const step=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.22);k.key(b,.014);k.fill(rect(0,0,w,.08),INK.white);k.text(label,w/2,Math.min(h*.5,.36),.12,INK.navy,{weight:900,max:w*.9});},{rim:.016});
const caseBody=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.red);k.key(b,.014);const i=rect(w*.06,h*.08,w*.88,h*.84);k.fill(i,'#f1e3c6');k.key(i,.01);
 const boot=`M${w*.14} ${h*.3} L${w*.3} ${h*.3} L${w*.31} ${h*.52} Q${w*.46} ${h*.54} ${w*.46} ${h*.66} L${w*.14} ${h*.68} Z`;k.fill(boot,INK.navy);k.key(boot,.01);k.circle(w*.68,h*.5,h*.16,INK.white,true);k.key(ell(w*.68,h*.5,h*.16,h*.16),.01);k.text('ATLANTA',w/2,h*.88,h*.1,INK.navy,{weight:900,max:w*.6});},{rim:.014});
const caseLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#c94a3f');k.dots(b,INK.navy,.035,.3);k.key(b,.014);const tag=rect(w*.3,h*.35,w*.4,h*.3);k.fill(tag,INK.paper);k.key(tag,.01);k.text('TO THE USA',w/2,h*.55,h*.11,INK.navy,{weight:900,max:w*.38});},{rim:.014});
const photo=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{k.fill(rect(w*.08,h*.08,w*.84,h*.84),INK.sky2);k.fill(rect(w*.08,h*.62,w*.84,h*.3),INK.grass);
 for(let i=0;i<6;i++){const x=w*(.18+i*.13);k.fill(rect(x-.05,h*.44,.1,.18),INK.navy);k.circle(x,h*.4,.05,'#f1c6a0',true);}k.text('6 WORLD CUPS',w/2,h*.26,h*.12,INK.navy,{weight:900,max:w*.8});k.text('1995 – 2015',w/2,h*.86,h*.09,INK.white,{weight:900,max:w*.8});});

/* ───────────── 1 · Joining the boys (brother) ───────────── */
const brother:SpreadDef={id:'brother',rest:16.6,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'FUCHŪ · TOKYO · JAPAN','BORN 1978 · WATCHING HER BROTHER TRAIN',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6,'#c9b98c',INK.brown);caption(k,2.5,'AGED SIX','INVITED TO JOIN THE BOYS’ TEAM',INK.navy);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);skyline(k,4.5,1.9,['#c9b48e','#d9c49a','#b9a27a']);roofs(k,0,4.5,2.3,2);k.fill(rect(0,2.3,4.5,.7),'#e3d6bb');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),'#c9b98c');});
  const sun=bd.add(S.sun(K+'b-sun',.3),'L',3.6,2.1,{out:.012});
  B.stand(S.tree(K+'b-tree',1.0,1.5),-4.4,-1.6,{layer:1});
  const fam=B.person(K+'b-mum',-3.4,-.2,1.6,{shirt:'casual',hair:'bun',hairColor:'#1d1512',skin:'#f1c6a0',adult:true,face:'smile',layer:2});
  const H=B.person(K+'b-h',-2.4,.6,.9,{shirt:'casual',...HS,face:'smile',layer:3});
  const born=B.stand(S.flipCard(K+'b-born',1.3,.32,'BORN 1978',INK.yellow,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const watch=B.stand(S.flipCard(K+'b-watch',1.5,.32,'WATCHING HER BROTHER',INK.sky,INK.navy),-1.7,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'b-goal',1.6,.85),3.8,-1.4,{layer:1});
  const boys=[[1.2,-.6,'short'],[2.4,-.9,'curly'],[3.4,.2,'short']].map(([x,z,h],i)=>B.person(K+`b-boy${i}`,x as number,z as number,1.2,{shirt:'bib',hair:h as 'short',hairColor:'#1d1512',skin:'#f1c6a0',face:'smile',layer:2}));
  const coach=B.person(K+'b-coach',4.3,-.8,1.6,{shirt:'coach',hair:'cap',skin:'#e8b88f',adult:true,face:'smile',layer:2});
  const HR=B.person(K+'b-hr',1.4,.9,.95,{shirt:'bib',...HS,legs:'kick',face:'grin',layer:3});
  const join=B.stand(S.flipCard(K+'b-join',1.3,.32,'IN THE TEAM!',INK.pink),2.4,1.95,{layer:3,s:0,tab:false});
  const qbc=B.stand(S.flipCard(K+'b-qbc',1.7,.3,'QUICK · BRAVE · CLEVER',INK.yellow,INK.navy),4.0,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'b-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.6):b.t;
   sun.dy=.3*beat(t,0,2);fam.body.s=beat(t,2,2.8);H.body.s=beat(t,8.4,9.2)*(1-beat(t,13.6,14.4));born.s=beat(t,2.6,3.4);watch.s=beat(t,9,9.8);
   boys.forEach((p,i)=>{p.body.s=beat(t,9.2+i*.4,10+i*.4);});coach.body.s=beat(t,12.6,13.4);coach.armR.rot=.12+1.3*pulse(t,13.4,16.4);HR.body.s=Math.max(beat(t,14,14.8),manual?1:0);
   // Kick the ball: from her foot to the boys' goal.
   const kick=manual?beat(act,0,.8):beat(t,17,18.6);HR.leg!.rot=-1.1*(manual?pulse(act,0,.3):pulse(t,16.9,17.5));
   const [bx,bz,by]=track(kick,[[0,1.75,1.0,0],[.5,2.9,-.2,.45],[1,3.7,-1.3,0]]);ball(bx,bz,by,t>14);
   join.s=Math.max(beat(t,18.8,19.6),manual?beat(act,.7,1):0);qbc.s=beat(t,22,22.8);boys.forEach((p,i)=>cheer(p,Math.max(beat(t,19+i*.3,19.6+i*.3)*(1-beat(t,24,25)),manual?beat(act,.8,1):0)));
   const run=t>26&&t<33?Math.abs(Math.sin(t*3)):0;HR.body.x=1.4+.8*run;cheer(HR,Math.max(beat(t,33.6,34.2),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,12,13):0;
  };
 }};

/* ───────────── 2 · Young and ready (young) ───────────── */
const young:SpreadDef={id:'young',rest:23.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'AGED 12 · YOMIURI BELEZA','DECEMBER 1993 · AGED 15 · FIRST GAME FOR JAPAN',INK.green,INK.navy,.36);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'ONE STEP AT A TIME','LISTEN · WATCH · PRACTISE',INK.navy);},
 build:B=>{
  const bd=backdrop(B,K+'y-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,JPN,1);k.fill(rect(0,2.4,4.5,.6),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  B.stand(S.goal(K+'y-goal',1.7,.9),-2.5,-1.75,{layer:1});
  const keeper=B.person(K+'y-keep',-2.5,-1.45,1.3,{shirt:'keeper',hair:'bun',skin:SKINS[2],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'y-h',-2.2,.8,1.05,{shirt:'navy',...HS,legs:'kick',face:'grin',layer:3});
  const age=B.stand(S.flipCard(K+'y-12',1.1,.32,'AGED 12',INK.yellow,INK.navy),-4.2,-.6,{layer:2,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'y-board',1.2,1.1,'GOALS'),-4.2,-1.4,{layer:1,s:0});board.add(S.flipCard(K+'y-4',.9,.5,'4',INK.pink),0,.3,{z:.012});
  const fifteen=B.stand(S.flipCard(K+'y-15',1.7,.32,'FOUR GOALS AT FIFTEEN',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const steps=[['LISTEN',.5,INK.sky],['WATCH',.95,INK.yellow],['PRACTISE',1.4,INK.pink]].map(([l,h,c],i)=>B.stand(step(`y-st${i}`,1.1,h as number,l as string,c as string),1.0+i*1.2,-.3-i*.4,{layer:2}));
  const HR=B.person(K+'y-hr',.8,.6,1.05,{shirt:'navy',...HS,face:'smile',layer:3});
  const olds=[[2.8,.9,'bun'],[4.2,.4,'long']].map(([x,z,h],i)=>B.person(K+`y-o${i}`,x as number,z as number,1.45,{shirt:'navy',hair:h as 'bun',hairColor:'#1d1512',skin:'#e8b88f',adult:true,face:'smile',layer:3}));
  const key=B.stand(S.flipCard(K+'y-key',1.4,.3,'A KEY PLAYER',INK.yellow,INK.navy),3.6,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'y-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23):b.t;
   H.body.s=beat(t,2,2.8);keeper.body.s=beat(t,2.4,3.2);age.s=beat(t,3,3.8);board.s=beat(t,10.4,11.2);
   const shots=[15.4,16.4,17.4,18.4];H.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));
   let [bx,bz,by]=[-1.9,.95,0];for(const a of shots)if(t>a&&t<a+1)[bx,bz,by]=track(t,[[a,-1.9,.95,0],[a+.5,-2.6+(a%2)*.4,-1.55,.3],[a+1,-2.6+(a%2)*.4,-1.55,0]]);ball(bx,bz,by,t>2);
   keeper.body.rot=.6*maxOf(shots.map(a=>pulse(t,a+.1,a+.8)));fifteen.s=beat(t,17,17.8);
   // Climb the steps, learning from the older players.
   const up=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,25.6+i*2,26.4+i*2));const n=up.reduce((a,v)=>a+v,0);
   let [x,z,dy]=[.8,.6,0];for(let i=0;i<3;i++)if(n>i){const u=Math.min(1,n-i),x1=1.0+i*1.2,z1=-.28-i*.4,h1=[.5,.95,1.4][i];x=x+(x1-x)*u;z=z+(z1-z)*u;dy=dy+(h1-dy)*u;}
   HR.body.x=x;HR.body.z=z+.02;HR.body.dy=dy;HR.body.s=Math.max(beat(t,19.6,20.4),manual?1:0);
   olds.forEach((p,i)=>{p.body.s=Math.max(beat(t,20+i*.4,20.8+i*.4),manual?1:0);p.armR.rot=.12+.9*pulse(t,25+i*2,27+i*2);});
   key.s=Math.max(beat(t,33.4,34.2),manual?beat(act,.9,1):0);cheer(HR,Math.max(beat(t,34,34.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,22.8,23.8):0;
  };
 }};

/* ───────────── 3 · Starting again far away (america) ───────────── */
const america:SpreadDef={id:'america',rest:14.7,
 left:k=>{paving(k,-5,0,'#d9d3c4','#a9a08c');caption(k,-2.5,'1999 · CONTRACT ENDED','A LONG WAY FROM HOME',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'ATLANTA BEAT · 2001–2003','A NEW LEAGUE · A NEW LANGUAGE',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'a-bd',k=>{daySky(k,4.5,3);skyline(k,4.5,1.9);sea(k,4.5,1.9,.5);k.fill(rect(0,2.4,4.5,.6),'#d9d3c4');},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.3,.5);skyline(k,4.5,2.2,['#c9a0a0','#d9b49a','#b98a7a']);crowd(k,4.5,2.2,2.5,[INK.red,INK.white,INK.navy],2);k.fill(rect(0,2.5,4.5,.5),INK.grass);});
  const plane=bd.add(S.plane(K+'a-pl',.7,.35),'L',3.6,2.0,{out:.03}),planeR=bd.add(S.plane(K+'a-pr',.7,.35),'R',.4,2.1,{out:.03});
  const ended=B.stand(P.lineCard('a-end',1.5,.62,['CONTRACT','ENDED'],'#c9b9d6'),-3.8,-1.4,{layer:1,s:0});
  const H=B.person(K+'a-h',-2.4,.4,1.24,{shirt:'casual',...HS,face:'open',layer:2});
  const suit=B.stand(caseBody(K+'a-case',1.3,.8),-1.3,.9,{layer:3});const lid=suit.flap(caseLid(K+'a-lid',1.3,.8),0,.8,{z:.03});
  const brave=B.stand(S.flipCard(K+'a-brave',1.4,.32,'BE BRAVE',INK.pink),-3.6,1.95,{layer:3,s:0,tab:false});
  const HR=B.person(K+'a-hr',2.0,.3,1.24,{shirt:'coach',...HS,face:'grin',layer:3});
  const mates=[[3.2,.9,'long'],[4.2,-.2,'curly']].map(([x,z,h],i)=>B.person(K+`a-m${i}`,x as number,z as number,1.2,{shirt:'coach',hair:h as 'long',hairColor:i?'#3b2e3f':'#c99a4b',skin:SKINS[i*3],adult:true,face:'smile',layer:i?2:3}));
  const hello=B.stand(S.bubble(K+'a-hi',.46,.4,'dots'),3.2,-.4,{layer:2,s:0,tab:false});
  const better=B.stand(S.flipCard(K+'a-better',1.7,.32,'AN EVEN BETTER PLAYER',INK.yellow,INK.navy),2.4,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.7):b.t;
   ended.s=beat(t,2.6,3.4);H.body.s=beat(t,2.2,3);H.body.yaw=-.3*beat(t,7,8);brave.s=beat(t,9,9.8);
   plane.dx=-2.6*beat(t,10,12);pop(plane,beat(t,9.8,10.2)*(1-beat(t,11.8,12.2)));planeR.dx=2.8*beat(t,12.2,14.4);pop(planeR,beat(t,12,12.4)*(1-beat(t,14.2,14.6)));
   // Open the suitcase: boots and a ball, ready for Atlanta.
   const open=manual?beat(act,0,.5):beat(t,15.2,16.4);lid.flip=-2.6*open;
   HR.body.s=Math.max(beat(t,17.2,18),manual?beat(act,.4,.8):0);mates.forEach((p,i)=>{p.body.s=Math.max(beat(t,17.8+i*.4,18.6+i*.4),manual?beat(act,.5,.9):0);});
   pop(hello,Math.max(beat(t,29.6,30.4),manual?beat(act,.6,1):0));better.s=Math.max(beat(t,33.4,34.2),manual?beat(act,.8,1):0);
   cheer(HR,Math.max(beat(t,34,34.6),manual?beat(act,.9,1):0));mates.forEach((p,i)=>cheer(p,beat(t,34.3+i*.3,34.9+i*.3)));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.6,17.6):0;
  };
 }};

/* ───────────── 4 · A country in sadness (wave) ───────────── */
const wave:SpreadDef={id:'wave',rest:18.0,
 left:k=>{const s=rect(-5,0,5,2.4);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<8;i++)k.key(`M${-4.6+i*.6} ${.6+(i%3)*.5} q.12 -.07 .24 0 q.12 .07 .24 0`,.014,INK.white);k.fill(rect(-5,2.4,5,4),'#e3d6bb');k.dots(rect(-5,2.4,5,4),'#b2a283',.06,.14);caption(k,-2.5,'MARCH 2011','MANY FAMILIES WERE VERY SAD',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'GERMANY · JULY 2011','CAPTAIN HOMARE · FOR EVERYONE AT HOME',INK.blue,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'w-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);hills(k,4.5,3,1.9,'#86a27a');roofs(k,.2,4.4,2.3,4);k.fill(rect(0,2.3,4.5,.7),'#e3d6bb');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,JPN,3);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const cloud=bd.add(P.rainCloud('w-cloud',1.4,.8),'L',2.2,1.9,{out:.03});
  const sun=bd.add(S.sun(K+'w-sun',.3),'R',3.6,2.2,{out:.012});
  const sad=[[-3.8,.9,'bun',true],[-2.8,1.0,'short',false],[-1.6,.8,'short',true]].map(([x,z,h,a],i)=>B.person(K+`w-p${i}`,x as number,z as number,a?1.5:1.0,{shirt:i===1?'bib':'casual',hair:h as 'bun',hairColor:'#1d1512',skin:'#f1c6a0',adult:a as boolean,face:'sad',layer:3}));
  const capt=B.stand(S.flipCard(K+'w-capt',1.3,.32,'CAPTAIN',INK.yellow,INK.navy),1.2,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'w-pole',.12,1.9,INK.stock),1.0,-1.4,{layer:1});const pole2=B.stand(S.post(K+'w-pole2',.12,1.9,INK.stock),3.8,-1.4,{layer:1});
  const ban=pole.add(S.banner(K+'w-ban',2.6,.6,'FOR EVERYONE AT HOME',INK.white,INK.navy),1.4,.1,{z:.03});void pole2;
  const team=[[1.4,.4],[2.4,.7],[3.4,.4]].map(([x,z],i)=>B.person(K+`w-t${i}`,x,z,1.22,{shirt:'navy',...(i===1?HS:{hair:(['bun','long'] as const)[i/2|0],hairColor:'#1d1512',skin:'#f1c6a0'}),face:'smile',layer:3}));
  const band=team[1].body.add(P.disc('w-band',.14,'C'),.16,team[1].h*.62,{z:.02,anchor:'center'});
  const courage=B.stand(S.flipCard(K+'w-cour',1.6,.32,'NEVER GIVE UP',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18):b.t;
   pop(cloud,beat(t,2.4,3.2));sad.forEach((p,i)=>{p.body.s=beat(t,7.4+i*.4,8.2+i*.4);});
   team.forEach((p,i)=>{p.body.s=beat(t,12+i*.4,12.8+i*.4);});pop(band,beat(t,13.4,14.2));capt.s=beat(t,14.4,15.2);
   // Raise the banner: the team's message for everyone at home.
   const up=manual?beat(act,0,.6):beat(t,18.6,20);ban.dy=1.2*up;pop(ban,Math.max(.2,up));team.forEach((p,i)=>{const v=Math.max(up,manual?beat(act,0,.6):0);p.armL.rot=-.12-1.6*v;p.armR.rot=.12+1.6*v;});
   courage.s=Math.max(beat(t,25.6,26.4),manual?beat(act,.7,1):0);sun.dy=.3*Math.max(beat(t,26,28),manual?beat(act,.6,1):0);
   sad.forEach((p,i)=>{p.body.yaw=.4*beat(t,27+i*.3,28+i*.3);cheer(p,Math.max(beat(t,29+i*.3,29.6+i*.3),manual?beat(act,.8,1):0)*.5);});
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,11.6,12.6):0;
  };
 }};

/* ───────────── 5 · Never giving up (final) ───────────── */
const final:SpreadDef={id:'final',rest:17.4,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'THE 117TH MINUTE','JAPAN 2, UNITED STATES 2',INK.yellow,INK.white);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M1.4 ${Z(-2.1)} L1.4 ${Z(-1.0)} L3.6 ${Z(-1.0)} L3.6 ${Z(-2.1)}`);k.circle(2.5,Z(-.2),.06,INK.white);caption(k,2.5,'PENALTIES · 3–1','THE FIRST ASIAN WORLD CHAMPIONS',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,JPN,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.white,INK.red,INK.navy,INK.blue],4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'f-fw1',.44,INK.yellow),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'f-fw2',.4,INK.pink),'R',3.4,2.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'f-conf',3.6,1.4,2),'R',.4,1.1,{out:.04});
  const board=B.stand(S.scoreboard(K+'f-board',1.8,1.3,'FINAL'),-3.8,-1.6,{layer:1});
  board.add(S.scoreFlap(K+'f-22',1.5,.6,'JPN','2–2','USA'),0,.36,{z:.012});const f21=board.flap(S.scoreFlap(K+'f-12',1.5,.6,'JPN','1–2','USA'),0,.96,{z:.026});
  B.stand(S.goal(K+'f-goalL',1.6,.85),-1.6,-1.7,{layer:1});
  const keepL=B.person(K+'f-kl',-1.6,-1.4,1.3,{shirt:'keeper',hair:'long',hairColor:'#c99a4b',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'f-h',-2.2,.6,1.2,{shirt:'navy',...HS,legs:'kick',face:'grin',layer:3});
  const min=B.stand(S.flipCard(K+'f-117',1.0,.32,'117′',INK.pink),-3.6,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'f-goalR',1.7,.9),2.5,-1.75,{layer:1});
  const keepR=B.person(K+'f-kr',2.5,-1.45,1.3,{shirt:'keeper',hair:'bun',hairColor:'#7a4d35',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const taker=B.person(K+'f-tk',2.2,.5,1.2,{shirt:'navy',hair:'long',hairColor:'#1d1512',skin:'#f1c6a0',legs:'kick',face:'grin',layer:3});
  const pens=B.stand(S.scoreboard(K+'f-pens',1.4,1.1,'PENALTIES'),4.3,-.6,{layer:2,s:0});pens.add(S.scoreFlap(K+'f-31',1.2,.5,'JPN','3–1','USA'),0,.3,{z:.012});
  const champs=B.stand(S.flipCard(K+'f-ch',1.7,.32,'WORLD CHAMPIONS!',INK.yellow,INK.navy),2.4,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'f-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.4):b.t;
   H.body.s=beat(t,2,2.8);keepL.body.s=beat(t,2.4,3.2);board.s=1;taker.body.s=beat(t,2.8,3.6);keepR.body.s=beat(t,3.2,4);
   const g=13.6;H.leg!.rot=-1.1*pulse(t,g-.3,g+.3);f21.flip=-3.2*beat(t,15.8,16.6);min.s=beat(t,10.6,11.4);
   // Take the next penalty: from the spot into the corner.
   const shot=manual?beat(act,0,.6):beat(t,18.2,19.2);taker.leg!.rot=-1.1*(manual?pulse(act,0,.25):pulse(t,17.9,18.5));keepR.body.rot=-.7*shot;keepR.body.dx=.4*shot;
   if(t<g)ball(-1.85,.75,0,t>2.4);else if(t<g+2)ball(...(track(t,[[g,-1.85,.75,0],[g+.6,-1.8,-.6,.4],[g+1.2,-1.2,-1.6,.25],[g+2,-1.2,-1.6,0]]) as [number,number,number]));
   else{const [x,z,y]=track(shot,[[0,2.5,.0,0],[.6,1.9,-1.2,.35],[1,1.9,-1.6,.2]]);ball(x,z,y,t>g+2||manual);}
   cheer(H,beat(t,14.6,15.2)*(1-beat(t,17,17.6)));pens.s=Math.max(beat(t,20,20.8),manual?beat(act,.5,.9):0);champs.s=Math.max(beat(t,23.6,24.4),manual?beat(act,.6,1):0);
   cheer(taker,Math.max(beat(t,19.6,20.2),manual?beat(act,.6,1):0));fw.forEach((q,i)=>{pop(q,Math.max(beat(t,23.8+i*.4,24.8+i*.4),manual?beat(act,.7,1):0));q.rot=t*.2;});pop(conf,Math.max(beat(t,24,25.2),manual?beat(act,.7,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,17.6,18.6):0;
  };
 }};

/* ───────────── 6 · Six World Cups (awards) ───────────── */
const awards:SpreadDef={id:'awards',rest:19.8,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'GOLDEN BALL · GOLDEN BOOT · 2011','WORLD PLAYER OF THE YEAR · FIRST FROM ASIA',INK.yellow,INK.white,.34);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'22 YEARS FOR JAPAN','SIX WORLD CUPS · 1995 TO 2015',INK.navy);},
 build:B=>{
  const bd=backdrop(B,K+'w2-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,JPN,2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,JPN,5);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const bunt=bd.add(S.bunting(K+'w2-bunt',3.8,.4,[INK.navy,INK.white,INK.red,INK.yellow,INK.sky,INK.pink]),'R',.4,1.0,{out:.02});
  const starsL=bd.add(S.stars(K+'w2-st',2.4,.6,9),'L',1.0,2.3,{out:.02});
  const gb=B.stand(S.goldenBall(K+'w2-gb',.28),-4.0,-1.2,{layer:1,s:0});const boot=B.stand(S.icon(K+'w2-boot',.6,'boot'),-3.0,-1.2,{layer:1,s:0});
  const five=B.stand(S.flipCard(K+'w2-5',1.3,.3,'5 GOALS',INK.yellow,INK.navy),-3.0,-.5,{layer:2,s:0,tab:false});
  const H=B.person(K+'w2-h',-1.8,.5,1.3,{shirt:'navy',...HS,adult:true,face:'grin',layer:3});
  const poy=B.stand(S.flipCard(K+'w2-poy',1.8,.32,'WORLD PLAYER OF THE YEAR',INK.pink),-3.2,1.95,{layer:3,s:0,tab:false});
  const first=B.stand(S.flipCard(K+'w2-first',1.3,.32,'FIRST FROM ASIA',INK.sky,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const pic=B.stand(photo(K+'w2-photo',2.0,1.4),2.5,-1.2,{layer:1});
  const cover=pic.flap(P.lineCard('w2-cover',1.9,1.3,['LIFT','THE FRAME'],INK.yellow),0,1.36,{z:.03});
  const club=B.stand(S.trophy(K+'w2-club',.4,.56),4.4,.2,{layer:2,s:0});const cc=B.stand(S.flipCard(K+'w2-cc',1.5,.3,'ONE MORE CLUB CUP',INK.yellow,INK.navy),3.8,1.95,{layer:3,s:0,tab:false});
  const HR=B.person(K+'w2-hr',1.3,.7,1.3,{shirt:'navy',...HS,adult:true,face:'grin',layer:3});
  const yrs=B.stand(S.flipCard(K+'w2-22',1.2,.32,'22 YEARS',INK.pink),1.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.8):b.t;
   H.body.s=beat(t,1.8,2.6);gb.s=beat(t,3,3.8);boot.s=beat(t,6.6,7.4);five.s=beat(t,9.4,10.2);poy.s=beat(t,11.4,12.2);first.s=beat(t,15,15.8);pop(starsL,beat(t,15.2,16.2));cheer(H,beat(t,16,16.6));
   // Lift the photo frame: six World Cups.
   const lift=manual?beat(act,0,.6):beat(t,20.4,21.6);cover.flip=-2.8*lift;pop(bunt,Math.max(beat(t,22,23),manual?beat(act,.5,1):0));
   HR.body.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.4,.8):0);club.s=Math.max(beat(t,31.4,32.2),manual?beat(act,.7,1):0);cc.s=Math.max(beat(t,32,32.8),manual?beat(act,.7,1):0);
   yrs.s=Math.max(beat(t,35.8,36.6),manual?beat(act,.8,1):0);cheer(HR,Math.max(beat(t,36.2,36.8),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,20,21):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={brother,young,america,wave,final,awards};
