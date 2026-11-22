/**
 * The six Antoine Griezmann pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/griezmann/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The thread is "too small": closed academy doors, a scout under a flap, a bridge over the border. Kits are colour only.
 */
import {INK,type Kit,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,caption,daySky,crowd,nightSky,lightRig,hills,roofs,sea,backdrop,plates,ballPair} from '../spreadKit';

const K='griezmann-';
const P=plates(K),{sp}=P;
const ANT={skin:'#f1c6a0',hair:'short' as const,hairColor:'#b8894a'};
const FRA=[INK.navy,INK.white,INK.red,INK.blue];

/* ───────────── Griezmann-only plates ───────────── */
const academy=(key:string,w:number,h:number,name:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.22,w,h*.78);k.fill(b,'#f0e0c0');k.dots(b,INK.orange,.04,.15);k.key(b,.014);const roof=rect(-.02,h*.1,w+.04,h*.14);k.fill(roof,c);k.key(roof,.012);k.text(name,w/2,h*.2,h*.1,INK.navy,{weight:900,max:w*.94});k.fill(rect(w*.25,h*.4,w*.5,h*.6),'#5a4a3a');});
const stamp=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.03,c);k.text(label,w/2,h*.72,h*.56,c,{weight:900,max:w*.86});},{rim:.012});
const deck=(key:string,w:number,h:number)=>S.bridgeDeck(key,w,h);
const sixBalls=(key:string)=>sp(key,1.5,.3,k=>{for(let i=0;i<6;i++){const x=.13+i*.25;k.fill(ell(x,.15,.1,.1),INK.white);k.key(ell(x,.15,.1,.1),.012);k.keyFill(ell(x,.15,.035,.035));}},{rim:.012});

/* ───────────── 1 · A small boy with a big touch (macon) ───────────── */
const macon:SpreadDef={id:'macon',rest:16.0,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'MÂCON · FRANCE · 1991','HIS HOMETOWN CLUB: UF MÂCONNAIS',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'SMALL AND SLIM','BUT VERY GOOD WITH THE BALL',INK.pink);},
 build:B=>{
  const bd=backdrop(B,K+'m-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#8fae6e');roofs(k,.2,4.3,2.3,2);k.fill(rect(0,2.3,4.5,.7),'#9dbd78');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'m-sun',.3),'L',3.7,2.1,{out:.012});
  const dream=bd.add(P.lineCard('m-dream',1.6,.6,['A BIG CLUB’S','ACADEMY?'],INK.white),'R',2.6,1.5,{out:.03});
  const club=B.stand(S.sign(K+'m-club',1.4,1.2,'UF MÂCONNAIS',INK.blue),-4.0,-1.4,{layer:1,s:0});
  B.stand(S.tree(K+'m-tree',1.0,1.6),-1.0,-1.7,{layer:1});
  const tall=[[-3.0,-.2],[-1.6,.2]].map(([x,z],i)=>B.person(K+`m-t${i}`,x,z,1.36,{shirt:'casual',hair:i?'curly':'short',skin:SKINS[i*3],face:'smile',layer:2}));
  const A=B.person(K+'m-a',-2.2,.9,.98,{shirt:'casual',...ANT,legs:'kick',face:'grin',layer:3});
  const small=B.stand(S.flipCard(K+'m-small',1.2,.3,'SMALL AND SLIM',INK.pink),-3.8,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'m-goal',1.7,.9),3.8,-1.5,{layer:1});
  const keeper=B.person(K+'m-keep',3.8,-1.2,1.3,{shirt:'keeper',hair:'short',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  B.slot(.4,.9,3.6,-1.3);
  const AR=B.person(K+'m-ar',.8,.8,.98,{shirt:'casual',...ANT,legs:'kick',face:'grin',layer:3});
  const def=B.person(K+'m-def',2.2,.0,1.38,{shirt:'navy',hair:'short',skin:SKINS[2],face:'open',layer:2});
  const weeks=['EVERY WEEK','HOPING','SOMEONE NOTICES'].map((l,i)=>B.stand(S.flipCard(K+`m-w${i}`,1.2,.3,l,[INK.yellow,INK.sky,INK.pink][i],INK.navy),1.0+i*1.35,1.95,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,K+'m-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16):b.t;
   sun.dy=.3*beat(t,0,2);A.body.s=beat(t,2.8,3.6);club.s=beat(t,8.6,9.4);tall.forEach((p,i)=>{p.body.s=beat(t,9.4+i*.4,10.2+i*.4);});small.s=beat(t,12.4,13.2);
   const drib=beat(t,13.4,15.6);A.body.x=-2.2+1.6*drib;A.leg!.rot=-.7*Math.abs(Math.sin(t*4))*(drib>0&&drib<1?1:0);tall.forEach((p,i)=>{p.body.rot=.25*pulse(t,13.8+i*.8,14.8+i*.8)*(i?1:-1);});
   AR.body.s=Math.max(beat(t,14.6,15.4),manual?1:0);keeper.body.s=beat(t,14,14.8);def.body.s=beat(t,14.2,15);
   // Kick the ball: past the tall defender, into the goal.
   const kick=manual?beat(act,0,.7):beat(t,16.6,18);AR.leg!.rot=-1.2*(manual?pulse(act,0,.3):pulse(t,16.3,16.9));
   let [bx,bz,by]=kick>0?track(kick,[[0,1.15,.9,0],[.5,2.4,-.2,.5],[1,3.6,-1.45,.2]]):[A.body.x+.3,.95,0];if(t<14.6&&!manual)[bx,bz,by]=[A.body.x+.3,.95,0];
   ball(bx,bz,by,t>3);keeper.body.rot=.6*(manual?pulse(act,.3,.9):pulse(t,17,18.4));cheer(AR,Math.max(beat(t,18.2,18.8)*(1-beat(t,24.6,25.2)),manual?beat(act,.9,1):0));
   pop(dream,beat(t,19.6,20.6));weeks.forEach((c,i)=>{c.s=beat(t,25.4+i*1.2,26.2+i*1.2);});cheer(A,beat(t,30,30.6));
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,14.2,15.2):0;
  };
 }};

/* ───────────── 2 · Told no, again and again (rejected) ───────────── */
const rejected:SpreadDef={id:'rejected',rest:23.6,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'AGED 13 TO 14','TRIALS AT LYON, AUXERRE, SAINT-ÉTIENNE, SOCHAUX',INK.navy,INK.navy,.4);},
 right:k=>{paving(k,0,5,'#e8dcc2','#b8a888');caption(k,2.5,'AGAIN AND AGAIN, NO','THEY WORRIED HE WAS TOO SMALL',INK.red);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.2,1);k.fill(rect(0,2.2,4.5,.8),'#e3d6bb');},k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.2,3);k.fill(rect(0,2.2,4.5,.8),'#e8dcc2');});
  const clubs:[string,string,number][]=[['LYON',INK.blue,-3.7],['AUXERRE',INK.sky,-1.4],['SAINT-ÉTIENNE',INK.grass,1.4],['SOCHAUX',INK.yellow,3.7]];
  const halls=clubs.map(([n,c,x],i)=>B.stand(academy(K+`r-a${i}`,1.8,1.5,n,c),x,-1.3,{layer:1}));
  const doors=halls.map((h,i)=>h.flap(P.doorway(`r-d${i}`,.9,.88,INK.red),-.45,0,{anchor:'bl',axis:'y',z:.02}));
  const nos=clubs.map(([, ,x],i)=>B.stand(stamp(K+`r-no${i}`,.6,.34,'NO',INK.red),x,-.2,{layer:2,s:0,tab:false}));
  const AL=B.person(K+'r-al',-2.6,.7,1.04,{shirt:'casual',...ANT,face:'smile',layer:3,holdR:'ball'});
  const AR=B.person(K+'r-ar',.8,.7,1.04,{shirt:'casual',...ANT,face:'smile',layer:3,holdR:'ball'});
  const coach=B.person(K+'r-coach',4.4,.4,1.72,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:2});
  const small=B.stand(P.lineCard('r-small',1.6,.34,['TOO SMALL?'],INK.white,INK.red),2.6,1.95,{layer:3,s:0,tab:false});
  const keep=B.stand(S.flipCard(K+'r-keep',1.5,.3,'KEEP GOING',INK.yellow,INK.navy),-2.6,1.95,{layer:3,s:0,tab:false});
  const sad=AL.body.add(P.faceCard('r-sad',.3,'sad',INK.sky),.3,1.3,{z:-.02,anchor:'center'});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.6):b.t;
   AL.body.s=beat(t,2.6,3.4);
   // The trials: Lyon and Auxerre on the left, then he crosses to Saint-Étienne and Sochaux.
   const walk=beat(t,3.4,10.4);AL.body.x=-4.2+3.6*walk;nos.forEach((q,i)=>{q.s=beat(t,[5,8.2,11,12.2][i],[5.6,8.8,11.6,12.8][i]);});
   coach.body.s=beat(t,13.8,14.6);coach.armR.rot=.12+.8*pulse(t,14.6,17.4);small.s=beat(t,14.6,15.4);
   // Knock on the doors: two taps, two more trials (the doors rattle, the boy keeps going).
   const k1=manual?beat(act,0,.5):beat(t,24,25),k2=manual?beat(act,.5,1):beat(t,25.4,26.6);
   doors[2].flip=-.25*pulse(k1,0,.5)-.25*pulse(k1,.5,1);doors[3].flip=-.25*pulse(k2,0,.5)-.25*pulse(k2,.5,1);
   AR.body.s=Math.max(beat(t,22.6,23.4),manual?1:0);AR.body.x=.8+.9*k1+1.6*k2;AR.armL.rot=-.12-1.4*Math.max(pulse(k1,0,1),pulse(k2,0,1));
   pop(sad,beat(t,26,26.6)*(1-beat(t,29.6,30.2)));keep.s=Math.max(beat(t,30,30.8),manual?beat(act,.8,1):0);cheer(AR,Math.max(beat(t,34,34.6),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,2.4,3.4)+.8*beat(t,10.4,11.4):0;
  };
 }};

/* ───────────── 3 · Someone was watching (scout) ───────────── */
const scout:SpreadDef={id:'scout',rest:19.6,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'2005 · MONTPELLIER','A TRIAL, A FRIENDLY MATCH',INK.blue);},
 right:k=>{pitch(k,0,5,'#8fc467',INK.leaf);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'SAN SEBASTIÁN · SPAIN','ONE WEEK, TWO WEEKS, A PLACE IN THE YOUTH TEAM',INK.blue,INK.navy,.36);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.6,2.45,[INK.orange,INK.navy,INK.white],1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#6d8f76');sea(k,4.5,1.6,.5);roofs(k,.2,4.3,2.25,4);k.fill(rect(0,2.25,4.5,.75),'#8fc467');});
  const plane=bd.add(S.plane(K+'s-plane',.7,.35),'R',.4,2.4,{out:.03});
  B.stand(S.goal(K+'s-goal',1.6,.85),-4.2,-1.0,{layer:1,yaw:.9});
  const A=B.person(K+'s-a',-2.6,.6,1.04,{shirt:'casual',...ANT,legs:'kick',face:'grin',layer:3});
  const opp=[[-3.4,-.4],[-1.8,-.1]].map(([x,z],i)=>B.person(K+`s-o${i}`,x,z,1.3,{shirt:'navy',hair:i?'short':'curly',skin:SKINS[i+1],face:'open',layer:2}));
  const stand=B.stand(S.post(K+'s-stand',1.6,1.3,'#d9cfb8'),-.9,-1.4,{layer:1});
  stand.add(P.frame('s-seat',1.46,1.1,k=>{k.fill(rect(.1,.6,1.26,.4),'#8b8f9e');for(let i=0;i<6;i++)k.circle(.2+i*.21,.55,.06,[INK.orange,INK.navy][i%2]);}),0,.12,{z:.012});
  const cover=stand.flap(P.frame('s-cover',1.5,1.16,k=>{k.text('WHO IS',.75,.5,.16,INK.navy,{weight:900});k.text('WATCHING?',.75,.76,.16,INK.navy,{weight:900});},INK.stock),0,1.25,{z:.04});
  const sc=B.person(K+'s-scout',-.9,-1.2,1.4,{shirt:'navy',hair:'short',skin:SKINS[0],adult:true,face:'smile',layer:1});
  const note=B.stand(P.lineCard('s-note',1.8,.6,['GREAT TECHNIQUE','UNDERSTANDS THE GAME'],INK.yellow),-3.4,1.65,{layer:3,s:0,tab:false});
  const AR=B.person(K+'s-ar',1.6,.6,1.06,{shirt:'fan',...ANT,legs:'kick',face:'grin',layer:3,holdR:'suitcase'});
  const weeks=[['1 WEEK',INK.yellow],['2 WEEKS',INK.sky],['YOUTH TEAM!',INK.pink]].map(([l,c],i)=>B.stand(S.flipCard(K+`s-w${i}`,1.2,.3,l,c,INK.navy),1.2+i*1.35,1.95,{layer:3,s:0,tab:false}));
  const rs=B.stand(S.sign(K+'s-rs',1.4,1.2,'REAL SOCIEDAD',INK.blue),3.7,-1.3,{layer:1,s:0});
  const mates=[[3.0,-.2,'curly'],[4.3,.4,'short']].map(([x,z,h],i)=>B.person(K+`s-m${i}`,x as number,z as number,1.06,{shirt:'fan',hair:h as 'curly',skin:SKINS[i*2],face:'grin',layer:2}));
  const ball=ballPair(B,K+'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   A.body.s=beat(t,2.2,3);opp.forEach((p,i)=>{p.body.s=beat(t,2.6+i*.4,3.4+i*.4);});
   const drib=t>3.4&&t<8.4;A.leg!.rot=-.8*Math.abs(Math.sin(t*4))*(drib?1:0);A.body.x=-2.6-.9*beat(t,3.4,8)+.9*beat(t,16,18);opp.forEach((p,i)=>{p.body.rot=.3*pulse(t,4.4+i*1.6,5.6+i*1.6)*(i?1:-1);});
   ball(A.body.x+.3,.75,0,t>2.4);
   sc.body.s=beat(t,8.6,9.4);note.s=beat(t,14.6,15.4);sc.armR.rot=.12+1.2*beat(t,15,15.8);
   // Lift the flap: the stand's cover lifts, and there is the scout.
   const lift=manual?beat(act,0,.5):beat(t,20,21.2);cover.flip=-2.8*lift;sc.body.dy=.0;
   plane.dx=2.6*beat(t,22,24.6);pop(plane,beat(t,21.8,22.2)*(1-beat(t,24.4,24.8)));AR.body.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.4,.8):0);
   weeks.forEach((c,i)=>{c.s=Math.max(beat(t,[23.6,27,30][i],[24.4,27.8,30.8][i]),manual?beat(act,.5+i*.15,.7+i*.15):0);});rs.s=beat(t,29.6,30.4);mates.forEach((p,i)=>{p.body.s=beat(t,30.4+i*.4,31.2+i*.4);});
   cheer(AR,Math.max(beat(t,31,31.6),manual?beat(act,.95,1):0));mates.forEach((p,i)=>cheer(p,beat(t,39+i*.3,39.6+i*.3)));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,21.6,22.6):0;
  };
 }};

/* ───────────── 4 · Across the border (border) ───────────── */
const border:SpreadDef={id:'border',rest:17.4,
 left:k=>{paving(k,-5,0);const r=rect(-.5,0,.5,6.4);k.fill(r,INK.blue);k.dots(r,INK.navy,.04,.3);caption(k,-2.5,'BAYONNE · FRANCE','HE LIVED WITH ÉRIC OLHATS AND WENT TO SCHOOL',INK.blue,INK.navy,.4);},
 right:k=>{const r=rect(0,0,.5,6.4);k.fill(r,INK.blue);k.dots(r,INK.navy,.04,.3);pitch(k,.5,5);chalk(k,`M.5 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'INTO SPAIN','TRAINING WITH REAL SOCIEDAD IN THE EVENINGS',INK.red,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#8fae6e');roofs(k,.2,4.0,2.3,1);k.fill(rect(4.0,1.6,.5,1.4),INK.blue);k.fill(rect(0,2.3,4.0,.7),'#e3d6bb');},
   k=>{nightSky(k,4.5,3,'#3b4a7e',INK.pink);hills(k,4.5,3,1.7,'#4d6f66');k.fill(rect(0,1.6,.5,1.4),INK.blue);k.fill(rect(.5,2.3,4,.7),INK.grass);});
  const sunL=bd.add(S.sun(K+'b-sun',.3),'L',3.4,2.0,{out:.012}),moon=bd.add(P.disc('b-moon',.4,'',INK.white),'R',3.5,2.2,{out:.012});
  const fr=B.stand(S.sign(K+'b-fr',1.2,1.2,'BAYONNE',INK.white),-4.2,-1.4,{layer:1});
  B.stand(S.house(K+'b-house',1.4,1.3),-3.0,-1.6,{layer:1});B.stand(P.windowFrame('b-school',1.0,.8),-1.6,-1.6,{layer:1});
  const olh=B.person(K+'b-olh',-3.6,.3,1.7,{shirt:'navy',hair:'short',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const A=B.person(K+'b-a',-2.4,.8,1.06,{shirt:'casual',...ANT,face:'smile',layer:3,holdR:'suitcase'});
  const miss=A.body.add(S.bubble(K+'b-miss',.46,.4,'heart'),.4,1.3,{z:-.02});
  const far=B.stand(S.flipCard(K+'b-far',1.5,.3,'FAR FROM HOME',INK.sky,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const dL=B.flat(deck(K+'b-dL',1.1,.6),-.05,.9,{edge:'right',hinge:1.45}),dR=B.flat(deck(K+'b-dR',1.1,.6),.05,.9,{edge:'left',hinge:-1.45});
  const es=B.stand(S.sign(K+'b-es',1.4,1.2,'SAN SEBASTIÁN',INK.red),1.4,-1.5,{layer:1});
  B.stand(S.goal(K+'b-goal',1.6,.85),3.9,-1.5,{layer:1});
  const AR=B.person(K+'b-ar',1.8,.8,1.1,{shirt:'fan',...ANT,legs:'kick',face:'grin',layer:3});
  const steps=['STRONGER','MORE SKILFUL'].map((l,i)=>B.stand(S.flipCard(K+`b-s${i}`,1.3,.3,l,[INK.yellow,INK.pink][i],INK.navy),1.6+i*1.6,1.95,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,K+'b-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.4):b.t;
   A.body.s=beat(t,2.2,3);far.s=beat(t,3.4,4.2);olh.body.s=beat(t,7,7.8);olh.armR.rot=.12+1.0*beat(t,8,8.8);pop(miss,beat(t,14,14.6)*(1-beat(t,18.6,19.2)));
   // Unfold the bridge: two deck halves fold down over the border river.
   const open=manual?beat(act,0,.6):beat(t,17.8,19.4);dL.s=dR.s=.03+.97*open;
   const go=manual?beat(act,.5,1):beat(t,19.8,21.8);A.body.x=-2.4+2.0*go;A.body.s=beat(t,2.2,3)*(1-(manual?beat(act,.75,.85):beat(t,21.6,22)));
   AR.body.s=Math.max(beat(t,21.8,22.4),manual?beat(act,.8,1):0);pop(moon,beat(t,19.6,20.6));sunL.dy=-.4*beat(t,19.6,21);
   const kicks=[24.6,26.6,28.6];AR.leg!.rot=-1.1*maxOf(kicks.map(a=>pulse(t,a-.3,a+.3)));let [bx,bz,by]=[2.15,.95,0];for(const a of kicks)if(t>a&&t<a+1.8)[bx,bz,by]=track(t,[[a,2.15,.95,0],[a+.8,3.8,-1.2,.3],[a+1.8,3.8,-1.2,0]]);ball(bx,bz,by,t>22.4);
   steps.forEach((c,i)=>{c.s=beat(t,28+i*1.4,28.8+i*1.4);});cheer(AR,Math.max(beat(t,31.6,32.2),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,21.4,22.4):0;
  };
 }};

/* ───────────── 5 · A final at home (euro) ───────────── */
const euro:SpreadDef={id:'euro',rest:21.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'EURO 2016 · IN FRANCE','TOP SCORER, SIX GOALS · BEST PLAYER',INK.navy,INK.navy,.4);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'THE FINAL','PORTUGAL 1, FRANCE 0',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'e-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,FRA,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,FRA,4);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const clubs=[['REAL SOCIEDAD 2009',INK.sky],['ATLÉTICO MADRID 2014',INK.red]].map(([l,c],i)=>B.stand(S.sign(K+`e-c${i}`,1.6,1.2,l,c),-4.0+i*1.8,-1.5,{layer:1,s:0}));
  const A=B.person(K+'e-a',-2.5,.5,1.2,{shirt:'navy',...ANT,legs:'kick',face:'grin',layer:3});
  const six=B.stand(sixBalls(K+'e-six'),-3.4,1.25,{layer:3,s:0,tab:false});const top=B.stand(S.flipCard(K+'e-top',1.3,.3,'TOP SCORER',INK.yellow,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const gb=B.stand(S.goldenBall(K+'e-gb',.26),-1.0,.8,{layer:3,s:0,tab:false});const bp=B.stand(S.flipCard(K+'e-bp',1.3,.3,'BEST PLAYER',INK.pink),-1.2,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'e-post',1.7,1.3,INK.white),2.0,-1.3,{layer:1});
  post.add(S.scoreFlap(K+'e-sc',1.56,.9,'POR','1–0','FRA'),0,.15,{z:.012});const cloud=post.flap(P.rainCloud('e-cloud',1.6,1.1),0,1.22,{z:.03});
  const team=[[1.4,.6,'short',SKINS[1]],[2.6,.9,'curly',SKINS[4]],[3.7,.4,'bald',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`e-t${i}`,x as number,z as number,1.2,{shirt:'navy',hair:h as 'short',skin:sk as string,face:'sad',layer:3}));
  const AR=B.person(K+'e-ar',4.4,1.0,1.2,{shirt:'navy',...ANT,face:'sad',layer:3});
  const up=B.stand(S.flipCard(K+'e-up',1.6,.3,'PICK YOURSELF UP',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'e-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.4):b.t;
   clubs.forEach((c,i)=>{c.s=beat(t,[3,7.6][i],[3.8,8.4][i]);});A.body.s=beat(t,2.4,3.2);
   const shots=[11.4,12.6,13.8,15,16.2,17.4];A.leg!.rot=-1*maxOf(shots.map(a=>pulse(t,a-.25,a+.25)));let [bx,bz,by]=[-2.15,.65,0];for(const a of shots)if(t>a&&t<a+1.1)[bx,bz,by]=track(t,[[a,-2.15,.65,0],[a+.5,-2.6,-1.6,.35],[a+1.1,-2.15,.65,0]]);ball(bx,bz,by,t>10.8&&t<19);
   six.s=beat(t,12,13);top.s=beat(t,13,13.8);gb.s=beat(t,17.2,18);bp.s=beat(t,17.8,18.6);cheer(A,beat(t,18.4,19));
   team.forEach((p,i)=>{p.body.s=beat(t,19+i*.3,19.8+i*.3)||(manual?1:0);});AR.body.s=Math.max(beat(t,19.4,20.2),manual?1:0);
   // Lift the rain cloud: the final score is under it. Then they help each other up.
   const lift=manual?beat(act,0,.5):beat(t,21.8,23);cloud.flip=-2.7*lift;
   const together=manual?beat(act,.6,1):beat(t,30,32);[...team,AR].forEach(p=>{p.armL.rot=-.12-1.3*together;p.armR.rot=.12+1.3*together;});up.s=together;
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,18.8,19.8):0;
  };
 }};

/* ───────────── 6 · Champion of the world (worldcup) ───────────── */
const worldcup:SpreadDef={id:'worldcup',rest:19.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.9);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.9 ${Z(-2.1)} L-3.9 ${Z(-.6)} L-1.1 ${Z(-.6)} L-1.1 ${Z(-2.1)}`);k.circle(-2.5,Z(-.2),.07,INK.white);caption(k,-2.5,'WORLD CUP FINAL 2018','FRANCE 4, CROATIA 2 · PLAYER OF THE MATCH',INK.yellow,INK.white,.38);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'WORLD CHAMPION','FRANCE’S SECOND WORLD CUP',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'w-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,FRA,2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,FRA,5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const stars=[0,1].map(i=>bd.add(P.disc(`w-star${i}`,.36,'★',INK.yellow,INK.navy),'R',1.8+i*.5,2.45,{out:.03}));
  const conf=bd.add(S.confetti(K+'w-conf',3.6,1.4,6),'R',.4,1.1,{out:.04}),fw=[bd.add(S.firework(K+'w-fw1',.42,INK.yellow),'L',1.2,1.9,{out:.03}),bd.add(S.firework(K+'w-fw2',.38,INK.sky),'R',3.6,2.0,{out:.03})];
  B.stand(S.goal(K+'w-goal',1.9,1.0),-2.5,-1.8,{layer:1});
  const keeper=B.person(K+'w-keep',-2.5,-1.5,1.3,{shirt:'keeper',hair:'short',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const A=B.person(K+'w-a',-2.3,.6,1.2,{shirt:'navy',...ANT,legs:'kick',face:'grin',layer:3});
  const board=B.stand(S.scoreboard(K+'w-board',1.4,1.15,'FINAL'),-4.2,-1.6,{layer:1,s:0});board.add(S.scoreFlap(K+'w-sc',1.1,.52,'FRA','4–2','CRO'),0,.32,{z:.012});
  const pom=B.stand(S.flipCard(K+'w-pom',1.6,.3,'PLAYER OF THE MATCH',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const pole=B.stand(S.post(K+'w-pole',.14,1.3,INK.stock),2.6,-.2,{layer:2,tab:false});const cup=pole.add(S.trophy(K+'w-cup',.6,.8),0,.3,{z:.03});
  const AR=B.person(K+'w-ar',2.0,.4,1.22,{shirt:'navy',...ANT,face:'grin',layer:3});
  const team=[[1.0,.9,'curly',SKINS[4]],[3.2,.9,'short',SKINS[1]],[4.0,.1,'bald',SKINS[3]]].map(([x,z,h,sk],i)=>B.person(K+`w-t${i}`,x as number,z as number,1.2,{shirt:'navy',hair:h as 'short',skin:sk as string,face:'grin',layer:3}));
  const sign=B.stand(S.sign(K+'w-sign',1.4,1.1,'TOO SMALL?',INK.white),4.2,-1.4,{layer:1});const champ=sign.flap(S.flipCard(K+'w-champ',1.4,.46,'WORLD CHAMPION',INK.yellow,INK.navy),0,1.1,{z:.03});
  const done=B.stand(S.flipCard(K+'w-2024',1.5,.3,'FRANCE, UNTIL 2024',INK.white,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'w-ball',.1),-2.5,-.2,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.8):b.t;
   board.s=beat(t,7.8,8.6);A.body.s=beat(t,2.4,3.2);keeper.body.s=beat(t,2.8,3.6);
   // His penalty.
   const pk=11.4;A.leg!.rot=-1.1*pulse(t,pk-.3,pk+.3);const [bx,bz,by]=t<pk?[-2.5,-.2,0]:track(t,[[pk,-2.5,-.2,0],[pk+.5,-3.1,-1.55,.4],[pk+1.2,-3.1,-1.55,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;
   const dive=pulse(t,pk+.1,pk+1.3);keeper.body.rot=.8*dive;keeper.body.dx=-.3*dive*0+.35*dive;pom.s=beat(t,12.8,13.6);cheer(A,beat(t,12.2,12.8));
   stars.forEach((q,i)=>pop(q,beat(t,15+i*.7,15.6+i*.7)));AR.body.s=Math.max(beat(t,16.6,17.4),manual?1:0);team.forEach((p,i)=>{p.body.s=beat(t,17+i*.4,17.8+i*.4);});
   // Raise the trophy.
   const raise=manual?beat(act,0,.6):beat(t,18.4,19.8);cup.dy=-.2+1.0*raise;pop(cup,Math.min(1,.2+raise*2));cheer(AR,raise);
   pop(conf,Math.max(beat(t,20,21.2),manual?beat(act,.6,1):0));fw.forEach((q,i)=>{pop(q,beat(t,20.2+i*.5,21.2+i*.5));q.rot=t*.2;});team.forEach((p,i)=>cheer(p,Math.max(beat(t,20.4+i*.3,21+i*.3),manual?beat(act,.7,1):0)));
   champ.flip=-3.1*Math.max(beat(t,21.6,22.6),manual?beat(act,.6,1):0);done.s=beat(t,26,26.8);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.4,17.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={macon,rejected,scout,border,euro,worldcup};
