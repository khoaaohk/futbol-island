(()=>{
// Offline original geometry informed by the supplied flattened storyboard.
const P={navy:'#071a31',deep:'#052a4b',blue:'#066eea',cyan:'#41b9e9',gold:'#ffba32',orange:'#f75b23',cream:'#fff0ce',green:'#087f78'};
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)},phase=(a,b,x)=>smooth((x-a)/(b-a));
const tile=document.createElement('canvas');tile.width=256;tile.height=256;const tc=tile.getContext('2d'),r=rng(7351);for(let i=0;i<10000;i++){tc.fillStyle=i%3?'rgba(240,227,190,.13)':'rgba(0,8,25,.2)';tc.fillRect(r()*256,r()*256,r()*1.7+.3,r()*1.4+.3)}let grain;
function poly(c,pts,col){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=col;c.fill()}
function line(c,pts,w,col){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()}
function oval(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fillStyle=col;c.fill()}
function ring(c,x,y,r,w,col){c.beginPath();c.arc(x,y,r,0,TAU);c.strokeStyle=col;c.lineWidth=w;c.stroke()}
function arrow(c,x,y,a,len,col,w=14){c.save();c.translate(x,y);c.rotate(a);line(c,[[0,0],[len,0]],w,col);poly(c,[[len+15,0],[len-27,-25],[len-27,25]],col);c.restore()}
function ball(c,x,y,s,t){c.save();c.translate(x,y);c.rotate(t);oval(c,0,0,s,s,P.cream);c.beginPath();c.arc(0,0,s,0,TAU);c.clip();for(let j=0;j<6;j++){const a=j*TAU/5,rad=j===5?0:s*.82;poly(c,Array.from({length:5},(_,k)=>[Math.cos(a)*rad+Math.cos(k*TAU/5+a)*s*.34,Math.sin(a)*rad+Math.sin(k*TAU/5+a)*s*.34]),j%2?P.deep:P.navy)}c.restore()}
function bg(c,t,index){c.fillStyle=P.navy;c.fillRect(-3000,-2600,6000,5200);for(let i=0;i<7;i++){const y=-800+i*290+Math.sin(t*.18+i)*35;c.beginPath();c.moveTo(-2500,y-280);c.bezierCurveTo(-550,y+600,200,y-600,2500,y-400);c.lineTo(2500,y-290);c.bezierCurveTo(200,y-480,-550,y+780,-2500,y-80);c.closePath();c.fillStyle=[P.deep,P.blue,P.deep,P.gold,P.blue,P.orange,P.deep][(i+index)%7];c.globalAlpha=i===3?.85:.48;c.fill()}c.globalAlpha=1;for(let i=0;i<16;i++)oval(c,Math.sin(i*31.2)*1200,650-((t*13+i*81)%1500),1.5+i%3,1.5+i%3,i%3?P.cyan:P.gold)}
function court(c,t,u,full=false,hideBall=false){c.save();c.translate(0,40);c.scale(1+u*.08,1);poly(c,[[-310,-190],[270,-190],[365,190],[-365,190]],P.blue);poly(c,[[-335,-205],[-310,-190],[-365,190],[-390,202]],P.orange);line(c,[[-310,-190],[270,-190],[365,190],[-365,190],[-310,-190]],5,P.cream);line(c,[[-20,-190],[0,190]],4,P.cream);c.save();c.scale(1,.65);ring(c,-5,0,76,4,P.cream);c.restore();line(c,[[-315,-75],[-245,-75],[-265,70],[-346,70]],4,P.cream);line(c,[[298,-75],[225,-75],[245,70],[333,70]],4,P.cream);if(!hideBall)ball(c,Math.sin(t*.7)*190,Math.cos(t*.6)*90,24,t*.7);if(full){for(let k=0;k<3;k++)arrow(c,-180+k*150,125,-Math.PI/2,100,P.gold,5)}c.restore()}
function clock(c,t,u){ring(c,0,15,205,23,P.blue);c.save();c.translate(0,15);c.rotate(-Math.PI/2);c.strokeStyle=P.gold;c.lineWidth=24;c.beginPath();c.arc(0,0,205,0,TAU*(.15+u*.8));c.stroke();c.restore();for(let i=0;i<12;i++){const a=i*TAU/12;line(c,[[Math.cos(a)*165,15+Math.sin(a)*165],[Math.cos(a)*183,15+Math.sin(a)*183]],5,i%3?P.cyan:P.cream)}const a=-Math.PI/2+u*TAU*1.4;line(c,[[0,15],[Math.cos(a)*142,15+Math.sin(a)*142]],12,P.cream);oval(c,0,15,18,18,P.gold);line(c,[[-25,-226],[25,-226]],17,P.cyan)}
function eye(c,t,u){c.save();c.translate(0,25);c.beginPath();c.moveTo(-280,0);c.quadraticCurveTo(0,-230,280,0);c.quadraticCurveTo(0,190,-280,0);c.fillStyle=P.cream;c.fill();oval(c,Math.sin(t*1.4)*76,0,77,92,P.blue);oval(c,Math.sin(t*1.4)*76,0,34,58,P.navy);for(let k=0;k<3;k++){const a=-.55+k*.55;arrow(c,200,0,a,190+Math.sin(t+k)*25,k===1?P.gold:P.cyan,6)}c.restore()}
function playArrow(c,pts,color,dashed=false,width=5){c.save();c.setLineDash(dashed?[13,11]:[]);line(c,pts,width,color);c.setLineDash([]);const a=pts[pts.length-2],b=pts[pts.length-1],angle=Math.atan2(b[1]-a[1],b[0]-a[0]);c.translate(...b);c.rotate(angle);poly(c,[[10,0],[-10,-8],[-10,8]],color);c.restore()}
function routes(c,t,u,kind){
 const A=[-235,155],B=[215,45],C=[-25,-190];
 [A,B,C].forEach((p,j)=>{ring(c,...p,30,7,j===0?P.gold:P.cream)});
 playArrow(c,[A,B],P.cream,false,7);playArrow(c,[B,C],P.cream,false,7);
 // Pass to the supporting teammate; run beyond the defender to meet return.
 playArrow(c,[A,[-290,-35],C],P.gold,true,6);
 poly(c,[[-62,-15],[-10,-15],[-10,37],[-62,37]],P.orange);
 const first=phase(0,.5,u),second=phase(.5,1,u),from=u<.5?A:B,to=u<.5?B:C,q=u<.5?first:second;
 ball(c,lerp(from[0],to[0],q),lerp(from[1],to[1],q),27,t*.4);
}
function foot(c,t,u){c.save();c.translate(-80,35+Math.sin(t)*10);c.rotate(-.15);poly(c,[[-140,-210],[-25,-210],[0,-45],[185,28],[207,84],[-130,84],[-155,35]],P.blue);poly(c,[[-130,75],[204,75],[192,104],[-145,104]],P.cream);for(let i=0;i<4;i++)line(c,[[8+i*23,-32+i*10],[43+i*23,-42+i*10]],7,P.gold);line(c,[[-120,-185],[-24,-185]],16,P.cyan);c.restore();ball(c,140+Math.sin(t)*16,160,96,t*.15);ring(c,142,160,121+Math.sin(t*2)*8,3,P.gold)}
function globe(c,t,u){oval(c,0,10,225,225,P.blue);c.save();c.beginPath();c.arc(0,10,225,0,TAU);c.clip();for(let i=0;i<8;i++){let x=((i*170+t*15)%750)-380;poly(c,[[x,-180+i%3*90],[x+80,-160+i%3*90],[x+130,-60+i%3*70],[x+63,110+i%2*80],[x-18,30]],i%2?P.deep:P.navy)}c.restore();ring(c,0,10,225,5,P.cyan);c.save();c.rotate(-.35);c.strokeStyle=P.gold;c.lineWidth=22;c.beginPath();c.ellipse(0,30,310,80,0,0,Math.PI);c.stroke();poly(c,[[315,25],[255,0],[266,67]],P.gold);c.restore()}
function fullPitch(c,t,u){
 court(c,t,u,false,true);
 const arrive=phase(17.35,19.1,t),settle=phase(19.1,19.75,t),scan=phase(19.75,20.5,t);
 const bx=lerp(-300,20,arrive)-settle*15,by=lerp(-110,95,arrive);ball(c,bx,by,28,t*.7*(1-settle));
 if(t<19.2){for(let j=0;j<3;j++)line(c,[[bx-70-j*15,by-24-j*8],[bx-35-j*10,by-11-j*8]],3,P.cyan)}
 c.save();c.globalAlpha=phase(18.3,19.15,t);poly(c,[[36,45],[75,45],[83,87],[141,105],[138,128],[37,128]],P.navy);line(c,[[39,127],[138,127]],6,P.cream);for(let j=0;j<3;j++)line(c,[[82+j*12,94+j*4],[94+j*12,91+j*4]],3,P.gold);c.restore();
 c.save();c.globalAlpha=phase(18.25,18.7,t);c.strokeStyle=P.gold;c.lineWidth=8;c.beginPath();c.arc(5,95,120,-Math.PI/2,-Math.PI/2+TAU*phase(18.36,20.7,t));c.stroke();c.restore();
 for(let j=0;j<3;j++){c.save();c.globalAlpha=scan;c.translate(5,95);c.rotate(-2.6+j*.75);poly(c,[[0,0],[210,-20],[210,20]],'rgba(255,186,50,.2)');arrow(c,35,0,0,150,j===1?P.gold:P.cyan,5);c.restore()}
}
function compact(c,t,u,expose=false){
 const squeeze=phase(5.85,6.65,t),w=lerp(330,245,squeeze),h=lerp(235,195,squeeze);
 poly(c,[[-w,-h],[w,-h],[w,h],[-w,h]],P.blue);line(c,[[-w,-h],[w,-h],[w,h],[-w,h],[-w,-h]],5,P.cream);line(c,[[0,-h],[0,h]],3,P.cream);ring(c,0,0,55,3,P.cream);
 const close=phase(8.9,9.5,t),pressure=lerp(155,100,close);
 for(const [x,y] of [[-pressure,-80],[pressure,-80],[-pressure,100],[pressure,100]]){
 poly(c,[[x-29,y-29],[x+29,y-29],[x+29,y+29],[x-29,y+29]],P.orange);ring(c,x,y,40,3,P.gold)}
 if(expose){const open=phase(0,.8,u);for(const side of [-1,1]){c.save();c.globalAlpha=1-open;poly(c,[[side*w,-h],[side*35,-h],[side*120,h],[side*w,h]],P.navy);c.restore()}for(let j=0;j<5;j++){const a=j*TAU/5;oval(c,Math.cos(a)*150,Math.sin(a)*115,19,19,P.cream);ring(c,Math.cos(a)*150,Math.sin(a)*115,28+open*10,3,P.cyan)}return}
 // Spoken "faster" at7.44s: accelerate through the narrow central gap.
 playArrow(c,[[0,155],[0,-150]],P.cream,false,4);ring(c,0,-160,19,5,P.gold);playArrow(c,[[-55,160],[-78,20],[-52,-115]],P.gold,true,4);
 const burst=phase(7.40,7.83,t),by=lerp(165,-150,burst),size=26+Math.sin(burst*Math.PI)*27;
 c.save();c.translate(0,-8*burst);c.scale(1+Math.sin(burst*Math.PI)*.14,1+Math.sin(burst*Math.PI)*.14);
 if(burst>0&&burst<1)for(let j=0;j<5;j++)line(c,[[(-2+j)*12,by+size+12],[(-2+j)*12,by+size+65+j*9]],4,P.cyan);
 ball(c,0,by,size,t*.5+burst*3);c.restore();
}
function decisions(c,t,u){
 const branches=[[-260,-170],[0,-240],[260,-170]];line(c,[[0,240],[0,50]],20,P.cream);
 branches.forEach(([x,y],j)=>{const chosen=j===1;line(c,[[0,50],[x*.5,-15],[x,y]],chosen?15:9,chosen?P.gold:P.blue);poly(c,[[x,y-25],[x-20,y+10],[x+20,y+10]],chosen?P.gold:P.cyan);const travel=(u*1.4+j*.15)%1;oval(c,x*travel,lerp(50,y,travel),chosen?14:8,chosen?14:8,chosen?P.cream:P.cyan)});
}
function maze(c,t,u){
 const opening=phase(.1,.65,u);line(c,[[-285,230],[-285,-210],[280,-210],[280,230]],12,P.blue);
 line(c,[[-285,30],[50,30]],35,P.orange);line(c,[[160,30],[280,30]],35,P.orange);
 line(c,[[-130,-100],[70-opening*95,-100]],30,P.gold);line(c,[[120+opening*100,-100],[280,-100]],30,P.gold);
 const pts=[[-180,200],[100,160],[100,-35],[-35,-35],[-35,-155],[230,-155]];
 c.strokeStyle=P.cyan;c.lineWidth=7;c.lineJoin='round';c.beginPath();c.moveTo(...pts[0]);for(let z=1;z<pts.length-1;z++){c.quadraticCurveTo(...pts[z],(pts[z][0]+pts[z+1][0])/2,(pts[z][1]+pts[z+1][1])/2)}c.lineTo(...pts[pts.length-1]);c.stroke();const n=clamp(u*5,0,4.999),j=Math.floor(n),q=n-j;ball(c,lerp(pts[j][0],pts[j+1][0],q),lerp(pts[j][1],pts[j+1][1],q),25,t*.5);
}
function network(c,t,u){
 const pts=Array.from({length:5},(_,j)=>[Math.cos(j*TAU/5-Math.PI/2)*235,Math.sin(j*TAU/5-Math.PI/2)*210]);
 pts.forEach(([x,y],j)=>{line(c,[[0,0],[x,y]],5,P.cyan);const a=pts[(j+1)%5];c.strokeStyle=P.blue;c.lineWidth=7;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+a[0],y+a[1],...a);c.stroke();ring(c,x,y,30,8,j%2?P.gold:P.cream);const q=(u+j*.2)%1;oval(c,x*q,y*q,10,10,P.gold)});ring(c,0,0,42+Math.sin(t*3)*6,10,P.gold);for(let j=0;j<5;j++){const a=pts[j],b=pts[(j+1)%5];playArrow(c,[[a[0]*1.22,a[1]*1.22],[b[0]*1.22,b[1]*1.22]],P.gold,true,4)}
}
function flow(c,t,u){c.strokeStyle=P.cyan;c.lineWidth=35;c.lineCap='round';c.beginPath();c.moveTo(-300,220);c.bezierCurveTo(360,260,-350,-230,300,-220);c.stroke();const q=u,x=-300+600*q,y=220-440*q;for(let j=0;j<7;j++){const z=(q+j*.13)%1;oval(c,-300+600*z+Math.sin(z*TAU)*100,220-440*z,12,12,P.gold)}arrow(c,210,-220,0,85,P.cream,15)}
function think(c,t,u){for(let j=0;j<4;j++){const a=j*Math.PI/2;const x=Math.cos(a)*190,y=Math.sin(a)*190;line(c,[[0,0],[x,y]],8,j===3?P.gold:P.blue);poly(c,[[x,y-38],[x+38,y],[x,y+38],[x-38,y]],j===3?P.gold:P.deep)}const r=45+Math.sin(u*Math.PI)*35;ring(c,0,0,r,14,P.cream);oval(c,0,0,18,18,P.gold)}
function atmosphere(c,k,t,u){
 if(['clock','eye','globe'].includes(k)){
 c.fillStyle=k==='eye'?'#073b55':k==='globe'?'#052546':P.navy;c.fillRect(-2500,-2400,5000,4800);
 for(let j=0;j<7;j++){const rr=260+j*125+Math.sin(t*.3+j)*18;ring(c,0,30,rr,j%2?28:5,j%2?'#063858':'#0b5880')}
 if(k==='eye')for(let j=0;j<5;j++){c.save();c.rotate(Math.sin(t*.4)*.35+j*.5-.9);c.globalAlpha=.15;poly(c,[[0,0],[1500,-190],[1500,190]],j%2?P.gold:P.cyan);c.restore()}
 if(k==='globe'){for(let j=0;j<4;j++){c.save();c.rotate(-.4+j*.5);c.strokeStyle=j%2?P.cyan:P.gold;c.globalAlpha=.32;c.lineWidth=12+j*5;c.beginPath();c.ellipse(0,20,480+j*160,160+j*80,0,0,TAU);c.stroke();c.restore()}}
 }
 if(['tight','foot','attack','defend'].includes(k)){
 c.fillStyle='#082c50';c.fillRect(-2400,-2300,4800,4600);
 for(let j=-5;j<6;j++){let x=j*200+Math.sin(t*.6)*25;poly(c,[[x*.3,-1800],[x*.3+24,-1800],[x*2+100,2200],[x*2,2200]],j%2?P.blue:P.deep)}
 for(let side of [-1,1]){c.globalAlpha=.75;poly(c,[[side*1000,-1500],[side*(250+Math.sin(t*.5)*35),-70],[side*800,1700],[side*1500,1700]],side===1?P.gold:P.orange);c.globalAlpha=1}
 }
 if(['routes','combine','choices','maze','network','flow','think'].includes(k)){
 c.fillStyle='#062f42';c.fillRect(-2500,-2500,5000,5000);for(let j=0;j<6;j++){c.save();c.translate(Math.sin(j*13)*500,Math.cos(j*19)*600);c.rotate(t*.025+j);c.strokeStyle=j%2?'#0c647a':'#12548b';c.lineWidth=15;c.beginPath();c.ellipse(0,0,340+j*35,180,0,0,TAU);c.stroke();c.restore()}
 }
 if(k==='open'){c.fillStyle='#117ea0';c.fillRect(-2500,-2500,5000,5000);oval(c,0,-220,350,350,P.gold);for(let j=0;j<8;j++){c.save();c.translate(0,-220);c.rotate(j*TAU/8+t*.025);c.globalAlpha=.24;poly(c,[[0,0],[1500,-150],[1500,150]],P.cream);c.restore()}poly(c,[[-2500,90],[2500,90],[2500,2500],[-2500,2500]],P.green)}
}
function scene(c,i,u,t){bg(c,t,Math.floor(i/3));let k=FUTSL.cues[i].kind;atmosphere(c,k,t,u);c.save();if(i===0){const shrink=lerp(1.9,1,smooth(u/.85));c.scale(shrink,shrink);}if(['globe','foot','clock'].includes(k))c.scale(1.24,1.24);if(i===6){fullPitch(c,t,u)}else if(k==='court'||k==='open'){if(k==='open')c.scale(.86,.86);court(c,t,u,k==='open'||i===6);if(k==='open'){for(let j=0;j<3;j++)arrow(c,-230+j*230,220,-Math.PI/2,180,P.cyan,8)}}else if(k==='clock')clock(c,t,u);else if(k==='eye')eye(c,t,u);else if(k==='foot')foot(c,t,u);else if(k==='tight'||k==='expose')compact(c,t,u,k==='expose');else if(k==='choices')decisions(c,t,u);else if(k==='maze')maze(c,t,u);else if(k==='network')network(c,t,u);else if(k==='flow')flow(c,t,u);else if(k==='think')think(c,t,u);else if(k==='routes'||k==='combine')routes(c,t,u,k);else if(k==='globe')globe(c,t,u);else if(k==='attack'){arrow(c,-240,80,-.25,440,P.gold,32);ball(c,lerp(-170,230,u),50-u*100,78,t)}else if(k==='defend'){for(let j=0;j<4;j++)poly(c,[[-180+j*100,-170],[-125+j*100,-170],[-125+j*100,170],[-180+j*100,170]],j%2?P.cyan:P.blue);ball(c,100-u*170,210,65,t)}else{if(k==='tight'){for(let j=0;j<4;j++){let d=300-u*90;poly(c,[[d,-600],[d+65,-600],[d+65,600],[d,600]],P.blue);poly(c,[[-d,-600],[-d-65,-600],[-d-65,600],[-d,600]],P.orange)}}if(i===1){ball(c,Math.sin(t*.5)*35,25,205+Math.sin(t*.6)*10,t*.13)}else if(k==='tight'){
 // The single hero ball gives way to a fast pass through narrowing lanes.
 const pass=clamp((u-.08)/.84,0,1);const bx=lerp(-470,470,pass),by=lerp(220,-120,pass);
 for(let j=0;j<4;j++)line(c,[[bx-100-j*45,by+35+j*12],[bx-32-j*35,by+12+j*12]],6-j,P.cyan);
 ball(c,bx,by,38,t*.8);
 }else{for(let j=0;j<4;j++){c.save();c.scale(1+j*.24+u*.2,1+j*.24+u*.2);line(c,[[-210,-120],[210,-120],[210,120],[-210,120],[-210,-120]],6,j%2?P.gold:P.cyan);c.restore()}}
 for(let j=0;j<3;j++)arrow(c,-330,200+j*40,-.3,180,P.gold,5)}c.restore()}
// Offline compositing surface: scene helpers can set local opacity without
// overriding the dissolve alpha applied to the completed artwork.
const blendSurface=document.createElement('canvas');const blendContext=blendSurface.getContext('2d');
function draw(c,t){
 resetT(c);grain??=c.createPattern(tile,'repeat');
 let i=0;while(i<FUTSL.cues.length-1&&t>=FUTSL.cues[i+1].start)i++;
 const start=FUTSL.cues[i].start,end=FUTSL.cues[i+1]?.start||FUTSL.duration;
 const u=clamp((t-start)/(end-start),0,1),overlap=Math.min(.7,(end-start)*.36);
 const q=i<FUTSL.cues.length-1?phase(end-overlap,end,t):0,unit=Math.min(W,H)/860;
 if(blendSurface.width!==W||blendSurface.height!==H){blendSurface.width=W;blendSurface.height=H;}
 function layer(index,progress,alpha,zoom){
  const b=blendContext;b.setTransform(1,0,0,1,0,0);b.globalAlpha=1;b.clearRect(0,0,W,H);
  b.save();b.translate(W/2,H*.48);b.scale(unit*zoom,unit*zoom);scene(b,index,progress,t);b.restore();
  c.save();c.globalAlpha=alpha;c.drawImage(blendSurface,0,0);c.restore();
 }
 // Keep recognizable artwork visible throughout. The incoming picture is
 // composited gently over the outgoing picture, never a full-color wipe.
 layer(i,u,1,1+Math.sin(u*Math.PI)*.025+q*.32);
 if(q>0&&i<FUTSL.cues.length-1)layer(i+1,0,q,1.18-q*.18);
 // Shared grain stays continuous across both compositions.
 c.save();c.translate(W/2,H*.48);c.scale(unit,unit);c.globalAlpha=.75;c.fillStyle=grain;c.fillRect(-4000,-4000,8000,8000);c.restore();
}
defineFilm({palette:PALETTES.screenSea,timeline:[{name:'Love Futsl',dur:FUTSL.duration,fn:draw}],score:()=>{},format:{ar:'16:9',width:1280}});
})();
