/**
 * The six Linda Caicedo pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/caicedo/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The illness is told gently and symbolically (a bed, a calendar, a rain cloud lifted off a window, helpers with hearts).
 * Kits are colour only: no crests, no likeness.
 */
import {INK,type Kit,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,floor,footprints,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,skyline,backdrop,plates,ballPair} from '../spreadKit';

const K='caicedo-';
const P=plates(K),{sp}=P;
const LINDA={skin:'#7f5138',hair:'long' as const,hairColor:'#1d1512'};
const COL=[INK.yellow,INK.blue,INK.red,INK.yellow,INK.white];

/* ───────────── Caicedo-only plates ───────────── */
const spoon=sp('spoon',.16,.42,k=>{k.fill(ell(.08,.08,.07,.08),INK.grey);k.key(ell(.08,.08,.07,.08),.01);k.keyFill(rect(.065,.15,.03,.27),INK.grey);},{rim:.012});
const doll=sp('doll',.26,.42,k=>{k.fill(poly([[.13,.14],[.25,.42],[.01,.42]]),INK.pink);k.key(poly([[.13,.14],[.25,.42],[.01,.42]]),.01);k.fill(ell(.13,.09,.07,.07),'#f0c9a0');k.key(ell(.13,.09,.07,.07),.01);k.fill(ell(.13,.04,.08,.04),INK.brown);},{rim:.012});
const silverBall=sp('silver',.6,.72,k=>{const c=ell(.3,.3,.27,.27);k.fill(c,'#d8dde6');k.dots(c,INK.navy,.025,.25);k.key(c,.012);k.key('M.12 .3 Q.3 .44 .48 .3 M.3 .06 Q.42 .3 .3 .54',.012,'#7e849e');k.fill(rect(.14,.6,.32,.12),INK.navy);k.text('SILVER BALL',.3,.69,.07,INK.white,{weight:900,max:.3});},{rim:.018});
const medalBack=sp('medalback',.6,.72,k=>{const c=ell(.3,.3,.27,.27);k.fill(c,'#aeb4c4');k.hatch(c,INK.navy,.04,.7,.01);k.key(c,.012);k.text('U-17',.3,.28,.1,INK.navy,{weight:900});k.text('2022',.3,.4,.09,INK.navy,{weight:900});k.fill(rect(.14,.6,.32,.12),INK.navy);},{rim:.018});
const heartBubble=(key:string)=>S.bubble(K+key,.44,.38,'heart');

/* ───────────── 1 · A club that had only boys (village) ───────────── */
const village:SpreadDef={id:'village',rest:22.6,
 left:k=>{const p=rect(-5,0,5,6.4);k.fill(p,'#e7cf9a');k.dots(p,INK.orange,.06,.16);footprints(k,-4.4,Z(1.6),-1.2,Z(.9),8);
  caption(k,-2.5,'CANDELARIA · 2005','A SMALL TOWN IN COLOMBIA',INK.orange);},
 right:k=>{pitchLines(k,0,5,2.8);chalk(k,`M.2 ${Z(-2.1)} L.2 ${Z(1.9)}`,.02);caption(k,2.5,'REAL JUANCHITO','A VILLAGE CLUB · AT TEN A GIRLS’ TEAM · AT ELEVEN, CALI',INK.green);},
 build:B=>{
  const bd=backdrop(B,K+'v-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#7fae6e');roofs(k,.2,4.3,2.3,2);k.fill(rect(0,2.3,4.5,.7),'#e7cf9a');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,INK.leaf);skyline(k,4.5,2.1);k.fill(rect(0,2.25,4.5,.75),INK.grass);});
  const sun=bd.add(S.sun(K+'v-sun',.32),'L',3.6,2.1,{out:.012}),cali=bd.add(S.banner(K+'v-cali',1.2,.3,'CALI',INK.red),'R',3.0,1.15,{out:.02});
  B.stand(S.house(K+'v-house',1.6,1.5),-3.9,-1.3,{layer:1});B.stand(S.tree(K+'v-tree',1.0,1.6,'palm'),-.7,-1.6,{layer:1});
  const mum=B.person(K+'v-mum',-3.2,.25,1.68,{shirt:'casual',hair:'bun',hairColor:'#1d1512',skin:'#6b4430',adult:true,face:'smile',layer:2});
  const kid=B.person(K+'v-kid',-2.0,.9,.92,{shirt:'bib',...LINDA,legs:'kick',face:'grin',layer:3});
  const kidR=B.person(K+'v-kidR',1.05,.2,.92,{shirt:'bib',...LINDA,face:'grin',layer:3});
  const sp1=B.stand(spoon,-1.4,1.3,{layer:3,tab:false,s:0}),dl=B.stand(doll,-4.3,1.1,{layer:3,tab:false,s:0});
  const age=B.stand(S.flipCard(K+'v-age',.9,.32,'AGED 5',INK.pink),-1.3,1.95,{layer:3,s:0,tab:false});
  const gate=B.stand(P.gatePosts('v-gate',1.5,1.15),1.05,-.55,{layer:2});
  const gL=gate.flap(P.gateLeaf('v-gl',.64,.86),-.64,.02,{anchor:'bl',axis:'y',z:.02}),gR=gate.flap(P.gateLeaf('v-gr',.64,.86),.64,.02,{anchor:'br',axis:'y',z:.02});
  gate.add(P.lineCard('v-name',1.3,.26,['REAL JUANCHITO'],INK.yellow),0,1.1,{z:.03});
  B.stand(S.goal(K+'v-goal',1.6,.85),3.9,-1.4,{layer:1});
  const boys=[[2.4,-.4,'short'],[3.3,.2,'curly'],[4.3,-.6,'short']].map(([x,z,h],i)=>B.person(K+`v-b${i}`,x as number,z as number,1.02,{shirt:'navy',hair:h as 'short',hairColor:'#1d1512',skin:SKINS[(i+1)%5],face:'smile',layer:2}));
  const coach=B.person(K+'v-coach',2.6,1.05,1.66,{shirt:'coach',hair:'short',hairColor:'#1d1512',skin:SKINS[3],adult:true,face:'smile',layer:3});
  const girls=[0,1].map(i=>B.person(K+`v-g${i}`,.7+i*.5,-.2+i*.25,.95,{shirt:'bib',hair:i?'bun':'curly',hairColor:'#1d1512',skin:SKINS[i?2:4],face:'grin',layer:2}));
  const cards=[['AGE 10 · GIRLS’ TEAM',INK.sky],['AGE 11 · CALI',INK.yellow],['3 NATIONAL U-13 TITLES',INK.pink]].map(([l,c],i)=>B.stand(S.flipCard(K+`v-c${i}`,1.3,.3,l,c,INK.navy),1.1+i*1.4,1.95,{layer:3,s:0,tab:false}));
  const cups=[0,1,2].map(i=>B.stand(S.trophy(K+'v-cup',.32,.42),3.5+i*.45,1.35,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,K+'v-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.6):b.t;
   sun.dy=.3*beat(t,0,2);mum.body.s=beat(t,9,10);
   // Dolls and kitchen spoons for footballs.
   pop(sp1,beat(t,10.4,11)*(1-beat(t,15.4,16)));pop(dl,beat(t,11.6,12.2)*(1-beat(t,15.4,16)));
   sp1.rot=.4*Math.sin(t*5)*(t>10.4&&t<15.4?1:0);kid.leg!.rot=-1*maxOf([11.2,13,14.4].map(a=>pulse(t,a-.3,a+.3)));mum.armR.rot=.12+1.4*beat(t,11,11.8)*(1-beat(t,15,15.6));
   age.s=beat(t,15.6,16.4);boys.forEach((p,i)=>{p.body.s=beat(t,16.4+i*.5,17.2+i*.5);});cali.scale=beat(t,30,31);cali.visible=cali.scale>.02;
   // Open the gate, and Linda walks onto the pitch.
   const open=manual?beat(act,0,.5):beat(t,23,24.4);gL.flip=-1.8*open;gR.flip=1.8*open;
   // Pieces belong to one page: Linda walks to the gutter on the left, and steps through the gate on the right.
   const walk=manual?beat(act,.3,.6):beat(t,24.6,26);kid.body.x=-2.0+1.7*walk;kid.body.s=beat(t,2.6,3.6)*(1-(manual?beat(act,.55,.65):beat(t,25.8,26.2)));
   const through=manual?beat(act,.6,1):beat(t,26,27.6);kidR.body.s=Math.min(1,through*4);kidR.body.z=.2+.75*through;kidR.body.x=1.05+.5*through;
   coach.body.s=Math.max(beat(t,24.8,25.6),manual?beat(act,.5,.9):0);coach.armL.rot=-.12-1.6*pulse(t,25.6,27.6);
   cards.forEach((c,i)=>{c.s=beat(t,[28.4,32.4,34.6][i],[29.2,33.2,35.4][i]);});cups.forEach((c,i)=>{c.s=beat(t,35.2+i*.5,35.8+i*.5);});
   // Ball: kitchen kicks with mum, then passes with the boys once the gate is open.
   let [bx,bz]=t<26.5&&!manual?[kid.body.x+.35,1.05]:[1.95,1.0];if(t>27.8&&t<34)[bx,bz]=track(t,[[27.8,1.75,1.0],[28.8,3.3,.45],[30,3.3,.45],[31,1.75,1.0]]);ball(bx,bz,0,t>15.6||manual);
   boys.forEach((p,i)=>{p.armR.rot=.12+.8*pulse(t,26+i*.3,27.4+i*.3);cheer(p,beat(t,39.8+i*.2,40.4+i*.2));});
   girls.forEach((g,i)=>{g.body.s=beat(t,39.4+i*.5,40.2+i*.5);cheer(g,beat(t,41+i*.3,41.6+i*.3));});cheer(kidR,Math.max(beat(t,40,40.6),manual?beat(act,.95,1):0));cheer(coach,beat(t,40.4,41));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,15.4,16.4)+.4*beat(t,24.6,25.6)-.4*beat(t,38.8,39.6):0;
  };
 }};

/* ───────────── 2 · A goal in her first match (debut) ───────────── */
const debut:SpreadDef={id:'debut',rest:20.1,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.9);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.1)} L-1.4 ${Z(-1.1)} L-1.4 ${Z(-2.1)}`);
  caption(k,-2.5,'JULY 2019 · AGED 14','HER FIRST PROFESSIONAL MATCH · AMÉRICA DE CALI',INK.yellow,INK.white);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'LEAGUE TOP SCORER','HER GOAL WON THE CLUB ITS FIRST LEAGUE TITLE',INK.yellow,INK.white,.36);},
 build:B=>{
  const reds=[INK.red,INK.white,INK.red,'#b9383a'];
  const bd=backdrop(B,K+'d-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,reds,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,reds,3);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'d-fw1',.4,INK.yellow),'R',1.3,1.9,{out:.03}),bd.add(S.firework(K+'d-fw2',.36,INK.pink),'L',3.2,2.0,{out:.03})];
  const bunt=bd.add(S.bunting(K+'d-bunt',3.2,.4,[INK.red,INK.white]),'R',.6,2.55,{out:.03});
  const cloud=bd.add(P.rainCloud('d-cloud',.9,.5),'R',3.6,2.2,{out:.03});
  B.stand(S.floodlight(K+'d-fl',.6,1.9),-4.6,-1.9,{layer:1});B.stand(S.floodlight(K+'d-fl',.6,1.9),4.6,-1.9,{layer:1});
  B.stand(S.goal(K+'d-goal',1.7,.9),-2.5,-1.7,{layer:1});
  const keeper=B.person(K+'d-keep',-2.5,-1.4,1.26,{shirt:'keeper',hair:'short',skin:SKINS[2],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const def=B.person(K+'d-def',-1.4,-.2,1.24,{shirt:'fan',hair:'bun',skin:SKINS[0],face:'open',layer:2});
  const linda=B.person(K+'d-linda',-2.9,.8,1.18,{shirt:'casual',...LINDA,legs:'kick',face:'grin',number:'',layer:3});
  const mates=[[-4.2,.1,'curly'],[-.9,1.1,'bun']].map(([x,z,h],i)=>B.person(K+`d-m${i}`,x as number,z as number,1.2,{shirt:'casual',hair:h as 'curly',hairColor:'#1d1512',skin:SKINS[i?3:1],face:'grin',layer:2}));
  const age=B.stand(S.flipCard(K+'d-age',.9,.32,'AGED 14',INK.pink),-4.2,1.9,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'d-board',1.8,1.35,'FIRST MATCH'),1.5,-1.75,{layer:1});
  board.add(S.flipCard(K+'d-10',1.4,.6,'1–0',INK.pink),0,.38,{z:.012});const cover=board.flap(S.flipCard(K+'d-00',1.4,.6,'0–0','#3d5da0'),0,.98,{z:.026});
  const top=B.stand(S.goldenBall(K+'d-top',.26),3.1,-.5,{layer:2,s:0});const topCard=B.stand(S.flipCard(K+'d-topc',1.3,.3,'TOP SCORER',INK.yellow,INK.navy),3.1,.3,{layer:2,s:0,tab:false});
  const cup=B.stand(S.trophy(K+'d-cup',.7,.9),4.2,.6,{layer:3,s:0});const champs=B.stand(S.flipCard(K+'d-ch',1.3,.3,'FIRST LEAGUE TITLE',INK.pink),3.8,1.9,{layer:3,s:0,tab:false});
  const LR=B.person(K+'d-lindaR',1.7,.9,1.2,{shirt:'casual',...LINDA,face:'grin',layer:3});
  const start=B.stand(S.flipCard(K+'d-start',1.3,.3,'A BRILLIANT START',INK.yellow,INK.navy),1.5,1.9,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'d-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.1):b.t;
   linda.body.s=beat(t,2.4,3.2);age.s=beat(t,5,5.8);keeper.body.s=beat(t,3,3.8);def.body.s=beat(t,3.4,4.2);mates.forEach((p,i)=>{p.body.s=beat(t,3.8+i*.4,4.6+i*.4);});
   // The only goal of the game.
   const shot=11;linda.leg!.rot=-1.1*pulse(t,shot-.3,shot+.3);
   const [bx,bz,by]=t<shot?[-2.55,.95,0]:track(t,[[shot,-2.55,.95,0],[shot+.6,-2.3,-.5,.4],[shot+1.1,-2.2,-1.55,.2],[shot+2,-2.2,-1.55,0]]);ball(bx,bz,by,t>2.6&&t<19.8);
   const dive=pulse(t,shot+.3,shot+1.6);keeper.body.rot=.8*dive;keeper.body.dx=-.3*dive;
   cheer(linda,beat(t,12,12.6)*(1-beat(t,19.6,20.2)));mates.forEach((p,i)=>cheer(p,beat(t,12.3+i*.2,12.9+i*.2)*(1-beat(t,19.6,20.2))));
   top.s=beat(t,13.6,14.4);topCard.s=beat(t,14.2,15);cup.s=beat(t,17.2,18);champs.s=beat(t,17.8,18.6);pop(bunt,beat(t,17.4,18.4));
   // Flip the scoreboard.
   cover.flip=-3.2*(manual?beat(act,0,.6):beat(t,20.4,21.4));
   LR.body.s=Math.max(beat(t,21.6,22.4),manual?beat(act,.5,.9):0);start.s=beat(t,22.4,23.2);
   fw.forEach((q,i)=>{pop(q,beat(t,22.6+i*.4,23.6+i*.4)*(1-beat(t,25,26)));q.rot=t*.2;});
   // A few months later: a small cloud in the far sky (the next page is the hard one).
   pop(cloud,beat(t,26.4,28));cloud.dx=-.3*beat(t,26.4,31);
   cheer(LR,Math.max(beat(t,32,32.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2.2,3.2)+.4*beat(t,13.4,14.4)-.4*beat(t,31,32):0;
  };
 }};

/* ───────────── 3 · The hardest challenge (illness) ───────────── */
const illness:SpreadDef={id:'illness',rest:20.3,
 left:k=>{floor(k,-5,0);const rug=ell(-2.5,Z(.6),1.7,.7);k.fill(rug,INK.sky,.7);k.dots(rug,INK.blue,.05,.3);caption(k,-2.5,'EARLY 2020 · AGED 15','A SERIOUS ILLNESS · TIME TO REST',INK.navy);},
 right:k=>{floor(k,0,5,'#e4cfa8','#b39a6e');const rug=ell(2.5,Z(.7),1.8,.7);k.fill(rug,INK.yellow,.5);k.dots(rug,INK.orange,.05,.3);caption(k,2.5,'LATER IN 2020','HER TEAM OF HELPERS · GETTING BETTER',INK.green);},
 build:B=>{
  const wall=(k:Kit,c:string)=>{wash(k,4.5,3,c,INK.white,y=>.2+y*.05);for(let x=.3;x<4.5;x+=.6)k.key(`M${x} 0 L${x} 2.4`,.01,'#c9b48e');k.fill(rect(0,2.4,4.5,.6),'#d9b98c');};
  const bd=backdrop(B,K+'i-bd',k=>wall(k,'#efe0c4'),k=>wall(k,'#f6e8cc'));
  const sunR=bd.add(S.sun(K+'i-sunR',.34),'R',3.4,1.4,{out:.012});
  bd.add(P.frame('i-photo',.9,.66,k=>{const g=rect(.08,.08,.74,.5);k.fill(g,INK.grass);k.dots(g,INK.leaf,.04,.3);k.key('M.45 .08 L.45 .58',.012,INK.white);k.key(ell(.45,.33,.1,.1),.012,INK.white);}),'R',1.4,1.0,{out:.012});
  B.stand(S.bush(K+'i-plant',.8,.6),4.4,-1.5,{layer:1});B.stand(S.lamp(K+'i-lamp',.5,1.3),.5,-1.7,{layer:1});
  B.stand(S.ball(K+'i-shelfball',.14),4.5,.9,{layer:3,tab:false});
  const win=B.stand(P.windowFrame('i-win',1.3,1.1),-1.0,-1.6,{layer:1});
  const sunW=win.add(S.sun(K+'i-sunW',.3),0,.25,{z:.012});
  const cloud=win.flap(P.rainCloud('i-cloud',1.24,.9),0,1.06,{z:.03});
  const bed=B.stand(P.bed('i-bed',2.0,.8),-3.0,.9,{layer:3});
  const linda=B.person(K+'i-linda',-3.3,.45,1.16,{shirt:'casual',...LINDA,face:'sad',layer:2});
  const doc=B.person(K+'i-doc',-1.6,-.1,1.68,{shirt:'ger',hair:'short',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const cal=B.stand(S.post(K+'i-cal',1.0,1.15,INK.white),-4.4,-1.1,{layer:1});
  cal.add(P.lineCard('i-m6',.84,.6,['6 MONTHS'],INK.grass),0,.25,{z:.012});
  const months=[1,2,3,4,5].map(i=>cal.flap(P.lineCard(`i-m${i}`,.84,.6,[`MONTH ${i}`],[INK.yellow,INK.sky,INK.pink][i%3]),0,.85,{z:.03-i*.003}));
  const mum=B.person(K+'i-mum',1.3,.2,1.66,{shirt:'casual',hair:'bun',hairColor:'#1d1512',skin:'#6b4430',adult:true,face:'smile',layer:2});
  const helpers=[[2.3,-.6,'bun'],[3.3,-.4,'short']].map(([x,z,h],i)=>B.person(K+`i-h${i}`,x as number,z as number,1.64,{shirt:'coach',hair:h as 'bun',skin:SKINS[i?0:3],adult:true,face:'smile',layer:1}));
  const hearts=helpers.map((h,i)=>h.body.add(heartBubble(`i-heart${i}`),.4,h.h*.95,{z:-.02}));
  const help=B.stand(P.lineCard('i-help',1.5,.62,['ASKING FOR','HELP IS BRAVE'],INK.yellow),4.1,-1.3,{layer:1,s:0});
  const well=B.person(K+'i-well',2.6,1.0,1.2,{shirt:'casual',...LINDA,face:'grin',layer:3,holdR:'ball'});
  const sept=B.stand(S.flipCard(K+'i-sept',1.4,.32,'GETTING BETTER',INK.pink),1.2,1.9,{layer:3,s:0,tab:false});
  const team=B.stand(P.lineCard('i-team',1.9,.36,['DOCTORS · FAMILY · HELPERS'],INK.white),3.6,1.9,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.3):b.t;
   linda.body.s=beat(t,2.2,3);linda.armR.rot=.12+.6*beat(t,5,6);doc.body.s=beat(t,9.2,10);doc.armL.rot=-.12-1.1*pulse(t,10,12.6);
   months.forEach((m,i)=>{m.flip=-3.2*beat(t,13.6+i*.8,14.2+i*.8);});
   // For a while she stays in bed: the figure lowers behind the quilt.
   const rest=beat(t,17.8,19)*(1-Math.max(beat(t,34,35),manual?beat(act,.6,1):0));linda.body.dy=-.55*rest;
   // Lift the rain cloud: the sun is behind it.
   const lift=manual?beat(act,0,.6):beat(t,20.8,22);cloud.flip=-2.7*lift;sunW.dy=.12*lift;
   mum.body.s=Math.max(beat(t,23,23.8),manual?beat(act,.4,.8):0);helpers.forEach((h,i)=>{h.body.s=Math.max(beat(t,26.6+i*.5,27.4+i*.5),manual?beat(act,.5,.9):0);});
   hearts.forEach((q,i)=>pop(q,beat(t,28.4+i*.5,29+i*.5)));help.s=beat(t,30.2,31);mum.armL.rot=-.12-1.2*beat(t,24,24.8);
   sunR.dy=.5*beat(t,32.8,35);well.body.s=Math.max(beat(t,34,34.8),manual?beat(act,.7,1):0);sept.s=beat(t,33.2,34);
   linda.body.s*=1-beat(t,34,34.6);
   team.s=beat(t,39.6,40.4);cheer(well,Math.max(beat(t,40.6,41.2),manual?beat(act,.95,1):0));helpers.forEach((h,i)=>cheer(h,beat(t,41+i*.3,41.6+i*.3)));cheer(mum,beat(t,41.4,42));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,22.6,23.6):0;
  };
 }};

/* ───────────── 4 · One small step at a time (return) ───────────── */
const comeback:SpreadDef={id:'return',rest:18.1,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);for(let i=0;i<6;i++)k.circle(-4.4+i*.6,Z(1.0),.06,INK.orange);caption(k,-2.5,'2020 · BACK TO TRAINING','OCTOBER 2020: FIRST MATCH FOR DEPORTIVO CALI',INK.green,INK.navy,.38);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'COPA AMÉRICA FEMENINA 2022','PLAYED IN COLOMBIA · LINDA, BEST PLAYER',INK.blue,INK.navy,.3);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.9,'#a9b78a');k.fill(rect(0,2.3,4.5,.7),'#9dbd78');for(let x=.1;x<4.5;x+=.18)k.key(`M${x} 1.95 L${x} 2.35`,.012,INK.white);k.key('M0 2.05 L4.5 2.05 M0 2.25 L4.5 2.25',.012,INK.white);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,COL,2);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const sun=bd.add(S.sun(K+'r-sun',.3),'L',3.7,2.2,{out:.012}),bunt=bd.add(S.bunting(K+'r-bunt',3.4,.4,[INK.yellow,INK.blue,INK.red]),'R',.5,2.5,{out:.03});
  for(const [x,z] of [[-4.3,.3],[-3.6,.6],[-2.9,.3]])B.stand(S.cone(K+'r-cone',.3),x,z,{layer:2});
  const linda=B.person(K+'r-linda',-4.2,.95,1.18,{shirt:'ger',...LINDA,legs:'kick',face:'smile',layer:3});
  const coach=B.person(K+'r-coach',-1.3,-.6,1.68,{shirt:'coach',hair:'short',skin:SKINS[3],adult:true,face:'smile',layer:2});
  const sign=B.stand(S.sign(K+'r-sign',1.4,1.2,'DEPORTIVO CALI',INK.grass),-3.6,-1.5,{layer:1,s:0});const oct=B.stand(S.flipCard(K+'r-oct',1.2,.32,'OCTOBER 2020',INK.yellow,INK.navy),-3.9,1.95,{layer:3,s:0,tab:false});
  const bar=B.stand(P.barFrame('r-bar',2.3,1.1,'STEP BY STEP'),-1.6,1.25,{layer:3});
  const segs=['STEP 1','STEP 2','STEP 3'].map((l,i)=>bar.add(P.segment(`r-s${i}`,.66,.38,l,[INK.yellow,INK.grass,INK.pink][i]),-.72+i*.72,.33,{z:.02,anchor:'bottom'}));
  B.stand(S.goal(K+'r-goal',1.6,.85),3.9,-1.4,{layer:1});
  const LR=B.person(K+'r-lindaR',1.7,.8,1.22,{shirt:'bib',...LINDA,legs:'kick',face:'grin',number:'',layer:3});
  const mates=[[2.7,-.3,'bun'],[3.6,.4,'curly'],[4.4,-.7,'long']].map(([x,z,h],i)=>B.person(K+`r-m${i}`,x as number,z as number,1.2,{shirt:'bib',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[(i+2)%5],face:'grin',layer:i===2?1:2}));
  const best=B.stand(S.goldenBall(K+'r-best',.28),3.2,1.0,{layer:3,s:0,tab:false});const bestC=B.stand(S.flipCard(K+'r-bestc',1.4,.3,'BEST PLAYER',INK.yellow,INK.navy),3.4,1.9,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'r-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.1):b.t;
   sun.dy=.3*beat(t,0,2);linda.body.s=beat(t,2.4,3.2);coach.body.s=beat(t,3,3.8);
   // Dribbling the cones, slowly at first.
   const drib=beat(t,3.6,11.8);linda.body.x=-4.2+1.6*drib;linda.leg!.rot=-.7*Math.abs(Math.sin(t*3.4))*(t>3.6&&t<11.8?1:0);coach.armR.rot=.12+1.3*pulse(t,7,10.4);
   sign.s=beat(t,12.2,13);oct.s=beat(t,12.8,13.6);
   // Fill the comeback bar: three steps; she moves along with it.
   const fills=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,18.6+i*1.1,19.2+i*1.1));segs.forEach((q,i)=>pop(q,fills[i]));
   const along=fills.reduce((a,v)=>a+v,0)/3;if(along>0){linda.body.x=-2.6+1.0*along;linda.body.z=.95-.3*along;}
   cheer(linda,beat(t,21,21.6)*(1-beat(t,23.4,24))+(manual?beat(act,.95,1):0));
   pop(bunt,beat(t,23.6,24.6));LR.body.s=Math.max(beat(t,24,24.8),manual?beat(act,.8,1):0);mates.forEach((p,i)=>{p.body.s=beat(t,24.6+i*.4,25.4+i*.4);});
   const [bx,bz]=t<26?[2.05,.95]:track(t,[[26,2.05,.95],[27,3.6,.55],[28.2,3.6,.55],[29.2,2.05,.95]]);ball(bx,bz,0,t>24.4);LR.leg!.rot=-1*pulse(t,25.8,26.4);
   best.s=beat(t,32,32.8);bestC.s=beat(t,32.6,33.4);cheer(LR,beat(t,33,33.6));mates.forEach((p,i)=>cheer(p,beat(t,35.4+i*.3,36+i*.3)));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,23.4,24.4):0;
  };
 }};

/* ───────────── 5 · So close, twice (finals) ───────────── */
const finals:SpreadDef={id:'finals',rest:20.9,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'COPA AMÉRICA FINAL 2022','BRAZIL 1, COLOMBIA 0',INK.blue,INK.navy,.36);},
 right:k=>{pitchLines(k,0,5,2.6,'#8fc467',INK.leaf);caption(k,2.5,'UNDER-17 WORLD CUP · INDIA','CAPTAIN · NUMBER 10 · SPAIN 1, COLOMBIA 0',INK.pink,INK.navy,.32);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.25,2.45,[INK.yellow,INK.green,INK.blue,INK.yellow],1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{wash(k,4.5,3,'#ffd9a0',INK.orange,y=>.5-y/3*.4);crowd(k,4.5,1.3,2.45,[INK.yellow,INK.red,INK.white,INK.blue],4);k.fill(rect(0,2.45,4.5,.55),'#8fc467');});
  const plane=bd.add(S.plane(K+'f-plane',.7,.35),'R',.8,2.2,{out:.03});
  const b1=B.stand(S.scoreboard(K+'f-b1',1.6,1.3,'COPA AMÉRICA'),-3.6,-1.7,{layer:1,s:0});b1.add(S.scoreFlap(K+'f-s1',1.3,.6,'BRA','1–0','COL'),0,.36,{z:.012});
  const L1=B.person(K+'f-l1',-2.2,.6,1.2,{shirt:'bib',...LINDA,face:'open',layer:3});const sad1=L1.body.add(P.faceCard('f-sad1',.32,'sad',INK.sky),.34,L1.h*1.02,{z:-.02,anchor:'center'});
  const m1=[[-3.4,.1,'bun'],[-1.1,-.2,'curly']].map(([x,z,h],i)=>B.person(K+`f-m${i}`,x as number,z as number,1.18,{shirt:'bib',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[(i+3)%5],face:'sad',layer:2}));
  const b2=B.stand(S.scoreboard(K+'f-b2',1.6,1.3,'U-17 WORLD CUP'),1.3,-1.7,{layer:1,s:0});b2.add(S.scoreFlap(K+'f-s2',1.3,.6,'ESP','1–0','COL'),0,.36,{z:.012});
  const L2=B.person(K+'f-l2',1.6,.7,1.2,{shirt:'bib',...LINDA,face:'smile',number:'10',layer:3});
  const band=L2.body.add(P.disc('f-band',.15,'C'),.17,L2.h*.62,{z:.02,anchor:'center'});
  const capt=B.stand(S.flipCard(K+'f-capt',1.2,.3,'CAPTAIN · 10',INK.yellow,INK.navy),1.3,1.9,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'f-post',.8,.95,INK.white),3.2,.3,{layer:2});
  post.add(silverBall,0,.12,{z:.012});const cover=post.flap(medalBack,0,.86,{z:.03});
  const silver=B.stand(S.flipCard(K+'f-sc',1.6,.3,'2ND BEST PLAYER',INK.sky,INK.navy),3.4,1.25,{layer:3,s:0,tab:false});
  const LM=B.person(K+'f-lm',4.3,.9,1.2,{shirt:'ger',...LINDA,face:'grin',layer:3,holdR:'suitcase'});
  const mad=B.stand(S.flipCard(K+'f-mad',1.4,.3,'FEB 2023 · REAL MADRID',INK.white,INK.navy),3.6,1.95,{layer:3,s:0,tab:false});
  const bag=B.stand(P.suitcase('f-bag',.5,.5,'MADRID'),4.8,1.2,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.9):b.t;
   L1.body.s=beat(t,2.2,3);b1.s=beat(t,6.4,7.2);m1.forEach((p,i)=>{p.body.s=beat(t,2.6+i*.4,3.4+i*.4);});pop(sad1,beat(t,8.4,9)*(1-beat(t,20,20.6)));L1.body.yaw=-.3*beat(t,8.4,9.4);
   L2.body.s=beat(t,11,11.8);pop(band,beat(t,13.4,14));capt.s=beat(t,14.4,15.2);b2.s=beat(t,17.6,18.4);
   // Turn the medal: the back says U-17 2022; the front is the Silver Ball.
   const turn=manual?beat(act,0,.6):beat(t,21.4,22.6);cover.flip=-3.1*turn;silver.s=Math.max(beat(t,26,26.8),manual?beat(act,.5,.9):0);
   cheer(L2,Math.max(beat(t,27,27.6)*(1-beat(t,31,31.6)),manual?beat(act,.9,1):0));m1.forEach((p,i)=>cheer(p,beat(t,39+i*.3,39.6+i*.3)));
   LM.body.s=beat(t,31.6,32.4);mad.s=beat(t,32.4,33.2);bag.s=beat(t,32,32.8);plane.dx=1.6*beat(t,33,37);pop(plane,beat(t,32.8,33.4));
   cheer(L1,beat(t,39.4,40));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,10.8,11.8):0;
  };
 }};

/* ───────────── 6 · A goal against Germany (worldcup) ───────────── */
const worldcup:SpreadDef={id:'worldcup',rest:23.0,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'WORLD CUP 2023','COLOMBIA 2, SOUTH KOREA 0',INK.yellow,INK.white);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.6 ${Z(-2.1)} L2.6 ${Z(-1.1)} L4.8 ${Z(-1.1)} L4.8 ${Z(-2.1)}`);
  caption(k,2.5,'COLOMBIA 2, GERMANY 1','HER GOAL: THE BEST OF THE WHOLE TOURNAMENT',INK.yellow,INK.white,.36);},
 build:B=>{
  const bd=backdrop(B,K+'w-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,COL,1);lightRig(k,1.0,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,COL,4);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const ban=bd.add(S.banner(K+'w-ban',2.4,.4,'WORLD CUP 2023',INK.yellow,INK.navy),'L',1.1,2.5,{out:.02});
  const conf=bd.add(S.confetti(K+'w-conf',3.6,1.4,3),'R',.4,1.1,{out:.04}),fw=[bd.add(S.firework(K+'w-fw1',.42,INK.yellow),'R',1.0,1.9,{out:.03}),bd.add(S.firework(K+'w-fw2',.36,INK.pink),'R',3.4,2.0,{out:.03})];
  const b1=B.stand(S.scoreboard(K+'w-b1',1.6,1.3,'GAME 1'),-3.7,-1.7,{layer:1,s:0});b1.add(S.scoreFlap(K+'w-s1',1.3,.6,'COL','2–0','KOR'),0,.36,{z:.012});
  B.stand(S.goal(K+'w-goalL',1.5,.8),-1.6,-1.8,{layer:1});
  const L1=B.person(K+'w-l1',-2.2,.6,1.2,{shirt:'bib',...LINDA,legs:'kick',face:'grin',layer:3});
  const m1=[[-4.2,.3,'bun'],[-3.2,1.1,'curly']].map(([x,z,h],i)=>B.person(K+`w-m${i}`,x as number,z as number,1.18,{shirt:'bib',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[(i+2)%5],face:'grin',layer:2}));
  B.stand(S.goal(K+'w-goal',1.8,.9),3.7,-1.75,{layer:1});
  const keeper=B.person(K+'w-keep',3.7,-1.45,1.26,{shirt:'keeper',hair:'bun',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const defs=[[2.6,-.5],[3.4,.1]].map(([x,z],i)=>B.person(K+`w-d${i}`,x,z,1.22,{shirt:'ger',hair:i?'long':'bun',hairColor:'#c79a4a',skin:SKINS[0],face:'open',layer:2}));
  B.slot(1.2,1.0,3.6,-1.4);
  const L2=B.person(K+'w-l2',1.0,1.0,1.22,{shirt:'bib',...LINDA,legs:'kick',face:'grin',layer:3});
  const b2=B.stand(S.scoreboard(K+'w-b2',1.4,1.15,'GERMANY'),1.2,-1.7,{layer:1,s:0});b2.add(S.scoreFlap(K+'w-s21',1.1,.52,'COL','2–1','GER'),0,.32,{z:.012});
  const best=B.stand(S.flipCard(K+'w-best',1.8,.32,'GOAL OF THE TOURNAMENT',INK.pink),3.3,1.95,{layer:3,s:0,tab:false});
  const hope=B.stand(S.flipCard(K+'w-hope',1.3,.3,'A STORY OF HOPE',INK.yellow,INK.navy),-2.4,1.95,{layer:3,s:0,tab:false});
  const mates=[[1.9,.3,'curly'],[2.2,1.3,'bun']].map(([x,z,h],i)=>B.person(K+`w-t${i}`,x as number,z as number,1.16,{shirt:'bib',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[(i+1)%5],face:'grin',layer:3}));
  const ball=ballPair(B,K+'w-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23):b.t;
   pop(ban,beat(t,2.2,3.2));L1.body.s=beat(t,2.6,3.4);m1.forEach((p,i)=>{p.body.s=beat(t,3+i*.4,3.8+i*.4);});
   const g1=7.6;L1.leg!.rot=-1.1*pulse(t,g1-.3,g1+.3);b1.s=beat(t,9.4,10.2);cheer(L1,beat(t,9,9.6)*(1-beat(t,11.6,12.2)));m1.forEach((p,i)=>cheer(p,beat(t,9.2+i*.2,9.8+i*.2)*(1-beat(t,11.6,12.2))));
   L2.body.s=beat(t,11.8,12.6);keeper.body.s=beat(t,12,12.8);defs.forEach((p,i)=>{p.body.s=beat(t,12.4+i*.4,13.2+i*.4);});
   // Kick the ball: along the slot past the defenders into the top corner.
   const kick=manual?beat(act,0,.7):beat(t,23.4,25);const k0=pulse(manual?act*3:t,manual?0:23.2,manual?1:23.8);L2.leg!.rot=-1.2*k0;
   const [kx,kz,ky]=kick<=0?[1.35,1.05,0]:track(kick,[[0,1.35,1.05,0],[.5,2.5,-.2,.5],[1,3.5,-1.5,.35]]);
   let bx=kx,bz=kz,by=ky;if(t<12.6&&!manual){[bx,bz,by]=t<g1?[-1.9,.75,0]:track(t,[[g1,-1.9,.75,0],[g1+1,-1.6,-1.6,.3],[g1+2,-1.6,-1.6,0]]);}
   ball(bx,bz,by,t>2.8);const dive=manual?pulse(act,.4,1):pulse(t,24.2,25.6);keeper.body.rot=-.8*dive;keeper.body.dx=.3*dive;
   b2.s=Math.max(beat(t,17.2,18),manual?beat(act,.6,1):0);best.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.7,1):0);
   cheer(L2,Math.max(beat(t,25.4,26),manual?beat(act,.9,1):0));pop(conf,Math.max(beat(t,25.4,26.6),manual?beat(act,.8,1):0));
   fw.forEach((q,i)=>{pop(q,beat(t,26+i*.5,27+i*.5));q.rot=t*.2;});
   mates.forEach((p,i)=>{p.body.s=beat(t,27+i*.6,27.8+i*.6);cheer(p,beat(t,28+i*.4,28.6+i*.4));});hope.s=beat(t,34.4,35.2);m1.forEach((p,i)=>cheer(p,beat(t,35+i*.3,35.6+i*.3)));cheer(L1,beat(t,35.4,36));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,11.6,12.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={village,debut,illness,return:comeback,finals,worldcup};
