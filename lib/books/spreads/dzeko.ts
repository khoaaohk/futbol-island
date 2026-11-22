/**
 * The six Edin Džeko pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/dzeko/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is hope after the siege, told gently: a door opening on a family together, a window closed by a
 * caring mother (outside only a grey cloud; no damage, weapons or people hurt are drawn), a sign, a trophy, a scoreboard
 * and a banner. Kits are colour only; no crests.
 */
import {INK,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,skyline,backdrop,plates} from '../spreadKit';

const K='dzeko-';
const P=plates(K),{sp}=P;
const ED={skin:'#f1b88f',hair:'short' as const,hairColor:'#2a1d16'};
const BIH=[INK.blue,INK.yellow,INK.white,INK.blue];
const WOB=['#3f9567',INK.white,'#3f9567','#2b2b33'];
const MCI=['#6fb6e2',INK.white,'#6fb6e2',INK.navy];

/* ───────────── Džeko-only plates ───────────── */
const tower=(key:string,w:number,h:number,c='#cfc8b8')=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.14);k.key(b,.014);
 for(let r=0;r<Math.floor(h/.2);r++)for(let i=0;i<4;i++){const wdw=rect(w*(.1+i*.21),.1+r*.2,w*.13,.1);k.fill(wdw,(r*3+i)%4?INK.sky2:INK.yellow);k.key(wdw,.006);}},{rim:.014});
/** The grandparents' small flat: a table with many family members around it. */
const familyTable=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{k.fill(rect(w*.06,h*.06,w*.88,h*.88),'#fff1c2');k.fill(rect(w*.06,h*.06,w*.88,h*.3),'#f6dca8');
 const tb=rect(w*.18,h*.62,w*.64,h*.1);k.fill(tb,INK.wood);k.key(tb,.01);k.fill(ell(w*.5,h*.6,w*.08,h*.04),INK.white);
 const cs=[INK.sky,INK.orange,INK.green,INK.pink,INK.blue,INK.yellow,INK.red];for(let i=0;i<15;i++){const row=i<8?0:1,n=row?7:8,j=row?i-8:i,x=w*(.12+j*(.76/(n-1))),y=h*(row?.86:.5),r=row?.05:.042;
  k.fill(rect(x-r*1.2,y,r*2.4,r*3),cs[i%cs.length]);k.circle(x,y-r*.6,r,SKINS[i%5],true);}
 k.fill(`M${w/2} ${h*.2} q-.07 -.09 -.13 0 q0 .05 .13 .15 q.13 -.1 .13 -.15 q-.06 -.09 -.13 0 Z`,INK.pink);k.text('15 OF US',w/2,h*.33,h*.07,INK.navy,{weight:900});});
const shutter=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.green);k.key(b,.012);for(let y=.06;y<h;y+=.08)k.key(`M.04 ${y} L${w-.04} ${y}`,.012,'#2b6b48');},{rim:.012});
const letter=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);k.text('TO THE CHILDREN',w/2,h*.2,h*.09,INK.navy,{weight:900,max:w*.9});k.text('OF BOSNIA',w/2,h*.32,h*.09,INK.navy,{weight:900,max:w*.9});
 for(let i=0;i<5;i++)k.key(`M${w*.12} ${h*(.46+i*.09)} L${w*(.88-(i%2)*.15)} ${h*(.46+i*.09)}`,.012,INK.grey);k.text('EDIN · 2026',w*.66,h*.94,h*.07,INK.blue,{weight:900});},{rim:.016});

/* ───────────── 1 · A city surrounded (siege) ───────────── */
const siege:SpreadDef={id:'siege',rest:21.8,
 left:k=>{paving(k,-5,0,'#d9d3c4','#a9a08c');caption(k,-2.5,'SARAJEVO · BORN 1986','AGED 6: A WAR BEGAN · A SIEGE OF NEARLY 4 YEARS',INK.blue,INK.navy,.42);},
 right:k=>{floor(k,0,5);caption(k,2.5,'ONE SMALL FLAT','15 FAMILY MEMBERS, LOOKING AFTER EACH OTHER',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.22);hills(k,4.5,3,1.5,'#9aa48a');skyline(k,4.5,2.3,['#b9b4a6','#c9c3b3','#a9a494']);k.fill(rect(0,2.3,4.5,.7),'#d9d3c4');},
   k=>{wash(k,4.5,3,'#efe0c4',INK.white,y=>.2);for(let x=.3;x<4.5;x+=.6)k.key(`M${x} 0 L${x} 2.4`,.01,'#c9b48e');k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const cloud=bd.add(S.cloud(K+'s-cloud',1.2,.5),'L',2.4,2.3,{out:.02});
  const towers=[[-4.2,1.9],[-3.2,2.3],[-1.0,2.0]].map(([x,h],i)=>B.stand(tower(K+`s-t${i}`,.8,h),x,-1.6,{layer:1}));void towers;
  const born=B.stand(S.flipCard(K+'s-born',1.3,.32,'BORN 1986',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const E=B.person(K+'s-e',-2.4,.6,.92,{shirt:'casual',...ED,face:'shy',layer:3});
  const six=B.stand(P.lineCard('s-6',1.4,.58,['AGED 6','A WAR BEGAN'],'#c9b9d6'),-2.2,-.6,{layer:2,s:0});
  const siegeC=B.stand(S.flipCard(K+'s-siege',1.8,.32,'A SIEGE: A CITY SURROUNDED',INK.sky,INK.navy),-2.5,1.6,{layer:3,s:0,tab:false});
  const hard=B.stand(S.flipCard(K+'s-hard',1.6,.32,'DANGEROUS AND HARD',INK.pink),-1.2,1.95,{layer:3,s:0,tab:false});
  const frameD=B.stand(P.doorway('s-frame',1.9,1.6,'#d9cdb6'),2.5,-1.0,{layer:1});
  frameD.add(familyTable(K+'s-fam',1.7,1.4),0,.1,{z:.012});
  const dL=frameD.flap(P.doorway('s-dl',.86,1.45,INK.brown),-.86,.08,{anchor:'bl',axis:'y',z:.03}),dR=frameD.flap(P.doorway('s-dr',.86,1.45,INK.brown),.86,.08,{anchor:'br',axis:'y',z:.03});
  const n15=B.stand(P.lineCard('s-15',1.4,.58,['15 PEOPLE','ONE SMALL FLAT'],INK.yellow),4.2,.0,{layer:2,s:0});
  const fam=[[1.1,.7,'bun',true,1.56],[2.0,.9,'short',false,.92],[3.0,.9,'short',true,1.62],[3.9,.8,'long',false,1.0]].map(([x,z,h,a,s],i)=>B.person(K+`s-p${i}`,x as number,z as number,s as number,{shirt:(['casual','casual','navy','bib'] as const)[i],hair:h as 'bun',hairColor:'#2a1d16',skin:SKINS[i%2?0:2],adult:a as boolean,face:'smile',layer:3}));
  const share=B.stand(S.flipCard(K+'s-share',1.8,.32,'SHARING · CARING',INK.pink),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.8):b.t;
   born.s=beat(t,2.2,3);E.body.s=beat(t,2.6,3.4);six.s=beat(t,10,10.8);cloud.dx=-.6*beat(t,10,16);siegeC.s=beat(t,15.8,16.6);hard.s=beat(t,17.9,18.7);
   // Open the door: the whole family is inside, together.
   const open=manual?beat(act,0,.5):beat(t,22.4,23.6);dL.flip=-1.8*open;dR.flip=1.8*open;
   n15.s=Math.max(beat(t,24.4,25.2),manual?beat(act,.3,.7):0);
   fam.forEach((p,i)=>{p.body.s=Math.max(beat(t,32.2+i*.3,33+i*.3),manual?beat(act,.5,.9):0);const v=Math.max(beat(t,33.4,34.4),manual?beat(act,.8,1):0);p.armL.rot=-.12-.9*v;p.armR.rot=.12+.9*v;});
   share.s=Math.max(beat(t,32.6,33.4),manual?beat(act,.7,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,21.8,22.8):0;
  };
 }};

/* ───────────── 2 · His mother said no (mother) ───────────── */
const mother:SpreadDef={id:'mother',rest:15.5,
 left:k=>{paving(k,-5,0,'#d9d3c4','#a9a08c');caption(k,-2.5,'OTOKA, SARAJEVO','FOOTBALL FELT A LITTLE BIT NORMAL',INK.blue,INK.navy,.42);},
 right:k=>{floor(k,0,5);caption(k,2.5,'SAFE AT HOME','GROWN-UPS SAY NO TO KEEP YOU SAFE',INK.green,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'m-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.2);skyline(k,4.5,2.25,['#b9b4a6','#c9c3b3','#a9a494']);k.fill(rect(0,2.25,4.5,.75),'#d9d3c4');},
   k=>{wash(k,4.5,3,'#efe0c4',INK.white,y=>.2);for(let x=.3;x<4.5;x+=.6)k.key(`M${x} 0 L${x} 2.4`,.01,'#c9b48e');k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  B.stand(tower(K+'m-t',.9,2.2),-4.3,-1.6,{layer:1});
  const E=B.person(K+'m-e',-2.6,.5,.94,{shirt:'casual',...ED,legs:'kick',face:'grin',layer:3});
  const pals=[[-3.6,.9,'curly'],[-1.5,.8,'short']].map(([x,z,h],i)=>B.person(K+`m-k${i}`,x as number,z as number,.92,{shirt:i?'bib':'fan',hair:h as 'curly',hairColor:'#2a1d16',skin:SKINS[i?0:2],face:'grin',layer:3}));
  const ball=B.stand(S.ball(K+'m-ball',.09),-2.25,.65,{layer:3,tab:false});
  const mum=B.person(K+'m-mum',-1.2,-.6,1.6,{shirt:'casual',hair:'long',hairColor:'#2a1d16',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const no=B.stand(S.noteCard(K+'m-no',.9,.5,['NOT','TODAY']),-.7,.3,{layer:2,s:0});
  const normal=B.stand(S.flipCard(K+'m-norm',1.8,.32,'A LITTLE BIT NORMAL',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const win=B.stand(P.windowFrame('m-win',1.4,1.2),2.5,-1.4,{layer:1});
  const grey=win.add(S.cloud(K+'m-grey',.9,.4),.3,.35,{z:.012});
  const sL=win.flap(shutter(K+'m-sl',.7,1.2),-.7,0,{anchor:'bl',axis:'y',z:.03}),sR=win.flap(shutter(K+'m-sr',.7,1.2),.7,0,{anchor:'br',axis:'y',z:.03});
  const ER=B.person(K+'m-er',2.0,.5,.94,{shirt:'casual',...ED,face:'smile',layer:3,holdR:'ball'});
  const mumR=B.person(K+'m-mumr',3.0,.4,1.6,{shirt:'casual',hair:'long',hairColor:'#2a1d16',skin:SKINS[0],adult:true,face:'smile',layer:3});
  const safe=B.stand(S.flipCard(K+'m-safe',1.5,.32,'SAFE AT HOME',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  const lamp=B.stand(S.lamp(K+'m-lamp',.5,1.2),4.4,-1.2,{layer:1,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.5):b.t;
   E.body.s=beat(t,2.2,3);pals.forEach((p,i)=>{p.body.s=beat(t,2.8+i*.4,3.6+i*.4);});const j=t>3&&t<8.2?Math.abs(Math.sin(t*3)):0;E.leg!.rot=-.8*j;ball.dy=.2*j;ball.visible=t<8.6;
   mum.body.s=beat(t,8.4,9.2);mum.armR.rot=.12+1.2*beat(t,9,9.8);no.s=beat(t,9.4,10.2);normal.s=beat(t,12.4,13.2);pals.forEach(p=>cheer(p,beat(t,12.6,13.2)*.5));
   ER.body.s=beat(t,10.4,11.2);mumR.body.s=beat(t,11,11.8);
   // Close the window: the shutters swing shut; the grey cloud stays outside.
   const close=manual?beat(act,0,.5):beat(t,16,17.2);sL.flip=-1.7*(1-close);sR.flip=1.7*(1-close);grey.dx=.5*beat(t,14,20);
   lamp.s=Math.max(beat(t,17.6,18.4),manual?beat(act,.4,.8):0);
   const hug=Math.max(beat(t,22,23),manual?beat(act,.6,1):0);mumR.body.x=3.0-.5*hug;mumR.armL.rot=-.12-1.2*hug;ER.armL.rot=-.12-.8*hug;
   safe.s=Math.max(beat(t,22.2,23),manual?beat(act,.7,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,15.4,16.4):0;
  };
 }};

/* ───────────── 3 · Too tall, they said (tall) ───────────── */
const tall:SpreadDef={id:'tall',rest:16.7,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'ŽELJEZNIČAR · SARAJEVO','“TOO TALL” FOR MIDFIELD, SOME SAID',INK.blue,INK.navy,.42);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'TEPLICE · CZECH REPUBLIC','SOLD FOR ONLY €25,000 · A NEW START',INK.blue,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'t-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#7fae62');crowd(k,4.5,1.7,2.45,[INK.blue,INK.white,INK.grey],2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#9dbd78');k.fill(rect(0,2.35,4.5,.65),INK.grass);});
  const E=B.person(K+'t-e',-2.6,.5,1.5,{shirt:'navy',...ED,adult:true,legs:'kick',face:'shy',layer:3});
  const mates=[[-3.8,.0,'curly'],[-1.4,-.1,'short']].map(([x,z,h],i)=>B.person(K+`t-m${i}`,x as number,z as number,1.15,{shirt:'navy',hair:h as 'curly',skin:SKINS[i*2],face:'smile',layer:2}));
  const coach=B.person(K+'t-coach',-.8,-1.3,1.6,{shirt:'coach',hair:'bald',skin:SKINS[0],adult:true,face:'open',layer:1});
  const note=coach.body.add(S.noteCard(K+'t-note',.6,.42,['TOO','TALL?']),.34,coach.h*.62,{z:.03});
  const ball=B.stand(S.ball(K+'t-ball',.1),-2.2,.7,{layer:3,tab:false});
  const hardC=B.stand(S.flipCard(K+'t-hard',1.8,.32,'HARD TO CONTROL IT',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'t-post',1.5,1.5,INK.white),1.3,-1.1,{layer:1});
  post.add(P.lineCard('t-tep',1.3,.8,['TEPLICE','NEW START'],INK.grass),0,.5,{z:.012});
  const flapC=post.flap(P.lineCard('t-too',1.3,.8,['TOO','TALL?'],INK.pink,INK.white),0,1.32,{z:.03});
  const fee=B.stand(P.lineCard('t-fee',1.3,.58,['ONLY','€25,000'],INK.yellow),3.0,-1.5,{layer:1,s:0});
  B.stand(S.goal(K+'t-goal',.9,1.5),4.6,-.3,{layer:1,yaw:-1.2});
  const keeper=B.person(K+'t-keep',4.2,-.1,1.2,{shirt:'keeper',hair:'short',skin:SKINS[1],adult:true,face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const ER=B.person(K+'t-er',2.0,.5,1.5,{shirt:'ger',...ED,adult:true,legs:'kick',face:'grin',layer:3});
  const ballR=B.stand(S.ball(K+'t-ballR',.1),2.4,.6,{layer:3,tab:false});
  const newS=B.stand(S.flipCard(K+'t-new',1.4,.32,'A NEW START',INK.yellow,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const front=B.stand(S.flipCard(K+'t-front',1.6,.32,'UP FRONT: GOALS!',INK.pink),3.9,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.7):b.t;
   E.body.s=beat(t,2.2,3);mates.forEach((m,i)=>{m.body.s=beat(t,2.6+i*.4,3.4+i*.4);});coach.body.s=beat(t,7.2,8);pop(note,beat(t,8,8.8));
   const bob=t>12.2&&t<16.7?pulse((t-12.2)%1.5,0,1.5):0;E.leg!.rot=-.6*bob;ball.x=-2.2+.5*bob;ball.dy=.25*bob;hardC.s=beat(t,12.4,13.2);
   // Flip the sign: "too tall?" turns into Teplice, a new start.
   const flip=manual?beat(act,0,.5):beat(t,17.4,18.4);flapC.flip=-3.1*flip;
   fee.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.3,.7):0);newS.s=Math.max(beat(t,25.2,26),manual?beat(act,.5,.8):0);
   ER.body.s=Math.max(beat(t,28.8,29.6),manual?beat(act,.6,.9):0);keeper.body.s=Math.max(beat(t,29,29.8),manual?beat(act,.6,.9):0);
   ER.leg!.rot=-1.1*(manual?pulse(act,.8,.9):pulse(t,30.4,31));const k=manual?beat(act,.82,1):beat(t,30.6,31.6);const [bx,bz,by]=track(k,[[0,2.4,.6,0],[1,4.3,-.25,.4]]);ballR.x=bx;ballR.z=bz;ballR.dy=by;ballR.visible=ER.body.s>.4;keeper.body.rot=.45*k;
   front.s=Math.max(beat(t,31.4,32.2),manual?beat(act,.9,1):0);cheer(ER,Math.max(beat(t,31.6,32.2),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16.6,17.6):0;
  };
 }};

/* ───────────── 4 · Champions of Germany (germany) ───────────── */
const germany:SpreadDef={id:'germany',rest:12.7,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'WOLFSBURG · GERMANY','HEIGHT · STRENGTH · CLEVER FEET',INK.green,INK.navy,.42);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'2009 · BUNDESLIGA CHAMPIONS','WOLFSBURG’S FIRST TITLE EVER',INK.green,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,WOB,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,WOB,4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const conf=bd.add(S.confetti(K+'g-conf',3.6,1.4,3),'R',.4,1.1,{out:.04});const bunt=bd.add(S.bunting(K+'g-bunt',3.8,.4,[INK.green,INK.white,INK.green]),'R',.4,1.0,{out:.02});
  B.stand(S.goal(K+'g-goal',1.6,1.0),-1.1,-1.3,{layer:1});
  const keep=B.person(K+'g-keep',-1.1,-1.0,1.2,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const E=B.person(K+'g-e',-3.4,.5,1.5,{shirt:'keeper',...ED,adult:true,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'g-ball',.1),-3.0,.6,{layer:3,tab:false});
  const skills=['HEIGHT','STRENGTH','CLEVER FEET'].map((l,i)=>B.stand(S.flipCard(K+`g-s${i}`,1.3,.3,l,[INK.yellow,INK.sky,INK.pink][i],i===2?INK.white:INK.navy),-4.0+i*1.5,1.95-(i%2)*.32,{layer:3,s:0,tab:false}));
  const pole=B.stand(S.post(K+'g-pole',.14,1.3,INK.stock),2.0,.7,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'g-cup',.6,.8),0,.3,{z:.03});
  const ER=B.person(K+'g-er',2.5,.4,1.5,{shirt:'keeper',...ED,adult:true,face:'grin',layer:2});
  const mates=[[1.2,.9,'curly'],[3.8,.9,'bald']].map(([x,z,h],i)=>B.person(K+`g-m${i}`,x as number,z as number,1.28,{shirt:'keeper',hair:h as 'curly',skin:SKINS[i*3],adult:true,face:'grin',layer:3}));
  const first=B.stand(P.lineCard('g-first',1.6,.62,['2009','FIRST TITLE EVER'],INK.yellow),3.8,-1.4,{layer:1,s:0});
  const champ=B.stand(S.flipCard(K+'g-champ',1.7,.32,'A CHAMPION!',INK.pink),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,12.7):b.t;
   E.body.s=beat(t,2.2,3);keep.body.s=beat(t,2.6,3.4);
   // Goals: a shot, then a header from a cross.
   E.leg!.rot=-1.1*pulse(t,4.4,5);const s1=beat(t,4.6,5.6);let [bx,bz,by]=track(s1,[[0,-3.0,.6,0],[1,-.8,-1.2,.4]]);
   if(t>8.6){const s2=beat(t,9,10.4);[bx,bz,by]=track(s2,[[0,-4.4,-1.0,.6],[.5,-3.4,.2,1.3],[1,-1.2,-1.2,.6]]);E.body.dy=.2*pulse(t,9.4,10.2);}
   ball.x=bx;ball.z=bz;ball.dy=by;keep.body.rot=(t>8.6?.5:-.5)*beat(t,4.8,5.6);
   skills.forEach((q,i)=>{q.s=beat(t,8.8+i*1.0,9.6+i*1.0);});
   // Raise the trophy: champions of Germany.
   const raise=manual?beat(act,0,.6):beat(t,13.4,14.8);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));ER.body.s=Math.max(beat(t,12.6,13.4),manual?1:0);cheer(ER,raise);
   mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,13+i*.4,13.8+i*.4),manual?beat(act,.2,.6):0);cheer(m,Math.max(beat(t,14.6+i*.3,15.2+i*.3),manual?beat(act,.5,.9):0));});
   first.s=Math.max(beat(t,15,15.8),manual?beat(act,.5,.9):0);pop(conf,Math.max(beat(t,15,16.2),manual?beat(act,.6,1):0));pop(bunt,Math.max(beat(t,21.6,22.6),manual?beat(act,.7,1):0));
   champ.s=Math.max(beat(t,22,22.8),manual?beat(act,.8,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,12.6,13.6):0;
  };
 }};

/* ───────────── 5 · Titles in England (england) ───────────── */
const england:SpreadDef={id:'england',rest:17.2,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'MANCHESTER CITY','PREMIER LEAGUE 2012 · 2014 · FA CUP 2011',INK.blue,INK.navy,.42);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'CHAMPIONS OF ENGLAND','WHERE YOU START DOES NOT DECIDE WHERE YOU GO',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'e-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);crowd(k,4.5,1.2,2.45,MCI,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);crowd(k,4.5,1.2,2.45,MCI,4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const drops=bd.add(S.drops(K+'e-drops',3.6,1.0),'L',.4,1.9,{out:.02});
  const t1=[['PREMIER LEAGUE','2012'],['FA CUP','2011'],['PREMIER LEAGUE','2014']].map(([a,y],i)=>B.stand(P.lineCard(`e-t${i}`,1.3,.58,[a,y],[INK.sky,INK.yellow,INK.sky][i]),-4.0+i*1.4,-1.5+(i%2)*.15,{layer:1,s:0}));
  const bench=B.stand(S.bench(K+'e-bench',1.4,.5),-3.6,.7,{layer:2});void bench;
  const E=B.person(K+'e-e',-3.6,.8,1.5,{shirt:'fan',...ED,adult:true,legs:'kick',face:'smile',layer:3});
  const ball=B.stand(S.ball(K+'e-ball',.1),-1.8,.3,{layer:3,tab:false});
  const bench2=B.stand(S.flipCard(K+'e-b',1.8,.32,'OFF THE BENCH, INTO THE GAME',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'e-board',2.0,1.6,'MANCHESTER CITY'),2.5,-1.4,{layer:1});
  board.add(P.lineCard('e-ch',1.7,.7,['CHAMPIONS','OF ENGLAND'],INK.yellow),0,.4,{z:.012});
  const cover=board.flap(P.lineCard('e-cover',1.74,.74,['FROM SARAJEVO','TO …'],INK.sky),0,1.12,{z:.03});
  const ER=B.person(K+'e-er',2.5,.4,1.5,{shirt:'fan',...ED,adult:true,face:'grin',layer:2});
  const fans=[[1.2,.9,'curly'],[3.8,.9,'cap']].map(([x,z,h],i)=>B.person(K+`e-f${i}`,x as number,z as number,1.05,{shirt:i?'fan':'casual',hair:h as 'curly',skin:SKINS[i*2+1],face:'grin',layer:3}));
  const big=B.stand(S.flipCard(K+'e-big',1.8,.32,'ONE OF THE BIGGEST LEAGUES',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   E.body.s=beat(t,2.2,3);pop(drops,beat(t,2,3)*(1-beat(t,17.4,18.4)));t1.forEach((c,i)=>{c.s=beat(t,5.6+i*1.6,6.4+i*1.6);});
   // Off the bench, then a goal.
   const on=beat(t,13.4,14.6);E.body.x=-3.6+1.4*on;E.body.z=.8-.4*on;E.leg!.rot=-1.1*pulse(t,14.8,15.4);const k=beat(t,15,15.8);ball.x=-1.8+1.0*k;ball.z=.3-1.4*k;ball.dy=.4*k;bench2.s=beat(t,13.6,14.4);cheer(E,beat(t,15.8,16.4));
   // Flip the scoreboard: champions of England.
   const flip=manual?beat(act,0,.5):beat(t,17.8,19);cover.flip=-3.1*flip;ER.body.s=Math.max(beat(t,19.4,20.2),manual?beat(act,.3,.7):0);cheer(ER,Math.max(beat(t,20,20.6),manual?beat(act,.5,.9):0));
   fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,20.2+i*.4,21+i*.4),manual?beat(act,.5,.9):0);cheer(f,Math.max(beat(t,21+i*.3,21.6+i*.3),manual?beat(act,.7,1):0));});
   big.s=Math.max(beat(t,22,22.8),manual?beat(act,.8,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.2,18.2):0;
  };
 }};

/* ───────────── 6 · A first World Cup for Bosnia (bosnia) ───────────── */
const bosnia:SpreadDef={id:'bosnia',rest:16.6,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'2014 WORLD CUP · BRAZIL','10 QUALIFYING GOALS · A FIRST WIN, v IRAN',INK.yellow,INK.white,.4);},
 right:k=>{floor(k,0,5,'#e3d6bb','#b2a283');caption(k,2.5,'CAPTAIN · A LETTER IN 2026','SHARE YOUR STORY TO HELP OTHERS',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,BIH,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,BIH,4);k.fill(rect(0,2.4,4.5,.6),'#e3d6bb');});
  const fw=bd.add(S.firework(K+'b-fw',.42,INK.yellow),'L',1.2,1.9,{out:.03});
  const ten=B.stand(P.lineCard('b-10',1.4,.62,['10 GOALS','TO QUALIFY'],INK.yellow),-4.1,-1.4,{layer:1,s:0});
  const E=B.person(K+'b-e',-2.6,.4,1.5,{shirt:'navy',...ED,adult:true,legs:'kick',face:'grin',layer:3});
  const mates=[[-4.0,.9,'curly'],[-1.2,.9,'short']].map(([x,z,h],i)=>B.person(K+`b-m${i}`,x as number,z as number,1.28,{shirt:'navy',hair:h as 'curly',skin:SKINS[i*2],adult:true,face:'grin',layer:3}));
  const win=B.stand(S.flipCard(K+'b-win',1.8,.32,'FIRST WORLD CUP WIN!',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const iran=B.stand(P.lineCard('b-iran',1.3,.58,['v IRAN','A GOAL!'],INK.sky),-1.4,-1.4,{layer:1,s:0});
  const pL=B.stand(S.post(K+'b-pl',.1,1.9,INK.wood),1.0,-1.2,{layer:1,tab:false}),pR=B.stand(S.post(K+'b-pr',.1,1.9,INK.wood),4.0,-1.2,{layer:1,tab:false});void pL;void pR;
  const ban=B.stand(S.banner(K+'b-ban',2.9,.6,'FOR BOSNIA!',INK.blue,INK.yellow),2.5,-1.15,{layer:1,tab:false});
  const ER=B.person(K+'b-er',2.6,.3,1.5,{shirt:'navy',...ED,adult:true,face:'grin',layer:2});
  const band=ER.body.add(P.disc('b-band',.15,'C'),.19,ER.h*.62,{z:.02,anchor:'center'});
  const most=B.stand(S.flipCard(K+'b-most',1.7,.32,'MOST GAMES · MOST GOALS',INK.yellow,INK.navy),3.9,1.6,{layer:3,s:0,tab:false});
  const let_=B.stand(letter(K+'b-letter',1.0,1.2),1.3,.5,{layer:3,s:0});
  const kids=[[3.6,.9,'bun'],[4.4,.6,'short']].map(([x,z,h],i)=>B.person(K+`b-k${i}`,x as number,z as number,.94,{shirt:i?'bib':'fan',hair:h as 'bun',hairColor:'#2a1d16',skin:SKINS[i*2],face:'grin',layer:3}));
  const hope=B.stand(S.flipCard(K+'b-hope',1.6,.32,'HOPE CAN GROW',INK.pink),2.2,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.6):b.t;
   E.body.s=beat(t,2.6,3.4);mates.forEach((m,i)=>{m.body.s=beat(t,3+i*.4,3.8+i*.4);});ten.s=beat(t,3.4,4.2);
   E.leg!.rot=-1.1*pulse(t,11.6,12.2);iran.s=beat(t,12,12.8);win.s=beat(t,13.6,14.4);pop(fw,beat(t,13.8,14.8));fw.rot=t*.2;
   cheer(E,beat(t,14,14.6));mates.forEach((m,i)=>cheer(m,beat(t,14.2+i*.3,14.8+i*.3)));
   // Raise the banner: for Bosnia!
   const raise=manual?beat(act,0,.6):beat(t,17.2,18.6);ban.dy=-1.2+1.5*raise;pop(ban,Math.min(1,.2+raise*2));
   ER.body.s=Math.max(beat(t,18.8,19.6),manual?beat(act,.3,.7):0);pop(band,Math.max(beat(t,19.4,20.2),manual?beat(act,.4,.8):0));most.s=Math.max(beat(t,20.6,21.4),manual?beat(act,.5,.8):0);
   let_.s=Math.max(beat(t,25.4,26.2),manual?beat(act,.6,.9):0);kids.forEach((q,i)=>{q.body.s=Math.max(beat(t,31.6+i*.4,32.4+i*.4),manual?beat(act,.7,1):0);});
   hope.s=Math.max(beat(t,36.6,37.4),manual?beat(act,.85,1):0);kids.forEach((q,i)=>cheer(q,Math.max(beat(t,37+i*.3,37.6+i*.3),manual?beat(act,.95,1):0)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16.6,17.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={siege,mother,tall,germany,england,bosnia};
