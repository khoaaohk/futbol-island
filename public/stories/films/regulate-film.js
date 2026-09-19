(()=>{
/* TWO GAMES. Original, layered Canvas artwork derived from the supplied boards.
   The source packs are flattened low-resolution crops, so silhouettes, field,
   characters and emotion shapes are rebuilt as sharp geometry. Offline only. */
const C={blue:'#0759ef',navy:'#092635',pink:'#fa79c9',orange:'#ff5424',yellow:'#ffc735',cream:'#fff0d1',green:'#047849',dark:'#034c3e',skin:'#f88b58',hair:'#081b28'};
const sat=x=>clamp(x,0,1),smooth=x=>{x=sat(x);return x*x*(3-2*x)},phase=(a,b,t)=>smooth((t-a)/(b-a));
const rand=rng(431);const plate=document.createElement('canvas');plate.width=384;plate.height=384;const pc=plate.getContext('2d');for(let i=0;i<15000;i++){pc.fillStyle=i%3?'rgba(255,240,210,.12)':'rgba(0,20,30,.17)';pc.fillRect(rand()*384,rand()*384,rand()*1.8+.3,rand()*1.4+.3)}let pattern;
function paint(c,p,color){c.fillStyle=color;c.fill(p);c.save();c.clip(p);c.fillStyle=pattern;c.fillRect(-2600,-2600,5200,5200);c.restore()}
function poly(c,pts,col){const p=new Path2D();pts.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();paint(c,p,col)}
function oval(c,x,y,rx,ry,col,a=0){const p=new Path2D();p.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),a,0,TAU);paint(c,p,col)}
function stroke(c,pts,width,col){c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function curve(c,pts,width,col){c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(...pts[0]);c.bezierCurveTo(...pts[1],...pts[2],...pts[3]);c.stroke()}
function leaf(c,x,y,s,a,col){c.save();c.translate(x,y);c.rotate(a);const p=new Path2D();p.moveTo(0,0);p.bezierCurveTo(s*.2,-s*.65,s*.85,-s*.7,s,0);p.bezierCurveTo(s*.5,s*.35,s*.1,s*.4,0,0);paint(c,p,col);stroke(c,[[0,0],[s,0]],1.5,'#c1cb69');c.restore()}
function palm(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);curve(c,[[0,0],[6,-90],[22,-155],[32,-200]],8,C.navy);for(let i=0;i<7;i++)leaf(c,32,-200,100,-3+i*.51+Math.sin(t*.4)*.03,i%2?C.dark:C.navy);c.restore()}
function cloud(c,x,y,s){oval(c,x,y,70*s,23*s,C.cream);oval(c,x-24*s,y-14*s,31*s,30*s,C.cream);oval(c,x+16*s,y-21*s,36*s,36*s,C.cream)}
function ribbon(c,t,i,col,dark){const p=new Path2D();const drift=Math.sin(t*.2+i)*30;p.moveTo(-2100,-1800+i*240);p.bezierCurveTo(-600,-1400+i*250+drift,-350,-450+i*140,1900,-500+i*220);p.lineTo(2100,-180+i*220);p.bezierCurveTo(-400,-280+i*160,-780,-1250+i*250+drift,-2200,-1400+i*240);p.closePath();paint(c,p,col)}
function world(c,t,mood=0){poly(c,[[-3000,-2500],[3000,-2500],[3000,160],[-3000,160]],mix(C.blue,C.navy,mood));[C.cream,C.pink,C.orange,C.green].forEach((col,i)=>ribbon(c,t,i,mix(col,C.navy,mood*.85)));oval(c,260,-430,142,142,mix(C.yellow,'#4a6571',mood));cloud(c,-380+Math.sin(t*.1)*35,-380,.75);cloud(c,520,-170,.45);
for(let i=0;i<21;i++){const x=-1160+i*116,h=95+i*63%160,w=48+i*13%40;poly(c,[[x,85],[x,-h],[x+w*.3,-h-22*(i%3===0)],[x+w*.7,-h-22*(i%3===0)],[x+w,-h+14*(i%2)],[x+w,85]],mix(i%2?C.pink:'#788bd1',C.navy,mood*.6));for(let k=0;k<4;k++)for(let j=0;j<2;j++)poly(c,[[x+12+j*20,-h+35+k*28],[x+17+j*20,-h+35+k*28],[x+17+j*20,-h+42+k*28],[x+12+j*20,-h+42+k*28]],C.cream)}
for(let i=0;i<16;i++){const x=-1500+i*205;oval(c,x,60,140,55+i*23%80,i%2?C.dark:C.green)}
palm(c,-470,115,.9,t);palm(c,510,110,.7,t);
for(const x of [-670,690]){stroke(c,[[x,95],[x,-335]],9,C.navy);for(let r=0;r<3;r++)for(let j=0;j<3;j++)oval(c,x-20+j*20,-330+r*22,7,9,C.cream)}
poly(c,[[-3000,110],[3000,110],[3000,2600],[-3000,2600]],mix(C.green,C.navy,mood*.4));for(let i=-10;i<10;i++)poly(c,[[i*160,110],[(i+1)*160,110],[(i+1)*450,1600],[i*450,1600]],i%2?'rgba(5,43,46,.21)':'rgba(166,183,69,.15)');curve(c,[[-1400,900],[-650,50],[650,50],[1400,900]],5,C.cream);stroke(c,[[0,110],[0,1600]],4,C.cream);c.save();c.scale(1,.33);c.strokeStyle=C.cream;c.lineWidth=5;c.beginPath();c.ellipse(0,980,280,280,0,0,TAU);c.stroke();c.restore();}
function ball(c,x,y,s,t){c.save();c.translate(x,y);c.rotate(t);oval(c,0,0,s,s,C.cream);c.beginPath();c.arc(0,0,s,0,TAU);c.clip();for(let j=0;j<6;j++){const a=j*TAU/5,r=j===5?0:s*.77;poly(c,Array.from({length:5},(_,k)=>[Math.cos(a)*r+Math.cos(k*TAU/5+a)*s*.31,Math.sin(a)*r+Math.sin(k*TAU/5+a)*s*.31]),C.hair)}c.restore()}
function scribble(c,t,x,y,s,calm=0){c.save();c.translate(x,y);c.scale(s,s);for(let k=0;k<5;k++){c.strokeStyle=mix(C.orange,'#74d8de',calm);c.lineWidth=3;c.beginPath();for(let i=0;i<=100;i++){const a=i/100*TAU,r=45+Math.sin(a*(3+k)+t*2)*17*(1-calm);const xx=Math.cos(a+t*.2+k)*r,yy=Math.sin(a*1.3+k)*r*.8;i?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke()}c.restore()}
function particles(c,t,kind){for(let i=0;i<25;i++){const x=Math.sin(i*27.1)*600+Math.sin(t*.3+i)*18,y=300-((t*23+i*79)%1000);if(kind==='leaf')leaf(c,x,y,15,i+t*.2,i%2?C.green:C.yellow);else oval(c,x,y,2+i%3,2+i%3,C.yellow)}}
function emotionPicture(c,kind,u,t){
 if(kind==='frustration'){
  poly(c,[[-3000,-2500],[3000,-2500],[3000,2500],[-3000,2500]],C.navy);
  const press=20+Math.sin(t*1.4)*15;
  poly(c,[[-1500,-1400],[-140-press,-900],[-200-press,-100],[-120-press,180],[-225-press,1400],[-1500,1400]],C.orange);
  poly(c,[[1500,-1400],[200+press,-900],[125+press,-80],[220+press,190],[145+press,1400],[1500,1400]],C.pink);
  const points=[[-180,-160],[-75,-75],[-155,10],[-30,95],[-100,210],[50,125],[140,240],[95,60],[190,-20],[85,-95],[135,-210]];
  stroke(c,points.map(([x,y],k)=>[x+Math.sin(t*1.3+k)*8,y+45]),22,C.yellow);
  for(let k=0;k<9;k++){const a=k*TAU/9,r=280+Math.sin(t+k)*14;c.save();c.translate(Math.cos(a)*r,40+Math.sin(a)*r);c.rotate(a);poly(c,[[-27,-11],[25,-17],[10,16],[-18,24]],k%2?C.cream:C.blue);c.restore()}
 }else if(kind==='fear'){
  poly(c,[[-3000,-2500],[3000,-2500],[3000,2500],[-3000,2500]],'#051b37');
  for(let k=6;k>=0;k--){const r=100+k*66+Math.sin(t*.6+k*.5)*8;const p=new Path2D();p.moveTo(-r,1000);p.lineTo(-r,45);p.bezierCurveTo(-r,-r,r,-r,r,45);p.lineTo(r,1000);p.closePath();paint(c,p,k%2?'#123a73':'#0b2851')}
  // A small wavering light under large shadow arches conveys vulnerability.
  const light=30+Math.sin(t*1.5)*4;oval(c,Math.sin(t*.8)*8,65,light,light*1.4,C.yellow);
  for(let k=0;k<4;k++){c.save();c.globalAlpha=.18;oval(c,0,65,light+22+k*16,(light+22+k*16)*1.2,C.blue);c.restore()}
 }else{
  poly(c,[[-3000,-2500],[3000,-2500],[3000,2500],[-3000,2500]],C.orange);
  for(let ring=2;ring>=0;ring--){const radius=150+ring*115+Math.sin(t*1.3)*14;const pts=Array.from({length:24},(_,k)=>{const a=k*TAU/24+t*.09*(ring%2?1:-1),r=radius*(k%2?.62:1);return[Math.cos(a)*r,40+Math.sin(a)*r]});poly(c,pts,[C.yellow,C.navy,C.pink][ring])}
  oval(c,0,40,67+Math.sin(t*1.3)*7,67+Math.sin(t*1.3)*7,C.orange);
 }
}
function abstract(c,index,u,t){
if(index===2){emotionPicture(c,'frustration',u,t);return;}
if(index===3){emotionPicture(c,'fear',u,t);const anger=phase(TWO_GAMES_EMOTIONS.anger-.18,TWO_GAMES_EMOTIONS.anger+.3,t);if(anger>0){c.save();c.globalAlpha*=anger;emotionPicture(c,'anger',u,t);c.restore();}return;}
const calm=[8,9,10,11,12,13,15,17].includes(index),base=calm?C.blue:C.navy;
poly(c,[[-3000,-2500],[3000,-2500],[3000,2500],[-3000,2500]],base);
for(let j=0;j<5;j++)ribbon(c,t*.35,j,[C.navy,C.green,C.pink,C.orange,C.blue][(j+index)%5],0);
// A living collage, with paper shapes continuing beyond all screen edges.
if([5,7].includes(index)){
 oval(c,0,40,255,255,index===5?C.cream:'#102f44');
 for(let k=0;k<6;k++){
  const p=new Path2D();for(let q=0;q<=180;q++){const relax=index===7?phase(.25,1,u):0,a=q/180*TAU,r=125+k*8+Math.sin(a*(3+k%3)+t*.5+k)*53*(1-relax);const x=Math.cos(a+k*.6)*r,y=40+Math.sin(a*(1.12-relax*.12)+k*(.3+relax*.3))*r;q?p.lineTo(x,y):p.moveTo(x,y)}
  c.strokeStyle=[C.orange,C.pink,C.yellow][k%3];c.lineWidth=9-k*.65;c.stroke(p);
 }
 if(index===7){const open=phase(0,1,u);oval(c,0,40,42+open*54,42+open*54,C.cream);oval(c,0,40,14,22,C.navy)}
 if(index===3)for(let k=0;k<7;k++){const a=k*TAU/7; c.save();c.translate(Math.cos(a)*295,40+Math.sin(a)*295);c.rotate(a);poly(c,[[0,-30],[44,-10],[20,3],[60,37],[-15,11],[6,-3]],k%2?C.pink:C.orange);c.restore()}
}else if(index===6){
 const colors=[C.orange,C.pink,C.yellow];for(let k=0;k<3;k++){const a=k*TAU/3+t*.16,r=115+Math.sin(t*.8+k)*22;oval(c,Math.cos(a)*r,35+Math.sin(a)*r,135+Math.sin(t+k)*12,165,colors[k],a)}oval(c,0,35,40+u*25,40+u*25,C.cream);
}else if(index===8){
 const space=55+u*110;oval(c,-space,35,155,245,C.pink,-.18);oval(c,space,35,155,245,C.green,.18);
 const p=new Path2D();p.moveTo(0,-180);p.bezierCurveTo(85,-40,85,130,0,270);p.bezierCurveTo(-85,130,-85,-40,0,-180);paint(c,p,C.cream);
 for(let k=0;k<4;k++){const x=(k-1.5)*85;oval(c,x,340+Math.sin(t*.8+k)*10,6,6,C.yellow)}
}else if(index===9){
 const breathe=.5+.5*Math.sin(t*.9);oval(c,0,35,125+breathe*35,125+breathe*35,C.cream);
 for(let k=0;k<4;k++){const r=185+k*57+breathe*14;c.strokeStyle=[C.yellow,C.pink,'#63d2c0',C.cream][k];c.lineWidth=17-k*3;c.beginPath();c.ellipse(0,35,r,r,0,0,TAU);c.stroke()}
 for(let side of [-1,1])for(let k=0;k<3;k++)leaf(c,side*(140+k*60),350-k*45,85,side<0?-2.5:-.65,C.green);
}else if(index===10){
 oval(c,0,30,270,270,C.cream);poly(c,[[-280,300],[-80,40],[-220,-150],[-130,-210],[0,-30],[140,-210],[230,-150],[80,40],[290,300]],C.yellow);
 poly(c,[[-255,205],[-95,20],[-190,-95],[-250,-35],[-320,-205],[-120,-170],[-175,-120],[-28,28],[-175,250]],C.blue);
 poly(c,[[175,250],[28,28],[175,-120],[120,-170],[320,-205],[250,-35],[190,-95],[95,20],[255,205]],C.green);
}else if(index===11){
 const focus=.35+.65*smooth(u);oval(c,0,30,225,225,C.navy);
 for(let k=0;k<12;k++){const a=k*TAU/12,r=255-focus*140; c.save();c.translate(Math.cos(a)*r,30+Math.sin(a)*r);c.rotate(a+t*.08);poly(c,[[-50,-20],[15,-35],[70,0],[15,35],[-50,20],[0,0]],[C.yellow,C.cream,C.pink][k%3]);c.restore()}
 oval(c,0,30,42,42,C.yellow);
}else if(index===12){
 oval(c,90,-100,230,230,C.yellow);for(let k=0;k<5;k++)poly(c,[[-800+k*270,430],[-480+k*240,-190-k%2*90],[-130+k*280,430]],[C.navy,C.green,C.blue,C.dark,C.green][k]);poly(c,[[-80,450],[50,180],[100,70],[140,180],[15,450]],C.cream);particles(c,t,'leaf');
}else if(index===13){
 const approach=phase(0,.7,u);oval(c,-148+approach*50,30,184,230,C.pink,-.3);oval(c,148-approach*50,30,184,230,C.yellow,.3);
 c.save();c.globalCompositeOperation='source-over';const p=new Path2D();p.moveTo(0,150);p.bezierCurveTo(-170,50,-120,-105,0,-25);p.bezierCurveTo(120,-105,170,50,0,150);paint(c,p,C.cream);c.restore();
 for(let side of [-1,1])for(let k=0;k<4;k++)leaf(c,side*(140+k*44),300-k*65,70,side<0?-2.7:-.6,C.green);
}else if(index===15){
 const points=[[-270,130],[-135,-60],[0,100],[135,-60],[270,130]];for(let k=0;k<4;k++){const a=points[k],b=points[k+1],grow=phase(k*.14,k*.14+.4,u);curve(c,[a,[a[0]+30,a[1]-70],[lerp(a[0],b[0],grow)-30,lerp(a[1],b[1],grow)-70],[lerp(a[0],b[0],grow),lerp(a[1],b[1],grow)]],10,C.cream)}points.forEach(([x,y],k)=>oval(c,x,y,40+Math.sin(t*.8+k)*4,40+Math.sin(t*.8+k)*4,k%2?C.yellow:C.pink));
}else if(index===17){
 for(let k=0;k<9;k++){const a=k*TAU/9+t*.08;oval(c,Math.cos(a)*140,30+Math.sin(a)*140,100,65,[C.pink,C.orange,C.yellow,C.green][k%4],a)}oval(c,0,30,87,87,C.cream);
}
}
function boot(c,x,y,s,a=0){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);
 const p=new Path2D();p.moveTo(-150,-72);p.lineTo(-65,-80);p.lineTo(-44,-20);p.bezierCurveTo(-15,-8,60,2,90,22);p.bezierCurveTo(115,46,94,62,65,63);p.lineTo(-135,60);p.bezierCurveTo(-163,48,-151,-5,-150,-72);p.closePath();paint(c,p,C.yellow);
 poly(c,[[-145,42],[101,40],[90,61],[-139,64]],C.navy);for(let k=0;k<5;k++)poly(c,[[-125+k*44,59],[-106+k*44,59],[-111+k*44,77],[-124+k*44,76]],C.yellow);
 for(let k=0;k<3;k++)stroke(c,[[-48+k*24,-4+k*4],[-63+k*24,20+k*3]],7,C.cream);
 poly(c,[[-140,-71],[-65,-77],[-60,-57],[-142,-49]],C.cream);c.restore();}
function glove(c,x,y,s,a=0){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);
 const p=new Path2D();p.moveTo(-70,105);p.lineTo(-87,8);p.bezierCurveTo(-120,-10,-152,-67,-126,-81);p.bezierCurveTo(-109,-92,-87,-53,-66,-34);p.lineTo(-74,-151);p.bezierCurveTo(-76,-183,-45,-183,-39,-154);p.lineTo(-31,-71);p.lineTo(-27,-178);p.bezierCurveTo(-24,-207,5,-204,8,-174);p.lineTo(12,-73);p.lineTo(22,-164);p.bezierCurveTo(26,-191,55,-188,54,-159);p.lineTo(48,-59);p.lineTo(60,-126);p.bezierCurveTo(67,-152,93,-138,85,-109);p.lineTo(69,29);p.bezierCurveTo(63,65,45,85,34,105);p.closePath();paint(c,p,C.cream);
 oval(c,-11,-1,53,66,C.blue);poly(c,[[-70,82],[42,82],[33,132],[-62,132]],C.yellow);stroke(c,[[-59,94],[29,94]],8,C.navy);curve(c,[[-76,-25],[-45,-5],[-56,54],[-44,71]],5,C.orange);c.restore();}
function net(c,t,impact=0){const kick=Math.sin(impact*Math.PI)*20;
 for(let k=0;k<=10;k++){const x=-265+k*53;curve(c,[[x,-210],[x+kick,-65],[x-kick,90],[x,220]],2.5,C.cream)}
 for(let k=0;k<=8;k++){const y=-210+k*54;curve(c,[[-265,y],[-100,y+kick],[100,y+kick],[265,y]],2.5,C.cream)}
 stroke(c,[[-265,220],[-265,-210],[265,-210],[265,220]],15,C.cream);
}
function objectWorld(c,t,dark=false,stage=0){poly(c,[[-3000,-2500],[3000,-2500],[3000,2500],[-3000,2500]],dark?C.navy:C.blue);const colors=[C.green,C.cream,C.blue,C.pink,C.orange],step=Math.floor(stage),blend=stage-step;for(let j=0;j<5;j++)ribbon(c,t*.4+stage*1.5,j,mix(colors[(j+step)%5],colors[(j+step+1)%5],blend),0);}
function actionClock(index,t){
 const a=TWO_GAMES_ACTIONS;
 const keys=index===0?[[0,0],[a.plays,1.56],[a.playsEnd,2.02],[TWO_GAMES[1].start,4.391]]:[[TWO_GAMES[1].start,0],[a.passes,2.12],[a.tackles,2.76],[a.goals,3.22],[a.saves,3.7],[TWO_GAMES[2].start,4.773]];
 let k=0;while(k<keys.length-2&&t>keys[k+1][0])k++;const from=keys[k],to=keys[k+1];return lerp(from[1],to[1],sat((t-from[0])/(to[0]-from[0])));
}
function scene(c,index,u,t){
 if([2,3,5,6,7,8,9,10,11,12,13,15,17].includes(index)){abstract(c,index,u,t);return;}
 const local=index===1?actionClock(1,t):t-TWO_GAMES[index].start,stage=index===1?phase(1.98,2.65,local)+phase(2.65,3.08,local)+phase(3.08,3.58,local)+phase(3.58,4.25,local):index===14?2:0;objectWorld(c,t,index===0,stage);
 if(index===0){
  // Two visual games: a tactile football and the unseen tangle of feeling.
  const moment=actionClock(0,t);const join=phase(2.9,3.8,moment);const kick=phase(1.56,2.1,moment);const bx=lerp(lerp(-142,75,kick),0,join),by=lerp(90-Math.sin(kick*Math.PI)*100,45,join);
  c.save();c.globalAlpha=phase(1.3,1.56,moment)*(1-phase(2.4,2.85,moment));boot(c,-510+phase(1.3,1.7,moment)*200,110,2.1,-.15+kick*.15);c.restore();
  c.save();c.globalAlpha=1-join;oval(c,150,30,150,170,C.navy);scribble(c,t,150,30,2.1,.1);curve(c,[[-50,190],[5,245],[78,190],[150,178]],10,C.yellow);c.restore();
  ball(c,bx,by,100+join*15,t*.16);
 }else if(index===1){
  const dt=actionClock(1,t);
  // Local Whisper word alignment: passes2.12, tackles2.76, goals3.22, saves3.70.
  // One football keeps its trajectory as contact artwork changes around it.
  if(dt<2.7){c.save();c.globalAlpha=1-phase(2.1,2.6,dt);boot(c,-180+phase(.4,1.95,dt)*80,100,2.15,-.2+phase(.4,1.95,dt)*.2);c.restore();}
  const pass=phase(1.98,2.65,dt),tackle=phase(2.65,3.08,dt),goal=phase(3.08,3.58,dt),save=phase(3.58,4.25,dt);
  let x=lerp(130,-150,pass),y=100-Math.sin(pass*Math.PI)*310;
  if(dt>=2.65){x=lerp(-150,95,tackle);y=lerp(100,35,tackle)}
  if(dt>=3.08){x=lerp(95,0,goal);y=lerp(35,-10,goal)}
  if(dt>=3.58){x=lerp(0,3,save);y=lerp(-10,90,save)}
  c.save();c.globalAlpha=phase(2.55,2.76,dt)*(1-phase(2.96,3.2,dt));boot(c,290-phase(2.55,2.86,dt)*190,110,1.65,Math.PI-.22);c.restore();
  c.save();c.globalAlpha=phase(2.95,3.18,dt)*(1-phase(3.48,3.72,dt));net(c,t,goal);c.restore();
  c.save();c.globalAlpha=phase(3.5,3.72,dt);glove(c,160-save*135,130,2,-.12);c.restore();
  ball(c,x,y,62*(1-goal*.18)+save*94,t*2.2);
 }else if(index===4){
  const tap=.5+.5*Math.sin(t*.8);boot(c,-100+tap*32,160,1.7,-.13);ball(c,150+tap*15,110,90,t*.22);
  for(let k=0;k<3;k++)curve(c,[[180+k*27,-110],[260+k*25,-35],[245+k*22,30],[210+k*21,65]],4,C.yellow);
 }else if(index===14){
  net(c,t,u);const arrive=phase(0,.6,u);ball(c,lerp(-160,0,arrive),lerp(200,0,arrive),lerp(105,70,arrive),t*1.4);
  for(let k=0;k<12;k++){const a=k*TAU/12,r=180+u*75;poly(c,[[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(a)*r+10,Math.sin(a)*r+6],[Math.cos(a)*r+2,Math.sin(a)*r+18]],k%2?C.pink:C.yellow)}
 }else if(index===16){
  // A grounded restart: the boot settles beside the ball, ready for one next touch.
  boot(c,-110,165,1.5,-.08);ball(c,142,123,82,t*.07);
  curve(c,[[-210,-80],[-20,-180],[145,-170],[230,-90]],12,C.yellow);poly(c,[[230,-90],[181,-97],[230,-145]],C.yellow);
 }else{
  const breathe=.5+.5*Math.sin(t*.7);oval(c,0,30,235+breathe*12,235+breathe*12,C.yellow);ball(c,0,30,130,t*.08);
  for(let k=0;k<5;k++){const a=k*TAU/5+t*.03;leaf(c,Math.cos(a)*250,30+Math.sin(a)*250,58,a+.7,k%2?C.green:C.pink)}
 }
}
function draw(c,t){resetT(c);pattern??=c.createPattern(plate,'repeat');let i=0;while(i<TWO_GAMES.length-1&&t>=TWO_GAMES[i+1].start)i++;const current=TWO_GAMES[i],end=TWO_GAMES[i+1]?.start||TWO_GAMES_DURATION,u=sat((t-current.start)/(end-current.start));const unit=Math.min(W,H)/850;const framing=W>H?.9:1.02;const transition=phase(end-Math.min(i===1?.35:1,(end-current.start)*.35),end,t);c.fillStyle=C.blue;c.fillRect(0,0,W,H);
function layer(index,progress,time,alpha=1,zoom=1){c.save();c.globalAlpha=alpha;c.translate(W/2,H*.47);c.scale(unit*framing*zoom,unit*framing*zoom);c.translate(0,-20);scene(c,index,progress,time);c.restore()}
// Travel through the painted composition itself: outgoing forms enlarge,
// their matching central space relaxes into the next picture, no card slide.
layer(i,u,t,1,1+u*.055+transition*.22);
if(i>0&&i<TWO_GAMES.length-1&&transition>0){layer(i+1,0,t,transition,1.22-transition*.22)}
const boundary=TWO_GAMES[1].start;
if(t>boundary-.65&&t<boundary+.5){const q=t<boundary?phase(boundary-.65,boundary,t):1-phase(boundary,boundary+.5,t);c.save();c.translate(W/2,H*.47);ball(c,0,0,Math.hypot(W,H)*q,t*.16);c.restore();}

}
defineFilm({palette:PALETTES.screenSea,timeline:[{name:'Two games — regulating emotions',dur:TWO_GAMES_DURATION,fn:draw}],score:()=>{},format:{ar:'16:9',width:1280}});

})();
