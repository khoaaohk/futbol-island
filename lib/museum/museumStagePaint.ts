/**
 * (Each region is clipped to its own rectangle: a sunburst never bleeds into its neighbour.)
 * The storytelling stages' printed set dressing (Oct 4 2026), painted ONCE per visit into one 1024² canvas in the island's
 * riso style (two or three inks, halftone dots, a slight mis-registration): the 1891 crowd stand, the 1863 meeting room, the
 * zoetrope's workshop poster, the 1930 stadium, the penalty pitch (grass stripes + chalk), the goal net, a whistle puff, a
 * sparkle and the IFAB seal. No people's names, no new facts: scenery only (the seal carries the case's own "IFAB, 1886").
 */
export const STAGE=1024,STAGE_H=2048;
export type Rect={x:number;y:number;w:number;h:number};
const r=(x:number,y:number,w:number,h:number):Rect=>({x,y,w,h});
export const STAGE_RECTS={pen:r(0,0,512,384),laws:r(512,0,512,384),zoe:r(0,384,512,384),wc:r(512,384,512,384),grass:r(0,768,512,256),net:r(512,768,256,256),puff:r(768,768,128,128),spark:r(896,768,128,128),seal:r(768,896,128,128),floor:r(896,896,128,128),
 cards:r(0,1024,340,256),var:r(340,1024,340,256),wwc:r(680,1024,340,256),futsal:r(0,1280,340,256),leather:r(340,1280,340,256),telstar:r(680,1280,340,256),shirts:r(0,1536,340,256),hall:r(340,1536,340,256),cloud:r(680,1536,170,128),drop:r(850,1536,32,64),beam:r(882,1536,128,128)} as const;
const PAPER='#f6ecd6',PINK='#ff48b0',BLUE='#3255a4',TEAL='#2f8f8a',YELLOW='#f2bb45',INK='#22366b',GREEN='#4f9a5b';

function halftone(g:CanvasRenderingContext2D,rc:Rect,color:string,density:(u:number,v:number)=>number,step=9,dx=0,dy=0){
 g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();g.fillStyle=color;g.globalCompositeOperation='multiply';
 for(let y=rc.y;y<rc.y+rc.h+step;y+=step)for(let x=rc.x+((y/step)%2?step/2:0);x<rc.x+rc.w+step;x+=step){const d=density((x-rc.x)/rc.w,(y-rc.y)/rc.h);if(d<=.02)continue;g.beginPath();g.arc(x+dx,y+dy,step*.5*Math.min(1,d),0,Math.PI*2);g.fill();}
 g.restore();
}
function ink(g:CanvasRenderingContext2D,color:string,draw:()=>void,dx=0,dy=0){g.save();g.globalCompositeOperation='multiply';g.translate(dx,dy);g.fillStyle=color;g.strokeStyle=color;draw();g.restore();}
const rnd=(seed:number)=>{let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};

export function paintStage(canvas:HTMLCanvasElement){
 canvas.width=STAGE;canvas.height=STAGE_H;const g=canvas.getContext('2d');if(!g)return canvas;g.clearRect(0,0,STAGE,STAGE_H);
 const paper=(rc:Rect)=>{g.fillStyle=PAPER;g.fillRect(rc.x,rc.y,rc.w,rc.h);};
 // 1891: a wooden stand packed with flat-capped spectators under a pale sky.
 {const rc=STAGE_RECTS.pen;g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();paper(rc);halftone(g,r(rc.x,rc.y,rc.w,rc.h*.45),'#9fc3e6',(u,v)=>.55-v*.5,10);
  ink(g,'#c9a36a',()=>g.fillRect(rc.x,rc.y+rc.h*.42,rc.w,rc.h*.58));
  const R=rnd(1891);for(let row=0;row<5;row++){const y=rc.y+rc.h*.5+row*44;for(let x=rc.x+10+(row%2)*14;x<rc.x+rc.w;x+=28){const c=['#8fa6d8','#f3a3cf','#6b7aa6'][Math.floor(R()*3)];
   ink(g,c,()=>{g.beginPath();g.arc(x,y,11,0,Math.PI*2);g.fill();g.fillRect(x-9,y+8,18,22);g.fillRect(x-13,y-9,26,5);g.fillRect(x-8,y-17,16,9);},R()*3-1.5,R()*2);}
   ink(g,'#8a6a3c',()=>g.fillRect(rc.x,y+28,rc.w,6));}
  halftone(g,rc,PINK,(u,v)=>v>.4?.1:0,12,3,2);g.restore();}
 // 1863: a meeting room: striped wallpaper, a tall window, a framed sheet of ruled lines, a hanging lamp.
 {const rc=STAGE_RECTS.laws;g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();paper(rc);for(let x=rc.x;x<rc.x+rc.w;x+=32)ink(g,'#e8c9a0',()=>g.fillRect(x,rc.y,14,rc.h));
  ink(g,'#9d805b',()=>g.fillRect(rc.x,rc.y+rc.h*.78,rc.w,rc.h*.22));
  ink(g,BLUE,()=>{g.fillRect(rc.x+40,rc.y+50,120,190);},2,2);ink(g,'#cfe3f0',()=>g.fillRect(rc.x+52,rc.y+62,96,166));ink(g,BLUE,()=>{g.fillRect(rc.x+97,rc.y+62,6,166);g.fillRect(rc.x+52,rc.y+140,96,6);});
  ink(g,YELLOW,()=>g.fillRect(rc.x+300,rc.y+60,150,190),-2,1);ink(g,PAPER,()=>g.fillRect(rc.x+314,rc.y+74,122,162));for(let k=0;k<8;k++)ink(g,INK,()=>g.fillRect(rc.x+328,rc.y+94+k*17,k%3?92:60,4));
  ink(g,INK,()=>{g.fillRect(rc.x+255,rc.y,3,60);g.beginPath();g.moveTo(rc.x+232,rc.y+80);g.lineTo(rc.x+280,rc.y+80);g.lineTo(rc.x+266,rc.y+58);g.lineTo(rc.x+246,rc.y+58);g.fill();});
  halftone(g,r(rc.x+200,rc.y+80,120,120),YELLOW,(u,v)=>.9-Math.hypot(u-.5,v-.1)*1.8,8);halftone(g,rc,PINK,(u,v)=>v>.78?.25:.06,12,2,3);g.restore();}
 // The zoetrope's stage: a fairground sunburst poster in teal and yellow.
 {const rc=STAGE_RECTS.zoe;g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();paper(rc);const cx=rc.x+rc.w/2,cy=rc.y+rc.h*.55;for(let k=0;k<24;k++){const a0=k/24*Math.PI*2,a1=(k+.5)/24*Math.PI*2;ink(g,k%2?TEAL:YELLOW,()=>{g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,420,a0,a1);g.fill();},k%2?2:0,k%2?1:0);}
  halftone(g,rc,PINK,(u,v)=>.35-Math.hypot(u-.5,v-.55)*.3,11,2,2);ink(g,PAPER,()=>{g.beginPath();g.arc(cx,cy,70,0,Math.PI*2);g.fill();});ink(g,INK,()=>{g.lineWidth=6;g.beginPath();g.arc(cx,cy,70,0,Math.PI*2);g.stroke();});g.restore();}
 // 1930: a stadium bowl full of crowd dots, bunting and sun rays.
 {const rc=STAGE_RECTS.wc;g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();paper(rc);for(let k=0;k<12;k++){const a0=Math.PI+k/12*Math.PI,a1=a0+Math.PI/24;ink(g,'#f6d98a',()=>{g.beginPath();g.moveTo(rc.x+rc.w/2,rc.y+rc.h*.42);g.arc(rc.x+rc.w/2,rc.y+rc.h*.42,600,a0,a1);g.fill();});}
  ink(g,'#c9a36a',()=>g.fillRect(rc.x,rc.y+rc.h*.38,rc.w,rc.h*.62));halftone(g,r(rc.x,rc.y+rc.h*.38,rc.w,rc.h*.62),'#8fa6d8',(u,v)=>.45+.15*Math.sin(u*12+v*5),11);halftone(g,r(rc.x,rc.y+rc.h*.38,rc.w,rc.h*.62),'#f3a3cf',(u,v)=>.35+.15*Math.cos(u*10-v*4),11,4,3);
  for(let k=0;k<14;k++){const x=rc.x+k*38;ink(g,[PINK,TEAL,YELLOW,BLUE][k%4],()=>{g.beginPath();g.moveTo(x,rc.y+rc.h*.3);g.lineTo(x+36,rc.y+rc.h*.3);g.lineTo(x+18,rc.y+rc.h*.3+26);g.fill();});}
  ink(g,INK,()=>g.fillRect(rc.x,rc.y+rc.h*.3-3,rc.w,3));g.restore();}
 // The penalty pitch: mown stripes and chalk (goal line at the top, the spot, the arc).
 {const rc=STAGE_RECTS.grass;g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();for(let k=0;k<8;k++){g.fillStyle=k%2?GREEN:'#5aa866';g.fillRect(rc.x,rc.y+k*rc.h/8,rc.w,rc.h/8);}halftone(g,rc,'#2f6b3c',(u,v)=>.18,7,1,1);
  g.fillStyle='#fff8e6';g.fillRect(rc.x,rc.y+18,rc.w,5);g.fillRect(rc.x+110,rc.y+18,5,70);g.fillRect(rc.x+rc.w-115,rc.y+18,5,70);g.fillRect(rc.x+110,rc.y+86,rc.w-220,5);
  g.beginPath();g.arc(rc.x+rc.w/2,rc.y+150,6,0,Math.PI*2);g.fill();g.strokeStyle='#fff8e6';g.lineWidth=5;g.beginPath();g.arc(rc.x+rc.w/2,rc.y+150,70,.35*Math.PI,.65*Math.PI);g.stroke();g.restore();}
 // The goal net (alpha): a diamond mesh.
 {const rc=STAGE_RECTS.net;g.clearRect(rc.x,rc.y,rc.w,rc.h);g.strokeStyle='rgba(255,255,255,.92)';g.lineWidth=2.5;for(let k=-rc.h;k<rc.w+rc.h;k+=18){g.beginPath();g.moveTo(rc.x+k,rc.y);g.lineTo(rc.x+k+rc.h,rc.y+rc.h);g.stroke();g.beginPath();g.moveTo(rc.x+k+rc.h,rc.y);g.lineTo(rc.x+k,rc.y+rc.h);g.stroke();}}
 // A whistle puff ("PEEP!"), a sparkle star, the IFAB seal, and a floor marker ring.
 {const rc=STAGE_RECTS.puff;g.clearRect(rc.x,rc.y,rc.w,rc.h);g.fillStyle='#ffffff';for(const [x,y,s] of [[40,70,30],[70,52,34],[96,72,26],[64,84,28]])g.beginPath(),g.arc(rc.x+x,rc.y+y,s,0,Math.PI*2),g.fill();g.fillStyle=INK;g.font='900 22px system-ui, sans-serif';g.textAlign='center';g.fillText('PEEP!',rc.x+66,rc.y+76);}
 {const rc=STAGE_RECTS.spark;g.clearRect(rc.x,rc.y,rc.w,rc.h);g.fillStyle=YELLOW;g.beginPath();const cx=rc.x+64,cy=rc.y+64;for(let i=0;i<8;i++){const a=i/8*Math.PI*2,rad=i%2?14:58;g.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}g.fill();}
 {const rc=STAGE_RECTS.seal;g.clearRect(rc.x,rc.y,rc.w,rc.h);const cx=rc.x+64,cy=rc.y+64;g.fillStyle=YELLOW;g.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,rad=i%2?54:62;g.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}g.fill();g.fillStyle='#e0a33a';g.beginPath();g.arc(cx,cy,44,0,Math.PI*2);g.fill();
  g.fillStyle=INK;g.textAlign='center';g.font='900 26px system-ui, sans-serif';g.fillText('IFAB',cx,cy+2);g.font='800 18px system-ui, sans-serif';g.fillText('1886',cx,cy+24);}
 {const rc=STAGE_RECTS.floor;g.clearRect(rc.x,rc.y,rc.w,rc.h);g.fillStyle=PAPER;g.beginPath();g.arc(rc.x+64,rc.y+64,62,0,Math.PI*2);g.fill();g.fillStyle=TEAL;g.beginPath();g.arc(rc.x+64,rc.y+64,48,0,Math.PI*2);g.fill();g.fillStyle=PAPER;g.beginPath();g.arc(rc.x+64,rc.y+64,9,0,Math.PI*2);g.fill();}
 const clip=(rc:Rect,fn:()=>void)=>{g.save();g.beginPath();g.rect(rc.x,rc.y,rc.w,rc.h);g.clip();paper(rc);fn();g.restore();};
 // 1970 cards: a darkened lecture wall for the lantern's slides (curtain folds, a projection square).
 clip(STAGE_RECTS.cards,()=>{const rc=STAGE_RECTS.cards;ink(g,'#3a2f4f',()=>g.fillRect(rc.x,rc.y,rc.w,rc.h));for(let x=rc.x;x<rc.x+rc.w;x+=22)ink(g,'#4d3f66',()=>g.fillRect(x,rc.y,10,rc.h));ink(g,'#d8466f',()=>g.fillRect(rc.x,rc.y,rc.w,22));halftone(g,rc,PINK,()=>.1,10,2,2);});
 // VAR: a dark booth wall with rows of small screens and a red ON AIR light.
 clip(STAGE_RECTS.var,()=>{const rc=STAGE_RECTS.var;ink(g,'#1f2a44',()=>g.fillRect(rc.x,rc.y,rc.w,rc.h));for(let r2=0;r2<3;r2++)for(let c=0;c<5;c++)ink(g,(r2+c)%3?'#3a6a8a':'#4f9a5b',()=>g.fillRect(rc.x+14+c*65,rc.y+20+r2*60,55,42));ink(g,'#e0453d',()=>{g.beginPath();g.arc(rc.x+rc.w-24,rc.y+220,10,0,Math.PI*2);g.fill();});halftone(g,rc,BLUE,()=>.15,9,2,1);});
 // 1991: a riso world map (blobby continents in pink and teal on blue sea).
 clip(STAGE_RECTS.wwc,()=>{const rc=STAGE_RECTS.wwc;ink(g,'#bfd6ee',()=>g.fillRect(rc.x,rc.y,rc.w,rc.h));halftone(g,rc,BLUE,(u,v)=>.25+.1*Math.sin(u*20+v*10),9);
  for(const [x,y,w,h,c] of [[40,60,80,70,TEAL],[70,140,50,80,TEAL],[150,50,60,60,PINK],[160,110,45,80,PINK],[210,50,100,80,TEAL],[270,150,40,40,PINK]] as const)ink(g,c,()=>{g.beginPath();g.ellipse(rc.x+x,rc.y+y,w/2,h/2,.3,0,Math.PI*2);g.fill();},1,1);});
 // Futsal: an indoor hall: brick wall, high windows, a scoreboard box.
 clip(STAGE_RECTS.futsal,()=>{const rc=STAGE_RECTS.futsal;for(let y=rc.y;y<rc.y+rc.h;y+=16)for(let x=rc.x+((y/16)%2?16:0);x<rc.x+rc.w;x+=32)ink(g,'#d98b6a',()=>g.fillRect(x,y,30,14));for(let k=0;k<4;k++)ink(g,'#bfe0f0',()=>g.fillRect(rc.x+20+k*80,rc.y+20,60,50));ink(g,INK,()=>g.fillRect(rc.x+130,rc.y+100,80,40));halftone(g,rc,PINK,()=>.12,10,2,2);});
 // Ball cabinet: workshop shelves with boot shapes and a tape measure.
 clip(STAGE_RECTS.leather,()=>{const rc=STAGE_RECTS.leather;ink(g,'#e8c9a0',()=>g.fillRect(rc.x,rc.y,rc.w,rc.h));for(let k=0;k<3;k++)ink(g,'#8a5a33',()=>g.fillRect(rc.x,rc.y+60+k*70,rc.w,8));for(let k=0;k<5;k++)ink(g,'#5a3a22',()=>{g.beginPath();g.ellipse(rc.x+40+k*62,rc.y+50,22,10,0,0,Math.PI*2);g.fill();});ink(g,YELLOW,()=>g.fillRect(rc.x+20,rc.y+200,rc.w-40,10));for(let x=rc.x+20;x<rc.x+rc.w-20;x+=12)ink(g,INK,()=>g.fillRect(x,rc.y+200,2,6));halftone(g,rc,PINK,()=>.1,10,2,2);});
 // 1970 TV: a cosy living room: wallpaper diamonds, a lamp, a cabinet.
 clip(STAGE_RECTS.telstar,()=>{const rc=STAGE_RECTS.telstar;ink(g,'#f3d9a8',()=>g.fillRect(rc.x,rc.y,rc.w,rc.h));for(let y=rc.y;y<rc.y+rc.h;y+=30)for(let x=rc.x+((y/30)%2?15:0);x<rc.x+rc.w;x+=30)ink(g,'#e0a33a',()=>{g.beginPath();g.moveTo(x,y);g.lineTo(x+6,y+8);g.lineTo(x,y+16);g.lineTo(x-6,y+8);g.fill();});ink(g,'#9d805b',()=>g.fillRect(rc.x,rc.y+rc.h-50,rc.w,50));halftone(g,rc,TEAL,()=>.1,10,2,2);});
 // Dressing room: tiles and a bench line.
 clip(STAGE_RECTS.shirts,()=>{const rc=STAGE_RECTS.shirts;for(let y=rc.y;y<rc.y+rc.h;y+=20)for(let x=rc.x;x<rc.x+rc.w;x+=20)ink(g,(x/20+y/20)%2?'#e6f0ec':'#d4e6df',()=>g.fillRect(x,y,19,19));ink(g,TEAL,()=>g.fillRect(rc.x,rc.y+rc.h-36,rc.w,10));halftone(g,rc,BLUE,()=>.08,10,2,2);});
 // Hall of Fame: red curtains and two spotlight cones.
 clip(STAGE_RECTS.hall,()=>{const rc=STAGE_RECTS.hall;ink(g,'#8a2f3a',()=>g.fillRect(rc.x,rc.y,rc.w,rc.h));for(let x=rc.x;x<rc.x+rc.w;x+=18)ink(g,'#a23a46',()=>g.fillRect(x,rc.y,8,rc.h));for(const cx of [rc.x+80,rc.x+260])ink(g,'#fff1b8',()=>{g.globalAlpha=.6;g.beginPath();g.moveTo(cx-10,rc.y);g.lineTo(cx+10,rc.y);g.lineTo(cx+70,rc.y+rc.h);g.lineTo(cx-70,rc.y+rc.h);g.fill();});halftone(g,rc,YELLOW,()=>.1,10,2,2);});
 // A rain cloud, a raindrop and a soft light beam (alpha).
 {const rc=STAGE_RECTS.cloud;g.clearRect(rc.x,rc.y,rc.w,rc.h);g.fillStyle='#8a9bb5';for(const [x,y,s2] of [[45,70,32],[85,55,40],[125,72,30],[85,85,30]])g.beginPath(),g.arc(rc.x+x,rc.y+y,s2,0,Math.PI*2),g.fill();}
 {const rc=STAGE_RECTS.drop;g.clearRect(rc.x,rc.y,rc.w,rc.h);g.fillStyle='#6fa8dc';g.beginPath();g.moveTo(rc.x+16,rc.y+4);g.quadraticCurveTo(rc.x+30,rc.y+44,rc.x+16,rc.y+56);g.quadraticCurveTo(rc.x+2,rc.y+44,rc.x+16,rc.y+4);g.fill();}
 {const rc=STAGE_RECTS.beam;g.clearRect(rc.x,rc.y,rc.w,rc.h);const gr=g.createLinearGradient(rc.x,0,rc.x+rc.w,0);gr.addColorStop(0,'rgba(255,246,200,.0)');gr.addColorStop(.5,'rgba(255,246,200,.55)');gr.addColorStop(1,'rgba(255,246,200,.0)');g.fillStyle=gr;g.fillRect(rc.x,rc.y,rc.w,rc.h);}
 return canvas;
}
