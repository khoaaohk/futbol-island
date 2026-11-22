/**
 * The six Mia Hamm pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/hamm/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is family and helping others: a shoebox, steps, a family flap, a banner, a scoreboard and medals.
 * Garrett's illness is shown only as a family together (no hospital or treatment). Kits are colour only.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,sea,backdrop,plates,ballPair} from '../spreadKit';

const K='hamm-';
const P=plates(K),{sp}=P;
const MIA={skin:'#f1b88f',hair:'long' as const,hairColor:'#8a5a3b'};
const USA=[INK.navy,INK.white,INK.red,INK.white];

/* ───────────── Hamm-only plates ───────────── */
const box=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f1e3c6');k.key(b,.014);const i=rect(w*.06,h*.1,w*.88,h*.8);k.fill(i,'#d9c49a');k.key(i,.01);
 for(const x of [.18,.54]){const s=`M${w*x} ${h*.62} L${w*x} ${h*.3} L${w*(x+.12)} ${h*.3} L${w*(x+.14)} ${h*.52} Q${w*(x+.3)} ${h*.54} ${w*(x+.3)} ${h*.68} L${w*x} ${h*.7} Z`;k.fill(s,INK.white);k.key(s,.012);k.key(`M${w*(x+.03)} ${h*.4} L${w*(x+.11)} ${h*.4} M${w*(x+.03)} ${h*.47} L${w*(x+.11)} ${h*.47}`,.01,INK.pink);}},{rim:.014});
const lid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.sky);k.dots(b,INK.blue,.035,.3);k.key(b,.014);k.text('SPECIAL SHOES',w/2,h*.58,h*.18,INK.navy,{weight:900,max:w*.86});},{rim:.014});
const step=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.22);k.key(b,.014);k.fill(rect(0,0,w,.08),INK.white);k.text(label,w/2,Math.min(h*.5,.36),.12,INK.navy,{weight:900,max:w*.9});},{rim:.016});
const family=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{k.fill(rect(w*.08,h*.08,w*.84,h*.84),'#fff1c2');const cs=[INK.navy,INK.orange,INK.sky,INK.pink,INK.green,INK.yellow,INK.red,INK.blue];
 for(let i=0;i<8;i++){const x=w*(.14+i*.1),hh=i<2?.36:.24+(i%3)*.03,y=h*.84;k.fill(rect(x-.05,y-hh*h*.9,.1,hh*h*.9*.6),cs[i]);k.circle(x,y-hh*h*.9-.03,.05,SKINS[i%5],true);}
 k.key(`M${w*.14} ${h*.6} L${w*.84} ${h*.6}`,.018,INK.navy);k.text('A FAMILY TOGETHER',w/2,h*.22,h*.09,INK.navy,{weight:900,max:w*.8});});

/* ───────────── 1 · Special shoes (shoes) ───────────── */
const shoes:SpreadDef={id:'shoes',rest:16.7,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'1972 · SELMA, ALABAMA','A CLUB FOOT · SPECIAL SHOES TO HELP IT GROW',INK.blue,INK.navy,.38);},
 right:k=>{pitch(k,0,5,'#9dbd78',INK.green,.8);caption(k,2.5,'FLORENCE · ITALY','HER FIRST SOCCER · NEW FRIENDS',INK.red);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{wash(k,4.5,3,'#f3e6c8',INK.orange,y=>.15);for(let x=.15;x<4.5;x+=.45)k.key(`M${x} 0 L${x} 2.4`,.012,'#e2cfa5');k.fill(rect(0,2.4,4.5,.6),'#d9b98c');k.fill(rect(.5,.5,1.2,.9),INK.sky2);k.key(rect(.5,.5,1.2,.9),.014);},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.5,.5);roofs(k,.2,4.3,2.2,1);k.fill(rect(0,2.2,4.5,.8),'#9dbd78');});
  const planeL=bd.add(S.plane(K+'s-pl',.7,.35),'L',3.5,2.1,{out:.03}),planeR=bd.add(S.plane(K+'s-pr',.7,.35),'R',.4,2.3,{out:.03});
  const born=B.stand(S.flipCard(K+'s-born',1.3,.32,'BORN 1972',INK.yellow,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const mum=B.person(K+'s-mum',-4.0,-.6,1.62,{shirt:'casual',hair:'bun',hairColor:'#5b3a2a',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const tot=B.person(K+'s-tot',-3.0,.3,.82,{shirt:'fan',...MIA,face:'smile',layer:3});
  const bx=B.stand(box(K+'s-box',1.2,.7),-1.6,.6,{layer:3});const lidP=bx.flap(lid(K+'s-lid',1.2,.7),0,.7,{z:.03});
  const ready=B.stand(S.flipCard(K+'s-ready',1.4,.32,'READY TO RUN',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const bases=['BASE','BASE','ITALY'].map((l,i)=>B.stand(S.sign(K+`s-b${i}`,.9,.9,l,i===2?INK.yellow:INK.white),.9+i*1.3,-1.6,{layer:1,s:0}));
  const M=B.person(K+'s-m',2.0,.5,1.0,{shirt:'fan',...MIA,legs:'kick',face:'grin',layer:3});
  const friends=[[3.2,.2,'curly'],[4.1,.9,'short']].map(([x,z,h],i)=>B.person(K+`s-fr${i}`,x as number,z as number,1.0,{shirt:i?'bib':'casual',hair:h as 'curly',skin:SKINS[i+1],face:'smile',layer:3}));
  const bye=B.stand(S.flipCard(K+'s-bye',1.4,.3,'GOODBYE, HELLO',INK.sky,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.7):b.t;
   born.s=beat(t,2.4,3.2);mum.body.s=beat(t,2,2.8);tot.body.s=beat(t,8.4,9.2);
   // Open the shoebox: the special shoes inside.
   const open=manual?beat(act,0,.6):beat(t,17.2,18.4);lidP.flip=-2.6*open;ready.s=Math.max(beat(t,18.2,19),manual?beat(act,.5,.9):0);
   bases.forEach((s,i)=>{s.s=beat(t,20+i*1.6,20.8+i*1.6);});planeL.dx=-2.4*beat(t,19.6,21.6);pop(planeL,beat(t,19.4,19.8)*(1-beat(t,21.4,21.8)));planeR.dx=2.8*beat(t,21.8,24.4);pop(planeR,beat(t,21.6,22)*(1-beat(t,24.2,24.6)));
   M.body.s=Math.max(beat(t,26,26.8),manual?beat(act,.7,1):0);const k1=maxOf([27.6,29.2].map(a=>pulse(t,a-.3,a+.3)));M.leg!.rot=-1*k1;
   const bxx=t<27.6?2.35:track(t,[[27.6,2.35],[28.4,3.0],[29.2,2.35],[30,3.0]])[0];ball(bxx,.6,0,t>26.4);
   bye.s=beat(t,30.6,31.4);friends.forEach((f,i)=>{f.body.s=Math.max(beat(t,35.2+i*.4,36+i*.4),manual?beat(act,.8,1):0);cheer(f,beat(t,36.2+i*.3,36.8+i*.3));});cheer(M,Math.max(beat(t,36.4,37),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,19.4,20.4):0;
  };
 }};

/* ───────────── 2 · The youngest on the team (youngest) ───────────── */
const youngest:SpreadDef={id:'youngest',rest:15.1,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'1987 · AGED 15','HER FIRST GAME FOR THE UNITED STATES',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'1991 · AGED 19','THE YOUNGEST WORLD CHAMPION ON THE TEAM',INK.red,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'y-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,USA,1);k.fill(rect(0,2.4,4.5,.6),INK.grass);},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.45,USA,3);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const big=[[-4.2,-.4,'bun'],[-3.2,-.8,'short'],[-1.2,-.5,'curly']].map(([x,z,h],i)=>B.person(K+`y-t${i}`,x as number,z as number,1.5,{shirt:'navy',hair:h as 'bun',hairColor:'#3b2e3f',skin:SKINS[(i*2)%5],adult:true,face:'smile',layer:2}));
  const M=B.person(K+'y-m',-2.3,.6,1.05,{shirt:'navy',...MIA,face:'shy',layer:3});
  const age=B.stand(S.flipCard(K+'y-age',1.1,.32,'AGED 15',INK.pink),-3.6,1.95,{layer:3,s:0,tab:false});
  const scary=B.stand(S.flipCard(K+'y-scary',1.5,.32,'BIGGER, OLDER',INK.sky,INK.navy),-1.6,1.95,{layer:3,s:0,tab:false});
  const steps=[['UNC',.5,'#6fb6e2'],['4 TITLES',.95,INK.white],['WORLD CUP',1.4,INK.yellow]].map(([l,h,c],i)=>B.stand(step(`y-st${i}`,1.1,h as number,l as string,c as string),1.0+i*1.2,-.3-i*.4,{layer:2}));
  const MR=B.person(K+'y-mr',.8,.6,1.05,{shirt:'fan',...MIA,face:'smile',layer:3});
  const cup=B.stand(S.trophy(K+'y-cup',.5,.7),4.4,-1.6,{layer:1,s:0});
  const first=B.stand(S.flipCard(K+'y-first',1.6,.32,'THE FIRST WORLD CUP',INK.yellow,INK.navy),2.2,1.95,{layer:3,s:0,tab:false});
  const work=B.stand(S.flipCard(K+'y-work',1.6,.3,'SPEED · DRIBBLE · SHOOT',INK.pink),4.0,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.1):b.t;
   big.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.4,3.2+i*.4);});M.body.s=beat(t,4,4.8);age.s=beat(t,6.4,7.2);scary.s=beat(t,10,10.8);M.body.yaw=-.25*beat(t,10,11);
   // Climb the steps: university, four titles, then the first Women's World Cup.
   const up=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,[17.6,21,28][i],[18.4,21.8,28.8][i]));const n=up.reduce((a,v)=>a+v,0);
   let [x,z,dy]=[.8,.6,0];for(let i=0;i<3;i++)if(n>i){const u=Math.min(1,n-i),x1=1.0+i*1.2,z1=-.28-i*.4,h1=[.5,.95,1.4][i];x=x+(x1-x)*u;z=z+(z1-z)*u;dy=dy+(h1-dy)*u;}
   MR.body.x=x;MR.body.z=z+.02;MR.body.dy=dy;MR.body.s=Math.max(beat(t,16.4,17.2),manual?1:0);
   cup.s=Math.max(beat(t,28.6,29.4),manual?beat(act,.8,1):0);first.s=Math.max(beat(t,29,29.8),manual?beat(act,.8,1):0);work.s=beat(t,33,33.8);
   cheer(MR,Math.max(beat(t,29.6,30.2),manual?beat(act,.9,1):0));big.forEach((p,i)=>cheer(p,beat(t,37.4+i*.3,38+i*.3)*.6));cheer(M,beat(t,37.6,38.2));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.6,17.6):0;
  };
 }};

/* ───────────── 3 · A hard illness (garrett) ───────────── */
const garrett:SpreadDef={id:'garrett',rest:22.2,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'HER BROTHER GARRETT','THE FOURTH OF SIX CHILDREN',INK.blue);},
 right:k=>{floor(k,0,5,'#e4d6bd','#b9a27a');caption(k,2.5,'MISSED VERY MUCH','IT IS OKAY TO FEEL SAD · LEAN ON FAMILY',INK.pink,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{wash(k,4.5,3,'#f3e6c8',INK.orange,y=>.15);k.fill(rect(.6,.4,1.3,.9),INK.sky2);k.key(rect(.6,.4,1.3,.9),.014);k.fill(rect(2.6,.5,1.0,.8),'#e9c28e');k.key(rect(2.6,.5,1.0,.8),.014);k.circle(3.1,.9,.2,INK.yellow);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{wash(k,4.5,3,'#e7dcef',INK.pink,y=>.15);k.fill(rect(0,2.4,4.5,.6),'#c9b9a0');k.fill(rect(2.8,.4,1.2,.9),INK.sky2);k.key(rect(2.8,.4,1.2,.9),.014);});
  const starsR=bd.add(S.stars(K+'g-stars',1.6,.5,6),'R',3.4,1.8,{out:.02});
  const lamp=B.stand(S.lamp(K+'g-lamp',.5,1.2),-4.5,-1.6,{layer:1});
  const sibs=[[-3.6,.2,'curly',1.1],[-1.4,.3,'short',1.4]].map(([x,z,h,s],i)=>B.person(K+`g-k${i}`,x as number,z as number,s as number,{shirt:i?'navy':'bib',hair:h as 'curly',hairColor:i?'#1d1512':'#8a5a3b',skin:SKINS[i?2:0],adult:i===1,face:'smile',layer:3}));
  const M=B.person(K+'g-m',-2.5,.6,1.1,{shirt:'fan',...MIA,face:'smile',layer:3});
  const six=B.stand(S.flipCard(K+'g-six',1.4,.32,'SIX CHILDREN',INK.yellow,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const ill=bd.add(P.lineCard('g-ill',1.5,.58,['A RARE ILLNESS','OF THE BLOOD'],'#c9b9d6'),'L',1.4,1.45,{out:.03});
  const donor=B.stand(S.flipCard(K+'g-donor',1.5,.32,'A DONOR?',INK.sky,INK.navy),-1.5,1.95,{layer:3,s:0,tab:false});
  const pic=B.stand(family(K+'g-fam',2.0,1.4),2.3,-1.2,{layer:1});
  const cover=pic.flap(P.lineCard('g-cover',1.9,1.3,['FINDING','A MATCH'],INK.sky),0,1.36,{z:.03});
  const match=B.stand(S.flipCard(K+'g-match',1.6,.32,'A MATCH WAS FOUND',INK.green),1.4,1.95,{layer:3,s:0,tab:false});
  const mem=B.stand(P.lineCard('g-mem',1.6,.62,['GARRETT','1997 · AGED 28'],'#e7dcef'),4.0,.4,{layer:2,s:0});
  const hug=[[1.2,.6,'long'],[2.0,.9,'bun'],[3.0,.7,'short']].map(([x,z,h],i)=>B.person(K+`g-h${i}`,x as number,z as number,i?1.5:1.15,{shirt:i===0?'fan':i===1?'casual':'navy',hair:h as 'long',hairColor:i===0?'#8a5a3b':'#5b3a2a',skin:i===0?MIA.skin:SKINS[0],adult:i>0,face:'shy',layer:3}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.2):b.t;
   M.body.s=beat(t,2,2.8);six.s=beat(t,2.6,3.4);sibs.forEach((p,i)=>{p.body.s=beat(t,4.8+i*.4,5.6+i*.4);});lamp.s=1;pop(ill,beat(t,9.6,10.4));donor.s=beat(t,17.6,18.4);
   // Lift the flap: the family together.
   const lift=manual?beat(act,0,.6):beat(t,22.6,23.8);cover.flip=-2.8*lift;match.s=Math.max(beat(t,26.6,27.4),manual?beat(act,.6,1):0);
   mem.s=beat(t,32,32.8);pop(starsR,beat(t,35.2,36.2));hug.forEach((p,i)=>{p.body.s=Math.max(beat(t,37+i*.4,37.8+i*.4),manual?beat(act,.7,1):0);p.armL.rot=-.12-.9*beat(t,40.4,41.4);p.armR.rot=.12+.9*beat(t,40.4,41.4);});
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,22,23):0;
  };
 }};

/* ───────────── 4 · Turning sadness into help (foundation) ───────────── */
const foundation:SpreadDef={id:'foundation',rest:11.9,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1999 · THE MIA HAMM FOUNDATION','THE FIRST GARRETT GAME',INK.navy,INK.navy,.36);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'HELP FOR OTHER FAMILIES','DONORS · AND MORE CHANCES FOR GIRLS TO PLAY',INK.pink,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,USA,2);k.fill(rect(0,2.4,4.5,.6),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const bunt=bd.add(S.bunting(K+'f-bunt',4.0,.4,[INK.red,INK.white,INK.blue,INK.yellow]),'L',.3,1.0,{out:.02});
  const players=[[-4.0,.2,'long'],[-3.0,-.6,'short'],[-1.6,.4,'curly'],[-1.0,-.4,'bun']].map(([x,z,h],i)=>B.person(K+`f-p${i}`,x as number,z as number,1.2,{shirt:i%2?'bib':'navy',hair:h as 'long',hairColor:'#3b2e3f',skin:SKINS[i%5],adult:true,face:'grin',layer:i%2?2:3}));
  const gg=B.stand(S.flipCard(K+'f-gg',1.6,.32,'GARRETT GAME',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'f-pole',.12,1.9,INK.stock),2.4,-1.2,{layer:1});
  const ban=pole.add(S.banner(K+'f-ban',1.9,.6,'MIA HAMM FOUNDATION',INK.blue),0,.1,{z:.03});
  const donors=B.stand(P.lineCard('f-donor',1.6,.62,['JOIN THE','DONOR LIST'],INK.white),1.0,.2,{layer:2,s:0});
  const girls=[[3.2,.7,'long'],[4.2,.2,'bun']].map(([x,z,h],i)=>B.person(K+`f-g${i}`,x as number,z as number,1.0,{shirt:i?'casual':'fan',hair:h as 'long',skin:SKINS[i*3],face:'grin',layer:3}));
  const help=B.stand(S.flipCard(K+'f-help',1.7,.32,'HELPING MANY FAMILIES',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,11.9):b.t;
   players.forEach((p,i)=>{p.body.s=beat(t,7+i*.4,7.8+i*.4);});gg.s=beat(t,8,8.8);pop(bunt,beat(t,7.6,8.6));
   // Raise the banner up the pole.
   const up=manual?beat(act,0,.6):beat(t,12.4,13.8);ban.dy=1.2*up;pop(ban,Math.max(.2,up));
   donors.s=Math.max(beat(t,18,18.8),manual?beat(act,.5,.9):0);girls.forEach((g,i)=>{g.body.s=Math.max(beat(t,22.6+i*.4,23.4+i*.4),manual?beat(act,.6,1):0);cheer(g,Math.max(beat(t,24+i*.3,24.6+i*.3),manual?beat(act,.8,1):0));});
   help.s=Math.max(beat(t,27,27.8),manual?beat(act,.8,1):0);players.forEach((p,i)=>cheer(p,beat(t,13.4+i*.3,14+i*.3)));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,12,13):0;
  };
 }};

/* ───────────── 5 · Goal number 108 (record) ───────────── */
const record:SpreadDef={id:'record',rest:20.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.1)} L-1.4 ${Z(-1.1)} L-1.4 ${Z(-2.1)}`);caption(k,-2.5,'MAY 1999 · GOAL 108','MORE THAN ANY PLAYER, MAN OR WOMAN',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'158 GOALS BY 2004','A RECORD THAT LASTED UNTIL 2013',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,USA,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.45,USA,4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'r-fw1',.4,INK.yellow),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'r-fw2',.36,INK.pink),'R',3.4,2.0,{out:.03})];
  B.stand(S.goal(K+'r-goal',1.7,.9),-2.5,-1.75,{layer:1});
  const keeper=B.person(K+'r-keep',-2.5,-1.45,1.3,{shirt:'keeper',hair:'bun',skin:SKINS[2],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const M=B.person(K+'r-m',-2.2,.8,1.2,{shirt:'navy',...MIA,legs:'kick',face:'grin',layer:3});
  const most=B.stand(S.flipCard(K+'r-most',1.7,.32,'NOBODY HAD SCORED MORE',INK.pink),-3.4,1.95,{layer:3,s:0,tab:false});
  const cup=B.stand(S.trophy(K+'r-cup',.45,.62),-4.4,-1.2,{layer:1,s:0});const wc=B.stand(S.flipCard(K+'r-wc',1.4,.3,'1999 WORLD CUP',INK.yellow,INK.navy),-4.0,-.55,{layer:2,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'r-board',1.9,1.4,'GOALS FOR THE USA'),2.4,-1.5,{layer:1});
  board.add(S.flipCard(K+'r-158',1.4,.6,'158',INK.yellow,INK.navy),0,.36,{z:.012});
  const f108=board.flap(S.flipCard(K+'r-108',1.4,.6,'108',INK.pink),0,.96,{z:.026}),f107=board.flap(S.flipCard(K+'r-107',1.4,.6,'107',INK.blue),0,.96,{z:.034});
  const MR=B.person(K+'r-mr',2.4,.6,1.24,{shirt:'navy',...MIA,face:'grin',layer:3});
  const until=B.stand(S.flipCard(K+'r-until',1.6,.32,'A RECORD UNTIL 2013',INK.sky,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'r-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20):b.t;
   M.body.s=beat(t,2,2.8);keeper.body.s=beat(t,2.4,3.2);const g=5.6;M.leg!.rot=-1.1*pulse(t,g-.3,g+.3);
   const [bx,bz,by]=t<g?[-1.9,.95,0]:track(t,[[g,-1.9,.95,0],[g+.6,-2.2,-.5,.4],[g+1.1,-3.0,-1.55,.25],[g+2,-3.0,-1.55,0]]);ball(bx,bz,by,t>2.4);keeper.body.rot=.7*pulse(t,g+.3,g+1.6);
   most.s=beat(t,9,9.8);cheer(M,beat(t,7,7.6));cup.s=beat(t,16,16.8);wc.s=beat(t,16.6,17.4);
   // Flip the scoreboard: 107, 108, and on to 158.
   const fl=manual?act:track(t,[[20.6,0],[21.6,.5],[24.4,.5],[25.4,1]])[0];f107.flip=-3.2*beat(fl,0,.5);f108.flip=-3.2*beat(fl,.5,1);
   MR.body.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.3,.6):0);cheer(MR,Math.max(beat(t,25.6,26.2),manual?beat(act,.9,1):0));until.s=Math.max(beat(t,29.4,30.2),manual?beat(act,.9,1):0);
   fw.forEach((q,i)=>{pop(q,Math.max(beat(t,21.4+i*.4,22.4+i*.4)*(1-beat(t,31,32)),manual?beat(act,.9,1):0));q.rot=t*.2;});
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,20.2,21.2):0;
  };
 }};

/* ───────────── 6 · Win or lose, together (gold) ───────────── */
const gold:SpreadDef={id:'gold',rest:17.7,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);caption(k,-2.5,'THIRD 1995 · SILVER 2000 · THIRD 2003','EACH TIME THEY CAME BACK',INK.navy,INK.navy,.34);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'OLYMPIC GOLD · 1996 AND 2004','KINDNESS LASTS LONGER THAN ANY TROPHY',INK.yellow,INK.white,.36);},
 build:B=>{
  const bd=backdrop(B,K+'o-bd',k=>{wash(k,4.5,3,'#d5d9e6',INK.sky,y=>.25);crowd(k,4.5,1.4,2.4,USA,2);k.fill(rect(0,2.4,4.5,.6),'#9dbd78');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.45,USA,5);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'o-fw1',.44,INK.yellow),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'o-fw2',.4,INK.pink),'R',3.4,2.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'o-conf',3.6,1.4,3),'R',.4,1.1,{out:.04});
  const meds=[['1995','#c98a4b'],['2000',INK.grey],['2003','#c98a4b']].map(([y,c],i)=>B.stand(P.medal(`o-m${i}`,.5,c),-4.2+i*1.1,-1.4,{layer:1,s:0}));
  const yrs=['3RD · 1995','SILVER · 2000','3RD · 2003'].map((l,i)=>B.stand(S.flipCard(K+`o-y${i}`,1.0,.28,l,INK.white,INK.navy),-4.0+i*1.1,-.8,{layer:2,s:0,tab:false}));
  const team=[[-3.8,.8,'long'],[-2.6,1.0,'bun'],[-1.4,.7,'curly']].map(([x,z,h],i)=>B.person(K+`o-t${i}`,x as number,z as number,1.2,{shirt:'navy',hair:h as 'long',hairColor:i?'#3b2e3f':'#8a5a3b',skin:i?SKINS[i*2]:MIA.skin,face:'smile',layer:3}));
  const again=B.stand(S.flipCard(K+'o-again',1.5,.32,'TRY AGAIN, TOGETHER',INK.sky,INK.navy),-2.5,1.98,{layer:3,s:0,tab:false});
  const golds=[0,1].map(i=>B.stand(P.medal(`o-g${i}`,.5),3.6+i*.8,-1.5,{layer:1,s:0}));
  const gy=B.stand(S.flipCard(K+'o-gy',1.5,.3,'GOLD 1996 · 2004',INK.yellow,INK.navy),4.0,-.85,{layer:2,s:0,tab:false});
  const MR=B.person(K+'o-mr',2.0,.4,1.3,{shirt:'navy',...MIA,adult:true,face:'grin',layer:3});
  const mates=[[1.0,.9],[3.2,.9]].map(([x,z],i)=>B.person(K+`o-r${i}`,x,z,1.24,{shirt:'navy',hair:i?'short':'bun',hairColor:'#3b2e3f',skin:SKINS[i+1],adult:true,face:'grin',layer:3}));
  const pole=B.stand(S.post(K+'o-pole',.14,1.3,INK.stock),2.5,.7,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'o-cup',.6,.8),0,.3,{z:.03});
  const kind=B.stand(S.flipCard(K+'o-kind',1.7,.32,'STILL HELPING FAMILIES',INK.pink),2.5,1.98,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.7):b.t;
   meds.forEach((m,i)=>{m.s=beat(t,[7.4,13,10.2][i],[8.2,13.8,11][i]);});yrs.forEach((y,i)=>{y.s=beat(t,[7.8,13.4,10.6][i],[8.6,14.2,11.4][i]);});
   team.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.4,3.2+i*.4);p.armL.rot=-.12-.5*beat(t,15,16);p.armR.rot=.12+.5*beat(t,15,16);});again.s=beat(t,15.2,16);
   // Raise the trophy: two Olympic golds.
   const raise=manual?beat(act,0,.6):beat(t,18.2,19.6);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));cheer(MR,Math.max(raise,manual?beat(act,.3,.7):0));MR.body.s=1;
   golds.forEach((g,i)=>{g.s=Math.max(beat(t,21+i*1.6,21.8+i*1.6),manual?beat(act,.5+i*.2,.7+i*.2):0);});gy.s=Math.max(beat(t,22,22.8),manual?beat(act,.7,1):0);
   mates.forEach((p,i)=>{p.body.s=Math.max(beat(t,19.6+i*.4,20.4+i*.4),manual?beat(act,.5,.9):0);cheer(p,Math.max(beat(t,20.4+i*.3,21+i*.3),manual?beat(act,.7,1):0));});
   fw.forEach((q,i)=>{pop(q,Math.max(beat(t,19.6+i*.4,20.6+i*.4),manual?beat(act,.6,1):0));q.rot=t*.2;});pop(conf,Math.max(beat(t,19.8,21),manual?beat(act,.6,1):0));
   kind.s=Math.max(beat(t,27,27.8),manual?beat(act,.9,1):0);team.forEach((p,i)=>cheer(p,beat(t,32+i*.3,32.6+i*.3)*.7));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,17.8,18.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={shoes,youngest,garrett,foundation,record,gold};
