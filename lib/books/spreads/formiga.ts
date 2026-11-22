/**
 * The six Formiga pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/formiga/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is an unfair rule changing and a very long career: a sign, a gate, a line of paper ants,
 * two medals, steps and a flag. Family resistance is shown only as a "not everyone said yes" card. Kits are colour only.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,cheer,pop,chalk,dash,pitch,pitchLines,paving,floor,caption,wash,daySky,crowd,nightSky,lightRig,roofs,skyline,sea,palms,backdrop,plates} from '../spreadKit';

const K='formiga-';
const P=plates(K),{sp}=P;
const FM={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1512'};
const BRA=[INK.yellow,INK.green,INK.blue,INK.yellow];
const SILVER='#cfd3dc';

/* ───────────── Formiga-only plates ───────────── */
/** A line of paper ants carrying a ball together. */
const antLine=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f6e8cc');k.dots(b,INK.navy,.035,.1);k.key(b,.014);
 k.key(`M${w*.04} ${h*.86} L${w*.96} ${h*.86}`,.012,INK.brown);
 for(let i=0;i<5;i++){const x=w*(.14+i*.18),y=h*.72;for(const [dx,r] of [[-.07,.035],[0,.03],[.065,.04]] as const)k.fill(ell(x+dx,y,r,r*.8),INK.navy);
  for(const s of [-1,0,1])k.key(`M${x+s*.04} ${y+.02} l${s*.03-.02} .07`,.008,INK.navy);k.key(`M${x+.08} ${y-.02} l.04 -.06`,.008,INK.navy);
  if(i===2){k.fill(ell(x,y-.17,.11,.11),INK.white);k.key(ell(x,y-.17,.11,.11),.01);k.fill(poly([[x,y-.22],[x+.04,y-.18],[x+.025,y-.13],[x-.025,y-.13],[x-.04,y-.18]]),INK.navy);}
  else{const c=rect(x-.06,y-.15,.12,.08);k.fill(c,[INK.yellow,INK.green,'',INK.sky,INK.pink][i]);k.key(c,.008);}}
 k.text('SMALL · STRONG · TOGETHER',w/2,h*.24,h*.12,INK.navy,{weight:900,max:w*.9});},{rim:.02});
const rings=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.blue,INK.yellow,INK.navy,INK.green,INK.red,INK.sky,INK.orange];cs.forEach((c,i)=>{const x=w*(.08+i*.14),y=h*(.4+(i%2)*.2);k.key(ell(x,y,h*.2,h*.2),.025,c);});},{rim:0,grain:.4});
const stepBlock=(key:string,w:number,h:number,label:string,c:string)=>P.segment(key,w,h,label,c);

/* ───────────── 1 · Born when girls could not play (ban) ───────────── */
const ban:SpreadDef={id:'ban',rest:19.3,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'SALVADOR · BRAZIL','BORN 1978 · WOMEN WERE NOT ALLOWED TO PLAY',INK.blue,INK.navy,.4);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'1979 · THE LAW IS REMOVED','STILL NOT TAKEN SERIOUSLY FOR YEARS',INK.green,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.1,2);k.fill(rect(0,2.1,4.5,.9),'#e3d6bb');},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.6,.5);palms(k,4.5,2.3,5);k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'b-sun',.3),'R',3.8,2.2,{out:.012});
  const born=B.stand(S.flipCard(K+'b-born',1.3,.32,'BORN 1978',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const law=B.stand(P.lineCard('b-law',1.5,.62,['A LAW SAID:','WOMEN CANNOT PLAY'],'#c9b9d6'),-4.0,-1.2,{layer:1,s:0});
  const wall=B.stand(P.sp('b-wall',2.0,.7,k=>{const b=rect(0,0,2,.7);k.fill(b,'#d9cdb6');k.dots(b,INK.navy,.03,.15);k.key(b,.014);for(let r=0;r<3;r++)for(let x=(r%2)*.2;x<2;x+=.4)k.key(rect(x,r*.23,.4,.23),.006,'#a9a08c');}),-1.6,.2,{layer:3});
  const girls=[[-2.2,-.3,'bun'],[-1.2,-.4,'curly']].map(([x,z,h],i)=>B.person(K+`b-g${i}`,x as number,z as number,1.0,{shirt:i?'casual':'fan',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[i?1:3],face:'shy',layer:2}));
  const secret=B.stand(S.flipCard(K+'b-sec',1.5,.32,'PLAYING IN SECRET',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'b-post',1.5,1.5,INK.white),1.4,-1.0,{layer:1});
  post.add(P.lineCard('b-yes',1.3,.8,['EVERYONE','PLAYS'],INK.grass),0,.5,{z:.012});
  const no=post.flap(P.lineCard('b-no',1.3,.8,['NO GIRLS','ALLOWED'],INK.pink,INK.white),0,1.32,{z:.03});
  const players=[[2.8,.3,'bun'],[3.7,-.3,'curly'],[4.4,.6,'long']].map(([x,z,h],i)=>B.person(K+`b-p${i}`,x as number,z as number,1.0,{shirt:'bib',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[(i*2+1)%5],face:'grin',layer:3}));
  const y79=B.stand(S.flipCard(K+'b-79',1.3,.32,'1979',INK.yellow,INK.navy),1.4,1.95,{layer:3,s:0,tab:false});
  const notyet=B.stand(S.flipCard(K+'b-not',1.8,.32,'NOT TAKEN SERIOUSLY',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  const F=B.person(K+'b-f',2.0,.9,.92,{shirt:'bib',...FM,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'b-ball',.09),2.35,1.05,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.3):b.t;
   sun.dy=.3*beat(t,0,2);born.s=beat(t,3,3.8);law.s=beat(t,9.4,10.2);
   girls.forEach((g,i)=>{g.body.s=beat(t,15+i*.4,15.8+i*.4);g.body.dy=.18*Math.abs(Math.sin(t*1.6+i))*(t>15.8&&t<19.4?1:0);});secret.s=beat(t,16,16.8);
   // Flip the sign: "No girls allowed" turns over to "Everyone plays".
   const flip=manual?beat(act,0,.5):beat(t,19.8,20.8);no.flip=-3.1*flip;
   y79.s=Math.max(beat(t,21.6,22.4),manual?beat(act,.3,.7):0);players.forEach((p,i)=>{p.body.s=Math.max(beat(t,22+i*.4,22.8+i*.4),manual?beat(act,.4,.8):0);});
   notyet.s=Math.max(beat(t,25.4,26.2),manual?beat(act,.6,.9):0);
   F.body.s=Math.max(beat(t,30.4,31.2),manual?beat(act,.8,1):0);F.leg!.rot=-.8*Math.abs(Math.sin(t*2.4))*(t>31?1:0);ball.visible=F.body.s>.4;ball.dy=.1*Math.abs(Math.sin(t*2.4))*(t>31?1:0);
   const c=Math.max(beat(t,33,33.6),manual?beat(act,.95,1):0);players.forEach(p=>cheer(p,c));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,19.2,20.2):0;
  };
 }};

/* ───────────── 2 · Her mother said yes (mother) ───────────── */
const mother:SpreadDef={id:'mother',rest:13.4,
 left:k=>{paving(k,-5,0,'#e9d6b4','#b9a27a');caption(k,-2.5,'CAMAÇARI','MOVED AT 9 · FOOTBALL FROM 12',INK.blue,INK.navy,.42);},
 right:k=>{floor(k,0,5,'#e9a76a','#b8743f');chalk(k,`M.2 ${Z(-1.9)} L4.8 ${Z(-1.9)} L4.8 ${Z(1.5)} L.2 ${Z(1.5)} Z`);chalk(k,ell(2.5,Z(-.2),.5,.5));caption(k,2.5,'FUTSAL · EUROEXPORT','QUICK PASSING · CLOSE CONTROL',INK.navy,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'m-bd',k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.2,5);k.fill(rect(0,2.2,4.5,.8),'#e9d6b4');},
   k=>{wash(k,4.5,3,'#d9e6ef',INK.sky,y=>.3);for(let x=.3;x<4.5;x+=.5)k.key(`M${x} .2 L${x} 2.3`,.012,INK.grey);k.fill(rect(0,2.3,4.5,.7),'#e9a76a');});
  B.stand(S.house(K+'m-house',1.4,1.4),-4.1,-1.4,{layer:1});
  const move=B.stand(S.flipCard(K+'m-move',1.3,.32,'MOVED AT 9',INK.sky,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const F=B.person(K+'m-f',-2.6,.5,1.02,{shirt:'casual',...FM,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'m-ball',.09),-2.25,.65,{layer:3,tab:false});
  const twelve=B.stand(S.flipCard(K+'m-12',1.3,.32,'AGED 12',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const notall=B.stand(P.lineCard('m-not',1.5,.62,['NOT EVERYONE','SAID YES'],'#c9b9d6'),-1.4,-1.0,{layer:2,s:0});
  const mum=B.person(K+'m-mum',-1.3,.6,1.6,{shirt:'casual',hair:'bun',hairColor:'#1d1512',skin:SKINS[3],adult:true,face:'smile',layer:3});
  const gate=B.stand(P.gatePosts('m-gate',1.5,1.15),1.0,-.6,{layer:2});
  const gL=gate.flap(P.gateLeaf('m-gl',.64,.86),-.64,.02,{anchor:'bl',axis:'y',z:.02}),gR=gate.flap(P.gateLeaf('m-gr',.64,.86),.64,.02,{anchor:'br',axis:'y',z:.02});
  gate.add(P.lineCard('m-name',1.3,.26,['EUROEXPORT'],INK.yellow),0,1.1,{z:.03});
  B.stand(S.goal(K+'m-goal',1.2,.8),4.3,-1.5,{layer:1});
  const FR=B.person(K+'m-fr',1.0,.5,1.04,{shirt:'bib',...FM,legs:'kick',face:'grin',layer:3});
  const mumR=B.person(K+'m-mumr',.4,1.0,1.6,{shirt:'casual',hair:'bun',hairColor:'#1d1512',skin:SKINS[3],adult:true,face:'grin',layer:3});
  const mate=B.person(K+'m-mate',3.4,.1,1.04,{shirt:'bib',hair:'bun',hairColor:'#3b2e3f',skin:SKINS[1],face:'grin',layer:2});
  const one=B.stand(S.flipCard(K+'m-one',1.8,.32,'ONE PERSON ON HER SIDE',INK.pink),1.6,1.95,{layer:3,s:0,tab:false});
  const skill=B.stand(S.flipCard(K+'m-skill',1.6,.32,'PASS · CONTROL · PASS',INK.yellow,INK.navy),3.8,1.95,{layer:3,s:0,tab:false});
  const ballR=B.stand(S.ball(K+'m-ballR',.09),1.4,.6,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.4):b.t;
   move.s=beat(t,2.4,3.2);F.body.s=beat(t,7.6,8.4);const j=t>8.4&&t<13.4?Math.abs(Math.sin(t*3)):0;F.leg!.rot=-.8*j;ball.dy=.22*j;ball.visible=F.body.s>.4;twelve.s=beat(t,8,8.8);
   notall.s=beat(t,10.4,11.2)*(1-Math.max(beat(t,15.4,16),manual?beat(act,.2,.4):0));mum.body.s=beat(t,11.6,12.4);mum.armR.rot=.12+.8*beat(t,12.4,13.2);
   // Open the gate: her mother takes her to futsal.
   const open=manual?beat(act,0,.5):beat(t,13.9,15.1);gL.flip=-1.8*open;gR.flip=1.8*open;
   const walk=Math.max(beat(t,15.6,17.4),manual?beat(act,.3,.8):0);FR.body.s=walk>0?1:0;FR.body.visible=walk>.02;mumR.body.s=walk>0?1:0;mumR.body.visible=walk>.02;
   FR.body.x=1.0+1.4*walk;FR.body.z=.5-.2*walk;mumR.body.x=.4+.5*walk;mumR.armL.rot=-.12-.9*walk;
   mate.body.s=Math.max(beat(t,18,18.8),manual?beat(act,.6,.9):0);one.s=Math.max(beat(t,21.2,22),manual?beat(act,.7,1):0);
   // Quick passes on the futsal court.
   const pass=t>25?((t-25)*.6)%1:0;const [px,pz]=t>25?track(pass,[[0,2.75,.4],[.45,3.25,.15],[.55,3.25,.15],[1,2.75,.4]]):[1.4,.6];ballR.x=px;ballR.z=pz;ballR.visible=walk>.5;
   FR.leg!.rot=-.9*(t>25?pulse(pass,0,.1)+pulse(pass,.9,1):0);skill.s=Math.max(beat(t,25.2,26),manual?beat(act,.85,1):0);
   cheer(FR,Math.max(beat(t,31.4,32),manual?beat(act,.95,1):0)*.8);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,13.4,14.4):0;
  };
 }};

/* ───────────── 3 · Small and strong (ant) ───────────── */
const ant:SpreadDef={id:'ant',rest:14.5,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'FORMIGA = ANT','SMALL, AGAINST BIGGER, OLDER PLAYERS',INK.green,INK.navy,.42);},
 right:k=>{pitch(k,0,5,'#c9d98e',INK.leaf,.8);caption(k,2.5,'SHE NEVER LIKED THE NAME','BUT IT STAYED WITH HER',INK.blue,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'a-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.4,2.45,[INK.grey,INK.yellow,INK.white,INK.sky],2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);k.fill(rect(0,1.9,4.5,1.1),'#c9d98e');for(let i=0;i<20;i++)k.key(`M${.1+i*.23} 2.2 q.03 -.14 .06 0`,.012,INK.leaf);});
  const sun=bd.add(S.sun(K+'a-sun',.28),'R',3.8,2.2,{out:.012});
  const word=B.stand(P.lineCard('a-word',1.4,.6,['FORMIGA','= ANT'],INK.yellow),-4.1,-1.3,{layer:1,s:0});
  const big=[[-3.4,-.4,'short'],[-1.6,-.2,'bald'],[-2.4,.9,'curly']].map(([x,z,h],i)=>B.person(K+`a-m${i}`,x as number,z as number,1.62,{shirt:'navy',hair:h as 'short',skin:SKINS[i+1],adult:true,beard:i===1,face:'open',layer:2}));
  const F=B.person(K+'a-f',-2.6,.4,1.0,{shirt:'bib',...FM,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'a-ball',.09),-2.3,.55,{layer:3,tab:false});
  const fan=B.person(K+'a-fan',-.6,-1.4,1.5,{shirt:'fan',hair:'cap',skin:SKINS[2],adult:true,face:'grin',layer:1});
  const note=fan.body.add(S.noteCard(K+'a-note',.62,.42,['LIKE AN','ANT!']),.36,fan.h*.66,{z:.03});
  const all=B.stand(S.flipCard(K+'a-all',1.8,.32,'ALL OVER THE PITCH',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'a-post',2.6,1.4,INK.white),2.5,-1.0,{layer:1});
  const ants=post.add(antLine(K+'a-ants',2.4,1.1),0,.15,{z:.012});
  const cover=post.flap(P.lineCard('a-cover',2.5,1.3,['LIFT THE FLAP'],INK.green,INK.white),0,1.37,{z:.03});
  const never=B.stand(P.lineCard('a-never',1.6,.58,['“NEVER LIKED','THE NICKNAME”'],INK.sky),4.1,.2,{layer:2,s:0});
  const FR=B.person(K+'a-fr',1.4,.6,1.02,{shirt:'bib',...FM,face:'grin',layer:3});
  const tiny=B.stand(S.flipCard(K+'a-tiny',1.6,.32,'TINY, BUT STRONG',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.5):b.t;
   pop(sun,beat(t,0,1.5));word.s=beat(t,2.2,3);big.forEach((m,i)=>{m.body.s=beat(t,5+i*.3,5.8+i*.3);});F.body.s=beat(t,5.4,6.2);
   fan.body.s=beat(t,6.4,7.2);pop(note,beat(t,8,8.8));
   // She runs all over the pitch, between the big players.
   const run=t>11.4?((t-11.4)*.18)%1:0;const [fx,fz]=track(run,[[0,-2.6,.4],[.25,-4.0,.1],[.5,-2.0,-.6],[.75,-1.0,.8],[1,-2.6,.4]]);F.body.x=fx;F.body.z=fz;F.leg!.rot=-.6*Math.abs(Math.sin(t*5))*(t>11.4?1:0);ball.x=fx+.3;ball.z=fz+.1;
   all.s=beat(t,11.6,12.4);
   // Lift the flap: a line of paper ants carrying a ball together.
   const lift=manual?beat(act,0,.6):beat(t,15,16.2);cover.flip=-2.9*lift;
   never.s=Math.max(beat(t,16.8,17.6),manual?beat(act,.4,.8):0);FR.body.s=Math.max(beat(t,17.4,18.2),manual?beat(act,.5,.9):0);
   ants.dx=.08*Math.sin(t*2)*Math.max(beat(t,22.4,23.2),manual?beat(act,.6,1):0);tiny.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.7,1):0);
   cheer(FR,Math.max(beat(t,27.8,28.4),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,14.4,15.4):0;
  };
 }};

/* ───────────── 4 · So close, again and again (silver) ───────────── */
const silver:SpreadDef={id:'silver',rest:27.1,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1995 · FIRST GAME FOR BRAZIL','AGED 17',INK.green,INK.navy,.42);},
 right:k=>{floor(k,0,5,'#e3d6bb','#b2a283');caption(k,2.5,'OLYMPIC FINALS 2004 · 2008','AND SECOND AT THE 2007 WORLD CUP',INK.blue,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,BRA,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{wash(k,4.5,3,'#e7dcef',INK.pink,y=>.15);crowd(k,4.5,1.5,2.4,[INK.grey,'#8f95ad',INK.white],3);k.fill(rect(0,2.4,4.5,.6),'#e3d6bb');});
  const F=B.person(K+'s-f',-2.6,.5,1.2,{shirt:'bib',...FM,face:'grin',layer:3});
  const seventeen=B.stand(S.flipCard(K+'s-17',1.3,.32,'AGED 17',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const close=B.stand(S.flipCard(K+'s-close',1.4,.32,'SO CLOSE',INK.pink),-1.4,1.95,{layer:3,s:0,tab:false});
  const finals=[['2004','OLYMPIC FINAL'],['2007','WORLD CUP FINAL'],['2008','OLYMPIC FINAL']].map(([y,l],i)=>B.stand(P.lineCard(`s-c${y}`,1.3,.6,[y,l],[INK.sky,'#c9b9d6',INK.sky][i]),-4.0+i*1.4,-1.3+(i%2)*.15,{layer:1,s:0}));
  const post=B.stand(S.post(K+'s-post',2.2,1.4,INK.white),2.0,-1.0,{layer:1});
  const medals=[0,1].map(i=>post.add(P.medal(`s-m${i}`,.6,SILVER,INK.blue),-.5+i*1.0,.2,{z:.012}));void medals;
  const covers=[0,1].map(i=>post.flap(P.lineCard(`s-cv${i}`,.9,1.1,[['2004','2008'][i],'FINAL'],INK.yellow),-.5+i*1.0,1.3,{z:.03}));
  const FR=B.person(K+'s-fr',3.8,.2,1.22,{shirt:'bib',...FM,adult:true,face:'sad',layer:3});
  const back=B.stand(S.flipCard(K+'s-back',1.6,.32,'SHE CAME BACK',INK.yellow,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const young=[[1.4,.9,'bun'],[2.4,.9,'curly']].map(([x,z,h],i)=>B.person(K+`s-y${i}`,x as number,z as number,1.0,{shirt:'bib',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[i*2+1],face:'grin',layer:3}));
  const help=B.stand(S.flipCard(K+'s-help',1.6,.32,'HELPING THE YOUNG ONES',INK.sky,INK.navy),4.1,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'s-ball',.09),3.3,.6,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,27.1):b.t;
   F.body.s=beat(t,2.8,3.6);seventeen.s=beat(t,4,4.8);close.s=beat(t,8.6,9.4);finals.forEach((f,i)=>{f.s=beat(t,12.4+i*2.4,13.2+i*2.4);});F.body.lean=.08*beat(t,22,23);
   // Turn over the two medals: silver, twice.
   covers.forEach((c,i)=>{const v=manual?beat(act,i*.3,i*.3+.4):beat(t,27.6+i*.7,28.6+i*.7);c.flip=-3.0*v;});
   FR.body.s=Math.max(beat(t,29.6,30.4),manual?beat(act,.5,.8):0);const up=Math.max(beat(t,32.5,33.5),manual?beat(act,.7,1):0);FR.body.lean=.12*(1-up);
   back.s=Math.max(beat(t,32.6,33.4),manual?beat(act,.7,1):0);young.forEach((y,i)=>{y.body.s=Math.max(beat(t,36.2+i*.4,37+i*.4),manual?beat(act,.8,1):0);});
   help.s=Math.max(beat(t,37,37.8),manual?beat(act,.85,1):0);FR.armL.rot=-.12-1.0*Math.max(beat(t,37.4,38.2),manual?beat(act,.9,1):0);ball.visible=up>.5;ball.x=3.3-.8*beat(t,38,39);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,27,28):0;
  };
 }};

/* ───────────── 5 · Seven World Cups (records) ───────────── */
const records:SpreadDef={id:'records',rest:22.9,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'7 WORLD CUPS','OLDEST SCORER AT 37 · OLDEST PLAYER AT 41',INK.green,INK.navy,.42);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'7 OLYMPIC GAMES','1996 TO 2020 · SEVEN AND SEVEN',INK.blue,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,BRA,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.4,2.45,BRA,5);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const bunt=bd.add(S.bunting(K+'r-bunt',3.8,.4,[INK.yellow,INK.green,INK.blue,INK.yellow,INK.green,INK.blue,INK.yellow]),'L',.4,.95,{out:.02});
  const balls=[0,1,2,3,4,5,6].map(i=>B.stand(S.ball(K+'r-b',.12),-4.3+i*.6,-1.4,{layer:1,s:0,tab:false}));
  const F=B.person(K+'r-f',-2.5,.4,1.24,{shirt:'bib',...FM,adult:true,legs:'kick',face:'grin',layer:3});
  const s37=B.stand(P.lineCard('r-37',1.3,.58,['2015 · AGED 37','OLDEST SCORER'],INK.yellow),-4.0,.2,{layer:2,s:0});
  const s41=B.stand(P.lineCard('r-41',1.3,.58,['2019 · AGED 41','OLDEST PLAYER'],INK.sky),-1.0,.2,{layer:2,s:0});
  const forty=B.stand(S.flipCard(K+'r-40',1.8,.32,'MOST STOP BEFORE 40',INK.pink),-2.5,1.95,{layer:3,s:0,tab:false});
  const steps=[['1996',.4],['2008',.8],['2020',1.2]].map(([l,h],i)=>B.stand(stepBlock(`r-st${i}`,.9,h as number,l as string,[INK.yellow,INK.sky,INK.grass][i]),1.4+i*1.0,-.4,{layer:2}));
  const ringsP=B.stand(rings(K+'r-rings',2.4,.5),2.6,-1.7,{layer:1,s:0,tab:false});
  const FR=B.person(K+'r-fr',.6,.2,1.2,{shirt:'bib',...FM,adult:true,face:'grin',layer:3});
  const seven=B.stand(S.flipCard(K+'r-77',1.6,.32,'SEVEN AND SEVEN!',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  const nobody=B.stand(S.flipCard(K+'r-nob',1.6,.32,'NOBODY ELSE',INK.pink),4.3,1.6,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.9):b.t;
   pop(bunt,beat(t,2,3));balls.forEach((q,i)=>{q.s=beat(t,2.4+i*.4,2.9+i*.4);});F.body.s=beat(t,2.2,3);
   s37.s=beat(t,7,7.8);F.leg!.rot=-1.0*pulse(t,8.4,9);s41.s=beat(t,13.6,14.4);forty.s=beat(t,19.6,20.4);
   // Climb the steps: one Olympics block at a time.
   const cl=manual?act:track(t,[[23.4,0],[24,.33],[24.6,.33],[25.2,.67],[25.8,.67],[26.4,1]])[0];
   const pos=track(cl,[[0,.6,.2,0],[.33,1.4,-.2,.4],[.67,2.4,-.2,.8],[1,3.4,-.2,1.2]]);FR.body.x=pos[0];FR.body.z=pos[1];FR.body.dy=pos[2];
   ringsP.s=Math.max(beat(t,25,25.8),manual?beat(act,.5,.9):0);seven.s=Math.max(beat(t,30.6,31.4),manual?beat(act,.85,1):0);nobody.s=Math.max(beat(t,31.4,32.2),manual?beat(act,.9,1):0);
   cheer(FR,Math.max(beat(t,30.8,31.4),manual?beat(act,.95,1):0));cheer(F,beat(t,31,31.6)*.7);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,22.8,23.8):0;
  };
 }};

/* ───────────── 6 · A long, long journey (farewell) ───────────── */
const farewell:SpreadDef={id:'farewell',rest:26.1,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'NOVEMBER 2021 · AGED 43','234 GAMES · 26 YEARS FOR BRAZIL',INK.yellow,INK.white,.4);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);caption(k,2.5,'OBRIGADA, FORMIGA!','SHE OPENED THE WAY',INK.yellow,INK.white,.42);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,BRA,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,BRA,4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'f-fw1',.42,INK.yellow),'R',1.2,2.0,{out:.03}),bd.add(S.firework(K+'f-fw2',.38,INK.green),'R',3.4,2.1,{out:.03})];
  const F=B.person(K+'f-f',-2.5,.4,1.3,{shirt:'bib',...FM,adult:true,face:'grin',layer:3});
  const games=B.stand(P.lineCard('f-234',1.4,.62,['234','GAMES'],INK.yellow),-4.1,-1.3,{layer:1,s:0});
  const years=B.stand(S.flipCard(K+'f-26',1.4,.32,'26 YEARS',INK.sky,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const paris=B.stand(P.sp('f-paris',1.3,1.3,k=>{k.fill(rect(0,0,1.3,1.3),'#1d2c57');k.key(rect(0,0,1.3,1.3),.014);k.key('M.65 .12 L.4 1.15 M.65 .12 L.9 1.15 M.48 .8 L.82 .8 M.55 .5 L.75 .5',.03,INK.yellow);k.text('PARIS',.65,1.25,.12,INK.white,{weight:900});},{rim:.016}),-1.1,-1.3,{layer:1,s:0});
  const ucl=B.stand(S.flipCard(K+'f-ucl',1.8,.32,'OLDEST TO SCORE, AT 41',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const flag=B.stand(P.flag('f-flag',1.6,2.0,[INK.green,INK.yellow,INK.green]),2.5,-.6,{layer:2,s:.05});
  const ban=B.stand(S.banner(K+'f-ban',2.4,.5,'OBRIGADA, FORMIGA!',INK.yellow,INK.navy),2.5,-1.6,{layer:1,s:0,tab:false});
  const kids=[[1.2,.9,'bun'],[1.9,.4,'short'],[3.2,.5,'curly'],[3.9,.9,'long']].map(([x,z,h],i)=>B.person(K+`f-k${i}`,x as number,z as number,.98,{shirt:(['bib','casual','bib','fan'] as const)[i],hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[(i*2)%5],face:'grin',layer:3}));
  const way=B.stand(S.flipCard(K+'f-way',1.8,.32,'FOR THE GIRLS AND BOYS NEXT',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26.1):b.t;
   F.body.s=beat(t,2.4,3.2);games.s=beat(t,9.4,10.2);years.s=beat(t,10.4,11.2);cheer(F,beat(t,11,11.8)*.6);paris.s=beat(t,17.8,18.6);ucl.s=beat(t,21.8,22.6);
   // Wave the flag: it swings on its pole.
   const wave=manual?beat(act,0,.4):beat(t,26.6,27.4);const sw=manual?Math.sin(act*Math.PI*4)*(1-beat(act,.8,1)):Math.sin((t-26.6)*3)*(t>26.6&&t<34?1:0);flag.yaw=.35*sw*wave;flag.lean=-.06*sw*wave;flag.s=Math.max(.05,wave);
   ban.s=Math.max(beat(t,28.4,29.2),manual?beat(act,.4,.8):0);fw.forEach((q,i)=>{pop(q,Math.max(beat(t,28.6+i*.4,29.6+i*.4),manual?beat(act,.5,.9):0));q.rot=t*.2;});
   kids.forEach((q,i)=>{q.body.s=Math.max(beat(t,35.6+i*.3,36.4+i*.3),manual?beat(act,.7,1):0);cheer(q,Math.max(beat(t,36.6+i*.2,37.2+i*.2),manual?beat(act,.9,1):0));});
   way.s=Math.max(beat(t,36,36.8),manual?beat(act,.8,1):0);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,26,27):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={ban,mother,ant,silver,records,farewell};
