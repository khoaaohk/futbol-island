/**
 * The six Tim Howard pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/howard/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The thread is "different, and focused": an explainer flap (what tics and OCD are, in plain words), a goal that opens,
 * a banner for helping kids, a suitcase to England, three dives, and helper cards. Tourette syndrome is explained, never
 * acted out for laughs: no tic is drawn as a gag. Kits are colour only (USA navy, keeper green, Belgium orange-red).
 */
import {INK,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,daySky,crowd,nightSky,lightRig,hills,roofs,sea,skyline,backdrop,plates,wash} from '../spreadKit';

const K='howard-';
const P=plates(K),{sp}=P;
const TH={skin:SKINS[2],hair:'short' as const,hairColor:'#2a1d14'};
const USA=[INK.navy,INK.white,INK.red,INK.blue];

/* ───────────── Howard-only plates ───────────── */
const board=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.wood);k.key(b,.016);const g=rect(w*.05,h*.07,w*.9,h*.86);k.fill(g,'#2f5a4a');k.dots(g,INK.navy,.04,.2);k.key(g,.01);});
const keeperBook=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.navy);k.dots(b,INK.blue,.035,.3);k.key(b,.016);k.fill(rect(0,0,w*.1,h),INK.blue);k.text('THE',w*.55,h*.3,h*.12,INK.yellow,{weight:900});k.text('KEEPER',w*.55,h*.46,h*.15,INK.yellow,{weight:900,max:w*.8});
 k.fill(ell(w*.55,h*.72,w*.16,w*.16),'#52a86a');k.key(ell(w*.55,h*.72,w*.16,w*.16),.01);});
const helperFront=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.sky);k.hatch(b,INK.white,.08,.8,.012);k.key(b,.016);k.text('?',w/2,h*.66,h*.5,INK.navy,{weight:900});},{rim:.016});
const helperBack=(key:string,w:number,h:number,label:string,c:string,skin:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.15);k.key(b,.016);k.fill(ell(w/2,h*.36,w*.16,w*.16),skin);k.key(ell(w/2,h*.36,w*.16,w*.16),.01);k.key(`M${w*.42} ${h*.4} Q${w/2} ${h*.47} ${w*.58} ${h*.4}`,.012);
 k.fill(rect(w*.3,h*.52,w*.4,h*.22),INK.white);k.key(rect(w*.3,h*.52,w*.4,h*.22),.01);k.text(label,w/2,h*.9,h*.12,INK.navy,{weight:900,max:w*.9});},{rim:.016});

/* ───────────── 1 · Tics he could not stop (tics) ───────────── */
const tics:SpreadDef={id:'tics',rest:17.3,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'NORTH BRUNSWICK · NEW JERSEY','BORN 1979 · HE LIVED WITH HIS MOTHER',INK.blue,INK.navy,.36);},
 right:k=>{floor(k,0,5);caption(k,2.5,'TOURETTE SYNDROME','DIFFERENT IS NOT WRONG',INK.pink);},
 build:B=>{
  const bd=backdrop(B,K+'t-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#8fae6e');roofs(k,.2,4.3,2.3,2);k.fill(rect(0,2.3,4.5,.7),'#e3d6bb');},
   k=>{wash(k,4.5,3,'#f6e2b8',INK.orange,()=>.14);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const sun=bd.add(S.sun(K+'t-sun',.3),'L',3.7,2.1,{out:.012});
  B.stand(S.house(K+'t-house',1.5,1.4),-3.8,-1.6,{layer:1});B.stand(S.tree(K+'t-tree',1.0,1.5),-1.2,-1.8,{layer:1});
  const T=B.person(K+'t-tim',-2.6,.7,.98,{shirt:'casual',...TH,face:'smile',layer:3,holdR:'ball'});
  const mum=B.person(K+'t-mum',-1.7,.1,1.6,{shirt:'coach',hair:'long',hairColor:'#c9a26a',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const born=B.stand(S.flipCard(K+'t-born',1.1,.3,'BORN 1979',INK.yellow,INK.navy),-3.9,1.95,{layer:3,s:0,tab:false});
  const ts=B.stand(S.flipCard(K+'t-ts',1.7,.3,'TOURETTE SYNDROME',INK.sky,INK.navy),-1.6,1.95,{layer:3,s:0,tab:false});
  const bb=B.stand(board(K+'t-board',2.4,1.5),2.0,-1.4,{layer:1});
  bb.add(P.lineCard('t-tics',2.1,.62,['TICS: SUDDEN MOVEMENTS','OR SOUNDS, HARD TO STOP'],INK.yellow),0,.75,{z:.012});
  const flap=bb.flap(P.lineCard('t-what',2.16,.66,['WHAT IS IT?'],INK.white),0,1.41,{z:.03});
  const ocd=bb.add(P.lineCard('t-ocd',2.1,.5,['OCD: WORRIES THAT MAKE','YOU REPEAT THINGS'],INK.sky),0,.14,{z:.012});
  const TR=B.person(K+'t-tr',1.2,.6,1.02,{shirt:'casual',...TH,face:'smile',layer:3});
  const kids=[[3.4,.4,'bun',SKINS[4]],[4.3,.0,'curly',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`t-k${i}`,x as number,z as number,.98,{shirt:i?'fan':'bib',hair:h as 'bun',skin:sk as string,face:'smile',layer:3}));
  const ok=B.stand(S.flipCard(K+'t-ok',1.7,.3,'DIFFERENT IS NOT WRONG',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.3):b.t;
   sun.dy=.3*beat(t,0,2);T.body.s=beat(t,2,2.8);born.s=beat(t,3.4,4.2);mum.body.s=beat(t,9.4,10.2);mum.armR.rot=.12+.8*beat(t,10.4,11.2);ts.s=beat(t,14.6,15.4);
   // Lift the flap: a plain explainer card.
   const lift=manual?beat(act,0,.5):beat(t,18.6,19.8);flap.flip=-2.8*lift;
   TR.body.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.3,.7):0);pop(ocd,Math.max(beat(t,26.6,27.4),manual?beat(act,.5,.9):0));
   kids.forEach((p,i)=>{p.body.s=Math.max(beat(t,30+i*.4,30.8+i*.4),manual?beat(act,.7,1):0);});ok.s=Math.max(beat(t,32.6,33.4),manual?beat(act,.9,1):0);TR.armR.rot=.12+1.2*beat(t,33,33.8);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.6,18.6):0;
  };
 }};

/* ───────────── 2 · Trying to hide it (hiding) ───────────── */
const hiding:SpreadDef={id:'hiding',rest:13.8,
 left:k=>{floor(k,-5,0,'#cdb894','#a08660');caption(k,-2.5,'SCHOOL DAYS','HIDING TICS ALL DAY IS VERY TIRING',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'IN GOAL','ALL HIS FOCUS ON THE BALL',INK.green);},
 build:B=>{
  const bd=backdrop(B,K+'h-bd',k=>{wash(k,4.5,3,'#d6dde6',INK.sky,()=>.2);for(let i=0;i<3;i++){const d=rect(.5+i*1.4,.6,.8,1.6);k.fill(d,'#8aa0c6');k.key(d,.012);}k.fill(rect(0,2.4,4.5,.6),'#a08660');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#8fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const T=B.person(K+'h-tim',-2.6,.6,1.1,{shirt:'casual',...TH,face:'shy',layer:3});
  const tired=T.body.add(P.faceCard('h-tired',.3,'worried',INK.sky),.32,1.32,{z:-.02,anchor:'center'});
  const kids=[[-3.8,-.4,'bun',SKINS[0]],[-1.4,-.2,'curly',SKINS[3]]].map(([x,z,h,sk],i)=>B.person(K+`h-k${i}`,x as number,z as number,1.08,{shirt:i?'fan':'bib',hair:h as 'bun',skin:sk as string,face:'open',layer:2}));
  const hide=B.stand(S.flipCard(K+'h-hide',1.4,.3,'TRYING TO HIDE',INK.sky,INK.navy),-3.9,1.95,{layer:3,s:0,tab:false});
  const und=B.stand(S.flipCard(K+'h-und',1.6,.3,'PEOPLE DID NOT KNOW',INK.pink),-1.5,1.95,{layer:3,s:0,tab:false});
  const goal=B.stand(S.goal(K+'h-goal',1.9,1.0),2.6,-1.4,{layer:1});
  const cover=goal.flap(P.frame('h-cover',2.0,1.06,k=>{k.text('OPEN',1.0,.5,.2,INK.navy,{weight:900});k.text('THE GOAL',1.0,.78,.18,INK.navy,{weight:900});},INK.stock),0,1.04,{z:.05});
  const keep=B.person(K+'h-keep',2.6,-1.1,1.24,{shirt:'keeper',...TH,face:'grin',layer:1,holdL:'glove',holdR:'glove'});
  const focus=['FOCUS','REACT FAST'].map((l,i)=>B.stand(S.flipCard(K+`h-f${i}`,1.2,.3,l,[INK.yellow,INK.green][i],INK.navy),1.6+i*1.8,1.95,{layer:3,s:0,tab:false}));
  const shooter=B.person(K+'h-sh',4.2,.7,1.08,{shirt:'navy',hair:'curly',skin:SKINS[4],legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'h-ball',.1),3.9,.8,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.8):b.t;
   T.body.s=beat(t,1.8,2.6);hide.s=beat(t,2.6,3.4);pop(tired,beat(t,7,7.6)*(1-beat(t,13.6,14.2)));T.body.rot=-.05*beat(t,7,8);kids.forEach((p,i)=>{p.body.s=beat(t,10.2+i*.4,11+i*.4);});und.s=beat(t,11,11.8);
   // Open the goal: the cover lifts and Tim steps in.
   const open=manual?beat(act,0,.5):beat(t,15,16.2);cover.flip=-2.9*open;keep.body.s=Math.max(beat(t,16.4,17.2),manual?beat(act,.4,.8):0);
   focus.forEach((c,i)=>{c.s=Math.max(beat(t,[20,23.6][i],[20.8,24.4][i]),manual?beat(act,.7+i*.1,.9+i*.1):0);});
   shooter.body.s=beat(t,24,24.8);const sh=26.6;shooter.leg!.rot=-1.1*pulse(t,sh-.3,sh+.3);
   const [bx,bz,by]=t<sh?[3.9,.8,0]:track(t,[[sh,3.9,.8,0],[sh+.6,3.0,-1.0,.45],[sh+1.4,3.4,.2,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>24.4;
   keep.body.rot=.5*pulse(t,sh+.2,sh+1.2);keep.body.dx=.3*pulse(t,sh+.2,sh+1.2);cheer(keep,beat(t,sh+1.4,sh+2));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,14,15):0;
  };
 }};

/* ───────────── 3 · A young professional (helping) ───────────── */
const helping:SpreadDef={id:'helping',rest:15.5,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1998 · AGED NINETEEN','HIS FIRST MAJOR LEAGUE SOCCER MATCH',INK.red,INK.navy,.4);},
 right:k=>{pitch(k,0,5,'#9dbd78',INK.green,.8);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'HELPING KIDS','HUMANITARIAN OF THE YEAR · 2001',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'p-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[INK.red,INK.white,INK.navy],1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#86ad78');k.fill(rect(0,2.3,4.5,.7),'#9dbd78');});
  const sign=B.stand(S.sign(K+'p-sign',1.4,1.1,'METROSTARS',INK.red),-4.0,-1.5,{layer:1,s:0});
  B.stand(S.goal(K+'p-goal',1.8,.95),-2.2,-1.8,{layer:1});
  const T=B.person(K+'p-tim',-2.2,-1.5,1.28,{shirt:'keeper',...TH,face:'grin',layer:1,holdL:'glove',holdR:'glove'});
  const kidsL=[[-3.4,.6,'bun',SKINS[1]],[-2.2,.9,'curly',SKINS[0]],[-1.0,.5,'short',SKINS[4]]].map(([x,z,h,sk],i)=>B.person(K+`p-k${i}`,x as number,z as number,.96,{shirt:['bib','fan','casual'][i] as 'bib',hair:h as 'bun',skin:sk as string,face:'grin',layer:3}));
  const young=B.stand(S.flipCard(K+'p-young',1.6,.3,'STILL VERY YOUNG',INK.yellow,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'p-pole',2.4,1.4,INK.stock),2.4,-1.2,{layer:1,tab:false});
  const banner=pole.add(S.banner(K+'p-ban',2.1,.5,'HELPING KIDS',INK.yellow,INK.navy),-1.05,.2,{z:.03,anchor:'bottom'});
  const award=B.stand(S.trophy(K+'p-award',.5,.66),.9,.6,{layer:3,s:0,tab:false});const awC=B.stand(S.flipCard(K+'p-aw',1.6,.3,'AN AWARD · 2001',INK.gold,INK.navy),1.2,1.95,{layer:3,s:0,tab:false});
  const TR=B.person(K+'p-tr',2.0,.4,1.3,{shirt:'navy',...TH,face:'smile',layer:2});
  const kids=[[3.0,.9,'bun',SKINS[3]],[3.8,.5,'long',SKINS[0]],[4.5,1.0,'curly',SKINS[2]]].map(([x,z,h,sk],i)=>B.person(K+`p-r${i}`,x as number,z as number,.96,{shirt:['fan','bib','casual'][i] as 'fan',hair:h as 'bun',skin:sk as string,face:'grin',layer:3}));
  const dream=B.stand(S.flipCard(K+'p-dream',1.6,.3,'FOLLOW YOUR DREAMS',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.5):b.t;
   sign.s=beat(t,2.4,3.2);T.body.s=beat(t,2.8,3.6);kidsL.forEach((p,i)=>{p.body.s=beat(t,10+i*.4,10.8+i*.4);cheer(p,pulse(t,11.6+i*.4,13+i*.4)*.7);});T.armR.rot=.12+1.0*pulse(t,10.6,13);young.s=beat(t,14,14.8);
   // Raise the banner up its pole.
   TR.body.s=Math.max(beat(t,15,15.8),manual?1:0);const raise=manual?beat(act,0,.6):beat(t,16.8,18.2);banner.dy=1.0*raise;pop(banner,Math.min(1,.15+raise*2));
   pop(award,Math.max(beat(t,19,19.8),manual?beat(act,.5,.8):0));awC.s=Math.max(beat(t,19.4,20.2),manual?beat(act,.6,.9):0);
   kids.forEach((p,i)=>{p.body.s=Math.max(beat(t,24+i*.4,24.8+i*.4),manual?beat(act,.6,1):0);cheer(p,Math.max(beat(t,28.4+i*.3,29+i*.3),manual?beat(act,.9,1):0));});dream.s=beat(t,28.6,29.4);
   cheer(TR,raise*.6);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,15,16):0;
  };
 }};

/* ───────────── 4 · A big move (england) ───────────── */
const england:SpreadDef={id:'england',rest:16.9,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'2003 · MANCHESTER UNITED','FA CUP WINNER, 2004',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'2006 · EVERTON','TEN SEASONS AT THE TOP',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'e-bd',k=>{daySky(k,4.5,3);sea(k,4.5,1.0,.5);skyline(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),INK.grass);},
   k=>{const p=rect(0,0,4.5,3);k.fill(p,'#c8d3e0');k.dots(p,INK.sky,.06,.3);crowd(k,4.5,1.2,2.45,[INK.blue,INK.white,INK.navy],4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const plane=bd.add(S.plane(K+'e-plane',.7,.35),'L',.2,2.6,{out:.03});
  const mu=B.stand(S.sign(K+'e-mu',1.6,1.1,'MANCHESTER UNITED',INK.red),-3.9,-1.5,{layer:1,s:0});
  const T=B.person(K+'e-tim',-2.4,.4,1.28,{shirt:'keeper',...TH,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const cup=B.stand(S.trophy(K+'e-fa',.55,.75),-1.2,.7,{layer:3,s:0,tab:false});const faC=B.stand(S.flipCard(K+'e-faC',1.3,.3,'FA CUP 2004',INK.yellow,INK.navy),-1.3,1.95,{layer:3,s:0,tab:false});
  const big=B.stand(S.flipCard(K+'e-big',1.6,.3,'A BIG STEP',INK.pink),-3.7,1.95,{layer:3,s:0,tab:false});
  const ev=B.stand(S.sign(K+'e-ev',1.3,1.1,'EVERTON',INK.blue),3.9,-1.5,{layer:1,s:0});
  const case_=B.stand(S.post(K+'e-case',1.3,.9,'#d9cfb8'),1.6,-.3,{layer:2});
  case_.add(sp(K+'e-in',1.2,.78,k=>{const b=rect(0,0,1.2,.78);k.fill(b,'#8a3b34');k.key(b,.014);const l=rect(.07,.06,1.06,.66);k.fill(l,'#cfe0f0');k.dots(l,INK.blue,.035,.2);k.key(l,.01);}),0,.06,{z:.012});
  const gloves=[0,1].map(i=>case_.add(S.icon(K+'e-glove',.3,'glove'),-.25+i*.5,.22,{z:.02}));
  const lid=case_.flap(P.suitcase('e-lid',1.24,.82,'ENGLAND',INK.red),0,.86,{z:.03});
  const TR=B.person(K+'e-tr',2.8,.6,1.3,{shirt:'keeper',...TH,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const ten=B.stand(S.flipCard(K+'e-ten',1.4,.3,'TEN SEASONS',INK.yellow,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const top=B.stand(S.flipCard(K+'e-top',1.6,.3,'AT THE VERY TOP',INK.pink),3.8,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.9):b.t;
   plane.dx=3.4*beat(t,1.8,5.4);pop(plane,beat(t,1.6,2)*(1-beat(t,5.4,5.8)));mu.s=beat(t,3,3.8);T.body.s=beat(t,4.4,5.2);pop(cup,beat(t,8.6,9.4));faC.s=beat(t,9,9.8);cheer(T,beat(t,9.4,10)*(1-beat(t,16,16.6)));big.s=beat(t,12,12.8);
   // Open the suitcase: his gloves are packed.
   const open=manual?beat(act,0,.6):beat(t,18.2,19.4);lid.flip=-2.7*open;gloves.forEach((g,i)=>{g.dy=.12*pulse(open,.5+i*.2,1);});
   ev.s=Math.max(beat(t,20,20.8),manual?beat(act,.4,.8):0);TR.body.s=Math.max(beat(t,20.4,21.2),manual?beat(act,.5,.9):0);ten.s=beat(t,22.4,23.2);top.s=beat(t,26.4,27.2);cheer(TR,Math.max(beat(t,27,27.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17,18):0;
  };
 }};

/* ───────────── 5 · Fifteen saves (belgium) ───────────── */
const belgium:SpreadDef={id:'belgium',rest:15.0,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'BRAZIL · 2014 WORLD CUP','USA AND BELGIUM · A KNOCKOUT MATCH',INK.yellow,INK.white,.38);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);chalk(k,`M.9 ${Z(-2.1)} L.9 ${Z(-.6)} L4.1 ${Z(-.6)} L4.1 ${Z(-2.1)}`);caption(k,2.5,'FIFTEEN SAVES','A WORLD CUP RECORD FOR ONE MATCH',INK.yellow,INK.white,.4);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.red,INK.yellow,INK.navy,INK.white],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,USA,5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const bel=[[-3.6,.4,'short',SKINS[0]],[-2.4,-.2,'curly',SKINS[4]],[-1.2,.6,'bald',SKINS[2]]].map(([x,z,h,sk],i)=>B.person(K+`b-a${i}`,x as number,z as number,1.24,{shirt:'casual',hair:h as 'short',skin:sk as string,legs:'kick',face:'open',layer:i===1?2:3}));
  const again=B.stand(S.flipCard(K+'b-again',1.6,.3,'AGAIN AND AGAIN',INK.pink),-3.7,1.95,{layer:3,s:0,tab:false});
  const ko=B.stand(S.flipCard(K+'b-ko',1.5,.3,'LOSERS GO HOME',INK.sky,INK.navy),-1.5,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'b-goal',2.4,1.1),2.5,-1.9,{layer:1});
  const T=B.person(K+'b-tim',2.5,-1.4,1.36,{shirt:'keeper',...TH,beard:true,face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const saves=B.stand(S.noteCard(K+'b-15',.8,.6,['15']),4.4,-.4,{layer:2,s:0});
  const board=B.stand(S.scoreboard(K+'b-board',1.4,1.1,'AFTER EXTRA TIME'),.8,-.4,{layer:2,s:0});board.add(S.scoreFlap(K+'b-sc',1.1,.5,'USA','1–2','BEL'),0,.3,{z:.012});
  const proud=B.stand(S.flipCard(K+'b-proud',1.6,.3,'PROUD OF HIS EFFORT',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  const balls=[0,1,2].map(i=>B.stand(S.ball(K+`b-ball${i}`,.1),.5,1.0,{layer:3,tab:false}));
  const ballL=B.stand(S.ball(K+'b-ballL',.1),-1.0,.8,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15):b.t;
   bel.forEach((p,i)=>{p.body.s=beat(t,2.2+i*.4,3+i*.4);});T.body.s=beat(t,3,3.8);again.s=beat(t,7.8,8.6);ko.s=beat(t,12.2,13);
   const kicks=[8.4,9.6,10.8];bel.forEach((p,i)=>{p.leg!.rot=-1.1*pulse(t,kicks[i]-.3,kicks[i]+.3);});
   let [lx,lz,ly]=[-1.0,.8,0];for(const [i,a] of kicks.entries())if(t>a&&t<a+.7)[lx,lz,ly]=track(t,[[a,-3.4+i*1.2,.5,0],[a+.7,-.1,-.4,.3]]);ballL.x=lx;ballL.z=lz;ballL.dy=ly;ballL.visible=kicks.some(a=>t>a&&t<a+.7);
   // Dive for the save, three times: left, right, up.
   const d=[0,1,2].map(i=>manual?beat(act,i/3,(i+.7)/3):beat(t,16.2+i*1.3,16.8+i*1.3));const dir=[-1,1,0];
   let dx=0,rot=0,dy=0;d.forEach((v,i)=>{const p=pulse(v,0,1);dx+=dir[i]*.7*p;rot+=dir[i]*-.9*p;dy+=(i===2?.45:.1)*p;});T.body.dx=dx;T.body.rot=rot;T.body.dy=dy;
   balls.forEach((q,i)=>{const v=d[i];const tx=2.5+dir[i]*.9,ty=i===2?1.3:.45;const [bx,bz,by]=track(v,[[0,.5+i*.8,1.0,0],[.6,tx,-1.3,ty],[1,tx+(i-1)*.4,-.2,0]]);q.x=bx;q.z=bz;q.dy=by;q.visible=v>0&&v<.98;});
   pop(saves,Math.max(beat(t,18.2,19),manual?beat(act,.9,1):0));board.s=beat(t,22.8,23.6);proud.s=beat(t,25.6,26.4);cheer(T,beat(t,27,27.6)*.6);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,15,16):0;
  };
 }};

/* ───────────── 6 · Helping other kids (legacy) ───────────── */
const legacy:SpreadDef={id:'legacy',rest:20.1,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'121 GAMES FOR THE UNITED STATES','HIS BOOK: THE KEEPER · 2014',INK.navy,INK.navy,.36);},
 right:k=>{paving(k,0,5,'#e8dcc2','#b8a888');caption(k,2.5,'NOBODY IS ALONE','A PROGRAMME AT RUTGERS CARRIES HIS NAME',INK.pink,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'l-bd',k=>{wash(k,4.5,3,'#f6e2b8',INK.orange,()=>.14);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#8fae6e');roofs(k,.3,4.2,2.3,3);k.fill(rect(0,2.3,4.5,.7),'#e8dcc2');});
  const games=B.stand(S.noteCard(K+'l-121',.9,.6,['121']),-4.0,-.8,{layer:2,s:0});
  const most=B.stand(S.flipCard(K+'l-most',1.7,.3,'MOST BY A US MEN’S KEEPER',INK.yellow,INK.navy),-3.7,1.95,{layer:3,s:0,tab:false});
  const book=B.stand(keeperBook(K+'l-book',.9,1.2),-2.4,-.6,{layer:2,s:0});
  const T=B.person(K+'l-tim',-1.4,.5,1.5,{shirt:'casual',...TH,beard:true,adult:true,face:'smile',layer:3});
  const open=B.stand(S.flipCard(K+'l-open',1.5,.3,'TALKING OPENLY',INK.pink),-1.4,1.95,{layer:3,s:0,tab:false});
  const labels:[string,string,string][]=[['YOU',INK.yellow,SKINS[0]],['ARE NOT',INK.grass,SKINS[4]],['ALONE',INK.pink,SKINS[2]]];
  const cards=labels.map(([l,c,sk],i)=>{const s=B.stand(S.post(K+`l-p${i}`,1.1,1.2,'#d9cfb8'),1.1+i*1.4,-1.2,{layer:1});s.add(helperBack(K+`l-b${i}`,1.0,1.06,l,c,sk),0,.08,{z:.012});return s.flap(helperFront(K+`l-f${i}`,1.04,1.1),0,1.18,{z:.03});});
  const kids=[[1.4,.6,'bun',SKINS[1]],[2.6,.9,'curly',SKINS[3]],[3.8,.5,'long',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`l-k${i}`,x as number,z as number,1.12,{shirt:['bib','fan','casual'][i] as 'bib',hair:h as 'bun',skin:sk as string,face:'grin',layer:3}));
  const rut=B.stand(S.flipCard(K+'l-rut',1.5,.3,'A PROGRAMME FOR TEENS',INK.sky,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const strong=B.stand(S.flipCard(K+'l-strong',1.6,.3,'DIFFERENT CAN BE STRONG',INK.yellow,INK.navy),3.7,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.1):b.t;
   pop(games,beat(t,2.4,3.2));most.s=beat(t,4.6,5.4);T.body.s=beat(t,2,2.8);book.s=beat(t,9.6,10.4);T.armR.rot=.12+.9*beat(t,10.4,11.2);open.s=beat(t,16.4,17.2);
   // Turn over the helper cards, one after another.
   cards.forEach((c,i)=>{c.flip=-3.0*(manual?beat(act,i/3,(i+.8)/3):beat(t,21.4+i*.9,22.2+i*.9));});
   kids.forEach((p,i)=>{p.body.s=Math.max(beat(t,24+i*.4,24.8+i*.4),manual?beat(act,.7,1):0);cheer(p,Math.max(beat(t,33.6+i*.3,34.2+i*.3),manual?beat(act,.9,1):0)*.8);});rut.s=beat(t,24.6,25.4);
   T.armL.rot=-.12-.6*pulse(t,30.6,32.6);strong.s=beat(t,33.6,34.4);cheer(T,beat(t,34,34.6)*.7);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,20.4,21.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={tics,hiding,helping,england,belgium,legacy};
