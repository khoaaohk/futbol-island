/**
 * The six Ian Wright pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/wright/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The thread is "a teacher who believed": a school door that opens, a reading-lesson flap, two closed club doors,
 * three steps to the top league, a 185 scoreboard and a thank-you frame. His hard home life is shown only as a grey
 * cloud over the street (no people, no detail); the help comes from school and Mr Pigden. Kits are colour only.
 */
import {INK,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,daySky,crowd,lightRig,hills,roofs,skyline,backdrop,plates,wash} from '../spreadKit';

const K='wright-';
const P=plates(K),{sp}=P;
const IW={skin:SKINS[3],hair:'short' as const,hairColor:'#1d1512'};
const PIG={shirt:'casual' as const,hair:'bald' as const,skin:SKINS[0],adult:true};

/* ───────────── Wright-only plates ───────────── */
const club=(key:string,w:number,h:number,name:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.22,w,h*.78);k.fill(b,'#f0e0c0');k.dots(b,INK.orange,.04,.15);k.key(b,.014);const roof=rect(-.02,h*.1,w+.04,h*.14);k.fill(roof,c);k.key(roof,.012);k.text(name,w/2,h*.2,h*.1,INK.white,{weight:900,max:w*.94});k.fill(rect(w*.25,h*.4,w*.5,h*.6),'#5a4a3a');});
const stamp=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.03,c);k.text(label,w/2,h*.72,h*.56,c,{weight:900,max:w*.86});},{rim:.012});
const step=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.18);k.key(b,.014);k.text(label,w/2,h*.34,Math.min(.15,h*.2),INK.navy,{weight:900,max:w*.9});},{rim:.016});
const lesson=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#2f5a4a');k.dots(b,INK.navy,.04,.2);k.key(b,.016);k.text('A  B  C',w/2,h*.36,h*.2,INK.white,{weight:900});k.text('READ',w*.3,h*.72,h*.16,INK.yellow,{weight:900});k.text('WRITE',w*.7,h*.72,h*.16,INK.yellow,{weight:900});});
const thanksPhoto=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{const g=rect(w*.1,h*.1,w*.8,h*.8);k.fill(g,'#ffe6b0');k.dots(g,INK.orange,.04,.2);
 for(const [x,sk,c,tall] of [[.38,SKINS[3],INK.red,.34],[.62,SKINS[0],INK.navy,.3]] as [number,string,string,number][]){k.fill(ell(w*x,h*(.66-tall),w*.07,w*.07),sk);k.key(ell(w*x,h*(.66-tall),w*.07,w*.07),.008);k.fill(rect(w*(x-.08),h*(.72-tall),w*.16,h*tall),c);k.key(rect(w*(x-.08),h*(.72-tall),w*.16,h*tall),.008);}
 k.key(`M${w*.44} ${h*.5} Q${w/2} ${h*.42} ${w*.56} ${h*.5}`,.03,INK.navy);k.text('THANK YOU',w/2,h*.84,h*.1,INK.red,{weight:900});},INK.white);
const coverCard=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{const g=rect(w*.1,h*.1,w*.8,h*.8);k.fill(g,INK.sky);k.dots(g,INK.blue,.04,.25);k.text('2005',w/2,h*.58,h*.2,INK.navy,{weight:900});},'#e9d3a8');

/* ───────────── 1 · A hard start (home) ───────────── */
const home:SpreadDef={id:'home',rest:17.3,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'WOOLWICH · LONDON · 1963','HE GREW UP IN BROCKLEY, WITH HIS MUM, NESTA',INK.red,INK.navy,.38);},
 right:k=>{paving(k,0,5,'#e8dcc2','#b8a888');k.fill(rect(.4,Z(.4),4.2,2.2),INK.grass,.7);caption(k,2.5,'A PLACE OF HELP','SCHOOL, AND FOOTBALL',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'h-bd',k=>{const p=rect(0,0,4.5,3);k.fill(p,'#c9cdd6');k.dots(p,INK.navy,.05,.18);roofs(k,.1,4.4,2.3,1);k.fill(rect(0,2.3,4.5,.7),'#e3d6bb');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#8fae6e');k.fill(rect(0,2.3,4.5,.7),'#e8dcc2');});
  const sun=bd.add(S.sun(K+'h-sun',.3),'R',3.7,2.1,{out:.012});
  B.stand(S.cityBlock(K+'h-city',1.6,1.5),-3.9,-1.7,{layer:1});
  const I=B.person(K+'h-ian',-2.4,.7,.98,{shirt:'casual',...IW,face:'shy',layer:3,holdR:'ball'});
  const mum=B.person(K+'h-mum',-1.4,.0,1.6,{shirt:'coach',hair:'bun',hairColor:'#1d1512',skin:SKINS[3],adult:true,face:'smile',layer:2});
  const born=B.stand(S.flipCard(K+'h-born',1.1,.3,'BORN 1963',INK.yellow,INK.navy),-3.9,1.95,{layer:3,s:0,tab:false});
  const cloudPost=B.stand(S.post(K+'h-cp',.1,1.3,INK.stock),-3.0,-.8,{layer:2,tab:false});const cloud=cloudPost.add(S.cloud(K+'h-cloud',1.2,.6),0,1.1,{z:.03,anchor:'center'});
  const hard=B.stand(S.flipCard(K+'h-hard',1.8,.3,'HOME WAS NOT ALWAYS HAPPY',INK.sky,INK.navy),-1.6,1.95,{layer:3,s:0,tab:false});
  const school=B.stand(S.house(K+'h-school',1.8,1.6),1.6,-1.5,{layer:1});school.add(P.lineCard('h-sign',1.2,.26,['SCHOOL'],INK.yellow),0,1.62,{z:.03});
  const inside=school.add(sp(K+'h-in',.62,.78,k=>{const b=rect(0,0,.62,.78);k.fill(b,'#ffe6b0');k.key(b,.01);k.fill(ell(.31,.3,.08,.08),SKINS[0]);k.fill(rect(.22,.38,.18,.3),INK.pink);}),0,.02,{z:.015});
  const door=school.flap(P.doorway('h-door',.64,.8,INK.blue),-.32,.02,{anchor:'bl',axis:'y',z:.03});
  const IR=B.person(K+'h-ir',2.4,.6,1.0,{shirt:'casual',...IW,legs:'kick',face:'grin',layer:3});
  B.stand(S.goal(K+'h-goal',1.4,.8),4.1,-.8,{layer:2});
  const happy=B.stand(S.flipCard(K+'h-happy',1.6,.3,'A PLACE TO BE HAPPY',INK.yellow,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  const help=B.stand(S.flipCard(K+'h-help',1.3,.3,'PEOPLE WHO HELP',INK.pink),1.4,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'h-ball',.1),2.75,.7,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.3):b.t;
   I.body.s=beat(t,2,2.8);born.s=beat(t,3,3.8);mum.body.s=beat(t,10.6,11.4);mum.armR.rot=.12+.8*beat(t,11.4,12.2);
   pop(cloud,beat(t,15,15.8)*(1-(manual?beat(act,.2,.5):beat(t,19,20))));hard.s=beat(t,15.6,16.4);
   // Open the school door.
   const open=manual?beat(act,0,.5):beat(t,18.6,19.8);door.flip=-2.4*open;pop(inside,Math.max(.02,open));sun.dy=.3*open;help.s=Math.max(beat(t,20.4,21.2),manual?beat(act,.4,.8):0);
   IR.body.s=Math.max(beat(t,25,25.8),manual?beat(act,.6,1):0);const sh=27;IR.leg!.rot=-1.1*pulse(t,sh-.3,sh+.3);
   const [bx,bz,by]=t<sh?[2.75,.7,0]:track(t,[[sh,2.75,.7,0],[sh+.6,3.6,-.3,.35],[sh+1.1,4.1,-.7,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=IR.body.s>.5;
   cheer(IR,Math.max(beat(t,28.2,28.8),manual?beat(act,.95,1):0));happy.s=beat(t,26,26.8);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.6,18.6):0;
  };
 }};

/* ───────────── 2 · Mr Pigden (pigden) ───────────── */
const pigden:SpreadDef={id:'pigden',rest:14.8,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'PRIMARY SCHOOL','HIS TEACHER, SYDNEY PIGDEN',INK.navy);},
 right:k=>{floor(k,0,5,'#e0c49a','#b08a5c');caption(k,2.5,'SOMEONE BELIEVED IN HIM','HE HELPED IAN LEARN TO READ AND WRITE',INK.pink,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'p-bd',k=>{wash(k,4.5,3,'#f6e2b8',INK.orange,()=>.14);const w=rect(2.8,.4,1.3,1.0);k.fill(w,INK.sky2);k.key(w,.014);k.key('M3.45 .4 L3.45 1.4 M2.8 .9 L4.1 .9',.02,INK.white);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{wash(k,4.5,3,'#f6e2b8',INK.orange,()=>.14);for(let i=0;i<3;i++){const f=rect(.5+i*1.3,.5,.9,.6);k.fill(f,INK.white);k.key(f,.012);k.text(['A','B','C'][i],.95+i*1.3,.98,.4,[INK.red,INK.blue,INK.green][i],{weight:900});}k.fill(rect(0,2.4,4.5,.6),'#e0c49a');});
  const plane=bd.add(S.plane(K+'p-plane',.8,.4),'L',.6,2.2,{out:.03});
  const pilot=B.stand(S.flipCard(K+'p-pilot',1.6,.3,'ONCE, A WARTIME PILOT',INK.sky,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const pig=B.person(K+'p-pig',-2.8,-.2,1.64,{...PIG,face:'smile',layer:2});
  const kids=[[-4.2,.7,'bun',SKINS[0]],[-1.0,.6,'curly',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`p-k${i}`,x as number,z as number,.96,{shirt:i?'fan':'bib',hair:h as 'bun',skin:sk as string,face:'smile',layer:3}));
  const I=B.person(K+'p-ian',-2.2,.9,.98,{shirt:'casual',...IW,face:'shy',layer:3});
  const noticed=B.stand(S.flipCard(K+'p-not',1.4,.3,'HE NOTICED IAN',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const stand=B.stand(S.post(K+'p-stand',1.7,1.2,'#d9cfb8'),2.0,-1.3,{layer:1});
  stand.add(lesson(K+'p-lesson',1.56,1.0),0,.1,{z:.012});const flap=stand.flap(P.frame('p-cover',1.62,1.06,k=>{k.text('LIFT',.81,.5,.18,INK.navy,{weight:900});k.text('THE FLAP',.81,.76,.16,INK.navy,{weight:900});},INK.stock),0,1.18,{z:.04});
  const pigR=B.person(K+'p-pigr',3.6,-.2,1.64,{...PIG,face:'grin',layer:2});
  const IR=B.person(K+'p-ir',2.6,.6,1.0,{shirt:'casual',...IW,face:'grin',layer:3});
  const book=IR.body.add(P.frame('p-book',.4,.3,k=>{k.key('M.2 0 L.2 .3',.01,INK.edge);},INK.white),.25,.6,{z:.03,anchor:'center'});
  const believe=B.stand(S.flipCard(K+'p-bel',1.7,.3,'ONE GROWN-UP CAN HELP',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.8):b.t;
   pig.body.s=beat(t,2.2,3);kids.forEach((p,i)=>{p.body.s=beat(t,3+i*.4,3.8+i*.4);});I.body.s=beat(t,3.6,4.4);
   plane.dx=2.0*beat(t,6.6,10.4);pop(plane,beat(t,6.4,7)*(1-beat(t,10.6,11)));pilot.s=beat(t,7,7.8);
   pig.armR.rot=.12+1.0*beat(t,12,12.8);I.body.rot=0;noticed.s=beat(t,12.6,13.4);
   // Lift the flap: a reading lesson.
   const lift=manual?beat(act,0,.5):beat(t,16,17.2);flap.flip=-2.8*lift;
   pigR.body.s=Math.max(beat(t,17.6,18.4),manual?beat(act,.3,.6):0);IR.body.s=Math.max(beat(t,17.8,18.6),manual?beat(act,.4,.7):0);pop(book,Math.max(beat(t,18.6,19.2),manual?beat(act,.6,.8):0));
   pigR.armL.rot=-.12-1.0*beat(t,23,24);believe.s=Math.max(beat(t,27.4,28.2),manual?beat(act,.9,1):0);cheer(IR,beat(t,28,28.6));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,15,16):0;
  };
 }};

/* ───────────── 3 · Two trials, two noes (trials) ───────────── */
const trials:SpreadDef={id:'trials',rest:15.2,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'TRIALS AS A TEENAGER','SOUTHEND UNITED AND BRIGHTON SAID NO',INK.navy,INK.navy,.4);},
 right:k=>{pitchLines(k,0,5,2.6,'#9dbd78',INK.green);caption(k,2.5,'SUNDAY LEAGUE','TOP SCORER IN HIS LEAGUE',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'t-bd',k=>{daySky(k,4.5,3);roofs(k,.1,4.4,2.2,1);k.fill(rect(0,2.2,4.5,.8),'#e3d6bb');},k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#86ad78');k.fill(rect(0,2.3,4.5,.7),'#9dbd78');});
  const clubs:[string,string,number][]=[['SOUTHEND',INK.blue,-3.6],['BRIGHTON',INK.sky,-1.4]];
  const halls=clubs.map(([n,c,x],i)=>B.stand(club(K+`t-c${i}`,1.8,1.5,n,c),x,-1.3,{layer:1}));
  const doors=halls.map((h,i)=>h.flap(P.doorway(`t-d${i}`,.9,.88,INK.red),-.45,0,{anchor:'bl',axis:'y',z:.02}));
  const nos=clubs.map(([, ,x],i)=>B.stand(stamp(K+`t-no${i}`,.6,.34,'NO',INK.red),x,-.2,{layer:2,s:0,tab:false}));
  const I=B.person(K+'t-ian',-4.4,.7,1.14,{shirt:'casual',...IW,face:'smile',layer:3,holdR:'ball'});
  const sad=I.body.add(P.faceCard('t-sad',.3,'sad',INK.sky),.3,1.36,{z:-.02,anchor:'center'});
  const over=B.stand(S.flipCard(K+'t-over',1.6,.3,'IS THE DREAM OVER?',INK.sky,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'t-goal',1.7,.9),3.9,-1.5,{layer:1});
  const keeper=B.person(K+'t-keep',3.9,-1.2,1.3,{shirt:'keeper',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const IR=B.person(K+'t-ir',1.4,.6,1.16,{shirt:'fan',...IW,legs:'kick',face:'grin',layer:3});
  const mates=[[2.4,-.4,'curly',SKINS[1]],[.6,-.6,'bald',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`t-m${i}`,x as number,z as number,1.24,{shirt:'fan',hair:h as 'curly',skin:sk as string,adult:true,face:'grin',layer:2}));
  const top=B.stand(S.flipCard(K+'t-top',1.3,.3,'TOP SCORER',INK.yellow,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const better=B.stand(S.flipCard(K+'t-better',1.6,.3,'BETTER EVERY WEEK',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'t-ball',.1),1.75,.7,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.2):b.t;
   I.body.s=beat(t,2.6,3.4);const walk=beat(t,3.6,8.6);I.body.x=-4.4+2.6*walk;nos.forEach((q,i)=>{q.s=beat(t,[9,10][i],[9.6,10.6][i]);});
   // Knock on the doors: two taps; they rattle but stay shut.
   const k1=manual?beat(act,0,.5):beat(t,16.4,17.2),k2=manual?beat(act,.5,1):beat(t,17.4,18.2);doors[0].flip=-.25*pulse(k1,0,.5)-.25*pulse(k1,.5,1);doors[1].flip=-.25*pulse(k2,0,.5)-.25*pulse(k2,.5,1);
   I.armL.rot=-.12-1.4*Math.max(pulse(k1,0,1),pulse(k2,0,1));pop(sad,beat(t,12,12.6)*(1-beat(t,17.6,18.2)));over.s=beat(t,12.2,13)*(1-beat(t,18,18.6));
   IR.body.s=Math.max(beat(t,18.4,19.2),manual?beat(act,.6,1):0);keeper.body.s=beat(t,18.6,19.4);mates.forEach((p,i)=>{p.body.s=beat(t,19+i*.4,19.8+i*.4);});
   const shots=[20.4,22.6,25.4];IR.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));let [bx,bz,by]=[1.75,.7,0];for(const a of shots)if(t>a&&t<a+1.4)[bx,bz,by]=track(t,[[a,1.75,.7,0],[a+.7,3.8,-1.3,.35],[a+1.4,1.75,.7,0]]);
   ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=IR.body.s>.5;keeper.body.rot=.5*maxOf(shots.map(a=>pulse(t,a+.3,a+1.1)));
   top.s=beat(t,22.4,23.2);better.s=beat(t,25.2,26);cheer(IR,beat(t,23,23.6)*(1-beat(t,25,25.4))+beat(t,26.4,27)*.8);mates.forEach((p,i)=>cheer(p,beat(t,23.2+i*.3,23.8+i*.3)*(1-beat(t,25,25.4))));
   return b.narrated?-.4*beat(t,2.2,3.2)+.8*beat(t,17.8,18.8):0;
  };
 }};

/* ───────────── 4 · A late start (palace) ───────────── */
const palace:SpreadDef={id:'palace',rest:14.4,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'AUGUST 1985 · AGED 21','HE SIGNED FOR CRYSTAL PALACE',INK.red);},
 right:k=>{paving(k,0,5,'#efe0c0','#c2ab82');caption(k,2.5,'UP TO THE TOP LEAGUE','1989: 24 LEAGUE GOALS',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'c-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.5,2.45,[INK.red,INK.blue,INK.white],1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#86ad78');skyline(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#efe0c0');});
  const gb=B.stand(S.sign(K+'c-gb',1.6,1.1,'GREENWICH BOROUGH',INK.green),-4.0,-1.5,{layer:1,s:0});
  const cp=B.stand(S.sign(K+'c-cp',1.5,1.1,'CRYSTAL PALACE',INK.red),-1.8,-1.5,{layer:1,s:0});
  const I=B.person(K+'c-ian',-2.8,.5,1.26,{shirt:'fan',...IW,face:'grin',layer:3});
  const pen=B.stand(P.lineCard('c-pen',1.0,.42,['SIGNED!'],INK.yellow),-1.4,.9,{layer:3,s:0,tab:false});
  const young=B.stand(S.flipCard(K+'c-young',1.8,.3,'MOST START MUCH YOUNGER',INK.sky,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const steps=[['GREENWICH',.45],['PALACE',.8],['TOP LEAGUE',1.15]].map(([l,h],i)=>B.stand(step(K+`c-s${i}`,1.05,h as number,l as string,[INK.grass,INK.red,INK.yellow][i]),1.0+i*1.1,-.6,{layer:2}));
  const IR=B.person(K+'c-ir',.4,.4,1.2,{shirt:'fan',...IW,face:'grin',layer:3});
  const goals=B.stand(S.noteCard(K+'c-24',.7,.56,['24']),4.4,.7,{layer:3,s:0,tab:false});
  const never=B.stand(S.flipCard(K+'c-never',1.6,.3,'NEVER TOO LATE',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.4):b.t;
   gb.s=beat(t,2.2,3);I.body.s=beat(t,2.4,3.2)*(1-beat(t,13.6,14.2));cp.s=beat(t,6,6.8);pop(pen,beat(t,7.6,8.4));cheer(I,beat(t,8,8.6)*(1-beat(t,11,11.6)));young.s=beat(t,12,12.8);
   // Climb the steps: three taps, three steps up.
   const st=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,15.6+i*1.2,16.4+i*1.2));
   IR.body.s=Math.max(beat(t,14,14.8),manual?1:0);const n=st.reduce((a,v)=>a+v,0),f=Math.floor(n),lv=[0,.45,.8,1.15,1.15];
   IR.body.x=.4+1.1*n;IR.body.dy=lv[f]+(n%1)*(lv[f+1]-lv[f])+.25*Math.sin((n%1)*Math.PI);IR.body.z=.4-.75*Math.min(1,n);
   steps.forEach((q,i)=>{q.rot=.04*pulse(st[i],.3,.9);});pop(goals,Math.max(beat(t,20.6,21.4),manual?beat(act,.85,1):0));cheer(IR,Math.max(beat(t,21,21.6),manual?beat(act,.9,1):0));never.s=beat(t,27.6,28.4);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,14,15):0;
  };
 }};

/* ───────────── 5 · Goals for Arsenal (arsenal) ───────────── */
const arsenal:SpreadDef={id:'arsenal',rest:20.3,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1991 · ARSENAL','AND GAMES FOR ENGLAND TOO',INK.red);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'185 GOALS','FA CUP · LEAGUE CUP · LEAGUE TITLE',INK.red,INK.navy);},
 build:B=>{
  const bd=backdrop(B,K+'a-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[INK.red,INK.white,INK.red],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[INK.red,INK.white,INK.red],5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const conf=bd.add(S.confetti(K+'a-conf',3.6,1.4,6),'R',.4,1.1,{out:.04});
  const ars=B.stand(S.sign(K+'a-ars',1.3,1.1,'ARSENAL',INK.red),-4.0,-1.5,{layer:1,s:0});
  B.stand(S.goal(K+'a-goal',1.8,.95),-2.0,-1.8,{layer:1});
  const keeper=B.person(K+'a-keep',-2.0,-1.5,1.3,{shirt:'keeper',hair:'short',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const I=B.person(K+'a-ian',-2.4,.5,1.26,{shirt:'casual',...IW,legs:'kick',face:'grin',layer:3});
  const most=B.stand(S.flipCard(K+'a-most',1.8,.3,'MORE THAN ANYONE BEFORE',INK.yellow,INK.navy),-3.5,1.95,{layer:3,s:0,tab:false});
  const fee=B.stand(S.flipCard(K+'a-fee',1.4,.3,'A RECORD FEE',INK.pink),-1.2,1.95,{layer:3,s:0,tab:false});
  const board=B.stand(S.scoreboard(K+'a-board',1.6,1.25,'ARSENAL GOALS'),1.6,-1.4,{layer:1});
  board.add(S.noteCard(K+'a-185',1.3,.56,['185']),0,.34,{z:.012});const cover=board.flap(S.noteCard(K+'a-184',1.34,.6,['184']),0,.92,{z:.03});
  const cups=['FA CUP','LEAGUE CUP','LEAGUE'].map((l,i)=>B.stand(S.trophy(K+'a-cup',.42,.56),3.3+i*.55,.3+(i%2)*.3,{layer:3,s:0,tab:false}));
  const IR=B.person(K+'a-ir',1.0,.6,1.28,{shirt:'casual',...IW,face:'grin',layer:3});
  const best=B.stand(S.flipCard(K+'a-best',1.7,.3,'ONE OF THE BEST',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'a-ball',.1),-2.2,-.1,{layer:2,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.3):b.t;
   ars.s=beat(t,2,2.8);I.body.s=beat(t,2.4,3.2);keeper.body.s=beat(t,2.8,3.6);
   const shots=[7.6,9,10.4];I.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.25,a+.25)));let [bx,bz,by]=[-2.2,-.1,0];
   for(const [i,a] of shots.entries())if(t>a&&t<a+.9)[bx,bz,by]=track(t,[[a,-2.2,-.1,0],[a+.5,-2.0+(i-1)*.6,-1.6,.35],[a+.9,-2.2,-.1,0]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>7&&t<12;
   keeper.body.rot=.5*maxOf(shots.map((a,i)=>pulse(t,a+.1,a+.8)*(i%2?1:-1)));most.s=beat(t,8.4,9.2);cheer(I,beat(t,11,11.6)*(1-beat(t,17,17.6)));fee.s=beat(t,18.2,19);
   // Flip the scoreboard: 184 turns over to 185.
   const flip=manual?beat(act,0,.6):beat(t,21.6,22.8);cover.flip=-3.0*flip;IR.body.s=Math.max(beat(t,21.4,22.2),manual?beat(act,.3,.6):0);cheer(IR,Math.max(beat(t,22.8,23.4),manual?beat(act,.6,.9):0));
   cups.forEach((q,i)=>pop(q,Math.max(beat(t,23.6+i*1.2,24.4+i*1.2),manual?beat(act,.5+i*.15,.65+i*.15):0)));pop(conf,Math.max(beat(t,24,25.2),manual?beat(act,.8,1):0));best.s=beat(t,28.2,29);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,20.6,21.6):0;
  };
 }};

/* ───────────── 6 · Thank you, Mr Pigden (thanks) ───────────── */
const thanks:SpreadDef={id:'thanks',rest:19.6,
 left:k=>{floor(k,-5,0,'#3b4a7e','#22366b');caption(k,-2.5,'2005 · ON BBC TELEVISION','HIS OLD TEACHER WALKED IN',INK.yellow,INK.white);},
 right:k=>{floor(k,0,5);caption(k,2.5,'THANK YOU, MR PIGDEN','IAN DEDICATED HIS 2016 LIFE STORY TO HIM',INK.red,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{const p=rect(0,0,4.5,3);k.fill(p,'#2d3f73');k.dots(p,INK.blue,.05,.3);lightRig(k,.8,.3);lightRig(k,2.25,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.4,4.5,.6),'#3b4a7e');},
   k=>{wash(k,4.5,3,'#f6e2b8',INK.orange,()=>.14);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');});
  const I=B.person(K+'s-ian',-3.0,.4,1.6,{shirt:'casual',...IW,adult:true,face:'smile',layer:3});
  const P2=B.person(K+'s-pig',-.6,.0,1.52,{...PIG,face:'grin',layer:3});
  const tears=I.body.add(S.bubble(K+'s-heart',.46,.4,'heart'),.5,1.8,{z:-.02});
  const told=B.stand(S.flipCard(K+'s-told',1.8,.3,'HE THOUGHT HE HAD DIED',INK.sky,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const happy=B.stand(S.flipCard(K+'s-happy',1.6,.3,'SO HAPPY, HE CRIED',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const stand=B.stand(S.post(K+'s-stand',1.5,1.3,'#d9cfb8'),1.6,-1.2,{layer:1});
  stand.add(thanksPhoto(K+'s-photo',1.36,1.1),0,.12,{z:.012});const cover=stand.flap(coverCard(K+'s-cover',1.42,1.16),0,1.28,{z:.04});
  const bookP=B.stand(sp(K+'s-book',.9,1.2,k=>{const b=rect(0,0,.9,1.2);k.fill(b,INK.red);k.dots(b,INK.navy,.035,.3);k.key(b,.016);k.fill(rect(0,0,.09,1.2),INK.navy);k.text('MY',.5,.36,.14,INK.white,{weight:900});k.text('STORY',.5,.54,.14,INK.white,{weight:900});k.text('FOR MR',.5,.84,.1,INK.yellow,{weight:900});k.text('PIGDEN',.5,.98,.1,INK.yellow,{weight:900});}),3.6,-.8,{layer:2,s:0});
  const never=B.stand(S.flipCard(K+'s-never',1.6,.3,'HE NEVER FORGOT',INK.pink),3.4,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   I.body.s=beat(t,2.2,3);told.s=beat(t,3.2,4);
   const walk=beat(t,7,10.4);P2.body.s=beat(t,6.6,7.4);P2.body.x=-.6-1.4*walk;
   pop(tears,beat(t,13.4,14)*(1-beat(t,19,19.6)));happy.s=beat(t,13.6,14.4);
   const hug=beat(t,16,17);I.armR.rot=.12+1.3*hug;I.armL.rot=-.12-.4*hug;P2.armL.rot=-.12-1.3*hug;P2.armR.rot=.12+.4*hug;
   // Lift the photo frame: the thank-you picture.
   const lift=manual?beat(act,0,.6):beat(t,21,22.2);cover.flip=-2.8*lift;
   bookP.s=Math.max(beat(t,23.2,24),manual?beat(act,.5,.9):0);never.s=Math.max(beat(t,29.6,30.4),manual?beat(act,.9,1):0);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,20.2,21.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={home,pigden,trials,palace,arsenal,thanks};
