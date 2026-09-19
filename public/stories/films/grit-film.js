/* GRIT — one connected, JavaScript-drawn world.
 * Original canvas geometry; supplied paintings are references, never enlarged crops.
 * 0–10 ball becomes seed; 10–40 follow roots through shifting earth;
 * 40–56 follow shoot into growing canopy; 56–66 roots support fruit;
 * 66–71 fruit fills camera and becomes sunset; 71–76 return to practice.
 * Fixed-seed print texture, jointed player, growing tapered branches, unfolding
 * leaves, soil displacement, wind, fruit sway, and shared-object camera journeys.
 * Rendered offline at 24 unique fps, then muxed with the supplied narration.
 */
const C={blue:'#0759ef',navy:'#072a3c',pink:'#ff79ca',orange:'#ff4d1b',yellow:'#ffc329',cream:'#fff0d1',green:'#00784e',dark:'#003e34',soil:'#352319',root:'#efb459'};
const sat=x=>clamp(x,0,1),ease=x=>{x=sat(x);return x*x*(3-2*x);},phase=(a,b,t)=>ease((t-a)/(b-a));
const rand=rng(61029),stars=Array.from({length:100},()=>[rand()*3600-1800,rand()*2200-1300,rand()*5+1]);
// A cached transparent print plate: no bitmap artwork and no per-frame noise.
const print=document.createElement('canvas');print.width=512;print.height=512;
const pc=print.getContext('2d');
for(let i=0;i<17000;i++){const x=rand()*512,y=rand()*512,s=rand()<.06?rand()*4:rand()*1.3;pc.fillStyle=i%3?'rgba(255,240,209,.15)':'rgba(2,25,30,.19)';pc.fillRect(x,y,s,s*.65);}
for(let i=0;i<80;i++){pc.strokeStyle='rgba(255,240,209,.12)';pc.lineWidth=.5;pc.beginPath();const x=rand()*512,y=rand()*512;pc.moveTo(x,y);pc.lineTo(x+rand()*26,y+rand()*8);pc.stroke();}
let pattern;
function paint(c,p,color){c.fillStyle=color;c.fill(p);c.save();c.clip(p);c.fillStyle=pattern;c.fillRect(-5000,-5000,10000,10000);c.restore();}
function poly(c,pts,color){const p=new Path2D();pts.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();paint(c,p,color);}
function oval(c,x,y,rx,ry,color,angle=0){const p=new Path2D();p.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),angle,0,TAU);paint(c,p,color);}
function line(c,pts,width,color){c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function leaf(c,x,y,size,angle,color){if(size<.1)return;c.save();c.translate(x,y);c.rotate(angle);const p=new Path2D();p.moveTo(0,0);p.bezierCurveTo(size*.1,-size*.65,size*.75,-size*.55,size,0);p.bezierCurveTo(size*.55,size*.34,size*.1,size*.35,0,0);paint(c,p,color);line(c,[[0,0],[size*.45,-size*.06],[size,0]],Math.max(.7,size*.012),C.yellow);c.restore();}
function cloud(c,x,y,s,color){c.save();c.translate(x,y);c.scale(s,s);const p=new Path2D();p.moveTo(-120,30);p.bezierCurveTo(-135,-10,-100,-45,-65,-24);p.bezierCurveTo(-70,-100,35,-115,46,-48);p.bezierCurveTo(105,-80,145,-10,128,30);p.closePath();paint(c,p,color);c.restore();}
function palm(c,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[6,-70],[18,-145],[32,-205]],9,C.navy);for(let j=0;j<7;j++){const a=-Math.PI+j*Math.PI/6+Math.sin(t*.55+j)*.035;c.save();c.translate(32,-205);c.rotate(a);const p=new Path2D();p.moveTo(0,0);p.bezierCurveTo(23,-40,80,-30,96,6);p.bezierCurveTo(45,-2,21,25,0,0);paint(c,p,j%2?C.dark:C.navy);c.restore();}c.restore();}
function sky(c,t,sunset=0){poly(c,[[-4000,-4000],[4000,-4000],[4000,10],[-4000,10]],mix(C.blue,'#153095',sunset*.35));
 // Layered radiating mural ribbons change shape and drift independently.
 for(let i=0;i<5;i++){const p=new Path2D();p.moveTo(-4600+i*700,-5000);p.bezierCurveTo(-4400+i*700,-3400,-3450+i*1090,-2050-Math.sin(t*.12+i)*65,-2200+i*700,-1400);p.bezierCurveTo(-950+i*310,-750+Math.sin(t*.12+i)*65,-1500+i*650,-420,900+i*450,-45);p.lineTo(1500+i*500,-35);p.bezierCurveTo(-700+i*480,-670,-400+i*300,-1100,-1800+i*700,-1500);p.bezierCurveTo(-3200+i*1100,-1900,-4100+i*700,-3500,-4200+i*700,-5000);p.closePath();paint(c,p,[C.orange,C.pink,C.blue,C.cream,C.green][i]);}
 
 cloud(c,-460+Math.sin(t*.08)*55,-590,.7,C.cream);cloud(c,460+Math.sin(t*.06+2)*80,-360,.5,sunset?C.pink:C.cream);cloud(c,-70+Math.sin(t*.07)*50,-900,.42,C.pink);
 // Individually shaped skyline: different rooflines, widths and silhouettes.
 for(let i=0;i<22;i++){const x=-1000+i*94,w=42+(i*19%42),h=65+(i*71%175),y=18,kind=i%5;let roof;
  if(kind===0)roof=[[x,y-h],[x+w*.5,y-h-40],[x+w,y-h]];
  else if(kind===1)roof=[[x,y-h],[x+w*.24,y-h],[x+w*.24,y-h-35],[x+w*.76,y-h-35],[x+w*.76,y-h],[x+w,y-h]];
  else if(kind===2)roof=[[x,y-h],[x+w,y-h+24]];
  else if(kind===3)roof=[[x,y-h],[x+w*.3,y-h-18],[x+w*.7,y-h-18],[x+w,y-h]];
  else roof=[[x,y-h],[x+w,y-h]];
  poly(c,[[x,y],...roof,[x+w,y]],['#ed7cca','#a96dd2','#ff97cb','#5058a5'][i%4]);
  if(i%3===0)line(c,[[x+w*.5,y-h],[x+w*.5,y-h-43]],3,C.pink);
  for(let row=0;row<3;row++)for(let col=0;col<2;col++)poly(c,[[x+10+col*18,y-30-row*25],[x+16+col*18,y-30-row*25],[x+16+col*18,y-22-row*25],[x+10+col*18,y-22-row*25]],'#ffbcbe');
 }
 // A solid rooted undergrowth band extends beneath the soil edge: no sky slivers.
 poly(c,[[-4000,-28],[4000,-28],[4000,35],[-4000,35]],C.dark);
 for(let i=0;i<15;i++){const x=-1450+i*207,w=125+(i*37%94),h=75+(i*43%96),p=new Path2D();p.moveTo(x-w,24);
  if(i%3===0){p.lineTo(x-w,-h*.3);p.bezierCurveTo(x-w*1.1,-h,x-w*.2,-h*1.2,x,-h*.72);p.bezierCurveTo(x+w*.45,-h*1.5,x+w*1.1,-h*.7,x+w,-h*.15);}
  else if(i%3===1){p.lineTo(x-w,-h*.15);p.bezierCurveTo(x-w*.65,-h*1.25,x-w*.2,-h*1.05,x+w*.2,-h);p.bezierCurveTo(x+w*.75,-h*.95,x+w,-h*.6,x+w,-h*.05);}
  else{p.lineTo(x-w,-h*.2);p.bezierCurveTo(x-w*.7,-h*.55,x-w*.5,-h*1.2,x,-h);p.bezierCurveTo(x+w*.3,-h*.85,x+w*.35,-h*.35,x+w,-h*.15);}
  p.lineTo(x+w,24);p.closePath();paint(c,p,[C.green,C.dark,'#126d53','#064e43'][i%4]);
  for(let j=0;j<3;j++)leaf(c,x-40+j*39,-h*.27,35+j*9,-1.9+j*.65, i%2?'#148354':C.dark);
 }
 oval(c,220,-690,155,155,C.yellow);
 palm(c,-570,20,1.3,t);palm(c,650,25,1.5,t);palm(c,-860,18,.72,t);palm(c,940,22,.96,t);
 // Broad-leaf and narrow upright trees break up the palm silhouettes.
 for(const [x,h,w] of [[-730,320,85],[790,240,105],[-1100,225,58]]){line(c,[[x,22],[x-7,-h*.72]],12,C.navy);const p=new Path2D();p.moveTo(x-w,-h*.3);p.bezierCurveTo(x-w*1.2,-h*.7,x-w*.55,-h*1.2,x,-h);p.bezierCurveTo(x+w*.8,-h*1.12,x+w*1.3,-h*.55,x+w,-h*.25);p.bezierCurveTo(x+w*.3,-h*.05,x-w*.7,-h*.07,x-w,-h*.3);paint(c,p,C.dark);}

}
function mural(c,x,y,w,h,t){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();poly(c,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],C.blue);oval(c,x+w*.23,y+h*.7,w*.3,h*.85,C.orange);oval(c,x+w*.65,y+h*.1,w*.23,h*.85,C.yellow);const p=new Path2D();p.moveTo(x+w*.2,y+h);p.bezierCurveTo(x+w*.65,y-h*.5,x+w*.4,y+h*1.7,x+w,y+h*.3);p.lineTo(x+w,y+h);p.closePath();paint(c,p,C.pink);for(let i=0;i<5;i++)oval(c,x+25+i*16,y+20,3,3,C.dark);c.restore();}
function football(c,x,y,r,t,gold=0){oval(c,x,y,r,r,mix(C.cream,C.yellow,gold));c.save();c.translate(x,y);c.rotate(t);c.globalAlpha=1-gold;for(let j=0;j<6;j++){const a=j*TAU/5,xx=j===5?0:Math.cos(a)*r*.75,yy=j===5?0:Math.sin(a)*r*.75;const pts=Array.from({length:5},(_,k)=>[xx+Math.cos(k*TAU/5)*r*.3,yy+Math.sin(k*TAU/5)*r*.3]);poly(c,pts,C.navy);}c.restore();}
function player(c,x,y,s,t,ending=false){c.save();c.translate(x,y);c.scale(s,s);
 const breath=Math.sin(t*1.6)*2,reach=ending?phase(71,74,t):phase(3,6,t);
 // Body parts share local joint endpoints and overlapping sleeves.
 line(c,[[-18,-105],[-39,-54],[-48,-10]],24,C.pink);const kick=ending?Math.sin(phase(71,72.4,t)*Math.PI)*23:0;line(c,[[18,-105],[33+kick*.4,-53],[45+kick,-8-kick*.3]],24,C.pink);
 poly(c,[[-48,-26],[-31,-24],[-16,-9],[-16,0],[-65,0]],C.orange);poly(c,[[33+kick,-23-kick*.3],[51+kick,-22-kick*.3],[72+kick,-6-kick*.3],[69+kick,1-kick*.3],[26+kick,1-kick*.3]],C.orange);
 for(const side of [-1,1]){line(c,[[side*38,-48],[side*42,-39]],20,C.cream);line(c,[[side*37,-62],[side*40,-54]],20,C.dark);}
 poly(c,[[-37,-120],[37,-120],[32,-87],[4,-85],[0,-99],[-6,-85],[-34,-87]],C.navy);
 poly(c,[[-30,-197+breath],[30,-197+breath],[43,-152],[27,-142],[28,-113],[-31,-113],[-34,-144],[-47,-152]],C.green);
 const armY=-166+breath;
 line(c,[[-36,armY],[-55,-139],[-43,-112]],16,C.pink);
 const handX=lerp(54,79,reach),handY=lerp(-108,-160,reach);line(c,[[36,armY],[58,-142],[handX,handY]],16,C.pink);oval(c,handX,handY,9,12,C.pink);
 line(c,[[0,-193+breath],[2,-222+breath]],19,C.pink);oval(c,3,-241+breath,28,32,C.pink,-.08);
 // Sculpted orange ponytail follows the head rather than floating apart.
 const hair=new Path2D();hair.moveTo(-22,-227+breath);hair.bezierCurveTo(-54,-257,-83,-217+Math.sin(t)*5,-58,-181);hair.bezierCurveTo(-80,-199,-94,-265,-50,-263);hair.bezierCurveTo(-30,-288,28,-284,32,-250);hair.lineTo(-10,-241);hair.closePath();paint(c,hair,C.orange);
 oval(c,15,-244+breath,15,7,C.cream,-.05);oval(c,20,-244+breath,5,6,C.navy);
 line(c,[[19,-226+breath],[25,-229+breath]],2,C.navy);
 c.fillStyle=C.cream;c.font='bold 37px sans-serif';c.textAlign='center';c.fillText('10',0,-141+breath);c.restore();}
function stadium(c,t,ending=false){sky(c,t,ending?1:0);mural(c,-1100,-115,2200,130,t);
 // The pitch is continuous geometry with crisp perspective markings.
 poly(c,[[-3000,0],[3000,0],[4000,3000],[-4000,3000]],C.green);
 for(let i=-6;i<7;i++)poly(c,[[i*140,0],[i*140+70,0],[(i*140+70)*4,2200],[i*560,2200]],i%2?'#04864e':'#159452');
 line(c,[[-950,14],[950,14],[1800,1600],[-1800,1600],[-950,14]],4,C.cream);line(c,[[0,0],[0,1700]],4,C.cream);
 c.strokeStyle=C.cream;c.lineWidth=4;c.beginPath();c.ellipse(0,220,310,110,0,0,TAU);c.stroke();
 for(let i=0;i<9;i++)line(c,[[-125+i*31,-100],[-125+i*31,0]],1.4,C.cream);for(let i=0;i<5;i++)line(c,[[-125,-100+i*25],[125,-100+i*25]],1.3,C.cream);line(c,[[-130,0],[-130,-106],[130,-106],[130,0]],6,C.cream);
 const travel=ending?phase(71.7,75,t):phase(0,5,t),bx=ending?lerp(-55,140,travel):lerp(150,0,travel),by=ending?180-Math.sin(travel*Math.PI)*45:180-Math.sin(travel*Math.PI)*80;
 player(c,ending?-100:-200,200,1,t,ending);football(c,bx,by,35,t*.7,ending?0:phase(6,8,t));

}
const rocks=Array.from({length:155},(_,i)=>({x:rand()*2800-1400,y:rand()*1600+28,r:10+rand()*34,a:rand()*TAU,seed:i}));
const rootSpecs=[];
const mainRoot={pts:[[0,28],[2,100],[-17,173],[-68,240],[-80,313],[-22,384],[8,480],[0,660]],start:12,dur:23,w:18};
mainRoot.curve=interpolatePath(mainRoot.pts);rootSpecs.push(mainRoot);
for(let j=0;j<12;j++){
 const sign=j%2?1:-1,f=.19+Math.floor(j/2)*.12,index=Math.floor(f*(mainRoot.curve.length-1)),anchor=mainRoot.curve[index],x=anchor[0],y=anchor[1],tip=x+sign*(185+(j%4)*65),start=12+f*23+1;
 const b={pts:[[x,y],[x+sign*50,y+45],[lerp(x,tip,.6),y+105],[tip,y+185]],start,dur:10,w:9-j*.22};b.curve=interpolatePath(b.pts);rootSpecs.push(b);
 for(let k=0;k<3;k++){const f=.4+k*.2,a=b.curve[Math.floor(f*(b.curve.length-1))];rootSpecs.push({pts:[a,[a[0]+sign*27,a[1]+60],[a[0]+sign*55,a[1]+130]],start:start+f*10+1,dur:7,w:3.4});}
}
function interpolatePath(points){const out=[];for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],d=points[i+1],e=points[Math.min(points.length-1,i+2)];for(let j=0;j<14;j++){const u=j/14,u2=u*u,u3=u2*u;out.push([0,1].map(k=>.5*((2*b[k])+(-a[k]+d[k])*u+(2*a[k]-5*b[k]+4*d[k]-e[k])*u2+(-a[k]+3*b[k]-3*d[k]+e[k])*u3)));}}out.push(points.at(-1));return out;}
rootSpecs.forEach(r=>r.curve=interpolatePath(r.pts));
function growingBranch(c,r,p,color){if(p<=0)return;const max=(r.curve.length-1)*sat(p);for(let i=0;i<Math.ceil(max);i++){const a=r.curve[i],b=r.curve[i+1],f=Math.min(1,max-i);line(c,[a,[lerp(a[0],b[0],f),lerp(a[1],b[1],f)]],Math.max(.8,r.w*(1-i/r.curve.length*.78)),color);} }
const branches=[];for(let j=0;j<14;j++){const side=j%2?1:-1,y=-80-Math.floor(j/2)*70;branches.push({pts:[[0,y],[side*50,y-80],[side*(140+(j%3)*30),y-140],[side*(210+(j%3)*24),y-205]],start:45+j*.52,dur:7,w:15-j*.5});}branches.forEach(r=>r.curve=interpolatePath(r.pts));
const fruits=branches.map((b,j)=>({x:b.pts[3][0]+26,y:b.pts[3][1]+35,start:56+j*.325}));
const HERO_FRUIT=8,heroFruit=fruits[HERO_FRUIT];
function seed(c,t){const opening=phase(12,19,t);c.save();c.translate(0,20);c.rotate(-.38+opening*.18);const p=new Path2D();p.moveTo(0,-48);p.bezierCurveTo(56,-40,62,17,0,53);p.bezierCurveTo(-58,13,-54,-28,0,-48);paint(c,p,C.yellow);
 const crack=new Path2D();crack.moveTo(-4,-43);crack.lineTo(10*opening,-12);crack.lineTo(-9*opening,8);crack.lineTo(5*opening,45);line(c,[[-3,-42],[opening*10,-12],[-opening*9,8],[opening*5,46]],1+opening*5,C.cream);c.restore();}
function earth(c,t,motion=t){poly(c,[[-4000,0],[4000,0],[4000,5000],[-4000,5000]],C.soil);
 // Stratified earth, textured seams and fine stones are fixed in world space.
 for(let i=0;i<6;i++){const p=new Path2D();p.moveTo(-3500,130+i*220);p.bezierCurveTo(-1300,210+i*240,800,50+i*255,3500,180+i*270);p.lineTo(3500,270+i*270);p.bezierCurveTo(1100,115+i*255,-1100,330+i*240,-3500,230+i*220);p.closePath();paint(c,p,i%2?'#50321f':'#241f1a');}
 rocks.forEach((r,j)=>{let push=phase(18+j%10,21+j%10,t)*Math.max(0,1-Math.abs(r.x)/150);const x=r.x+Math.sign(r.x||1)*push*25,y=r.y+Math.sin(push*Math.PI)*15;const pts=Array.from({length:7},(_,k)=>{const a=k*TAU/7+r.a,rr=r.r*(.7+.3*Math.sin(j+k*7)**2);return[x+Math.cos(a)*rr,y+Math.sin(a)*rr];});poly(c,pts,['#171e20','#684027','#3e3023'][j%3]);});
 poly(c,[[-10,220],[40,203],[79,238],[69,284],[15,293],[-21,260]],'#17282a');
 rootSpecs.forEach(r=>growingBranch(c,r,phase(r.start,r.start+r.dur,t),C.root));
 // Subtle sap moves along already-grown roots: the root network feels alive.
 rootSpecs.slice(0,9).forEach((r,j)=>{const p=phase(r.start,r.start+r.dur,t),u=((motion*.16+j*.17)%1)*p,at=r.curve[Math.floor(u*(r.curve.length-1))];if(p>.1)oval(c,at[0],at[1],2.3,3,C.cream);});
 seed(c,t);
}
const trunk={curve:interpolatePath([[0,15],[7,-90],[-8,-240],[8,-430],[0,-650]]),w:27};
function tree(c,t,motion=t){const grow=phase(40,55,t);
 // A rounded, layered crown fills the central gap, with irregular leafy edges.
 const crown=phase(49,58,t);
 if(crown>0){for(let layer=0;layer<3;layer++){const p=new Path2D(),cx=(layer-1)*78*crown,cy=-485-(layer===1?80:0)*crown,rx=(270-layer*32)*crown,ry=(260-layer*22)*crown;for(let j=0;j<=90;j++){const a=j/90*TAU,r=1+.045*Math.sin(a*11+layer)+.025*Math.cos(a*17);const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;j?p.lineTo(x,y):p.moveTo(x,y);}p.closePath();paint(c,p,[C.dark,C.green,'#16844c'][layer]);}}
 growingBranch(c,trunk,grow,C.root);
 branches.forEach((b,j)=>{const g=phase(b.start,b.start+b.dur,t);growingBranch(c,b,g,C.root);for(let k=0;k<5;k++){const at=b.curve[Math.floor((.35+k*.15)*(b.curve.length-1))],unfold=phase(b.start+(.35+k*.15)*b.dur,b.start+(.35+k*.15)*b.dur+2.2,t);leaf(c,at[0],at[1],(65+(j%3)*12)*unfold,(j%2?-.65:-2.5)+Math.sin(motion*.9+j+k)*.055,[C.dark,C.green,'#28994e'][k%3]);}});
 // Fan-shaped top growth joins the two sides above the central trunk.
 for(let j=0;j<7;j++)leaf(c,(j-3)*13,-620,95*phase(53+j*.2,58+j*.2,t),-Math.PI+j*Math.PI/6+Math.sin(motion*.7+j)*.03,[C.dark,C.green,'#28994e'][j%3]);
 // The first two leaves unfold directly from the shoot before the canopy.
 for(const side of [-1,1])leaf(c,0,-115,90*phase(42,46,t),(side===1?-.45:-2.6)+Math.sin(motion*.9)*.065,C.green);
 fruits.forEach((f,j)=>{const g=phase(f.start,f.start+3,t),sway=Math.sin(motion*.9+j)*.045;if(g<=0)return;line(c,[[f.x-26,f.y-35],[f.x,f.y-15]],2,C.dark);oval(c,f.x,f.y,34*g,37*g,j===HERO_FRUIT?mix('#ff8520',C.yellow,phase(64,66,t)):[C.orange,'#ff8520','#f3b62c'][j%3],sway);if(g>.1){oval(c,f.x-10*g,f.y-12*g,6*g,9*g,C.yellow);leaf(c,f.x,f.y-33*g,24*g,-.6+sway,C.green);}});
 // Breakthrough throws earth aside, then the loose clods settle.
 const breakP=phase(40,44,t);if(breakP>0&&breakP<1)for(let j=0;j<14;j++){const side=j%2?1:-1,x=side*(12+breakP*(35+j*5)),y=-Math.sin(breakP*Math.PI)*(30+j*7);oval(c,x,y,5+j%4,4+j%3,C.soil);}
 for(let i=-20;i<=20;i++){const x=i*48;poly(c,[[x,2],[x-5,-9],[x+5,-5],[x+10,-18+Math.sin(motion*.8+i)*3],[x+14,2]],C.green);}
}
// Shared scene clock maps recorded narration cues onto continuous growth.
const cameraKeys=[
 [0,0,-65,.56],[1.4,0,-65,.67],[4.7,0,-65,.67],[5.8,0,430,2.25],[6.5,0,430,2.25],[7.65,0,-535,2.15],[8.1,0,-535,2.15],[9.1,0,-65,.7],[13,0,-65,.7],[15.5,50,-130,.82],[17,0,350,1.25],[18,0,350,1.25],[19.4,40,-470,1.3],[20.4,40,-470,1.3],[22,0,300,1.1],
 [23.5,0,150,1.1],[25.4,0,20,75],[26.2,0,20,75],[27.3,0,95,3.3],
 [30,-52,240,2.8],[33.2,-55,325,2.1],[36.4,0,430,1.55],
 [37.2,0,240,1.25],[40.8,0,-200,1.05],[43,0,-260,.85],[46.7,0,-65,.69],
 [49.2,0,530,2.2],[50.8,130,590,4.7],[53.6,130,590,4.7],[57.4,0,530,2.2],[59.2,0,-535,2.15],
 [61,0,-535,2.15],[64,heroFruit.x,heroFruit.y,2.7],[66,heroFruit.x,heroFruit.y,75]
];
function atKeys(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=phase(a[0],b[0],t);return [lerp(a[1],b[1],u),lerp(a[2],b[2],u),Math.exp(lerp(Math.log(a[3]),Math.log(b[3]),u))];}
function growthClock(t){const keys=[[26.2,12],[27.3,16],[33.2,30],[37.2,40],[40.8,49],[43,51],[46,54],[49,56],[56,58],[61,60],[66,66]];let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;return lerp(keys[i][1],keys[i+1][1],phase(keys[i][0],keys[i+1][0],t));}
function camera(c,x,y,z){const unit=Math.min(W,H)/1000*(W>H?.72:.82);c.translate(CX,CY);c.scale(unit*z,unit*z);c.translate(-x,-y);}
function cueLabel(c,text,x,y,color=C.cream,size=32){c.fillStyle=color;c.font=`${size}px "Story Brush"`;c.textAlign='center';c.textBaseline='middle';c.strokeStyle=C.navy;c.lineWidth=size>40?7:3;c.lineJoin='round';c.strokeText(text,x,y);c.fillText(text,x,y);}
function pairedGrowth(c,t){
 if(t>=8.3&&t<13){c.save();c.globalAlpha=phase(8.3,9,t)*(1-phase(12.3,13,t));for(let j=0;j<5;j++){const x=-230+j*115,r=6+5*Math.sin(t*2-j*.4)**2;oval(c,x,-330-Math.abs(x)*.45,r,r,C.yellow);oval(c,x,330+Math.abs(x)*.45,r,r,C.yellow);}c.restore();}
 if(t>=15.5&&t<23.5){for(let j=0;j<9;j++){const u=(t*.25+j/9)%1;oval(c,20+Math.sin(u*4)*20,70+u*340,3,5,C.cream);}}
}
// The unseen-work metaphor becomes a quiet human moment inside the earth.
function lonelyMoment(c,t){
 const darken=phase(52.8,53.8,t),arrive=phase(49.2,50.8,t),leave=1-phase(55.8,56.5,t),weight=arrive*leave,dark=arrive*(1-phase(56.5,59.2,t));if(dark<=0)return;
 c.save();c.fillStyle=`rgba(3,12,20,${dark*.84})`;c.fillRect(-4000,-4000,8000,8000);
 c.globalAlpha=weight;const center=phase(53.6,57.4,t);c.translate(lerp(130,0,center),lerp(590,530,center));const shrink=phase(53.8,55.8,t);c.translate(0,shrink*72);const size=(.78+.22*arrive)*lerp(1,.065,shrink);c.scale(size,size);const breath=Math.sin(t*1.35)*1.1;
 if(shrink>0){c.beginPath();c.arc(0,-8,lerp(190,54,phase(0,.6,shrink)),0,TAU);c.clip();}
 // Drooping shoulders, lowered gaze and knitted brows carry the emotion.
 const shirt=new Path2D();shirt.moveTo(-75,115);shirt.bezierCurveTo(-73,65,-42,48,-22,52);shirt.lineTo(20,52);shirt.bezierCurveTo(48,48,76,70,78,115);shirt.closePath();paint(c,shirt,mix(C.green,'#111b1b',darken));
 line(c,[[0,37],[0,64]],24,mix('#bf619f','#141c1c',darken));
 c.save();c.translate(0,breath);c.rotate(.08);
 const head=new Path2D();head.moveTo(-31,-50);head.bezierCurveTo(-57,-22,-48,24,-18,40);head.bezierCurveTo(11,59,45,34,43,5);head.bezierCurveTo(62,-18,29,-59,-1,-61);head.closePath();paint(c,head,mix('#c96bad','#141c1c',darken));
 // Orange hair and ponytail echo the player seen at the end of the film.
 const hair=new Path2D();hair.moveTo(-40,-10);hair.bezierCurveTo(-62,-45,-42,-75,-10,-67);hair.bezierCurveTo(26,-87,59,-45,46,-22);hair.bezierCurveTo(25,-42,4,-23,-22,-28);hair.lineTo(-32,-8);hair.closePath();paint(c,hair,mix('#c85226','#111919',darken));
 const tail=new Path2D();tail.moveTo(-42,-45);tail.bezierCurveTo(-100,-68,-84,5,-109,24);tail.bezierCurveTo(-62,26,-60,-13,-40,-23);tail.closePath();paint(c,tail,mix('#873f27','#111919',darken));
 oval(c,-35,4,10,13,mix('#c96bad','#141c1c',darken));
 // Two lowered eyes, inward-raised brows and a downturned mouth, not a smile.
 oval(c,-12,3,13,7,C.cream,.13);oval(c,20,5,12,6,C.cream,-.09);
 oval(c,-8,6,4,4,C.navy);oval(c,17,8,4,4,C.navy);
 // A single slow tear on the difficult/heavy phrase; no extra interaction loop.
 if(t>50.5){for(let j=0;j<4;j++){
  const u=((t-50.5)*.42+j*.49)%1,side=j%2?26:-9;
  c.save();c.globalAlpha*=Math.sin(u*Math.PI);line(c,[[side,12+u*24],[side-.5,17+u*24]],1.2,'#b7e1ee');oval(c,side,18+u*24,2.2,3.8,'#79c4dd');c.restore();
 }}
 c.restore();
 // Quiet shoulder silhouette; the tear motion carries the emotion.
 c.restore();
}

// Narration-led details: light reaches the leaves, gravity draws a trail down,
// then energy travels through the whole plant as the life metaphor is spoken.
function livingConnections(c,t){
 const light=phase(13,15,t)*(1-phase(23,24,t));
 if(light>0){c.save();c.beginPath();c.rect(-2000,-2500,4000,2500);c.clip();
  const glow=c.createRadialGradient(220,-690,65,180,-590,620);
  glow.addColorStop(0,'rgba(255,218,118,.3)');glow.addColorStop(.45,'rgba(255,207,97,.13)');glow.addColorStop(1,'rgba(255,207,97,0)');
  c.globalAlpha=light*(.88+.12*Math.sin(t*.7));c.fillStyle=glow;c.fillRect(-600,-1400,1500,1400);c.restore();}
 const energy=phase(43,44,t)*(1-phase(48,49,t));
 if(energy>0){c.save();c.globalAlpha=energy;for(let j=0;j<12;j++){
  const u=(t*.2+j/12)%1,y=600-u*1180,x=Math.sin(u*6)*14;
  oval(c,x,y,4,7,C.yellow);
 }c.restore();}
 // Falling earth during resistance, drifting pollen during visible success.
 const underground=phase(27,28,t)*(1-phase(36,37,t));
 if(underground>0){c.save();c.globalAlpha=underground*.65;for(let j=0;j<20;j++){
  const u=(t*.18+j*.173)%1;oval(c,-180+(j*71%360),80+u*480,2+j%3,2,C.root);
 }c.restore();}
 const pollen=phase(57,59,t)*(1-phase(64,65,t));
 if(pollen>0){c.save();c.globalAlpha=pollen*.7;for(let j=0;j<18;j++){
  const u=(t*.09+j*.13)%1;leaf(c,-320+(j*97%640)+Math.sin(t+j)*9,-160-u*610,8,-t*.4+j,C.yellow);
 }c.restore();}
}


function wateredRoots(c,t){
 // Keep the face and tears centered during the camera pullback. Dissolve the
 // cheek drops into the central root rather than sending them sideways.
 const end=1-phase(58.5,59.2,t);if(t<53.5||end<=0)return;
 const center=phase(53.6,57.4,t),cx=lerp(130,0,center),cy=lerp(590,530,center);
 c.save();
 for(let j=0;j<6;j++){
  const elapsed=t-(53.5+j*.28);if(elapsed<0)continue;
  const side=j%2?26:-9,localY=28;
  const sx=cx+side*Math.cos(.08)-localY*Math.sin(.08);
  const sy=cy+side*Math.sin(.08)+localY*Math.cos(.08);
  const blend=phase(.7,2,elapsed),life=phase(0,.18,elapsed)*(1-phase(3.1,3.65,elapsed))*end;
  // Both halves retain the same size, rhythm and downward motion through the fade.
  c.globalAlpha=life*(1-blend);oval(c,lerp(sx,0,blend*.85),sy+elapsed*12,2.2,3.8,'#79c4dd');
  const rootY=sy+elapsed*12;
  let index=mainRoot.curve.findIndex(at=>at[1]>=rootY);
  if(index<0)index=mainRoot.curve.length-1;
  const at=mainRoot.curve[index],spread=phase(1.4,3,elapsed);
  const branch=rootSpecs.filter(r=>r.pts.length===4)[6+j%6];
  const branchAt=branch.curve[Math.floor((.4+spread*.55)*(branch.curve.length-1))];
  c.globalAlpha=life*blend*(1-spread);oval(c,at[0],at[1],2.2,3.8,'#79c4dd');
  c.globalAlpha=life*blend*spread;oval(c,branchAt[0],branchAt[1],2.2,3.8,'#79c4dd');
 }
 // A gradual spread begins only after the first cheek drops reach the roots.
 const wet=phase(55.5,57.6,t)*end;
 rootSpecs.forEach((r,j)=>{for(let k=0;k<3;k++){
  const u=(((t-54)*.42+j*.07+k/3)%1+1)%1,at=r.curve[Math.floor(u*(r.curve.length-1))];
  c.globalAlpha=wet*phase(55.5+j*.055,56.6+j*.055,t);
  oval(c,at[0],at[1],2.2,3.8,'#79c4dd');
 }});c.restore();
}
// Tears dissolve into matching root droplets while the soil remains visible.
function draw(c,t){resetT(c);pattern??=c.createPattern(print,'repeat');c.fillStyle=C.blue;c.fillRect(0,0,W,H);c.save();
 if(t<66){const [x,y,z]=atKeys(cameraKeys,t);camera(c,x,y,z);sky(c,t,phase(56,66,t));
  if(t<25.8){const p=phase(0,9,t);earth(c,lerp(26,43,p),t);tree(c,lerp(47,61,p),t);pairedGrowth(c,t);livingConnections(c,t);}
  else{const g=growthClock(t);earth(c,g,t);tree(c,g,t);livingConnections(c,t);lonelyMoment(c,t);wateredRoots(c,t);}
  if(t>24.7&&t<26.8){c.save();c.globalAlpha=phase(24.7,25.1,t)*(1-phase(26.3,26.8,t));oval(c,0,20,38,46,C.yellow);c.restore();}
 }else{
  // A shared golden disc fills the frame at both sides of this match cut:
  // fruit becomes sun, then reveals the player returning to quiet practice.
  const reveal=phase(66,70.3,t),z=Math.exp(lerp(Math.log(75),Math.log(.96),reveal));camera(c,lerp(220,-20,reveal),lerp(-690,-170,reveal),z);stadium(c,t,true);
 }
 c.restore();
}
new FontFace('Story Brush','url(assets/Knewave-Regular.ttf)').load().then(font=>{document.fonts.add(font);defineFilm({palette:PALETTES.screenSea,timeline:[{name:'Grit — the unseen work',dur:76.375,fn:draw}],score:()=>{},format:{ar:'16:9',width:1920}});}).catch(console.error);
