/**
 * The six Son Heung-min pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/son/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is patience and the basics: taps, cones, steps and a long run with the ball. Kits are colour only.
 */
import {INK,type Kit,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,caption,wash,daySky,crowd,nightSky,lightRig,hills,skyline,sea,palms,backdrop,plates,ballPair} from '../spreadKit';

const K='son-';
const P=plates(K),{sp}=P;
const SON={skin:'#f1c6a0',hair:'short' as const,hairColor:'#1d1512'};
const KOR=[INK.red,INK.white,INK.blue,INK.red];
const SPURS=[INK.white,INK.navy,INK.white,'#3d5da0'];

/* ───────────── Son-only plates ───────────── */
const step=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.22);k.key(b,.014);k.fill(rect(0,0,w,.08),INK.white);k.text(label,w/2,Math.min(h*.5,.36),.12,INK.navy,{weight:900,max:w*.9});},{rim:.016});
const caseBody=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.blue);k.key(b,.014);const i=rect(w*.06,h*.08,w*.88,h*.84);k.fill(i,'#f1e3c6');k.key(i,.01);
 k.fill(rect(w*.12,h*.2,w*.3,h*.5),INK.red);k.key(rect(w*.12,h*.2,w*.3,h*.5),.01);const bk=rect(w*.5,h*.22,w*.36,h*.46);k.fill(bk,INK.yellow);k.key(bk,.01);k.text('GERMAN',w*.68,h*.5,h*.1,INK.navy,{weight:900,max:w*.32});},{rim:.014});
const caseLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#2f6db0');k.dots(b,INK.navy,.035,.3);k.key(b,.014);k.key(`M${w*.08} ${h*.15} L${w*.08} ${h*.85} M${w*.92} ${h*.15} L${w*.92} ${h*.85}`,.025,INK.yellow);const tag=rect(w*.3,h*.35,w*.4,h*.3);k.fill(tag,INK.paper);k.key(tag,.01);k.text('HAMBURG',w/2,h*.55,h*.12,INK.navy,{weight:900,max:w*.38});},{rim:.014});
const goldBoot=(key:string,s:number)=>sp(key,s,s*1.1,k=>{const p=`M${s*.2} ${s*.1} L${s*.5} ${s*.1} L${s*.52} ${s*.5} Q${s*.9} ${s*.55} ${s*.92} ${s*.74} L${s*.18} ${s*.76} Z`;k.fill(p,INK.gold);k.dots(p,INK.orange,.025,.35);k.key(p,.014);for(let i=0;i<4;i++)k.circle(s*(.28+i*.18),s*.8,.02,INK.navy,true);const base=rect(s*.14,s*.86,s*.72,s*.22);k.fill(base,INK.navy);k.key(base,.012);});
const tvSet=(key:string)=>sp(key,.6,.52,k=>{const b=rect(0,0,.6,.44);k.fill(b,'#2b2b33');k.key(b,.012);const s=rect(.05,.05,.5,.34);k.fill(s,INK.sky);k.circle(.22,.24,.07,INK.yellow);k.circle(.4,.2,.05,INK.pink);k.keyFill(rect(.27,.44,.06,.08),'#2b2b33');});
const subBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.45,h*.55,w*.1,h*.45),INK.grey);const b=rect(0,0,w,h*.55);k.fill(b,'#1a1a1a');k.key(b,.014);k.fill(rect(w*.06,h*.08,w*.4,h*.38),INK.grass);k.fill(rect(w*.54,h*.08,w*.4,h*.38),INK.red);k.text('ON',w*.26,h*.34,h*.16,INK.white,{weight:900});k.text('OFF',w*.74,h*.34,h*.16,INK.white,{weight:900});});
const wheel=(k:Kit,x:number,y:number,r:number)=>{k.key(ell(x,y,r,r),.025,'#7e849e');for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.key(`M${x} ${y} L${x+Math.cos(a)*r} ${y+Math.sin(a)*r}`,.012,'#7e849e');k.fill(ell(x+Math.cos(a)*r,y+Math.sin(a)*r,.05,.05),INK.white);}k.keyFill(`M${x-.05} ${y} L${x-.25} ${y+r+.2} L${x+.25} ${y+r+.2} L${x+.05} ${y} Z`,'#7e849e');};

/* ───────────── 1 · Years of basics (basics) ───────────── */
const basics:SpreadDef={id:'basics',rest:18.2,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);const p=ell(-2.4,Z(.6),1.5,.9);k.fill(p,'#c9b98c',.7);k.dots(p,INK.brown,.05,.2);caption(k,-2.5,'CHUNCHEON · SOUTH KOREA','BORN 1992 · COACHED BY HIS FATHER',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6);for(let i=0;i<7;i++)k.circle(.8+i*.6,Z(1.1),.06,INK.orange);caption(k,2.5,'AGAIN AND AGAIN','NO PROPER LEAGUE UNTIL HE WAS A TEENAGER',INK.navy,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.5,'#6d8f76');const lake=rect(0,1.9,4.5,.35);k.fill(lake,INK.blue);k.dots(lake,INK.navy,.045,.3);k.fill(rect(0,2.25,4.5,.75),'#9dbd78');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#6d8f76');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'b-sun',.32),'L',3.6,2.1,{out:.012});
  B.stand(S.tree(K+'b-pine',.9,1.6,'pine'),-4.5,-1.5,{layer:1});B.stand(S.tree(K+'b-tree',1.0,1.5),-.6,-1.7,{layer:1});
  const dad=B.person(K+'b-dad',-3.3,-.1,1.72,{shirt:'coach',hair:'short',hairColor:'#1d1512',skin:'#e8b88f',adult:true,face:'smile',layer:2});
  const boy=B.person(K+'b-boy',-2.2,.7,1.0,{shirt:'casual',...SON,legs:'kick',face:'smile',layer:3});
  const ball=B.stand(S.ball(K+'b-ball',.1),-1.85,.85,{layer:3,tab:false});B.slot(-2.0,1.0,-1.6,1.0);
  const count=[1,2,3].map(i=>B.stand(P.disc(`b-n${i}`,.3,String(i),[INK.yellow,INK.sky,INK.pink][i-1]),-4.3+i*.55,1.9,{layer:3,s:0,tab:false}));
  const skills=['CONTROL','DRIBBLING','PASSING'].map((l,i)=>B.stand(S.flipCard(K+`b-s${i}`,1.0,.3,l,[INK.yellow,INK.sky,INK.pink][i],INK.navy),-4.4+i*1.1,-1.0,{layer:2,s:0}));
  const league=B.stand(S.sign(K+'b-league',1.4,1.2,'LEAGUE: NOT YET',INK.white),1.2,-1.5,{layer:1,s:0});
  B.stand(S.goal(K+'b-goal',1.6,.85),3.9,-1.4,{layer:1});
  const cones=[0,1,2,3].map(i=>B.stand(S.cone(K+'b-cone',.3),1.6+i*.75,.3+(i%2)*.4,{layer:2}));void cones;
  const SR=B.person(K+'b-sr',1.2,.95,1.1,{shirt:'casual',...SON,legs:'kick',face:'grin',layer:3});
  const boring=B.stand(P.lineCard('b-boring',1.7,.34,['BORING? IT BUILDS TOUCH'],INK.yellow),3.4,1.95,{layer:3,s:0,tab:false});
  const ballR=B.stand(S.ball(K+'b-ballR',.1),1.5,1.05,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.2):b.t;
   sun.dy=.3*beat(t,0,2);boy.body.s=beat(t,2,2.8);dad.body.s=beat(t,7.4,8.2);dad.armR.rot=.12+1.3*pulse(t,8.4,12);
   skills.forEach((c,i)=>{c.s=beat(t,[13.8,15.2,16.6][i],[14.6,16,17.4][i]);});
   // Tap the ball three times: each tap lifts it off the foot and back.
   const taps=[0,1,2].map(i=>manual?beat(act,i/3,(i+.9)/3):beat(t,18.8+i*.6,19.2+i*.6));const hop=manual?Math.sin(Math.PI*((act*3)%1))*(act<1?1:0):maxOf([0,1,2].map(i=>pulse(t,18.8+i*.6,19.3+i*.6)));
   ball.dy=.35*hop;boy.leg!.rot=-.7*hop;count.forEach((c,i)=>{c.s=taps[i];});
   const drill=t>3&&t<12.6?Math.abs(Math.sin(t*2.4)):0;ball.dy=Math.max(ball.dy,.2*drill);boy.leg!.rot=Math.min(boy.leg!.rot,-.5*drill);
   league.s=beat(t,21,21.8);
   SR.body.s=beat(t,25.8,26.6);const run=beat(t,26.6,31.8);SR.body.x=1.2+2.6*run;SR.body.z=.95-.25*Math.sin(run*Math.PI*3);SR.leg!.rot=-.6*Math.abs(Math.sin(t*4))*(run>0&&run<1?1:0);
   ballR.x=SR.body.x+.3;ballR.z=SR.body.z+.1;ballR.rot=-ballR.x*6;ballR.visible=t>26;boring.s=beat(t,29.4,30.2);
   cheer(boy,Math.max(beat(t,33,33.6),manual?beat(act,.95,1):0));cheer(SR,beat(t,33.2,33.8));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,20.6,21.6)-.4*beat(t,32.4,33.2):0;
  };
 }};

/* ───────────── 2 · Far from home (hamburg) ───────────── */
const hamburg:SpreadDef={id:'hamburg',rest:20.6,
 left:k=>{const p=rect(-5,0,5,6.4);k.fill(p,'#d9d3c4');k.dots(p,INK.navy,.06,.1);for(let x=-4.6;x<0;x+=.9)k.key(`M${x} ${Z(-1)} L${x+.4} ${Z(-1)}`,.04,INK.yellow);caption(k,-2.5,'2008 · AGED 16','FROM SOUTH KOREA TO GERMANY',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'HAMBURGER SV','A YOUTH ACADEMY · A NEW LANGUAGE',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'h-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#6d8f76');skyline(k,4.5,2.3,['#c9b48e','#d9c49a','#b9a27a']);k.fill(rect(0,2.3,4.5,.7),'#d9d3c4');},
   k=>{wash(k,4.5,3,'#cfd6e6',INK.sky,y=>.5-y*.1);sea(k,4.5,1.6,.5);for(let i=0;i<3;i++){const x=.6+i*1.3;k.keyFill(`M${x} 1.6 L${x} .7 L${x+.7} .7 L${x+.7} .78 L${x+.08} .78 L${x+.08} 1.6 Z`,INK.red);}k.fill(rect(0,2.1,4.5,.9),INK.grass);});
  const plane=bd.add(S.plane(K+'h-plane',.7,.35),'L',3.6,2.3,{out:.03}),planeR=bd.add(S.plane(K+'h-planeR',.7,.35),'R',.4,2.4,{out:.03});
  const fam=[[-3.8,.2,'bun',true],[-2.9,-.1,'short',true]].map(([x,z,h,a],i)=>B.person(K+`h-f${i}`,x as number,z as number,1.66,{shirt:i?'navy':'casual',hair:h as 'bun',hairColor:'#1d1512',skin:'#e8b88f',adult:a as boolean,face:'smile',layer:2}));
  const boy=B.person(K+'h-boy',-1.8,.8,1.15,{shirt:'casual',...SON,face:'smile',layer:3,holdR:'suitcase'});
  const age=B.stand(S.flipCard(K+'h-age',.9,.32,'AGED 16',INK.pink),-3.6,1.9,{layer:3,s:0,tab:false});
  const miss=fam[0].body.add(S.bubble(K+'h-miss',.46,.4,'heart'),.4,fam[0].h*.95,{z:-.02});
  const acad=B.stand(S.sign(K+'h-acad',1.5,1.25,'YOUTH ACADEMY',INK.white),1.2,-1.6,{layer:1,s:0});
  const SR=B.person(K+'h-sr',1.4,.4,1.18,{shirt:'ger',...SON,face:'open',layer:2});
  const suit=B.stand(caseBody(K+'h-case',1.3,.8),3.2,1.0,{layer:3});const lid=suit.flap(caseLid(K+'h-lid',1.3,.8),0,.8,{z:.03});
  const words=[['HALLO!',INK.yellow],['DANKE!',INK.sky],['HELLO!',INK.pink]].map(([w,c],i)=>B.stand(P.lineCard(`h-w${i}`,.8,.32,[w],c),2.4+i*.95,-.4+(i%2)*.3,{layer:2,s:0,tab:false}));
  const tvv=B.stand(tvSet(K+'h-tv'),4.4,-1.2,{layer:1,s:0});const toons=B.stand(S.flipCard(K+'h-toons',1.1,.3,'CARTOONS',INK.white,INK.navy),4.2,-.55,{layer:2,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.6):b.t;
   fam.forEach((p,i)=>{p.body.s=beat(t,2+i*.4,2.8+i*.4);p.armR.rot=.12+2*Math.abs(Math.sin(t*3))*(t>9&&t<12.5?1:0);});boy.body.s=beat(t,2.4,3.2)*(1-beat(t,9.6,10.4));age.s=beat(t,3,3.8);
   plane.dx=-2.6*beat(t,9.8,11.8);pop(plane,beat(t,9.6,10)*(1-beat(t,11.6,12)));planeR.dx=2.8*beat(t,12,14.4);pop(planeR,beat(t,11.8,12.2)*(1-beat(t,14.2,14.6)));
   acad.s=beat(t,13.4,14.2);SR.body.s=Math.max(beat(t,14,14.8),manual?1:0);pop(miss,beat(t,17.2,17.8)*(1-beat(t,22,22.6)));
   // Open the suitcase: a German book inside, then new words.
   const open=manual?beat(act,0,.5):beat(t,21,22.2);lid.flip=-2.6*open;
   words.forEach((w,i)=>{w.s=Math.max(beat(t,[23.2,24.4,25.8][i],[24,25.2,26.6][i]),manual?beat(act,.4+i*.15,.6+i*.15):0);});
   tvv.s=beat(t,27.4,28.2);toons.s=beat(t,28.4,29.2);SR.body.yaw=.3*beat(t,28,29);
   cheer(SR,Math.max(beat(t,32.4,33),manual?beat(act,.95,1):0));fam.forEach((p,i)=>cheer(p,beat(t,33+i*.3,33.6+i*.3)*.6));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,12,13):0;
  };
 }};

/* ───────────── 3 · First goal in Germany (firstgoal) ───────────── */
const firstgoal:SpreadDef={id:'firstgoal',rest:20.6,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.9);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.1)} L-1.4 ${Z(-1.1)} L-1.4 ${Z(-2.1)}`);caption(k,-2.5,'30 OCTOBER 2010','FIRST BUNDESLIGA GOAL · AGAINST FC KÖLN',INK.yellow,INK.white);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'STEP BY STEP','HAMBURG, THEN BAYER LEVERKUSEN IN 2013',INK.red);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.white,INK.blue,INK.navy,INK.white],1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,[INK.red,'#2b2b33',INK.white],3);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const fw=bd.add(S.firework(K+'g-fw',.4,INK.yellow),'L',2.4,2.0,{out:.03}),starB=bd.add(S.stars(K+'g-stars',2.4,.6,9),'R',1.1,2.3,{out:.02});
  B.stand(S.goal(K+'g-goal',1.7,.9),-2.5,-1.75,{layer:1});
  const keeper=B.person(K+'g-keep',-2.5,-1.45,1.4,{shirt:'keeper',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const men=[[-3.6,-.3],[-1.3,-.1]].map(([x,z],i)=>B.person(K+`g-d${i}`,x,z,1.5,{shirt:'casual',hair:i?'bald':'short',skin:SKINS[i*2],adult:true,beard:true,face:'open',layer:2}));
  const S1=B.person(K+'g-s1',-2.3,.8,1.16,{shirt:'ger',...SON,legs:'kick',face:'grin',layer:3});
  const card=B.stand(S.flipCard(K+'g-first',1.5,.32,'FIRST LEAGUE GOAL',INK.pink),-3.6,1.95,{layer:3,s:0,tab:false});
  const age=B.stand(S.flipCard(K+'g-age',1.0,.32,'AGED 18',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const steps=[['HAMBURG',.5,INK.white],['LEVERKUSEN',.95,INK.red],['A STAR',1.4,INK.yellow]].map(([l,h,c],i)=>B.stand(step(`g-st${i}`,1.1,h as number,l as string,c as string),1.2+i*1.15,-.4-i*.35,{layer:2}));
  const SR=B.person(K+'g-sr',1.2,.25,1.1,{shirt:'ger',...SON,face:'grin',layer:3});
  const year=B.stand(S.flipCard(K+'g-2013',.9,.3,'2013',INK.red),2.35,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'g-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.6):b.t;
   S1.body.s=beat(t,2.4,3.2);keeper.body.s=beat(t,2.8,3.6);men.forEach((p,i)=>{p.body.s=beat(t,3.2+i*.4,4+i*.4);});
   const g=10.2;S1.leg!.rot=-1.1*pulse(t,g-.3,g+.3);const [bx,bz,by]=t<g?[-1.95,.95,0]:track(t,[[g,-1.95,.95,0],[g+.6,-2.2,-.5,.45],[g+1.1,-2.9,-1.55,.25],[g+2,-2.9,-1.55,0]]);ball(bx,bz,by,t>2.6);
   const dive=pulse(t,g+.3,g+1.6);keeper.body.rot=-.8*dive;keeper.body.dx=.3*dive;card.s=beat(t,11.2,12);pop(fw,beat(t,11.4,12.4)*(1-beat(t,14.6,15.4)));fw.rot=t*.2;
   cheer(S1,beat(t,11.6,12.2));age.s=beat(t,15,15.8);men.forEach(p=>{p.body.dy=.0;});
   // Climb the steps: three steps, one tap each.
   const up=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,21+i*.9,21.6+i*.9));const n=up.reduce((a,v)=>a+v,0);
   const at=(i:number)=>[1.2+i*1.15,-.4-i*.35+.05,[.5,.95,1.4][i]];
   let [x,z,dy]=[1.2,.25,0];for(let i=0;i<3;i++)if(n>i){const u=Math.min(1,n-i),[x1,z1,h1]=at(i);x=x+(x1-x)*u;z=z+(z1-z)*u;dy=dy+(h1-dy)*u;}
   SR.body.x=x;SR.body.z=z+.02;SR.body.dy=dy;SR.body.s=Math.max(beat(t,17,17.8),manual?1:0);year.s=Math.max(beat(t,23,23.8),manual?beat(act,.4,.7):0);
   pop(starB,Math.max(beat(t,28.4,29.4),manual?beat(act,.9,1):0));cheer(SR,Math.max(beat(t,29,29.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.6,17.6)-.4*beat(t,33,33.8):0;
  };
 }};

/* ───────────── 4 · A goal from end to end (london) ───────────── */
const london:SpreadDef={id:'london',rest:21.8,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-.02 ${Z(-2.1)} L-.02 ${Z(1.9)}`,.03);chalk(k,`M-5 ${Z(-1.1)} L-3.4 ${Z(-1.1)} L-3.4 ${Z(1.0)} L-5 ${Z(1.0)}`);caption(k,-2.5,'TOTTENHAM · LONDON 2015','ASIAN GAMES GOLD 2018 · BOTH GOALS SET UP',INK.navy,INK.navy,.36);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.1),.7,.7));chalk(k,`M5 ${Z(-1.1)} L3.4 ${Z(-1.1)} L3.4 ${Z(1.0)} L5 ${Z(1.0)}`);caption(k,2.5,'DECEMBER 2019 · BURNLEY','NEARLY THE WHOLE PITCH · THE PUSKÁS AWARD',INK.pink,INK.navy,.36);},
 build:B=>{
  const bd=backdrop(B,K+'l-bd',k=>{daySky(k,4.5,3);skyline(k,4.5,1.6);wheel(k,3.5,.85,.5);crowd(k,4.5,1.55,2.45,SPURS,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);skyline(k,4.5,1.6);crowd(k,4.5,1.55,2.45,SPURS,3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const gold=B.stand(P.medal('l-gold',.5),-4.3,-1.4,{layer:1,s:0});const ag=B.stand(S.flipCard(K+'l-ag',1.6,.32,'ASIAN GAMES GOLD',INK.yellow,INK.navy),-3.6,-.75,{layer:2,s:0,tab:false});
  B.slot(-4.3,.9,4.2,.4);
  const SL=B.person(K+'l-sl',-4.4,.75,1.14,{shirt:'ger',...SON,legs:'kick',face:'grin',layer:3});
  const SR=B.person(K+'l-sr',.4,.75,1.14,{shirt:'ger',...SON,legs:'kick',face:'grin',layer:3});
  const defs=[-3.0,-1.6,-.6,1.4,2.8].map((x,i)=>B.person(K+`l-d${i}`,x,.2+(i%2)*.9,1.16,{shirt:'casual',hair:(['short','curly','bald','short','long'] as const)[i],skin:SKINS[i%5],face:'open',layer:2}));
  B.stand(S.goal(K+'l-goal',.9,1.5),4.6,-.3,{layer:2,yaw:-1.2});
  const keeper=B.person(K+'l-keep',4.2,-.1,1.2,{shirt:'keeper',hair:'short',skin:SKINS[0],face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const puskas=B.stand(S.goldenBall(K+'l-pk',.26),2.6,-1.6,{layer:1,s:0});const pc=B.stand(S.flipCard(K+'l-pc',1.6,.32,'PUSKÁS AWARD',INK.yellow,INK.navy),2.4,1.95,{layer:3,s:0,tab:false});
  const yr=B.stand(S.flipCard(K+'l-yr',1.5,.3,'GOAL OF THE YEAR',INK.pink),4.1,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'l-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.8):b.t;
   gold.s=beat(t,7.4,8.2);ag.s=beat(t,9,9.8);defs.forEach((p,i)=>{p.body.s=beat(t,15+i*.4,15.8+i*.4);});keeper.body.s=beat(t,16.6,17.4);SL.body.s=beat(t,2.4,3.2);
   // Roll the ball down the pitch: three taps, from his own box to the far goal.
   const run=manual?act:track(t,[[22.6,0],[24.6,.34],[25.4,.34],[27,.67],[27.6,.67],[29.4,1]])[0];
   const x=-4.3+8.4*run,z=.75-.35*run+.25*Math.sin(run*Math.PI*5);
   SL.body.x=Math.min(-.3,x-.3);SL.body.z=z;SL.body.s=beat(t,2.4,3.2)*(x<-.1?1:0);SR.body.x=Math.max(.3,x-.3);SR.body.z=z;SR.body.s=x>=-.1?1:0;
   const runL=Math.abs(Math.sin(t*6))*(run>0&&run<1?1:0);SL.leg!.rot=-.7*runL;SR.leg!.rot=-.7*runL-(run>.97?.5:0);
   defs.forEach((p,i)=>{const dx=[-3.0,-1.6,-.6,1.4,2.8][i];p.body.rot=.35*Math.max(0,1-Math.abs(x-dx)*2)*(i%2?1:-1);});
   const shoot=run>.97;ball(shoot?4.3:x+.05,shoot?.1:z+.05,shoot?.2:0,t>2.6);keeper.body.rot=-.6*beat(run,.95,1);
   puskas.s=Math.max(beat(t,30.4,31.2),manual?beat(act,.9,1):0);pc.s=Math.max(beat(t,31,31.8),manual?beat(act,.9,1):0);yr.s=beat(t,32.6,33.4);
   cheer(SR,Math.max(beat(t,30,30.6),manual?beat(act,.97,1):0));
   return b.narrated?-.4*beat(t,6.8,7.8)+.4*beat(t,14.6,15.6):0;
  };
 }};

/* ───────────── 5 · Top scorer (boot) ───────────── */
const boot:SpreadDef={id:'boot',rest:19.4,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.1)} L-1.4 ${Z(-1.1)} L-1.4 ${Z(-2.1)}`);caption(k,-2.5,'2021–22 · 23 GOALS','CLEAN, QUICK SHOOTING, PRACTISED SINCE HE WAS A BOY',INK.navy,INK.navy,.38);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'THE GOLDEN BOOT','SHARED WITH MOHAMED SALAH · CAPTAIN IN 2023',INK.gold,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'o-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,SPURS,2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.45,SPURS,5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const starsB=bd.add(S.stars(K+'o-stars',2.6,.6,11),'R',1.0,2.3,{out:.02});
  B.stand(S.goal(K+'o-goal',1.7,.9),-2.5,-1.75,{layer:1});
  const keeper=B.person(K+'o-keep',-2.5,-1.45,1.26,{shirt:'keeper',hair:'short',skin:SKINS[3],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const S1=B.person(K+'o-s1',-2.2,.8,1.18,{shirt:'ger',...SON,legs:'kick',face:'grin',layer:3});
  const counter=B.stand(S.scoreboard(K+'o-count',1.3,1.2,'GOALS'),-4.2,-1.0,{layer:2});
  counter.add(S.flipCard(K+'o-c23',.9,.5,'23',INK.pink),0,.32,{z:.012});const cnt=['5','10','15','20'].map((l,i)=>counter.flap(S.flipCard(K+`o-c${l}`,.9,.5,l,i%2?INK.blue:'#3d5da0'),0,.82,{z:.04-i*.004}));
  const board=B.stand(S.scoreboard(K+'o-board',1.8,1.35,'TOP SCORER'),1.4,-1.7,{layer:1});
  board.add(P.lineCard('o-asian',1.5,.62,['FIRST ASIAN','WINNER'],INK.yellow),0,.36,{z:.012});const cover=board.flap(P.lineCard('o-shared',1.5,.62,['SHARED WITH','SALAH'],INK.sky),0,.98,{z:.026});
  const gb=B.stand(goldBoot(K+'o-gb',.7),3.1,-.4,{layer:2,s:0});
  const SR=B.person(K+'o-sr',2.4,.6,1.22,{shirt:'ger',...SON,face:'grin',layer:3});
  const band=SR.body.add(P.disc('o-band',.15,'C'),.17,SR.h*.62,{z:.02,anchor:'center'});
  const capt=B.stand(S.flipCard(K+'o-capt',1.4,.3,'CAPTAIN · 2023',INK.yellow,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const anyw=B.stand(S.flipCard(K+'o-any',1.7,.3,'FROM ANYWHERE TO THE TOP',INK.pink),3.8,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'o-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.4):b.t;
   S1.body.s=beat(t,1.8,2.6);keeper.body.s=beat(t,2.2,3);cnt.forEach((c,i)=>{c.flip=-3.2*beat(t,3+i*.9,3.4+i*.9);});
   const shots=[4,6.2,14.6,16.8];S1.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));
   let [bx,bz,by]=[-1.9,.95,0];for(const a of shots)if(t>a&&t<a+1.8)[bx,bz,by]=track(t,[[a,-1.9,.95,0],[a+.7,-2.6+(a%2)*.5,-1.55,.3],[a+1.8,-2.6+(a%2)*.5,-1.55,0]]);ball(bx,bz,by,t>2);
   keeper.body.rot=.7*maxOf(shots.map(a=>pulse(t,a+.2,a+1.2)))*(1);
   gb.s=beat(t,8.4,9.2);SR.body.s=beat(t,8.6,9.4);board.s=1;
   // Flip the scoreboard: shared with Salah, and the first Asian winner.
   cover.flip=-3.2*(manual?beat(act,0,.6):beat(t,20,21));cheer(SR,Math.max(beat(t,22,22.6)*(1-beat(t,24.8,25.4)),manual?beat(act,.8,1):0));
   pop(band,Math.max(beat(t,25.4,26),manual?beat(act,.5,.8):0));capt.s=beat(t,26,26.8);anyw.s=beat(t,29.4,30.2);pop(starsB,beat(t,29.6,30.6));cheer(S1,beat(t,33.2,33.8));
   return b.narrated?.4*beat(t,8,9)-.4*beat(t,32.8,33.6):0;
  };
 }};

/* ───────────── 6 · A trophy at last (trophy) ───────────── */
const trophyS:SpreadDef={id:'trophy',rest:19.6,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'21 MAY 2025 · EUROPA LEAGUE','TOTTENHAM 1, MANCHESTER UNITED 0',INK.yellow,INK.white,.34);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'HIS FIRST MAJOR TROPHY','THEN LOS ANGELES FC, AUGUST 2025',INK.yellow,INK.white,.36);},
 build:B=>{
  const bd=backdrop(B,K+'t-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,SPURS,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3,'#3b2a5e',INK.pink);palms(k,4.5,1.9,5);k.fill(rect(0,1.9,4.5,.2),'#e0a070');crowd(k,4.5,2.0,2.5,SPURS,4);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'t-fw1',.44,INK.yellow),'L',1.2,1.9,{out:.03}),bd.add(S.firework(K+'t-fw2',.4,INK.pink),'R',3.4,1.9,{out:.03}),bd.add(S.firework(K+'t-fw3',.36,INK.sky),'L',3.4,2.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'t-conf',3.6,1.4,5),'L',.4,1.1,{out:.04});
  const plane=bd.add(S.plane(K+'t-plane',.7,.35),'R',.4,2.4,{out:.03});
  const years=B.stand(P.lineCard('t-years',1.5,.62,['YEARS WITHOUT','A BIG TROPHY'],'#c9b9d6'),-4.1,-1.4,{layer:1});
  const board=B.stand(S.scoreboard(K+'t-board',1.7,1.3,'FINAL'),-1.3,-1.7,{layer:1,s:0});board.add(S.scoreFlap(K+'t-s',1.4,.6,'TOT','1–0','MUN'),0,.36,{z:.012});
  const sub=B.stand(subBoard(K+'t-sub',.8,1.2),-3.9,.3,{layer:2,s:0});
  const SL=B.person(K+'t-sl',-2.6,.7,1.24,{shirt:'ger',...SON,face:'grin',layer:3});
  const team=[[-3.4,1.0,'curly'],[-1.6,.2,'short'],[-1.0,1.1,'bald']].map(([x,z,h],i)=>B.person(K+`t-m${i}`,x as number,z as number,1.2,{shirt:'ger',hair:h as 'curly',hairColor:'#1d1512',skin:SKINS[(i+1)%5],face:'grin',layer:i===1?2:3}));
  const pole=B.stand(S.post(K+'t-pole',.14,1.3,INK.stock),-2.1,.9,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'t-cup',.6,.8),0,.3,{z:.03});
  const first=B.stand(S.flipCard(K+'t-first',1.6,.32,'FIRST MAJOR TROPHY',INK.yellow,INK.navy),-2.5,1.98,{layer:3,s:0,tab:false});
  const SR=B.person(K+'t-sr',2.4,.7,1.24,{shirt:'navy',...SON,face:'grin',layer:3,holdR:'suitcase'});
  const la=B.stand(S.flipCard(K+'t-la',1.7,.32,'LOS ANGELES FC · 2025',INK.yellow,INK.navy),2.4,1.95,{layer:3,s:0,tab:false});
  const pat=B.stand(P.lineCard('t-pat',1.6,.62,['BASICS · PRACTICE','PATIENCE'],INK.white),4.0,-1.2,{layer:1,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   years.s=1-beat(t,8,9)*0;board.s=beat(t,8,8.8);sub.s=beat(t,15.2,16);SL.body.s=beat(t,15.6,16.4);team.forEach((p,i)=>{p.body.s=beat(t,16+i*.4,16.8+i*.4);});
   SL.body.x=-2.6-.6*(1-beat(t,15.6,17));
   // Raise the trophy.
   const raise=manual?beat(act,0,.6):beat(t,20.2,21.6);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));cheer(SL,Math.max(raise,manual?beat(act,.3,.7):0));
   first.s=Math.max(beat(t,22,22.8),manual?beat(act,.5,.9):0);fw.forEach((q,i)=>{pop(q,Math.max(beat(t,21.6+i*.4,22.6+i*.4),manual?beat(act,.6,1):0));q.rot=t*.2;});pop(conf,Math.max(beat(t,21.8,23),manual?beat(act,.6,1):0));
   team.forEach((p,i)=>cheer(p,beat(t,22.4+i*.3,23+i*.3)));
   plane.dx=2.6*beat(t,24.6,27.4);pop(plane,beat(t,24.4,24.8)*(1-beat(t,27.2,27.6)));SR.body.s=beat(t,26.6,27.4);la.s=beat(t,27.2,28);
   pat.s=beat(t,31,31.8);cheer(SR,beat(t,36.4,37));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,24.4,25.4)-.4*beat(t,30.6,31.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={basics,hamburg,firstgoal,london,boot,trophy:trophyS};
