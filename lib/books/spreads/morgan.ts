/**
 * The six Alex Morgan pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/morgan/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The thread is "a late start and a big comeback": a club gate at fourteen, a comeback bar, a rain cloud, a 123rd-minute goal,
 * a bookshelf. Kits are colour only (USA navy, Canada orange-red). The 2012 semi is the same match as the Sinclair book's London spread.
 */
import {INK,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,floor,caption,daySky,crowd,nightSky,lightRig,hills,backdrop,plates} from '../spreadKit';

const K='morgan-';
const P=plates(K),{sp}=P;
const AM={skin:SKINS[0],hair:'long' as const,hairColor:'#6b4a2e'};
const USA=[INK.navy,INK.white,INK.red,INK.blue];

/* ───────────── Morgan-only plates ───────────── */
const shelf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.wood);k.dots(b,INK.brown,.035,.25);k.key(b,.014);for(let r=0;r<3;r++){const y=h*(.08+r*.31);k.fill(rect(w*.05,y,w*.9,h*.26),'#8a5a3c');for(let i=0;i<7;i++){const bw=w*.1,bx=w*.08+i*w*.12;k.fill(rect(bx,y+h*.03+(i%3)*h*.01,bw,h*.23-(i%3)*h*.01),[INK.red,INK.blue,INK.yellow,INK.green,INK.pink,INK.sky,INK.orange][(i+r*2)%7]);k.key(rect(bx,y+h*.03+(i%3)*h*.01,bw,h*.23-(i%3)*h*.01),.008);}}});
const bookInside=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.016);k.key(`M${w/2} 0 L${w/2} ${h}`,.014,INK.edge);for(let i=0;i<4;i++)k.key(`M${w*.08} ${h*(.24+i*.14)} L${w*.42} ${h*(.24+i*.14)}`,.012,'#9c8a66');
 const g=rect(w*.56,h*.14,w*.38,h*.62);k.fill(g,INK.grass);k.key(g,.01);k.circle(w*.75,h*.56,h*.06,INK.white,true);k.fill(ell(w*.72,h*.32,h*.07,h*.07),'#f1b88f');k.fill(rect(w*.68,h*.38,w*.08,h*.16),INK.pink);k.text('THE KICKS',w*.75,h*.9,h*.1,INK.navy,{weight:900});});
const bookCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.pink);k.dots(b,INK.red,.035,.3);k.key(b,.016);k.fill(rect(0,0,w*.1,h),INK.red);k.text('THE',w*.55,h*.36,h*.13,INK.white,{weight:900});k.text('KICKS',w*.55,h*.54,h*.16,INK.white,{weight:900});k.fill(ell(w*.55,h*.76,w*.15,w*.15),INK.white);k.key(ell(w*.55,h*.76,w*.15,w*.15),.01);});

/* ───────────── 1 · Starting late (late) ───────────── */
const late:SpreadDef={id:'late',rest:21.7,
 left:k=>{pitch(k,-5,0,'#a3c47e',INK.green,.7);caption(k,-2.5,'SAN DIMAS · CALIFORNIA','SOCCER FOR FUN IN A LOCAL LEAGUE',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.8);caption(k,2.5,'A CLUB TEAM AT FOURTEEN','MANY PLAYERS START MUCH YOUNGER',INK.red);},
 build:B=>{
  const bd=backdrop(B,K+'l-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#c9b27a');k.fill(rect(0,2.3,4.5,.7),'#a3c47e');},k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#9ab07a');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'l-sun',.32),'L',3.6,2.1,{out:.012});
  B.stand(S.tree(K+'l-palm',.9,1.7,'palm'),-4.4,-1.7,{layer:1});B.stand(S.tree(K+'l-tree',1.0,1.5),-1.0,-1.8,{layer:1});
  const A=B.person(K+'l-a',-2.6,.7,1.06,{shirt:'casual',...AM,legs:'kick',face:'grin',layer:3});
  const kids=[[-3.8,-.2,'curly',SKINS[3]],[-1.6,-.4,'bun',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`l-k${i}`,x as number,z as number,1.0,{shirt:i?'fan':'bib',hair:h as 'curly',skin:sk as string,face:'grin',layer:2}));
  const fun=B.stand(S.flipCard(K+'l-fun',1.2,.3,'JUST FOR FUN',INK.yellow,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const born=B.stand(S.flipCard(K+'l-born',1.1,.3,'BORN 1989',INK.sky,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const gate=B.stand(P.gatePosts('l-gate',1.5,1.15),1.2,-.3,{layer:2});
  const gL=gate.flap(P.gateLeaf('l-gl',.64,.86),-.64,.02,{anchor:'bl',axis:'y',z:.02}),gR=gate.flap(P.gateLeaf('l-gr',.64,.86),.64,.02,{anchor:'br',axis:'y',z:.02});
  gate.add(P.lineCard('l-name',1.3,.26,['CLUB TEAM'],INK.yellow),0,1.1,{z:.03});
  const club=[[2.8,-.9,'bun',SKINS[2]],[3.7,-.3,'long',SKINS[0]],[4.4,-1.1,'curly',SKINS[4]]].map(([x,z,h,sk],i)=>B.person(K+`l-c${i}`,x as number,z as number,1.12,{shirt:'navy',hair:h as 'bun',skin:sk as string,face:'smile',layer:1}));
  const years=B.stand(S.flipCard(K+'l-years',1.5,.3,'YEARS OF PRACTICE',INK.pink),3.7,1.95,{layer:3,s:0,tab:false});
  const AR=B.person(K+'l-ar',1.2,.9,1.1,{shirt:'navy',...AM,legs:'kick',face:'grin',layer:3});
  const learn=B.stand(S.flipCard(K+'l-learn',1.3,.3,'LEARNING FAST',INK.yellow,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const u20=B.stand(P.lineCard('l-u20',1.4,.5,['UNDER-20','TEAM'],INK.white,INK.red),4.2,.7,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'l-ball',.1),-2.3,.8,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.7):b.t;
   sun.dy=.3*beat(t,0,2);A.body.s=beat(t,2.2,3);born.s=beat(t,4,4.8);kids.forEach((p,i)=>{p.body.s=beat(t,9+i*.4,9.8+i*.4);});fun.s=beat(t,10,10.8);
   const drib=t>9.4&&t<15;A.leg!.rot=-.7*Math.abs(Math.sin(t*4))*(drib?1:0);A.body.x=-2.6+.6*Math.sin(Math.max(0,t-9.4)*.6)*(t<15?1:0);ball.x=A.body.x+.3;ball.visible=t>2.6;
   kids.forEach((p,i)=>cheer(p,pulse(t,11+i,12.6+i)*.6));club.forEach((p,i)=>{p.body.s=beat(t,15.6+i*.4,16.4+i*.4);});years.s=beat(t,18.2,19);
   // Open the gate: Alex walks into the club team.
   const open=manual?beat(act,0,.5):beat(t,22.8,24);gL.flip=-1.8*open;gR.flip=1.8*open;
   const go=manual?beat(act,.4,1):beat(t,24,26);AR.body.s=Math.max(beat(t,22.6,23.4),manual?1:0);AR.body.x=1.2+1.4*go;AR.body.z=.9-.8*go;
   learn.s=beat(t,24.6,25.4);club.forEach((p,i)=>cheer(p,beat(t,26+i*.3,26.6+i*.3)*.5));pop(u20,beat(t,29,29.8));cheer(AR,Math.max(beat(t,30,30.6),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,15.2,16.2):0;
  };
 }};

/* ───────────── 2 · A big knee injury (knee) ───────────── */
const knee:SpreadDef={id:'knee',rest:19.7,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'AGED 17 · A PRACTICE GAME','A TORN KNEE LIGAMENT, THE ACL',INK.red);},
 right:k=>{floor(k,0,5);caption(k,2.5,'BACK IN FIVE MONTHS','EXERCISES, REST AND GOOD HELPERS',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'k-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#9ab07a');k.fill(rect(0,2.3,4.5,.7),INK.grass);},
   k=>{const p=rect(0,0,4.5,3);k.fill(p,'#e5eef2');k.dots(p,INK.sky,.05,.2);const w=rect(.4,.4,1.3,.9);k.fill(w,INK.sky2);k.key(w,.014);k.key('M1.05 .4 L1.05 1.3 M.4 .85 L1.7 .85',.02,INK.white);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const A=B.person(K+'k-a',-2.6,.6,1.14,{shirt:'navy',...AM,face:'sad',layer:3});
  const knee=A.body.add(S.icon(K+'k-ow',.22,'cross'),.05,.36,{z:.03,anchor:'center'});
  const coach=B.person(K+'k-coach',-1.3,-.2,1.6,{shirt:'coach',hair:'short',skin:SKINS[2],adult:true,face:'open',layer:2});
  const miss=B.stand(S.flipCard(K+'k-miss',1.7,.3,'A WHOLE SEASON MISSED',INK.sky,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const big=B.stand(S.flipCard(K+'k-big',1.6,.3,'A VERY BIG INJURY',INK.pink),-1.4,1.95,{layer:3,s:0,tab:false});
  B.stand(S.bench(K+'k-bench',1.4,.5),-3.8,-.9,{layer:2});
  const bar=B.stand(P.barFrame('k-bar',2.3,1.1,'COMEBACK BAR'),2.0,1.25,{layer:3});
  const segs=['EXERCISE','REST','LISTEN'].map((l,i)=>bar.add(P.segment(`k-s${i}`,.66,.38,l,[INK.yellow,INK.grass,INK.pink][i]),-.72+i*.72,.33,{z:.02,anchor:'bottom'}));
  const AR=B.person(K+'k-ar',1.4,-.4,1.16,{shirt:'navy',...AM,legs:'kick',face:'smile',layer:2});
  const helper=B.person(K+'k-help',3.0,-.8,1.62,{shirt:'coach',hair:'bun',hairColor:'#2a1d14',skin:SKINS[3],adult:true,face:'smile',layer:1});
  for(const [x,z] of [[3.6,.2],[4.1,-.2],[4.5,.3]])B.stand(S.cone(K+'k-cone',.28),x,z,{layer:2});
  const months=B.stand(S.flipCard(K+'k-five',1.4,.3,'FIVE MONTHS',INK.yellow,INK.navy),4.0,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'k-ball',.1),1.8,-.3,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.7):b.t;
   A.body.s=beat(t,2.2,3);pop(knee,beat(t,5,5.6)*(1-beat(t,19,19.6)));coach.body.s=beat(t,6,6.8);coach.armR.rot=.12+.9*beat(t,6.8,7.6);miss.s=beat(t,9,9.8);big.s=beat(t,12.6,13.4);A.body.rot=-.08*beat(t,5,6);
   // Fill the comeback bar: exercise, rest, listen.
   const fills=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,20.8+i*1.1,21.4+i*1.1));segs.forEach((q,i)=>pop(q,fills[i]));
   helper.body.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.2,.5):0);helper.armR.rot=.12+1.0*pulse(t,23.4,25.6);
   const back=Math.max(beat(t,26,26.8),manual?beat(act,.8,1):0);AR.body.s=back;months.s=Math.max(beat(t,26.6,27.4),manual?beat(act,.9,1):0);
   AR.leg!.rot=-.8*Math.abs(Math.sin(t*3.4))*(t>27&&t<33?1:0);AR.body.x=1.4+2.2*beat(t,27,33);ball.x=AR.body.x+.35;ball.visible=back>.5;cheer(AR,beat(t,33.6,34.2));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,20,21):0;
  };
 }};

/* ───────────── 3 · The winning goal (u20) ───────────── */
const u20:SpreadDef={id:'u20',rest:14.2,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'CHILE · 2008','UNDER-20 WORLD CUP · FOUR GOALS',INK.yellow,INK.white);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);chalk(k,`M3.6 ${Z(-2.1)} L3.6 ${Z(-.9)} L5 ${Z(-.9)}`);caption(k,2.5,'UNDER-20 WORLD CHAMPIONS','HER FOURTH GOAL WON THE FINAL',INK.yellow,INK.white,.36);},
 build:B=>{
  const bd=backdrop(B,K+'u-bd',k=>{nightSky(k,4.5,3);hills(k,4.5,3,1.5,'#3b4a6e',INK.navy);crowd(k,4.5,1.6,2.5,USA,1);lightRig(k,.9,.6);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.3,2.5,USA,4);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const conf=bd.add(S.confetti(K+'u-conf',3.6,1.4,2),'R',.4,1.1,{out:.04});
  const A=B.person(K+'u-a',-2.6,.6,1.18,{shirt:'navy',...AM,face:'grin',layer:3});
  const four=[0,1,2,3].map(i=>B.stand(S.ball(K+'u-g',.11),-4.4+i*.34,1.3,{layer:3,s:0,tab:false}));
  const fourC=B.stand(S.flipCard(K+'u-four',1.2,.3,'FOUR GOALS',INK.yellow,INK.navy),-3.9,1.95,{layer:3,s:0,tab:false});
  const two=B.stand(S.flipCard(K+'u-two',1.6,.3,'TWO YEARS AFTER HER KNEE',INK.sky,INK.navy),-1.5,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'u-goal',1.8,.95),4.0,-1.6,{layer:1});
  const keeper=B.person(K+'u-keep',4.0,-1.3,1.26,{shirt:'keeper',hair:'bun',skin:SKINS[1],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const def=B.person(K+'u-def',2.8,-.4,1.22,{shirt:'ger',hair:'short',hairColor:'#1d1512',skin:SKINS[2],face:'open',layer:2});
  B.slot(1.5,.8,3.8,-1.4);
  const AR=B.person(K+'u-ar',1.2,.8,1.2,{shirt:'navy',...AM,legs:'kick',face:'grin',layer:3});
  const mates=[[.6,-.6,'curly',SKINS[4]],[2.0,1.1,'bun',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`u-m${i}`,x as number,z as number,1.16,{shirt:'navy',hair:h as 'curly',skin:sk as string,face:'grin',layer:i?3:2}));
  const champ=B.stand(S.flipCard(K+'u-champ',1.4,.3,'WORLD CHAMPIONS',INK.yellow,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'u-ball',.1),1.55,.85,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.2):b.t;
   A.body.s=beat(t,2.2,3)*(1-beat(t,13.6,14.2));four.forEach((q,i)=>pop(q,beat(t,8.4+i*.5,9+i*.5)));fourC.s=beat(t,9.6,10.4);two.s=beat(t,11.4,12.2);cheer(A,beat(t,10,10.6));
   AR.body.s=Math.max(beat(t,13.6,14.2),manual?1:0);keeper.body.s=beat(t,13.4,14);def.body.s=beat(t,13.6,14.2);mates.forEach((p,i)=>{p.body.s=beat(t,13.8+i*.3,14.4+i*.3);});
   // Kick the ball: past the defender, into the goal.
   const kick=manual?beat(act,0,.7):beat(t,15.4,16.8);AR.leg!.rot=-1.2*(manual?pulse(act,0,.3):pulse(t,15.1,15.7));
   const [bx,bz,by]=kick>0?track(kick,[[0,1.55,.85,0],[.5,2.8,-.3,.45],[1,3.9,-1.45,.15]]):[1.55,.85,0];ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;
   keeper.body.rot=-.6*(manual?pulse(act,.3,.9):pulse(t,15.8,17.2));def.body.rot=.2*pulse(kick,.1,.6);
   const joy=Math.max(beat(t,17.2,17.8),manual?beat(act,.8,1):0);cheer(AR,joy);mates.forEach((p,i)=>cheer(p,Math.max(beat(t,17.6+i*.3,18.2+i*.3),manual?beat(act,.85,1):0)));
   champ.s=Math.max(beat(t,19,19.8),manual?beat(act,.9,1):0);pop(conf,Math.max(beat(t,19.4,20.4),manual?beat(act,.7,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,13.4,14.4):0;
  };
 }};

/* ───────────── 4 · The youngest, and a lost final (2011) ───────────── */
const wc2011:SpreadDef={id:'final',rest:17.3,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'GERMANY · 2011 WORLD CUP','THE YOUNGEST ON THE TEAM',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6,'#6f9f5e',INK.green);caption(k,2.5,'THE FINAL','2–2 WITH JAPAN, LOST ON PENALTIES',INK.pink,INK.navy);},
 build:B=>{
  const bd=backdrop(B,K+'w-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[...USA,INK.yellow],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{const p=rect(0,0,4.5,3);k.fill(p,'#b4a9c6');k.dots(p,INK.navy,.05,(x,y)=>.4-y/3*.3);crowd(k,4.5,1.2,2.45,[INK.navy,INK.white,INK.blue],5);k.fill(rect(0,2.45,4.5,.55),'#6f9f5e');});
  B.stand(S.goal(K+'w-goal',1.8,.95),-3.8,-1.8,{layer:1});
  const keeper=B.person(K+'w-keep',-3.8,-1.5,1.3,{shirt:'keeper',hair:'bun',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const A=B.person(K+'w-a',-2.6,.6,1.16,{shirt:'navy',...AM,legs:'kick',face:'grin',layer:3});
  const fra=B.person(K+'w-fra',-1.4,-.3,1.24,{shirt:'ger',hair:'long',hairColor:'#2a1d14',skin:SKINS[3],face:'open',layer:2});
  const young=B.stand(S.flipCard(K+'w-young',1.3,.3,'THE YOUNGEST',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const first=B.stand(S.flipCard(K+'w-first',1.7,.3,'FIRST WORLD CUP GOAL',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'w-post',1.7,1.3,INK.white),1.4,-1.3,{layer:1});
  post.add(S.scoreFlap(K+'w-sc',1.56,.9,'USA','2–2','JPN'),0,.15,{z:.012});const cloud=post.flap(P.rainCloud('w-cloud',1.6,1.1),0,1.22,{z:.03});
  const team=[[2.8,.5,'bun',SKINS[2]],[3.8,.9,'curly',SKINS[4]],[4.5,.1,'short',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`w-t${i}`,x as number,z as number,1.18,{shirt:'navy',hair:h as 'bun',skin:sk as string,face:'sad',layer:3}));
  const AR=B.person(K+'w-ar',1.4,.8,1.16,{shirt:'navy',...AM,face:'sad',layer:3});
  const harder=B.stand(S.flipCard(K+'w-harder',1.7,.3,'WORK EVEN HARDER',INK.yellow,INK.navy),3.2,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'w-ball',.1),-2.4,-.1,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.3):b.t;
   A.body.s=beat(t,2.6,3.4);keeper.body.s=beat(t,3,3.8);young.s=beat(t,5,5.8);fra.body.s=beat(t,9.2,10);
   const pk=10.6;A.leg!.rot=-1.1*pulse(t,pk-.3,pk+.3);const [bx,bz,by]=t<pk?[-2.4,-.1,0]:track(t,[[pk,-2.4,-.1,0],[pk+.5,-3.4,-1.6,.4],[pk+1.1,-3.4,-1.6,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>8.8&&t<17;
   keeper.body.rot=.6*pulse(t,pk+.1,pk+1.2);first.s=beat(t,11.6,12.4);cheer(A,beat(t,11.4,12)*(1-beat(t,16.6,17.2)));
   // Lift the rain cloud: the final score is underneath.
   const lift=manual?beat(act,0,.5):beat(t,18.4,19.6);cloud.flip=-2.7*lift;
   team.forEach((p,i)=>{p.body.s=Math.max(beat(t,20.4+i*.3,21.2+i*.3),manual?1:0);});AR.body.s=Math.max(beat(t,20.2,21),manual?1:0);
   const together=manual?beat(act,.5,1):beat(t,31,33);[...team,AR].forEach(p=>{p.armL.rot=-.12-1.3*together;p.armR.rot=.12+1.3*together;});harder.s=together;
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,17.6,18.6):0;
  };
 }};

/* ───────────── 5 · In the 123rd minute (london) ───────────── */
const london:SpreadDef={id:'london',rest:21.1,
 left:k=>{pitchLines(k,-5,0,-2.5,'#6f9f5e',INK.green);caption(k,-2.5,'LONDON 2012 · SEMI-FINAL','3–3, DEEP INTO EXTRA TIME',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6,'#6f9f5e',INK.green);caption(k,2.5,'OLYMPIC CHAMPIONS','THE FINAL: USA 2, JAPAN 1',INK.yellow,INK.navy);},
 build:B=>{
  const dusk=(k:Parameters<SpreadDef['left']>[0],seed:number)=>{const p=rect(0,0,4.5,3);k.fill(p,'#f2a77a');k.dots(p,INK.pink,.06,(x,y)=>.5-y/3*.4);crowd(k,4.5,1.2,2.45,[...USA,INK.orange],seed);lightRig(k,.8,.3);lightRig(k,3.8,.3);k.fill(rect(0,2.45,4.5,.55),'#6f9f5e');};
  const bd=backdrop(B,K+'o-bd',k=>dusk(k,2),k=>dusk(k,6));
  const conf=bd.add(S.confetti(K+'o-conf',3.6,1.4,5),'R',.4,1.1,{out:.04});
  B.stand(S.goal(K+'o-goal',1.8,.95),-3.8,-1.8,{layer:1});
  const keeper=B.person(K+'o-keep',-3.8,-1.5,1.3,{shirt:'keeper',hair:'bun',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const A=B.person(K+'o-a',-2.4,.4,1.2,{shirt:'navy',...AM,legs:'kick',face:'grin',layer:3});
  const can=B.person(K+'o-can',-1.2,-.3,1.22,{shirt:'casual',hair:'long',hairColor:'#4a3222',skin:SKINS[0],face:'open',layer:2});
  const min=B.stand(S.noteCard(K+'o-123',.7,.6,['123’']),-1.0,1.1,{layer:3,s:0,tab:false});
  const three=B.stand(S.flipCard(K+'o-three',1.8,.3,'CHRISTINE SINCLAIR: 3 GOALS',INK.orange,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'o-board',1.6,1.25,'SEMI-FINAL'),1.6,-1.4,{layer:1});
  board.add(S.scoreFlap(K+'o-sc',1.3,.56,'USA','4–3','CAN'),0,.34,{z:.012});
  const cover=board.flap(S.scoreFlap(K+'o-33',1.34,.6,'USA','3–3','CAN'),0,.92,{z:.03});
  const AR=B.person(K+'o-ar',1.0,.6,1.2,{shirt:'navy',...AM,face:'grin',layer:3});
  const team=[[3.2,.2,'bun',SKINS[2]],[4.2,.8,'curly',SKINS[4]]].map(([x,z,h,sk],i)=>B.person(K+`o-t${i}`,x as number,z as number,1.18,{shirt:'navy',hair:h as 'bun',skin:sk as string,face:'grin',layer:3}));
  const pole=B.stand(S.post(K+'o-pole',.14,1.3,INK.stock),3.8,-.9,{layer:2,tab:false});const gold=pole.add(P.medal('o-gold',.62,INK.gold,INK.red),0,.3,{z:.03,anchor:'center'});
  const joy=B.stand(S.flipCard(K+'o-joy',1.5,.3,'SADNESS TO JOY',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'o-ball',.1),-2.2,-.2,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.1):b.t;
   A.body.s=beat(t,2.8,3.6);keeper.body.s=beat(t,3.2,4);can.body.s=beat(t,4,4.8);
   const pk=12.6;A.leg!.rot=-1.2*pulse(t,pk-.3,pk+.3);const [bx,bz,by]=t<pk?[-2.2,-.2,0]:track(t,[[pk,-2.2,-.2,0],[pk+.5,-3.2,-1.6,.45],[pk+1.1,-3.2,-1.6,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>9&&t<21;
   keeper.body.rot=-.7*pulse(t,pk+.1,pk+1.2);pop(min,beat(t,13.4,14.2));cheer(A,beat(t,13.6,14.2));three.s=beat(t,15.8,16.6);can.armR.rot=.12+.8*beat(t,16,16.8);
   // Flip the scoreboard: 3–3 turns over to 4–3.
   const flip=manual?beat(act,0,.6):beat(t,22.4,23.6);cover.flip=-3.0*flip;AR.body.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.4,.8):0);
   team.forEach((p,i)=>{p.body.s=Math.max(beat(t,24+i*.4,24.8+i*.4),manual?beat(act,.5,.9):0);cheer(p,Math.max(beat(t,29.4+i*.3,30+i*.3),manual?beat(act,.9,1):0));});
   const raise=Math.max(beat(t,29.2,30.6),manual?beat(act,.6,1):0);gold.dy=-.2+1.0*raise;pop(gold,Math.min(1,.2+raise*2));cheer(AR,raise);
   pop(conf,Math.max(beat(t,29.8,30.8),manual?beat(act,.7,1):0));joy.s=beat(t,32,32.8);
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,21.4,22.4):0;
  };
 }};

/* ───────────── 6 · Two World Cups and a bookshelf (books) ───────────── */
const books:SpreadDef={id:'books',rest:16.9,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'2015 AND 2019','WORLD CHAMPION, TWICE',INK.yellow,INK.navy);},
 right:k=>{floor(k,0,5);caption(k,2.5,'THE KICKS','HER BOOKS ABOUT A GIRL WHO PLAYS SOCCER',INK.pink,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,USA,3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f6e2b8');k.dots(p,INK.orange,.05,.14);const w=rect(2.9,.4,1.2,.9);k.fill(w,INK.sky2);k.key(w,.014);k.key('M3.5 .4 L3.5 1.3 M2.9 .85 L4.1 .85',.02,INK.white);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const stars=[0,1].map(i=>bd.add(P.disc(`b-star${i}`,.4,'★',INK.yellow,INK.navy),'L',1.7+i*.6,2.4,{out:.03}));
  const A=B.person(K+'b-a',-2.6,.6,1.2,{shirt:'navy',...AM,face:'grin',layer:3});
  const hurt=['ANKLE','KNEE','HAMSTRING'].map((l,i)=>B.stand(S.flipCard(K+`b-h${i}`,1.1,.3,l,INK.sky,INK.navy),-4.2+i*1.2,1.95,{layer:3,s:0,tab:false}));
  const back=B.stand(S.flipCard(K+'b-back',1.5,.3,'BACK EVERY TIME',INK.yellow,INK.navy),-1.2,1.95,{layer:3,s:0,tab:false});
  const cups=[0,1].map(i=>B.stand(S.trophy(K+'b-cup',.5,.66),-1.4+i*.6,.9,{layer:3,s:0,tab:false}));
  const clubs=[['USA',INK.blue],['FRANCE',INK.red]].map(([l,c],i)=>B.stand(S.sign(K+`b-c${i}`,1.2,1.1,l,c),-4.0+i*1.4,-1.6,{layer:1,s:0}));
  const shelfP=B.stand(shelf(K+'b-shelf',1.9,1.6),3.6,-1.5,{layer:1});
  const stand=B.stand(S.post(K+'b-stand',1.6,1.1,'#d9cfb8'),1.6,-.7,{layer:2});
  stand.add(bookInside(K+'b-in',1.5,.95),0,.08,{z:.012});const cover=stand.flap(bookCover(K+'b-cover',.75,.95),-.75,.08,{anchor:'bl',axis:'y',z:.03});
  const kids=[[1.0,.8,'bun',SKINS[3]],[2.4,1.0,'curly',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`b-k${i}`,x as number,z as number,.98,{shirt:i?'fan':'bib',hair:h as 'bun',skin:sk as string,face:'grin',layer:3}));
  const AR=B.person(K+'b-ar',3.8,.5,1.22,{shirt:'casual',...AM,face:'smile',layer:3});
  const next=B.stand(S.flipCard(K+'b-next',1.6,.3,'THE NEXT GENERATION',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.9):b.t;
   A.body.s=beat(t,2.2,3);hurt.forEach((c,i)=>{c.s=beat(t,4+i*.8,4.8+i*.8);});back.s=beat(t,7.2,8);A.body.rot=-.1*pulse(t,4,7.2);
   cups.forEach((q,i)=>pop(q,beat(t,10.4+i*1.2,11.2+i*1.2)));stars.forEach((q,i)=>pop(q,beat(t,10.6+i*1.2,11.4+i*1.2)));cheer(A,beat(t,12.4,13));clubs.forEach((c,i)=>{c.s=beat(t,14+i*1.6,14.8+i*1.6);});
   // Open the book.
   const open=manual?beat(act,0,.6):beat(t,18,19.2);cover.flip=-2.9*open;
   kids.forEach((p,i)=>{p.body.s=Math.max(beat(t,20+i*.4,20.8+i*.4),manual?beat(act,.4,.8):0);cheer(p,Math.max(beat(t,22+i*.3,22.6+i*.3),manual?beat(act,.8,1):0)*.6);});
   AR.body.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.3,.7):0);AR.armL.rot=-.12-1.0*beat(t,21,22);next.s=Math.max(beat(t,32.6,33.4),manual?beat(act,.9,1):0);shelfP.rot=0;
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,17.2,18.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={late,knee,u20,final:wc2011,london,books};
