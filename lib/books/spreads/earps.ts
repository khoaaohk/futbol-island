/**
 * The six Mary Earps pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/earps/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Being left out is shown gently: an empty bench, a squad sheet, a rain cloud lifted off the training she kept doing.
 * Kits are colour only (keeper green, England white); no crests, no likeness.
 */
import {INK,type Kit,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,cheer,pop,chalk,pitch,pitchLines,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,backdrop,plates,ballPair} from '../spreadKit';

const K='earps-';
const P=plates(K),{sp}=P;
const MARY={skin:'#f1c6a0',hair:'long' as const,hairColor:'#c79a4a'};
const ENG=[INK.white,INK.red,INK.white,INK.navy];

/* ───────────── Earps-only plates ───────────── */
const glove=(key:string)=>S.icon(K+key,.26,'glove');
const squad=(key:string,w:number,h:number,names:string[])=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.16),INK.navy);k.text('ENGLAND SQUAD',w/2,h*.11,h*.07,INK.white,{weight:900});
 names.forEach((n,i)=>{const y=h*(.26+i*.1);k.key(`M${w*.1} ${y} L${w*.9} ${y}`,.008,INK.grey);k.text(n,w/2,y-.02,h*.06,INK.navy,{weight:800});});});
const shirtRack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M${w*.05} ${h*.12} L${w*.95} ${h*.12}`,.03,INK.grey);k.keyFill(rect(w*.04,h*.12,.04,h*.88),INK.grey);k.keyFill(rect(w*.92,h*.12,.04,h*.88),INK.grey);
 for(let i=0;i<3;i++){const x=w*(.14+i*.27),s=w*.22,p=poly([[x,h*.2],[x+s*.3,h*.18],[x+s*.5,h*.24],[x+s*.7,h*.18],[x+s,h*.2],[x+s*1.1,h*.36],[x+s*.9,h*.4],[x+s*.9,h*.8],[x+s*.1,h*.8],[x+s*.1,h*.4],[x-s*.1,h*.36]]);k.fill(p,i===1?INK.grass:INK.white);k.key(p,.012);}});
const awardFrame=(key:string,w:number,h:number,year:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.gold);k.key(b,.016);const i=rect(w*.08,h*.08,w*.84,h*.84);k.fill(i,INK.night);k.dots(i,INK.blue,.04,.3);
 k.fill(`M${w*.36} ${h*.62} L${w*.36} ${h*.3} Q${w*.5} ${h*.18} ${w*.64} ${h*.3} L${w*.64} ${h*.62} Z`,INK.yellow);k.key(`M${w*.36} ${h*.62} L${w*.36} ${h*.3} Q${w*.5} ${h*.18} ${w*.64} ${h*.3} L${w*.64} ${h*.62} Z`,.012);k.text('THE BEST',w/2,h*.76,h*.1,INK.white,{weight:900});k.text(year,w/2,h*.88,h*.09,INK.yellow,{weight:900});},{rim:.018});
const teamPhoto=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.016);const g=rect(w*.06,h*.06,w*.88,h*.7);k.fill(g,INK.sky2);k.fill(rect(w*.06,h*.5,w*.88,h*.26),INK.grass);
 for(let i=0;i<7;i++){const x=w*(.14+i*.12),y=h*(.36+(i%2)*.08);k.circle(x,y,w*.035,SKINS[i%5]);k.fill(rect(x-w*.04,y+w*.03,w*.08,h*.18),i===3?INK.grass:INK.white);k.key(rect(x-w*.04,y+w*.03,w*.08,h*.18),.008);}k.text('53 MATCHES',w/2,h*.9,h*.1,INK.navy,{weight:900});},{rim:.018});

/* ───────────── 1 · Picked for goal (gloves) ───────────── */
const gloves:SpreadDef={id:'gloves',rest:15.0,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.1)} L-1.4 ${Z(-1.1)} L-1.4 ${Z(-2.1)}`);caption(k,-2.5,'NOTTINGHAM · AGED 10','WEST BRIDGFORD · A GOALKEEPER',INK.green);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'MANY CLUBS','THEN WOLFSBURG, GERMANY, 2018: LEAGUE AND CUP',INK.blue,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#7fae6e');roofs(k,.2,4.3,2.3,1);k.fill(rect(0,2.3,4.5,.7),'#9dbd78');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,[INK.grass,INK.white,INK.grass,INK.blue],2);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const sun=bd.add(S.sun(K+'g-sun',.3),'L',3.7,2.1,{out:.012}),plane=bd.add(S.plane(K+'g-plane',.7,.35),'R',.4,2.4,{out:.03});
  const club=B.stand(S.sign(K+'g-club',1.4,1.2,'WEST BRIDGFORD',INK.yellow),-4.2,-1.4,{layer:1,s:0});
  B.stand(S.goal(K+'g-goal',1.8,.95),-2.5,-1.75,{layer:1});
  const coach=B.person(K+'g-coach',-3.9,.3,1.7,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const bare=B.person(K+'g-bare',-2.4,.5,1.05,{shirt:'keeper',...MARY,face:'smile',layer:3});
  const gl=B.person(K+'g-gl',-2.4,.5,1.05,{shirt:'keeper',...MARY,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const gL=B.stand(glove('g-glL'),-1.2,1.3,{layer:3,tab:false}),gR=B.stand(glove('g-glR'),-.8,1.3,{layer:3,tab:false});
  const age=B.stand(S.flipCard(K+'g-age',.9,.32,'AGED 10',INK.pink),-4.2,1.9,{layer:3,s:0,tab:false});
  const seen=B.stand(P.lineCard('g-seen',1.7,.34,['A MISTAKE? EVERYONE SEES'],INK.white),-1.4,1.95,{layer:3,s:0,tab:false});
  const clubs=[['DONCASTER',INK.yellow],['BRISTOL',INK.sky],['READING',INK.pink],['WOLFSBURG',INK.grass]].map(([l,c],i)=>B.stand(S.sign(K+`g-c${i}`,1.0,1.0,l,c),1.0+i*1.1,-1.5,{layer:1,s:0}));
  B.stand(S.goal(K+'g-goalR',1.6,.85),4.0,-.6,{layer:1});
  const MR=B.person(K+'g-mr',3.0,.4,1.24,{shirt:'keeper',...MARY,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const cups=[0,1].map(i=>B.stand(S.trophy(K+'g-cup',.5,.66),4.0+i*.6,1.1,{layer:3,s:0,tab:false}));
  const lc=B.stand(S.flipCard(K+'g-lc',1.4,.3,'LEAGUE AND CUP',INK.yellow,INK.navy),3.6,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'g-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15):b.t;
   sun.dy=.3*beat(t,0,2);bare.body.s=beat(t,2,2.8);age.s=beat(t,7,7.8);club.s=beat(t,8,8.8);coach.body.s=beat(t,10.4,11.2);coach.armR.rot=.12+1.6*pulse(t,11.6,14.4);
   // Pull on the gloves: they slide up to her hands, then she is a keeper.
   const pull=manual?beat(act,0,.6):beat(t,15.3,16.6);
   gL.x=-1.2+(-2.75+1.2)*pull;gR.x=-.8+(-2.05+.8)*pull;gL.z=gR.z=1.3-(.8)*pull;gL.dy=gR.dy=.55*pull;const on=pull>.97;gL.visible=gR.visible=!on;
   gl.body.s=on?1:0;bare.body.s*=on?0:1;cheer(gl,Math.max(beat(t,16.8,17.4)*(1-beat(t,19.4,20)),manual?beat(act,.8,1):0));
   // Shots at the new keeper.
   const shots=[18.6,21];let [bx,bz,by]=[-1.2,1.6,0];for(const a of shots)if(t>a&&t<a+2)[bx,bz,by]=track(t,[[a,-1.2,1.6,0],[a+.7,-2.2,.6,.4],[a+2,-1.2,1.6,0]]);ball(bx,bz,by,t>17&&t<23.4);
   gl.body.rot=.5*Math.max(pulse(t,19,19.8),pulse(t,21.4,22.2))*(on?1:0);seen.s=beat(t,17.4,18.2)*(1-beat(t,23,23.6));
   clubs.forEach((c,i)=>{c.s=beat(t,[25.4,26.6,27.8,31.6][i],[26.2,27.4,28.6,32.4][i]);});MR.body.s=beat(t,24.8,25.6);
   MR.body.x=3.0+.0;plane.dx=2.4*beat(t,30.4,32.6);pop(plane,beat(t,30.2,30.6)*(1-beat(t,32.4,32.8)));
   cups.forEach((c,i)=>{c.s=beat(t,33+i*.4,33.6+i*.4);});lc.s=beat(t,33.4,34.2);cheer(MR,beat(t,33.6,34.2));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,22.4,23.4)-.4*beat(t,34.4,35.2):0;
  };
 }};

/* ───────────── 2 · Left out (leftout) ───────────── */
const leftout:SpreadDef={id:'leftout',rest:16.4,
 left:k=>{floor(k,-5,0,'#c9c3b4','#9a9384');caption(k,-2.5,'2019 TO 2021','NOT PICKED FOR ENGLAND',INK.navy);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);for(let i=0;i<5;i++)k.circle(1.0+i*.7,Z(1.0),.06,INK.orange);caption(k,2.5,'SHE KEPT TRAINING','NOT KNOWING IF SHE WOULD BE PICKED AGAIN',INK.green);},
 build:B=>{
  const bd=backdrop(B,K+'l-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);for(let x=.2;x<4.5;x+=.5)k.key(`M${x} 0 L${x} 2.4`,.01,'#9aa0b4');k.fill(rect(0,2.4,4.5,.6),'#c9c3b4');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.9,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'l-sun',.32),'R',3.6,1.9,{out:.012});
  const list=B.stand(squad(K+'l-squad',1.5,1.7,['','','','','']),-3.9,-1.2,{layer:1});
  B.stand(S.bench(K+'l-bench',1.6,.55),-2.0,.5,{layer:2});
  const M=B.person(K+'l-m',-2.2,.35,1.16,{shirt:'casual',...MARY,face:'sad',layer:2});
  const end=B.stand(P.lineCard('l-end',1.5,.34,['THE END?'],'#c9b9d6'),-3.8,1.95,{layer:3,s:0,tab:false});
  const quit=B.stand(P.lineCard('l-quit',1.7,.34,['STOP FOOTBALL?'],'#c9b9d6'),-1.6,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'l-post',1.5,1.25,INK.white),1.8,-.9,{layer:1});
  post.add(P.frame('l-train',1.36,1.0,k=>{k.fill(rect(.1,.6,1.16,.32),INK.grass);k.fill(poly([[.9,.82],[.98,.6],[1.06,.82]]),INK.orange);k.circle(.5,.32,.08,'#f1c6a0');k.fill(rect(.42,.4,.16,.3),INK.grass);k.key(rect(.42,.4,.16,.3),.01);k.circle(.78,.76,.05,INK.white,true);k.text('TRAINING',.68,.2,.1,INK.green,{weight:900});}),0,.12,{z:.012});
  const cloud=post.flap(P.rainCloud('l-cloud',1.4,1.05),0,1.18,{z:.03});
  const tvf=B.stand(P.lineCard('l-film',1.3,.6,['A BBC FILM','HONEST FEELINGS'],INK.white),4.1,-1.3,{layer:1,s:0});
  const MR=B.person(K+'l-mr',3.2,.5,1.2,{shirt:'keeper',...MARY,face:'smile',layer:3,holdL:'glove',holdR:'glove'});
  const cones=[0,1,2].map(i=>B.stand(S.cone(K+'l-cone',.3),2.0+i*.8,1.2,{layer:3,s:0,tab:false}));
  const feel=B.stand(S.flipCard(K+'l-feel',1.7,.3,'SAD? NOT GOOD ENOUGH?',INK.sky,INK.navy),2.4,1.95,{layer:3,s:0,tab:false});
  const anyway=B.stand(S.flipCard(K+'l-any',1.3,.3,'TRAIN ANYWAY',INK.yellow,INK.navy),4.1,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.4):b.t;
   list.s=beat(t,1.8,2.6);M.body.s=beat(t,2.4,3.2);end.s=beat(t,8.2,9);quit.s=beat(t,11.8,12.6);M.body.yaw=-.3*beat(t,8.4,9.4);
   // Lift the rain cloud: under it, she is still training.
   const lift=manual?beat(act,0,.6):beat(t,16.8,18);cloud.flip=-2.7*lift;sun.dy=.4*lift;
   tvf.s=beat(t,19.4,20.2);feel.s=beat(t,25.2,26);MR.body.s=Math.max(beat(t,30.2,31),manual?beat(act,.5,.9):0);cones.forEach((c,i)=>{c.s=Math.max(beat(t,30.4+i*.3,31+i*.3),manual?beat(act,.5,.9):0);});
   MR.body.x=3.2-1.2*Math.abs(Math.sin((t-31)*.8))*(t>31&&t<35.4?1:0);anyway.s=beat(t,31.6,32.4);cheer(MR,Math.max(beat(t,35.6,36.2),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16.6,17.6):0;
  };
 }};

/* ───────────── 3 · A new coach, a new chance (chance) ───────────── */
const chance:SpreadDef={id:'chance',rest:21.6,
 left:k=>{floor(k,-5,0,'#d9cdb4','#a99a7a');caption(k,-2.5,'SEPTEMBER 2021','A NEW MANAGER: SARINA WIEGMAN',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'ENGLAND’S NUMBER ONE','BACK IN THE TEAM, AND THIS TIME SHE STAYED',INK.green,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'c-bd',k=>{wash(k,4.5,3,'#e7dcc2',INK.orange,y=>.1);for(let i=0;i<5;i++){const x=.3+i*.85;k.fill(rect(x,.9,.6,1.4),INK.white);k.key(rect(x,.9,.6,1.4),.012);k.circle(x+.3,.75,.08,INK.yellow);}k.fill(rect(0,2.4,4.5,.6),'#d9cdb4');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.25,2.45,ENG,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const bunt=bd.add(S.bunting(K+'c-bunt',3.2,.4,[INK.white,INK.red,INK.navy]),'R',.6,2.5,{out:.03});
  const boss=B.person(K+'c-boss',-3.8,.0,1.72,{shirt:'navy',hair:'bun',hairColor:'#e0c07a',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const sheet=B.stand(S.post(K+'c-sheet',1.3,1.0,INK.white),-2.2,-1.2,{layer:1});
  sheet.add(P.lineCard('c-earps',1.1,.4,['KEEPER: EARPS'],INK.grass),0,.15,{z:.012});const blank=sheet.flap(P.lineCard('c-blank',1.1,.4,['KEEPER: ?'],INK.white),0,.55,{z:.03});
  sheet.add(P.lineCard('c-xi',1.1,.3,['STARTING XI'],INK.navy,INK.white),0,.68,{z:.012});
  const fresh=B.stand(S.flipCard(K+'c-fresh',1.4,.3,'A FRESH START',INK.yellow,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const mates=[[-1.6,.6,'bun'],[-.8,1.1,'curly']].map(([x,z,h],i)=>B.person(K+`c-m${i}`,x as number,z as number,1.14,{shirt:'ger',hair:h as 'bun',skin:SKINS[i*3],face:'grin',layer:3}));
  const wall=B.stand(S.post(K+'c-wall',1.4,1.6,'#e7dcc2'),1.3,-.8,{layer:2});
  wall.add(P.frame('c-out',1.1,1.3,k=>{k.fill(rect(.08,.5,.94,.72),INK.grass);k.fill(rect(.08,.08,.94,.42),INK.sky2);for(let i=0;i<6;i++)k.circle(.15+i*.16,.4,.05,[INK.white,INK.red][i%2]);}),0,.15,{z:.012});
  const door=wall.flap(P.doorway('c-door',1.1,1.3,INK.navy),-.55,.15,{anchor:'bl',axis:'y',z:.03});
  const MR=B.person(K+'c-mr',2.0,.8,1.22,{shirt:'keeper',...MARY,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const one=B.stand(P.disc('c-one',.5,'1',INK.yellow),3.6,-.6,{layer:2,s:0});const oneC=B.stand(S.flipCard(K+'c-onec',1.4,.3,'NUMBER ONE',INK.yellow,INK.navy),3.5,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'c-goal',1.6,.85),4.0,-1.5,{layer:1});
  const stay=B.stand(S.flipCard(K+'c-stay',1.4,.3,'BACK, AND STAYED',INK.pink),1.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.6):b.t;
   boss.body.s=beat(t,2.8,3.6);boss.armR.rot=.12+1.4*pulse(t,8,11.6);blank.flip=-3.2*beat(t,9.6,10.6);fresh.s=beat(t,15,15.8);mates.forEach((p,i)=>{p.body.s=beat(t,16+i*.5,16.8+i*.5);cheer(p,beat(t,17.4+i*.3,18+i*.3)*(1-beat(t,21,21.6)));});
   // Open the door: the pitch is waiting.
   const open=manual?beat(act,0,.5):beat(t,22,23.2);door.flip=-1.9*open;
   MR.body.s=Math.max(beat(t,23.8,24.6),manual?beat(act,.4,.8):0);MR.body.x=2.0+.5*beat(t,24.6,26.4);
   one.s=Math.max(beat(t,29,29.8),manual?beat(act,.7,1):0);oneC.s=beat(t,29.6,30.4);stay.s=beat(t,34.6,35.4);pop(bunt,beat(t,29,30));
   cheer(MR,Math.max(beat(t,30,30.6),manual?beat(act,.9,1):0));cheer(boss,beat(t,38.4,39)*.6);
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,21.4,22.4):0;
  };
 }};

/* ───────────── 4 · Every minute (euros) ───────────── */
const euros:SpreadDef={id:'euros',rest:17.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'EURO 2022 · AT HOME','EVERY MINUTE OF ALL SIX MATCHES',INK.red);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'CHAMPIONS OF EUROPE','TEAM OF THE TOURNAMENT',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'e-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.1,2.45,ENG,1);lightRig(k,.9,.2);lightRig(k,3.7,.2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.1,2.45,ENG,4);lightRig(k,.8,.2);lightRig(k,3.9,.2);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const conf=bd.add(S.confetti(K+'e-conf',3.6,1.4,4),'R',.4,1.1,{out:.04}),bunt=bd.add(S.bunting(K+'e-bunt',3.4,.4,[INK.white,INK.red]),'L',.5,2.55,{out:.03});
  const fw=[bd.add(S.firework(K+'e-fw1',.42,INK.yellow),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'e-fw2',.38,INK.pink),'L',3.2,2.0,{out:.03})];
  const tiles=[1,2,3,4,5,6].map(i=>B.stand(P.disc(`e-t${i}`,.36,String(i),INK.white),-4.6+i*.56,-1.3,{layer:1,s:0}));
  const ticks=tiles.map((tl,i)=>tl.add(S.icon(K+'e-tick',.16,'tick'),.12,.3,{z:.02}));
  B.stand(S.goal(K+'e-goal',1.7,.9),-2.5,-.6,{layer:1});
  const M=B.person(K+'e-m',-2.5,-.3,1.2,{shirt:'keeper',...MARY,face:'grin',layer:2,holdL:'glove',holdR:'glove'});
  const tot=B.stand(S.flipCard(K+'e-tot',1.8,.3,'TEAM OF THE TOURNAMENT',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'e-pole',.14,1.3,INK.stock),2.5,-.2,{layer:2,tab:false});const cup=pole.add(S.trophy(K+'e-cup',.6,.8),0,.3,{z:.03});
  const MR=B.person(K+'e-mr',2.0,.3,1.22,{shirt:'keeper',...MARY,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const team=[[1.0,.9,'bun'],[3.1,.9,'long'],[4.0,.2,'curly'],[3.6,-1.0,'short']].map(([x,z,h],i)=>B.person(K+`e-p${i}`,x as number,z as number,1.16,{shirt:'ger',hair:h as 'bun',skin:SKINS[i%5],face:'grin',layer:i===3?1:3}));
  const champs=B.stand(S.flipCard(K+'e-ch',1.6,.32,'EURO 2022 WINNERS',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.4):b.t;
   pop(bunt,beat(t,1.8,2.8));M.body.s=beat(t,2.2,3);tiles.forEach((q,i)=>{q.s=beat(t,6.6+i*.7,7.2+i*.7);pop(ticks[i],beat(t,7.2+i*.7,7.6+i*.7));});tot.s=beat(t,11.4,12.2);
   M.body.rot=.4*Math.sin(t*2)*(t>13.4&&t<17.4?1:0);cheer(M,beat(t,11.8,12.4)*(1-beat(t,13,13.6)));
   team.forEach((p,i)=>{p.body.s=beat(t,13.6+i*.4,14.4+i*.4);});MR.body.s=beat(t,13.4,14.2)||(manual?1:0);
   // Raise the trophy.
   const raise=manual?beat(act,0,.6):beat(t,18,19.4);cup.dy=-.2+1.0*raise;pop(cup,Math.min(1,.2+raise*2));cheer(MR,raise);
   champs.s=Math.max(beat(t,20,20.8),manual?beat(act,.5,.9):0);pop(conf,Math.max(beat(t,19.8,21),manual?beat(act,.6,1):0));fw.forEach((q,i)=>{pop(q,beat(t,20+i*.5,21+i*.5));q.rot=t*.2;});
   team.forEach((p,i)=>cheer(p,Math.max(beat(t,24+i*.3,24.6+i*.3),manual?beat(act,.8,1):0)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,13,14)-.4*beat(t,29.4,30.2):0;
  };
 }};

/* ───────────── 5 · A save in a hard final (save) ───────────── */
const save:SpreadDef={id:'save',rest:19.6,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.9);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.9 ${Z(-2.1)} L-3.9 ${Z(-.6)} L-1.1 ${Z(-.6)} L-1.1 ${Z(-2.1)}`);k.circle(-2.5,Z(-.2),.07,INK.white);caption(k,-2.5,'WORLD CUP FINAL 2023','A PENALTY SAVED · SPAIN 1, ENGLAND 0',INK.yellow,INK.white,.38);},
 right:k=>{floor(k,0,5,'#e4cfa8','#b39a6e');caption(k,2.5,'THE GOLDEN GLOVE','SHE SPOKE UP FOR YOUNG GOALKEEPERS',INK.green);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.white,INK.red,INK.yellow,INK.red],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{wash(k,4.5,3,'#f6e8cc',INK.orange,y=>.12);k.fill(rect(.4,.5,3.7,.25),INK.red);k.text('SHOP',2.25,.7,.18,INK.white,{weight:900});k.fill(rect(0,2.4,4.5,.6),'#e4cfa8');});
  B.stand(S.goal(K+'s-goal',1.9,1.0),-2.5,-1.8,{layer:1});
  const keeper=B.person(K+'s-keep',-2.5,-1.5,1.3,{shirt:'keeper',...MARY,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const taker=B.person(K+'s-taker',-2.2,.6,1.22,{shirt:'casual',hair:'bun',skin:SKINS[2],legs:'kick',face:'open',layer:3});
  const min=B.stand(S.noteCard(K+'s-68',.6,.6,['68’']),-4.3,-.6,{layer:2,s:0});
  const board=B.stand(S.scoreboard(K+'s-board',1.4,1.15,'FINAL'),-4.2,-1.8,{layer:1,s:0});board.add(S.scoreFlap(K+'s-sc',1.1,.52,'ESP','1–0','ENG'),0,.32,{z:.012});
  const saved=B.stand(S.flipCard(K+'s-saved',1.3,.32,'SAVED!',INK.yellow,INK.navy),-1.0,1.95,{layer:3,s:0,tab:false});
  const gg=B.stand(S.icon(K+'s-gg',.5,'glove'),1.4,-.4,{layer:2,s:0});const ggc=B.stand(S.flipCard(K+'s-ggc',1.3,.3,'GOLDEN GLOVE',INK.gold,INK.navy),1.4,1.95,{layer:3,s:0,tab:false});
  const rack=B.stand(shirtRack(K+'s-rack',2.0,1.1),3.2,-1.4,{layer:1,s:0});
  const none=B.stand(P.lineCard('s-none',1.6,.34,['NO KEEPER SHIRT'],INK.white,INK.pink),3.4,-.4,{layer:2,s:0,tab:false});
  const MR=B.person(K+'s-mr',2.4,.7,1.22,{shirt:'casual',...MARY,face:'smile',layer:3});
  const voice=MR.body.add(S.bubble(K+'s-voice',.5,.42,'heart'),.45,MR.h*.95,{z:-.02});
  const kids=[[3.6,.9,'curly'],[4.4,.5,'bun']].map(([x,z,h],i)=>B.person(K+`s-k${i}`,x as number,z as number,.92,{shirt:'keeper',hair:h as 'bun',skin:SKINS[i+1],face:'grin',layer:3,holdR:'glove'}));
  const ball=B.stand(S.ball(K+'s-ball',.1),-2.5,-.2,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   keeper.body.s=beat(t,2.4,3.2);taker.body.s=beat(t,2.8,3.6);board.s=beat(t,3,3.8);min.s=beat(t,7.8,8.6);
   // Dive for the save (the 68th minute penalty, then again on the reader's tap).
   const shot=(a:number)=>track(t,[[a,0,0],[a+.5,1,0]])[0];const kick=manual?beat(act,0,.5):Math.max(t>8.6&&t<12?shot(8.6):0,t>20&&t<24?shot(20):0);
   const dive=manual?beat(act,.1,.5):Math.max(t>8.6&&t<12?beat(t,8.7,9.2)*(1-beat(t,11,11.6)):0,t>20&&t<24?beat(t,20.1,20.6)*(1-beat(t,23,23.6)):0);
   keeper.body.rot=-1.0*dive;keeper.body.dx=.45*dive;taker.leg!.rot=-1.1*(manual?pulse(act,0,.25):Math.max(pulse(t,8.3,8.9),pulse(t,19.7,20.3)));
   const [bx,bz,by]=track(kick,[[0,-2.5,-.2,0],[.7,-2.0,-1.2,.35],[1,-1.7,-.6,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;
   saved.s=Math.max(beat(t,10,10.8),manual?beat(act,.5,.9):0);cheer(keeper,manual?beat(act,.8,1):0);
   gg.s=beat(t,15.4,16.2);ggc.s=beat(t,16,16.8);MR.body.s=beat(t,15,15.8);
   rack.s=beat(t,22.2,23);none.s=beat(t,25.6,26.4);pop(voice,beat(t,30,30.6)*(1-beat(t,35,35.6)));kids.forEach((p,i)=>{p.body.s=beat(t,31.4+i*.5,32.2+i*.5);cheer(p,beat(t,35.6+i*.3,36.2+i*.3));});
   cheer(MR,beat(t,36,36.6));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,14.6,15.6)-.8*beat(t,19.4,20)+.8*beat(t,21.8,22.8):0;
  };
 }};

/* ───────────── 6 · The best in the world (best) ───────────── */
const best:SpreadDef={id:'best',rest:17.0,
 left:k=>{floor(k,-5,0,'#3b2a5e','#5a4a80');caption(k,-2.5,'THE BEST · 2022 AND 2023','FIFA WOMEN’S GOALKEEPER, TWICE',INK.yellow,INK.white);},
 right:k=>{floor(k,0,5,'#3b2a5e','#5a4a80');caption(k,2.5,'MAY 2025','53 MATCHES FOR ENGLAND',INK.yellow,INK.white);},
 build:B=>{
  const stage=(k:Kit)=>{nightSky(k,4.5,3,'#3b2a5e',INK.pink);for(let i=0;i<5;i++){const x=.4+i*.9;k.fill(poly([[x,0],[x+.2,0],[x+.5,2.4],[x-.3,2.4]]),INK.yellow,.12);}k.fill(rect(0,2.3,4.5,.7),'#2b2140');};
  const bd=backdrop(B,K+'b-bd',stage,stage);
  const st=[bd.add(S.stars(K+'b-st1',2.4,.7,10),'L',1.0,2.1,{out:.02}),bd.add(S.stars(K+'b-st2',2.4,.7,10),'R',1.0,2.1,{out:.02})];
  const a22=B.stand(awardFrame(K+'b-a22',.9,1.1,'2022'),-4.0,-1.1,{layer:1,s:0}),a23=B.stand(awardFrame(K+'b-a23',.9,1.1,'2023'),-2.9,-1.3,{layer:1,s:0});
  const M=B.person(K+'b-m',-2.3,.6,1.24,{shirt:'keeper',...MARY,face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const spoty=B.stand(S.trophy(K+'b-spoty',.55,.75),-1.0,-.2,{layer:2,s:0});const sc=B.stand(P.lineCard('b-sc',1.8,.6,['SPORTS PERSONALITY','OF THE YEAR 2023'],INK.yellow),-1.3,1.6,{layer:3,s:0,tab:false});
  const vote=B.stand(S.flipCard(K+'b-vote',1.4,.3,'VOTED BY THE PUBLIC',INK.pink),-3.9,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'b-post',1.7,1.3,INK.white),2.2,-.9,{layer:1});
  post.add(teamPhoto(K+'b-photo',1.56,1.1),0,.1,{z:.012});const cover=post.flap(P.frame('b-cover',1.6,1.14,k=>{k.text('ENGLAND',.8,.5,.16,INK.navy,{weight:900});k.text('TEAM PHOTO',.8,.74,.12,INK.red,{weight:900});},INK.stock),0,1.24,{z:.03});
  const MR=B.person(K+'b-mr',3.9,.6,1.24,{shirt:'casual',...MARY,face:'grin',layer:3});
  const story=B.stand(P.lineCard('b-story',2.0,.6,['A SETBACK IS NOT','THE END OF YOUR STORY'],INK.white),2.5,1.6,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17):b.t;
   M.body.s=beat(t,1.8,2.6);a22.s=beat(t,4,4.8);a23.s=beat(t,6.4,7.2);st.forEach((q,i)=>{pop(q,beat(t,6.8+i*.4,7.8+i*.4));});cheer(M,beat(t,7.2,7.8)*(1-beat(t,9,9.6)));
   spoty.s=beat(t,10.4,11.2);sc.s=beat(t,11,11.8);vote.s=beat(t,14.4,15.2);
   // Lift the photo frame: her England team photo.
   const lift=manual?beat(act,0,.6):beat(t,17.6,18.8);cover.flip=-2.8*lift;MR.body.s=Math.max(beat(t,20,20.8),manual?beat(act,.5,.9):0);
   story.s=beat(t,31,31.8);cheer(MR,Math.max(beat(t,26,26.6),manual?beat(act,.9,1):0));cheer(M,beat(t,36,36.6));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.2,18.2)-.4*beat(t,35.4,36.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={gloves,leftout,chance,euros,save,best};
