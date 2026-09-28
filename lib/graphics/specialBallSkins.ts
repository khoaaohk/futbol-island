import {SPECIAL_BALL_IDS} from '../town/specialBalls';
/**
 * 128×64 equirectangular skins for the vending-machine special balls (lib/town/specialBalls.ts). Drawn once per style when a
 * ball is first shown, then cached by createBallAppearance with the other patterned skins. Returns the emissive tint, or null
 * when the style is not a special ball.
 */
export function drawSpecialBallSkin(c:CanvasRenderingContext2D,style:string):string|null{
 if(!SPECIAL_BALL_IDS.has(style))return null;
 const dots=(color:string,r:number,rows:number[][])=>{c.fillStyle=color;for(const [x,y] of rows){c.beginPath();for(let n=0;n<5;n++){const a=-Math.PI/2+n*Math.PI*2/5;n?c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();}};
 const grid=[[8,10],[40,10],[72,10],[104,10],[24,32],[56,32],[88,32],[120,32],[8,54],[40,54],[72,54],[104,54]];
 if(style==='telstar'){telstar(c);return '#000000';}
 if(style==='futsal'){c.fillStyle='#f2d23c';c.fillRect(0,0,128,64);c.fillStyle='#2356b8';for(let i=0;i<8;i++){c.beginPath();c.ellipse(i*16+8,i%2?20:44,7,10,i%2?.5:-.5,0,Math.PI*2);c.fill();}c.fillStyle='#ffffff';c.fillRect(0,30,128,4);return '#3a3000';}
 if(style==='grassroots'){c.fillStyle='#f5f2e6';c.fillRect(0,0,128,64);c.strokeStyle='#3f8f47';c.lineWidth=3;for(let row=-1;row<4;row++)for(let col=-1;col<5;col++){const x=col*32+(row%2)*16,y=row*22;c.beginPath();c.moveTo(x,y+6);c.lineTo(x+16,y);c.lineTo(x+32,y+6);c.lineTo(x+32,y+18);c.lineTo(x+16,y+24);c.lineTo(x,y+18);c.closePath();c.stroke();}return '#000000';}
 if(style==='hivis'){c.fillStyle='#e7f53c';c.fillRect(0,0,128,64);c.strokeStyle='#1c2a6b';c.lineWidth=5;c.beginPath();for(let x=0;x<=128;x+=4)c.lineTo(x,32+Math.sin(x/128*Math.PI*4)*12);c.stroke();c.strokeStyle='#ff7a1a';c.lineWidth=2;c.beginPath();for(let x=0;x<=128;x+=4)c.lineTo(x,32+Math.sin(x/128*Math.PI*4+1)*16);c.stroke();return '#4a5200';}
 if(style==='eleven'){c.fillStyle='#f1ede2';c.fillRect(0,0,128,64);c.fillStyle='#1d2f5e';for(let i=0;i<4;i++){c.beginPath();c.moveTo(i*32,64);c.quadraticCurveTo(i*32+16,20,i*32+32,0);c.lineTo(i*32+24,0);c.quadraticCurveTo(i*32+10,24,i*32-6,64);c.fill();}c.fillStyle='#e8b33c';c.fillRect(0,28,128,3);return '#000000';}
 if(style==='beach'){const stripes=['#ff6b6b','#ffb347','#ffe66d','#4ecdc4','#5b8cff','#c77dff'];stripes.forEach((color,i)=>{c.fillStyle=color;c.fillRect(0,i*64/6,128,64/6+1);});c.fillStyle='#ffffff';c.beginPath();c.arc(32,32,7,0,Math.PI*2);c.arc(96,32,7,0,Math.PI*2);c.fill();return '#2a1200';}
 if(style==='retro'){c.fillStyle='#8a5a33';c.fillRect(0,0,128,64);c.strokeStyle='#5f3a1e';c.lineWidth=1.5;for(let x=0;x<128;x+=21){c.beginPath();c.moveTo(x,0);c.lineTo(x,64);c.stroke();}for(let y=0;y<64;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(128,y);c.stroke();}c.strokeStyle='#efe0b8';c.lineWidth=2;c.beginPath();c.moveTo(56,22);c.lineTo(56,42);c.moveTo(72,22);c.lineTo(72,42);c.stroke();for(let y=24;y<=40;y+=4){c.beginPath();c.moveTo(56,y);c.lineTo(72,y+2);c.stroke();}return '#000000';}
 // panna: street-cage graffiti splashes on lilac
 c.fillStyle='#b98af0';c.fillRect(0,0,128,64);const splash=['#ffe66d','#ffffff','#3c2a6b','#ff7ab8'];for(let i=0;i<14;i++){c.fillStyle=splash[i%4];c.beginPath();c.arc((i*37+9)%128,(i*23+5)%64,i%3?3:5.5,0,Math.PI*2);c.fill();}c.strokeStyle='#3c2a6b';c.lineWidth=3;c.beginPath();c.moveTo(10,48);c.bezierCurveTo(40,10,80,60,118,16);c.stroke();return '#2a1350';
}

/** A real 32-panel truncated icosahedron projected into the sphere's equirectangular UVs, so the 12 black pentagons keep
 * their shape on the ball instead of stretching into blobs near the poles. Painted once and cached by ballAppearance. */
function telstar(c:CanvasRenderingContext2D){
 // Twice the usual skin size so panel edges stay crisp in close-up previews.
 c.canvas.width=256;c.canvas.height=128;
 const W=c.canvas.width,H=c.canvas.height,g=(1+Math.sqrt(5))/2,faces:{n:number[];r:number;pent:boolean}[]=[];
 const add=(v:number[],pent:boolean)=>{const l=Math.hypot(v[0],v[1],v[2]);faces.push({n:v.map(x=>x/l),r:pent?2.3276:2.2672,pent});};
 for(const a of [-1,1])for(const b of [-1,1]){add([0,a,b*g],true);add([a,b*g,0],true);add([b*g,0,a],true);}
 for(const a of [-1,1])for(const b of [-1,1])for(const d of [-1,1])add([a,b,d],false);
 for(const a of [-1,1])for(const b of [-1,1]){add([0,a/g,b*g],false);add([a/g,b*g,0],false);add([b*g,0,a/g],false);}
 const img=c.createImageData(W,H),px=img.data;
 for(let y=0;y<H;y++){const th=(y+.5)/H*Math.PI;for(let x=0;x<W;x++){const ph=(x+.5)/W*Math.PI*2,d=[-Math.cos(ph)*Math.sin(th),Math.cos(th),Math.sin(ph)*Math.sin(th)];
  let best=-9,second=-9,pent=false;for(const f of faces){const v=(f.n[0]*d[0]+f.n[1]*d[1]+f.n[2]*d[2])*f.r;if(v>best){second=best;best=v;pent=f.pent;}else if(v>second)second=v;}
  const seam=best-second<.022,col=seam?[150,146,136]:pent?[29,29,31]:[244,241,232],i=(y*W+x)*4;px[i]=col[0];px[i+1]=col[1];px[i+2]=col[2];px[i+3]=255;}}
 c.putImageData(img,0,0);
}
