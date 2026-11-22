/**
 * The six Vinícius Júnior pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/vinicius/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Racism is named as wrong and never drawn: no hostile figures, only a rain cloud lifted by players standing together.
 * Kits are colour only (no crests, no likeness).
 */
import {INK,type Kit,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,backdrop,plates,ballPair} from '../spreadKit';

const K='vinicius-';
const P=plates(K),{sp}=P;
const VINI={skin:'#5b3a2a',hair:'curly' as const,hairColor:'#1d1512'};
const RIO=[INK.red,'#2b2b33',INK.red,INK.white];

/* ───────────── Vinícius-only plates ───────────── */
function court(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,6.4);k.fill(p,'#e58c4e');k.dots(p,INK.red,.06,.18);const c=(x1+x0)/2;
 chalk(k,rect(x0+.3,Z(-2.0),x1-x0-.6,3.6),.035);chalk(k,`M${c} ${Z(-2.0)} L${c} ${Z(1.6)}`,.03);chalk(k,ell(c,Z(-.2),.5,.5),.03);}
const futsalGoal=(key:string)=>sp(key,1.1,.62,k=>{const net=rect(.05,.05,1.0,.57);k.hatch(net,INK.navy,.06,.78,.006);k.hatch(net,INK.navy,.06,-.78,.006);for(const r of [rect(0,0,1.1,.06),rect(0,0,.06,.62),rect(1.04,0,.06,.62)])k.fill(r,INK.white);k.key('M0 .62 L0 0 L1.1 0 L1.1 .62',.012);for(let i=0;i<7;i++)k.fill(rect(i*.16,0,.08,.06),INK.red);});
const tv=(key:string)=>sp(key,.5,.46,k=>{const b=rect(0,0,.5,.38);k.fill(b,'#2b2b33');k.key(b,.012);const s=rect(.04,.04,.42,.3);k.fill(s,INK.grass);k.dots(s,INK.leaf,.03,.3);k.circle(.25,.19,.05,INK.white);k.keyFill(rect(.22,.38,.06,.08),'#2b2b33');});
const tower=(k:Kit,x:number,y:number,h:number)=>{const w=h*.42;k.keyFill(`M${x-w/2} ${y} L${x-w*.08} ${y-h*.7} L${x} ${y-h} L${x+w*.08} ${y-h*.7} L${x+w/2} ${y} L${x+w*.3} ${y} Q${x} ${y-h*.25} ${x-w*.3} ${y} Z`,'#5a5f7e');k.key(`M${x-w*.32} ${y-h*.3} L${x+w*.32} ${y-h*.3} M${x-w*.16} ${y-h*.58} L${x+w*.16} ${y-h*.58}`,.02,'#5a5f7e');};
const blackboard=(k:Kit,x:number,y:number,w:number,h:number)=>{const b=rect(x,y,w,h);k.fill(b,'#2f5a46');k.dots(b,INK.white,.05,.06);k.key(b,.03,INK.wood);k.text('A B C',x+w*.3,y+h*.45,h*.22,INK.white,{weight:800});k.text('1 2 3',x+w*.72,y+h*.78,h*.22,INK.yellow,{weight:800});};
const bookCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.blue);k.dots(b,INK.navy,.035,.3);k.key(b,.016);k.fill(rect(0,0,w*.08,h),INK.navy);k.text('LEARN',w*.54,h*.42,h*.16,INK.yellow,{weight:900});k.fill(ell(w*.54,h*.66,w*.14,w*.14),INK.white);k.key(ell(w*.54,h*.66,w*.14,w*.14),.012);},{rim:.016});
const bookInside=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.016);k.key(`M${w/2} 0 L${w/2} ${h}`,.014,INK.edge);for(let i=0;i<5;i++){k.key(`M${w*.08} ${h*(.2+i*.12)} L${w*.42} ${h*(.2+i*.12)}`,.012,'#9c8a66');}
 const d=rect(w*.56,h*.22,w*.34,h*.5);k.fill(d,INK.yellow);k.key(d,.012);k.fill(rect(w*.66,h*.36,w*.14,h*.36),INK.wood);k.key(rect(w*.66,h*.36,w*.14,h*.36),.01);k.circle(w*.77,h*.55,.018,INK.gold);k.text('LEARNING OPENS DOORS',w/2,h*.9,h*.07,INK.navy,{weight:900,max:w*.9});},{rim:.016});
const coin=(key:string)=>sp(key,.22,.22,k=>{k.fill(ell(.11,.11,.1,.1),INK.gold);k.key(ell(.11,.11,.1,.1),.01);k.text('$',.11,.155,.12,INK.brown,{weight:900});},{rim:.012});

/* ───────────── 1 · A boy who loved the ball (goncalo) ───────────── */
const goncalo:SpreadDef={id:'goncalo',rest:18.8,
 left:k=>{paving(k,-5,0,'#e6d3b0','#b9a27a');caption(k,-2.5,'SÃO GONÇALO · 2000','NEAR RIO DE JANEIRO, BRAZIL',INK.green);},
 right:k=>{court(k,0,5);caption(k,2.5,'FUTSAL','A HARD COURT · A SMALLER BALL · QUICK FEET',INK.navy,INK.navy);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.5,'#6d9a6a');roofs(k,.1,4.4,2.0,1);roofs(k,.3,4.4,2.4,3);k.fill(rect(0,2.4,4.5,.6),'#e6d3b0');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#6d9a6a');k.fill(rect(0,1.7,4.5,.8),'#f2d3a0');for(let x=.2;x<4.4;x+=.5)k.fill(rect(x,1.85,.3,.25),INK.sky);k.key(rect(0,1.7,4.5,.8),.012);k.fill(rect(0,2.5,4.5,.5),'#e58c4e');});
  const sun=bd.add(S.sun(K+'g-sun',.32),'L',3.7,2.1,{out:.012});
  B.stand(S.tree(K+'g-palm',1.0,1.7,'palm'),-4.4,-1.4,{layer:1});B.stand(S.house(K+'g-home',1.4,1.3),-3.3,-1.6,{layer:1});
  const dad=B.person(K+'g-dad',-2.9,.3,1.7,{shirt:'casual',hair:'short',hairColor:'#1d1512',skin:'#5b3a2a',adult:true,face:'smile',layer:2});
  const boy=B.person(K+'g-boy',-2.0,.9,.92,{shirt:'fan',...VINI,legs:'kick',face:'grin',layer:3});
  const school=B.stand(S.sign(K+'g-school',1.5,1.3,'FLAMENGO SCHOOL',INK.red),-.9,-.9,{layer:2,s:0});
  const money=B.stand(P.lineCard('g-money',1.5,.34,['NOT MUCH MONEY'],INK.white),-4.0,1.9,{layer:3,s:0,tab:false});
  const age=B.stand(S.flipCard(K+'g-age',.9,.32,'AGED 6',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const goalR=B.stand(futsalGoal(K+'g-fgoal'),3.6,-1.5,{layer:1});void goalR;
  const keeper=B.person(K+'g-keep',3.6,-1.25,1.0,{shirt:'keeper',hair:'short',skin:SKINS[2],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const VR=B.person(K+'g-vr',1.6,.7,.98,{shirt:'casual',...VINI,legs:'kick',face:'grin',layer:3});
  const mates=[[2.4,-.5,'short'],[4.4,.4,'curly']].map(([x,z,h],i)=>B.person(K+`g-m${i}`,x as number,z as number,.98,{shirt:i?'bib':'casual',hair:h as 'short',hairColor:'#1d1512',skin:SKINS[(i+1)%5],face:'grin',layer:2}));
  B.slot(1.9,.85,3.5,-1.3);
  const cards=[['QUICK FEET',INK.yellow],['FAST THINKING',INK.sky]].map(([l,c],i)=>B.stand(S.flipCard(K+`g-c${i}`,1.3,.3,l,c,INK.navy),1.4+i*2.0,1.95,{layer:3,s:0,tab:false}));
  const ballL=B.stand(S.ball(K+'g-ballL',.1),-1.6,1.05,{layer:3,tab:false}),ballR=B.stand(S.ball(K+'g-ballR',.08),1.95,.85,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.8):b.t;
   sun.dy=.3*beat(t,0,2);boy.body.s=beat(t,2.6,3.4);money.s=beat(t,9.4,10.2);
   boy.leg!.rot=-.9*maxOf([4.6,6.4,8.2].map(a=>pulse(t,a-.3,a+.3)));ballL.dy=.25*maxOf([4.8,6.6,8.4].map(a=>pulse(t,a,a+.7)));
   dad.body.s=beat(t,12.4,13.2);age.s=beat(t,13,13.8);school.s=beat(t,15,15.8);dad.armR.rot=.12+1.2*beat(t,15.6,16.4);
   VR.body.s=Math.max(beat(t,17,17.8),manual?1:0);keeper.body.s=beat(t,16.6,17.4);mates.forEach((p,i)=>{p.body.s=beat(t,17.2+i*.4,18+i*.4);});
   // Kick the ball: along the slot into the futsal goal.
   const kick=manual?beat(act,0,.7):beat(t,19.3,20.6);VR.leg!.rot=-1.2*(manual?pulse(act,0,.3):pulse(t,19.1,19.7));
   let [bx,bz,by]=track(kick,[[0,1.95,.85,0],[.6,3.0,-.6,.3],[1,3.45,-1.3,.15]]);
   const pass=[24,28.4];for(const a of pass)if(t>a&&t<a+3&&!manual)[bx,bz,by]=track(t,[[a,1.95,.85,0],[a+1,2.6,-.2,0],[a+2,4.2,.55,0],[a+3,1.95,.85,0]]);
   ballR.x=bx;ballR.z=bz;ballR.dy=by;ballR.rot=-bx*6;ballR.visible=t>16.8||manual;keeper.body.rot=-.6*(manual?pulse(act,.4,1):pulse(t,19.8,21));
   cheer(VR,Math.max(beat(t,20.8,21.4)*(1-beat(t,23.6,24)),manual?beat(act,.9,1):0));cards.forEach((c,i)=>{c.s=beat(t,[29.4,31.4][i],[30.2,32.2][i]);});
   mates.forEach((p,i)=>cheer(p,beat(t,36.2+i*.3,36.8+i*.3)));cheer(boy,beat(t,36.4,37));cheer(dad,beat(t,36.8,37.4)*.5);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.6,17.6)-.4*beat(t,35.6,36.4):0;
  };
 }};

/* ───────────── 2 · Help from his family (uncle) ───────────── */
const uncle:SpreadDef={id:'uncle',rest:15.3,
 left:k=>{pitch(k,-5,-2.6,'#9dbd78',INK.green,.8);const r=rect(-2.6,0,2.6,6.4);k.fill(r,'#d9c49a');k.dots(r,INK.brown,.06,.14);const road=`M-2.6 ${Z(1.6)} Q-1.2 ${Z(.2)} -.2 ${Z(-2.2)}`;k.key(road,.36,'#9a9aa2');k.key(road,.03,INK.yellow);
  caption(k,-2.5,'2010 · FLAMENGO','A TRIAL, AND A PLACE IN THE YOUTH TEAM',INK.red);},
 right:k=>{paving(k,0,5,'#ead9b6','#bda57d');caption(k,2.5,'UNCLE ULISSES’ HOUSE','CLOSER TO TRAINING · MANY PEOPLE HELPED',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'u-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.9,'#a9b78a');const cl=rect(.4,1.55,1.6,.6);k.fill(cl,'#f1e3c6');k.key(cl,.012);k.fill(rect(.3,1.47,1.8,.1),INK.red);k.fill(rect(0,2.3,4.5,.7),'#9dbd78');},
   k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.2,2);k.fill(rect(0,2.2,4.5,.8),'#ead9b6');});
  const sun=bd.add(S.sun(K+'u-sun',.3),'R',3.6,2.2,{out:.012});
  const coach=B.person(K+'u-coach',-3.9,-.4,1.7,{shirt:'coach',hair:'short',skin:SKINS[3],adult:true,face:'smile',layer:2});
  const boy=B.person(K+'u-boy',-3.0,.6,1.0,{shirt:'casual',...VINI,legs:'kick',face:'grin',layer:3});
  const ok=B.stand(S.flipCard(K+'u-ok',1.3,.32,'ACCEPTED!',INK.grass,INK.navy),-4.0,1.9,{layer:3,s:0,tab:false});
  const far=B.stand(S.sign(K+'u-far',1.2,1.2,'A LONG WAY',INK.yellow),-1.0,-1.5,{layer:1,s:0});
  const worry=boy.body.add(P.faceCard('u-worry',.3,'worried',INK.orange),.3,1.25,{z:-.02,anchor:'center'});
  const home=B.stand(S.house(K+'u-house',2.0,1.9),2.6,-1.2,{layer:1});
  const door=home.flap(P.doorway('u-door',.36,.55,INK.blue),-.18,0,{anchor:'bl',axis:'y',z:.02});
  const ul=B.person(K+'u-ul',2.0,.3,1.72,{shirt:'casual',hair:'short',hairColor:'#1d1512',skin:'#5b3a2a',adult:true,beard:true,face:'smile',layer:2});
  const VR=B.person(K+'u-vr',2.9,.6,1.0,{shirt:'casual',...VINI,face:'grin',layer:3,holdR:'suitcase'});
  const helpers=[[4.2,-.2,'coach'],[1.0,1.0,'navy']].map(([x,z,sh],i)=>B.person(K+`u-h${i}`,x as number,z as number,1.62,{shirt:sh as 'coach',hair:i?'short':'bun',skin:SKINS[i?0:2],adult:true,face:'smile',layer:2}));
  const coins=[0,1,2].map(i=>B.stand(coin(K+'u-coin'),3.6+i*.32,1.3,{layer:3,s:0,tab:false}));
  const team=B.stand(P.lineCard('u-team',2.0,.34,['PART OF YOUR TEAM'],INK.yellow),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.3):b.t;
   boy.body.s=beat(t,2.2,3);coach.body.s=beat(t,2.6,3.4);ok.s=beat(t,6.4,7.2);cheer(boy,beat(t,6.6,7.2)*(1-beat(t,8.2,8.8)));coach.armR.rot=.12+1.6*pulse(t,5.6,8);
   far.s=beat(t,8.6,9.4);pop(worry,beat(t,12,12.6)*(1-Math.max(beat(t,17.4,18),manual?beat(act,.4,.8):0)));boy.body.x=-3.0+.8*beat(t,9,11.6);
   // Open the door: uncle Ulisses is home.
   const open=manual?beat(act,0,.5):beat(t,15.6,16.8);door.flip=-1.9*open;
   ul.body.s=Math.max(beat(t,17,17.8),manual?beat(act,.3,.7):0);VR.body.s=Math.max(beat(t,17.6,18.4),manual?beat(act,.5,.9):0);ul.armR.rot=.12+1.0*beat(t,18.4,19.2);
   helpers.forEach((h,i)=>{h.body.s=beat(t,22.6+i*.6,23.4+i*.6);});coins.forEach((c,i)=>{c.s=beat(t,24.4+i*.4,25+i*.4);});
   team.s=beat(t,30.8,31.6);[ul,VR,...helpers].forEach((p,i)=>cheer(p,Math.max(beat(t,27.8+i*.3,28.4+i*.3),manual&&p===VR?beat(act,.9,1):0)));
   sun.dy=.3*beat(t,15.6,17.6);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,15,16):0;
  };
 }};

/* ───────────── 3 · A big move, and big pressure (madrid) ───────────── */
const madrid:SpreadDef={id:'madrid',rest:21.1,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'FLAMENGO · AGED 16','HIS FIRST MATCH FOR THE FIRST TEAM',INK.red);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);for(let i=0;i<6;i++)k.circle(1.2+i*.55,Z(.2),.06,INK.orange);caption(k,2.5,'REAL MADRID · 2018','A NEW COUNTRY AND A NEW LANGUAGE AT EIGHTEEN',INK.navy,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'m-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,RIO,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);for(let i=0;i<6;i++){const x=.2+i*.72,h=.6+((i*5)%3)*.25,b=rect(x,2.2-h,.6,h);k.fill(b,['#f0c273','#e7cfa4','#f2d895'][i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.2);r++)k.fill(rect(x+.1,2.2-h+.08+r*.2,.4,.08),INK.blue);}k.fill(rect(0,2.2,4.5,.8),INK.grass);});
  const plane=bd.add(S.plane(K+'m-plane',.7,.35),'L',.6,2.3,{out:.03}),planeR=bd.add(S.plane(K+'m-planeR',.7,.35),'R',.4,2.4,{out:.03});
  B.stand(S.goal(K+'m-goalL',1.6,.85),-2.5,-1.7,{layer:1});
  const V16=B.person(K+'m-v16',-2.4,.6,1.18,{shirt:'casual',...VINI,legs:'kick',face:'grin',layer:3});
  const mates=[[-4.0,.0,'short'],[-1.1,-.3,'curly']].map(([x,z,h],i)=>B.person(K+`m-m${i}`,x as number,z as number,1.2,{shirt:'casual',hair:h as 'short',hairColor:'#1d1512',skin:SKINS[(i+2)%5],face:'grin',layer:2}));
  const first=B.stand(S.flipCard(K+'m-first',1.4,.32,'FIRST TEAM AT 16',INK.yellow,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const bag=B.stand(P.suitcase('m-bag',.5,.5,'MADRID'),1.0,1.1,{layer:3,s:0,tab:false});
  const VR=B.person(K+'m-vr',1.6,.7,1.22,{shirt:'ger',...VINI,legs:'kick',face:'open',layer:3});
  const hola=VR.body.add(P.lineCard('m-hola',.6,.3,['HOLA!'],INK.white),.45,VR.h*1.02,{z:-.02,anchor:'center'});
  const age=B.stand(S.flipCard(K+'m-age',1.2,.32,'AGED 18',INK.pink),1.2,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'m-goal',1.6,.85),4.0,-1.4,{layer:1});
  const board=B.stand(S.post(K+'m-board',1.3,1.05,INK.white),3.1,.4,{layer:2});
  board.add(P.frame('m-practice',1.14,.84,k=>{k.text('PRACTISE',.57,.3,.13,INK.green,{weight:900});k.key('M.2 .7 L.5 .45 L.9 .4',.03,INK.navy);k.circle(.9,.4,.06,INK.white,true);for(let i=0;i<3;i++)k.fill(poly([[.25+i*.2,.78],[.3+i*.2,.62],[.35+i*.2,.78]]),INK.orange);}),0,.12,{z:.012});
  const critic=board.flap(P.lineCard('m-critic',1.18,.9,['NOT GOOD','ENOUGH?'],'#c9b9d6',INK.navy),0,1.0,{z:.03});
  const cards=[['SHOOTING',INK.yellow],['DECISIONS',INK.sky]].map(([l,c],i)=>B.stand(S.flipCard(K+`m-c${i}`,1.2,.3,l,c,INK.navy),2.9+i*1.4,1.95,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,K+'m-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.1):b.t;
   V16.body.s=beat(t,2.8,3.6);mates.forEach((p,i)=>{p.body.s=beat(t,3.2+i*.4,4+i*.4);});first.s=beat(t,5,5.8);V16.leg!.rot=-1*pulse(t,6,6.6);cheer(V16,beat(t,6.8,7.4)*(1-beat(t,9,9.6)));
   plane.dx=-2.2*beat(t,8.4,10.6);pop(plane,beat(t,8.2,8.6)*(1-beat(t,10.4,10.8)));planeR.dx=2.6*beat(t,10.8,13.4);pop(planeR,beat(t,10.6,11)*(1-beat(t,13.2,13.6)));
   VR.body.s=Math.max(beat(t,12.6,13.4),manual?1:0);bag.s=beat(t,12.8,13.6);age.s=beat(t,13.4,14.2);pop(hola,beat(t,15,15.6)*(1-beat(t,19,19.6)));
   // Lift the flap: under the critics' question, the practice.
   const lift=manual?beat(act,0,.5):beat(t,19.8,21);critic.flip=-2.8*lift;
   cards.forEach((c,i)=>{c.s=Math.max(beat(t,[29.4,31.4][i],[30.2,32.2][i]),manual?beat(act,.6+i*.2,.8+i*.2):0);});
   const shots=[25.2,27.6,30.4];VR.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)))-(manual?1.1*pulse(act,.5,.8):0);
   let [bx,bz,by]=[1.95,.85,0];for(const a of shots)if(t>a&&t<a+2.2)[bx,bz,by]=track(t,[[a,1.95,.85,0],[a+.9,3.9,-1.15,.35],[a+2.2,3.9,-1.15,0]]);
   if(manual)[bx,bz,by]=track(act,[[.5,1.95,.85,0],[.85,3.9,-1.15,.35],[1,3.9,-1.15,0]]);ball(bx,bz,by,t>4.4&&(t<8||t>13.4));
   cheer(VR,Math.max(beat(t,34,34.6),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,2.6,3.6)+.8*beat(t,12.4,13.4)-.4*beat(t,33.4,34.2):0;
  };
 }};

/* ───────────── 4 · The winning goal (final) ───────────── */
const final:SpreadDef={id:'final',rest:15.0,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'PARIS · MAY 2022','THE CHAMPIONS LEAGUE FINAL · MILLIONS WATCHING',INK.yellow,INK.white);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.6 ${Z(-2.1)} L2.6 ${Z(-1.1)} L4.8 ${Z(-1.1)} L4.8 ${Z(-2.1)}`);caption(k,2.5,'REAL MADRID 1, LIVERPOOL 0','CHAMPIONS OF EUROPE',INK.yellow,INK.white);},
 build:B=>{
  const cs=[INK.white,INK.red,INK.white,INK.navy];
  const bd=backdrop(B,K+'f-bd',k=>{nightSky(k,4.5,3);tower(k,.7,1.3,1.1);crowd(k,4.5,1.35,2.5,cs,1);lightRig(k,2.2,.4);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.25,2.5,cs,4);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const conf=bd.add(S.confetti(K+'f-conf',3.6,1.4,2),'R',.4,1.1,{out:.04}),fw=[bd.add(S.firework(K+'f-fw1',.42,INK.yellow),'L',2.8,2.0,{out:.03}),bd.add(S.firework(K+'f-fw2',.38,INK.pink),'R',3.4,2.0,{out:.03})];
  const tvs=[0,1,2].map(i=>B.stand(tv(K+'f-tv'),-4.4+i*.7,-1.5+(i%2)*.3,{layer:1,s:0}));
  const mates=[[-2.8,-.2,'short'],[-1.6,.6,'curly'],[-3.9,.7,'bald']].map(([x,z,h],i)=>B.person(K+`f-m${i}`,x as number,z as number,1.22,{shirt:'ger',hair:h as 'short',hairColor:'#1d1512',skin:SKINS[(i+1)%5],face:'grin',layer:i===1?3:2}));
  const cup=B.stand(S.trophy(K+'f-cup',.8,1.05),-2.4,1.2,{layer:3,s:0});const champs=B.stand(S.flipCard(K+'f-ch',1.6,.32,'CHAMPIONS OF EUROPE',INK.yellow,INK.navy),-2.5,1.98,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'f-goal',1.8,.9),3.7,-1.75,{layer:1});
  const keeper=B.person(K+'f-keep',3.7,-1.45,1.28,{shirt:'keeper',hair:'short',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const def=B.person(K+'f-def',2.6,-.4,1.24,{shirt:'casual',hair:'short',skin:SKINS[1],face:'open',layer:2});
  const VR=B.person(K+'f-vr',3.0,.6,1.24,{shirt:'ger',...VINI,legs:'kick',face:'grin',layer:3});
  const board=B.stand(S.scoreboard(K+'f-board',1.7,1.3,'FINAL'),1.2,-1.75,{layer:1});
  board.add(S.scoreFlap(K+'f-10',1.4,.6,'RMA','1–0','LIV'),0,.36,{z:.012});const cover=board.flap(S.scoreFlap(K+'f-00',1.4,.6,'RMA','0–0','LIV'),0,.96,{z:.026});
  const doubt=B.stand(S.flipCard(K+'f-doubt',1.6,.32,'THE DOUBTED PLAYER',INK.sky,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const win=B.stand(S.flipCard(K+'f-win',1.5,.32,'THE WINNING GOAL',INK.pink),3.9,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'f-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15):b.t;
   mates.forEach((p,i)=>{p.body.s=beat(t,2+i*.4,2.8+i*.4);});VR.body.s=beat(t,2.6,3.4);keeper.body.s=beat(t,3,3.8);def.body.s=beat(t,3.4,4.2);
   // The only goal: a tap-in at the far post.
   const g=9.4;VR.leg!.rot=-1.1*pulse(t,g-.3,g+.3);const [bx,bz,by]=t<7?[1.0,1.2,0]:t<g?track(t,[[7,1.0,1.2,0],[g,3.25,.75,0]]):track(t,[[g,3.25,.75,0],[g+.7,3.5,-1.55,.25],[g+1.6,3.5,-1.55,0]]);ball(bx,bz,by,t>3);
   const dive=pulse(t,g+.1,g+1.4);keeper.body.rot=.8*dive;keeper.body.dx=-.3*dive;cheer(VR,beat(t,10.4,11)*(1-beat(t,14.4,15)));
   tvs.forEach((q,i)=>{q.s=beat(t,12+i*.4,12.8+i*.4);});
   // Flip the scoreboard.
   cover.flip=-3.2*(manual?beat(act,0,.6):beat(t,15.4,16.4));
   cup.s=Math.max(beat(t,17.4,18.4),manual?beat(act,.5,.9):0);champs.s=beat(t,18.2,19);pop(conf,Math.max(beat(t,17.6,18.8),manual?beat(act,.6,1):0));
   fw.forEach((q,i)=>{pop(q,beat(t,18+i*.5,19+i*.5));q.rot=t*.2;});mates.forEach((p,i)=>cheer(p,beat(t,18.4+i*.2,19+i*.2)));
   doubt.s=beat(t,22.2,23);win.s=beat(t,24.6,25.4);cheer(VR,Math.max(beat(t,24.8,25.4),manual?beat(act,.9,1):0)+beat(t,10.4,11)*(1-beat(t,14.4,15)));
   return b.narrated?.4*beat(t,6,7)-.4*beat(t,16.6,17.6):0;
  };
 }};

/* ───────────── 5 · Speaking up (racism) ───────────── */
const racism:SpreadDef={id:'racism',rest:16.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'RACISM IS ALWAYS WRONG','NOBODY SHOULD BE TREATED BADLY FOR HOW THEY LOOK',INK.pink,INK.navy,.36);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'SPEAKING UP','NEW LAWS IN BRAZIL · A FIFA PLAYERS’ GROUP',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.3-y*.05);crowd(k,4.5,1.25,2.45,['#8f95ad','#a3a8bd','#7e849e'],1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.25,2.45,[INK.yellow,INK.green,INK.white,INK.blue,INK.pink],3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const sun=bd.add(S.sun(K+'r-sun',.34),'R',3.7,1.9,{out:.012});
  const cloud=bd.add(P.rainCloud('r-cloud',1.3,.7),'L',2.0,1.6,{out:.04});
  const V=B.person(K+'r-v',-2.5,.4,1.24,{shirt:'ger',...VINI,face:'sad',layer:3});
  const wrong=B.stand(P.lineCard('r-wrong',1.8,.62,['RACISM IS','ALWAYS WRONG'],INK.white,INK.pink),-4.0,-1.3,{layer:1,s:0});
  const pole=B.stand(S.post(K+'r-pole',.12,1.9,INK.stock),-.6,-1.0,{layer:1,tab:false});
  const banner=pole.add(S.banner(K+'r-ban',2.1,.5,'NO TO RACISM',INK.yellow,INK.navy),-1.05,.2,{z:.03,anchor:'bottom'});
  const line=[[-3.7,.9,'short','ger'],[-1.4,.9,'long','bib'],[-.6,1.4,'curly','fan']].map(([x,z,h,sh],i)=>B.person(K+`r-l${i}`,x as number,z as number,1.2,{shirt:sh as 'ger',hair:h as 'short',hairColor:'#1d1512',skin:SKINS[i%5],face:'smile',layer:3}));
  const ref=B.person(K+'r-ref',2.0,-.2,1.62,{shirt:'navy',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:2});
  const stop=B.stand(P.lineCard('r-stop',1.7,.62,['MATCHES CAN','BE STOPPED'],INK.yellow),3.8,-1.2,{layer:1,s:0});
  const VR=B.person(K+'r-vr',3.1,.7,1.24,{shirt:'ger',...VINI,face:'grin',layer:3});
  const voice=VR.body.add(S.bubble(K+'r-voice',.5,.42,'heart'),.45,VR.h*.95,{z:-.02});
  const cards=[['SPOKE UP',INK.pink],['LAWS IN BRAZIL',INK.yellow],['FIFA GROUP',INK.sky]].map(([l,c],i)=>B.stand(S.flipCard(K+`r-c${i}`,1.25,.3,l,c,INK.navy),1.0+i*1.4,1.95,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.4):b.t;
   V.body.s=beat(t,1.8,2.6);const up=manual?beat(act,0,.7):beat(t,16.8,18.4);
   pop(cloud,beat(t,2.6,3.6)*(1-up));wrong.s=beat(t,8.6,9.4);
   // Raise the banner: teammates stand in a line, arms linked, and the rain cloud goes.
   banner.dy=-1.0+1.6*up;pop(banner,Math.min(1,.4+up));line.forEach((p,i)=>{p.body.s=Math.max(beat(t,12.4+i*.5,13.2+i*.5),manual?beat(act,.2+i*.1,.5+i*.1):0);p.armL.rot=-.12-1.3*up;p.armR.rot=.12+1.3*up;});
   V.armL.rot=-.12-1.3*up;V.armR.rot=.12+1.3*up;sun.dy=.4*up;
   VR.body.s=Math.max(beat(t,18.6,19.4),manual?beat(act,.6,1):0);pop(voice,beat(t,21.2,21.8)*(1-beat(t,26,26.6)));cards[0].s=beat(t,21.4,22.2);
   ref.body.s=beat(t,24.4,25.2);ref.armR.rot=.12+2.6*beat(t,26,26.8);stop.s=beat(t,26.4,27.2);cards[1].s=beat(t,27,27.8);cards[2].s=beat(t,31.4,32.2);
   cheer(VR,Math.max(beat(t,36,36.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18.6,19.6)-.4*beat(t,35.4,36.4):0;
  };
 }};

/* ───────────── 6 · Helping children learn (school) ───────────── */
const school:SpreadDef={id:'school',rest:17.2,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'INSTITUTO VINI JR. · 2021','HELPING CHILDREN GO TO SCHOOL AND KEEP LEARNING',INK.green,INK.navy,.36);},
 right:k=>{floor(k,0,5,'#e4cfa8','#b39a6e');caption(k,2.5,'2024','UNESCO GOODWILL AMBASSADOR · FIFA THE BEST',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{wash(k,4.5,3,'#f3e6c8',INK.orange,y=>.12);blackboard(k,.6,.7,3.2,1.3);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{wash(k,4.5,3,'#f6e8cc',INK.orange,y=>.12);for(let i=0;i<3;i++){const s=rect(.4+i*1.35,.5,1.0,1.6);k.fill(s,INK.wood);k.key(s,.012);for(let r=0;r<4;r++)for(let c=0;c<5;c++)k.fill(rect(.46+i*1.35+c*.18,.56+r*.4,.14,.32),[INK.red,INK.blue,INK.yellow,INK.green,INK.pink][(c+r+i)%5]);}k.fill(rect(0,2.4,4.5,.6),'#e4cfa8');});
  const banner=bd.add(S.bunting(K+'s-bunt',3.4,.4,[INK.yellow,INK.green,INK.blue]),'L',.5,2.55,{out:.03});
  const kids=[[-4.2,.5,'curly',SKINS[1]],[-3.3,1.0,'bun',SKINS[4]],[-1.6,.6,'short',SKINS[3]],[-.8,1.1,'long',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`s-k${i}`,x as number,z as number,.95,{shirt:(['fan','bib','casual','fan'] as const)[i],hair:h as 'curly',hairColor:'#1d1512',skin:sk as string,face:'grin',layer:3,holdR:i%2?'ball':'none'}));
  const V=B.person(K+'s-v',-2.5,-.2,1.3,{shirt:'navy',...VINI,face:'smile',layer:2});
  const sign=B.stand(S.sign(K+'s-sign',1.5,1.2,'INSTITUTO VINI JR.',INK.yellow),-4.2,-1.5,{layer:1,s:0});
  const grew=B.stand(S.flipCard(K+'s-grew',1.6,.3,'HE GREW UP WITHOUT MUCH',INK.white,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const stand=B.stand(S.post(K+'s-stand',1.6,1.1,INK.white),2.0,-.6,{layer:2});
  stand.add(bookInside(K+'s-in',1.5,.95),0,.08,{z:.012});const cover=stand.flap(bookCover(K+'s-cover',.75,.95),-.75,.08,{anchor:'bl',axis:'y',z:.03});
  const amb=B.stand(P.lineCard('s-amb',1.6,.62,['GOODWILL','AMBASSADOR'],INK.sky),4.1,-1.2,{layer:1,s:0});
  const pele=B.stand(S.flipCard(K+'s-pele',1.9,.3,'2ND BRAZILIAN, AFTER PELÉ',INK.yellow,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const best=B.stand(S.goldenBall(K+'s-best',.26),4.3,.6,{layer:3,s:0,tab:false});const bestC=B.stand(S.flipCard(K+'s-bestc',1.4,.3,'THE BEST · 2024',INK.pink),3.9,1.95,{layer:3,s:0,tab:false});
  const VR=B.person(K+'s-vr',3.3,.6,1.24,{shirt:'ger',...VINI,face:'grin',layer:3});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   sign.s=beat(t,2.4,3.2);V.body.s=beat(t,3.2,4);kids.forEach((p,i)=>{p.body.s=beat(t,5+i*.6,5.8+i*.6);});pop(banner,beat(t,8,9));
   V.armR.rot=.12+1.2*pulse(t,9,12.4);grew.s=beat(t,13.6,14.4);
   // Open the book.
   const open=manual?beat(act,0,.6):beat(t,17.6,18.8);cover.flip=-2.9*open;
   amb.s=Math.max(beat(t,20,20.8),manual?beat(act,.5,.8):0);VR.body.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.4,.8):0);pele.s=beat(t,27.4,28.2);
   best.s=beat(t,32.8,33.6);bestC.s=beat(t,33.4,34.2);cheer(VR,Math.max(beat(t,34,34.6),manual?beat(act,.9,1):0));
   kids.forEach((p,i)=>cheer(p,beat(t,37.6+i*.3,38.2+i*.3)));cheer(V,beat(t,38.4,39));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,17,18)-.4*beat(t,37,37.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={goncalo,uncle,madrid,final,racism,school};
