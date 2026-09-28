import {vendingItem} from '../town/vendingCatalog';
import {BALL_COLORS} from '../town/customization';
/** Original product miniatures, shared by the world atlas and the interactive face. */
export function drawVendingProduct(c:CanvasRenderingContext2D,id:string,kind:string,x:number,y:number,s:number,shadow=true){
 c.save();c.translate(x,y);
 if(shadow){c.fillStyle='#173a3924';c.beginPath();c.ellipse(0,s*.95,s*.8,s*.14,0,0,Math.PI*2);c.fill();}
 if(kind==='display'){
  const d=vendingItem(id)?.display;if(!d){c.restore();return;}
  c.fillStyle='#233b48';c.fillRect(-s*.6,s*.72,s*1.2,s*.14);
  if(d.shape==='book'){
   // A hardback standing straight on the shelf, front-on: page block showing on the right, cloth spine on the left.
   const L=-s*.62,R=s*.56,T=-s*.98,B=s*.72;
   c.fillStyle='#e9dcc0';c.fillRect(R-s*.02,T+s*.05,s*.1,B-T-s*.08);c.strokeStyle='#c7b48e';c.lineWidth=Math.max(1,s*.012);for(let i=1;i<5;i++){c.beginPath();c.moveTo(R+s*.015*i,T+s*.07);c.lineTo(R+s*.015*i,B-s*.05);c.stroke();}
   c.fillStyle=d.color;c.fillRect(L,T,R-L,B-T);c.fillStyle='#0000002e';c.fillRect(L,T,s*.13,B-T);c.fillStyle='#ffffff26';c.fillRect(L+s*.13,T,s*.03,B-T);
   c.strokeStyle='#fff4d5aa';c.lineWidth=Math.max(1,s*.025);c.strokeRect(L+s*.22,T+s*.1,R-L-s*.32,B-T-s*.2);
   const cx=(L+s*.16+R)/2;c.fillStyle='#fff4d5';c.textAlign='center';c.font=`900 ${s*.27}px sans-serif`;c.fillText(d.title.toUpperCase(),cx,-s*.42,R-L-s*.36);c.font=`700 ${s*.12}px sans-serif`;c.fillText('POP-UP STORY',cx,-s*.2,R-L-s*.4);
   c.fillStyle='#fff4d5';c.beginPath();c.arc(cx,s*.24,s*.2,0,Math.PI*2);c.fill();c.fillStyle=d.color;c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.lineTo(cx+Math.cos(a)*s*.08,s*.24+Math.sin(a)*s*.08);}c.closePath();c.fill();
  }else if(d.shape==='frame'){
   c.fillStyle='#9a7844';c.fillRect(-s*.82,-s,s*1.64,s*1.8);c.fillStyle='#fff0cc';c.fillRect(-s*.72,-s*.9,s*1.44,s*1.6);c.fillStyle=d.color;c.fillRect(-s*.6,-s*.78,s*1.2,s*1.12);c.fillStyle='#fff2cb';c.font=`900 ${s*.65}px sans-serif`;c.textAlign='center';c.fillText('10',0,s*.02);c.fillStyle='#28434a';c.font=`800 ${s*.22}px sans-serif`;c.fillText(d.title,0,s*.59,s*1.25);
  }else if(d.shape==='lamp'){
   c.fillStyle='#d6ba75';c.fillRect(-s*.07,-s*.2,s*.14,s*.95);c.fillStyle=d.color;c.beginPath();c.moveTo(-s*.5,-s);c.lineTo(s*.5,-s);c.lineTo(s*.8,s*.02);c.lineTo(-s*.8,s*.02);c.fill();c.fillStyle='#ffe6a1';c.fillRect(-s*.8,0,s*1.6,s*.1);
  }else{
   const gold=c.createLinearGradient(-s*.6,0,s*.6,0);gold.addColorStop(0,'#aa7632');gold.addColorStop(.45,'#ffe2a1');gold.addColorStop(1,'#d3a244');c.fillStyle=gold;c.fillRect(-s*.12,s*.55,s*.24,s*.2);c.beginPath();c.moveTo(-s*.58,-s);c.lineTo(s*.58,-s);c.quadraticCurveTo(s*.5,0,s*.12,s*.12);c.lineTo(s*.12,s*.6);c.lineTo(-s*.12,s*.6);c.lineTo(-s*.12,s*.12);c.quadraticCurveTo(-s*.5,0,-s*.58,-s);c.fill();c.strokeStyle='#dab471';c.lineWidth=s*.1;c.beginPath();c.arc(0,-s*.62,s*.79,0,Math.PI);c.stroke();
  }
 }else if(kind==='ball'){
  const base=BALL_COLORS[id.slice(5) as keyof typeof BALL_COLORS]??'#f7edcc';
  const g=c.createRadialGradient(-s*.35,-s*.4,s*.05,0,0,s);g.addColorStop(0,'#fffaf0');g.addColorStop(.35,base);g.addColorStop(1,'#597f86');c.fillStyle=g;c.beginPath();c.arc(0,0,s,0,Math.PI*2);c.fill();
  c.save();c.clip();c.strokeStyle='#183f47';c.lineWidth=Math.max(1,s*.035);c.fillStyle='#264955';
  const panel=(px:number,py:number,r:number)=>{c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.lineTo(px+Math.cos(a)*r,py+Math.sin(a)*r);}c.closePath();c.fill();c.stroke();};
  panel(-s*.1,-s*.04,s*.34);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;panel(Math.cos(a)*s*.91,Math.sin(a)*s*.91,s*.24);c.beginPath();c.moveTo(Math.cos(a)*s*.3-s*.1,Math.sin(a)*s*.3);c.lineTo(Math.cos(a)*s*.77,Math.sin(a)*s*.77);c.stroke();}c.restore();
  c.strokeStyle='#fff9e8aa';c.lineWidth=s*.055;c.beginPath();c.arc(-s*.04,-s*.04,s*.87,3.5,4.8);c.stroke();
 }else{
  const five=id==='pack:5',special=!/^pack:[35]$/.test(id),base=special?'#335e76':five?'#715088':'#2e7867';
  c.rotate(-.07);const g=c.createLinearGradient(-s,0,s,0);g.addColorStop(0,base);g.addColorStop(.5,special?'#568dae':five?'#ab77ac':'#59a792');g.addColorStop(1,base);c.fillStyle=g;c.fillRect(-s*.7,-s,s*1.4,s*2);
  c.fillStyle='#ffe7a5';c.fillRect(-s*.7,-s,s*1.4,s*.12);c.fillRect(-s*.7,s*.86,s*1.4,s*.14);
  c.strokeStyle='#fff4d477';c.lineWidth=s*.025;for(let i=0;i<8;i++){const px=-s*.62+i*s*.175;c.beginPath();c.moveTo(px,-s);c.lineTo(px,-s*.9);c.moveTo(px,s*.9);c.lineTo(px,s);c.stroke();}
  c.fillStyle='#fff1c9';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=s*(i%2?.25:.49);c.lineTo(Math.cos(a)*r,Math.sin(a)*r-s*.13);}c.closePath();c.fill();
  c.fillStyle='#fff5d8';c.font=`900 ${Math.round(s*.3)}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(five?'5 CARDS':'3 CARDS',0,s*.58);
 }
 c.restore();
}
