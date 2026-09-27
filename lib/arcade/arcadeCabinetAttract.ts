import * as T from 'three';
import type {ArcadeCabinetId} from './arcadeCatalog';

const INK='#152e38',CREAM='#fff0cd',GOLD='#efc060',CORAL='#ee927e',TEAL='#388d7d',BLUE='#83cce0';
const TITLES:Record<ArcadeCabinetId,string>={runner:'BREAKAWAY',tennis:'FUTBOL TENNIS',pinball:'FUTBOL PINBALL',puzzle:'PASS PUZZLES',live:'ISLAND STRIKERS'};
const DASH=[5,4],SOLID:number[]=[];
const PINBALL_PATH=[128,153,69,103,110,65,186,90,150,139,119,101,153,43,128,25];
const PUZZLE_PATH=[60,144,105,113,171,86,136,34];
const STRIKER_PATH=[67,137,155,119,173,72,124,31];
const clamp=(v:number)=>Math.max(0,Math.min(1,v)),ease=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};

/** A small authored illustration, never a nested game. The room owns scheduling/visibility. */
export function createArcadeCabinetAttract(id:ArcadeCabinetId){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;
 const c=canvas.getContext('2d')!;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
 let disposed=false,lastSlot=-1,lastReduced=false,frames=0,ballX=128,ballY=96;
 function rect(x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(x,y,w,h);}
 function line(x:number,y:number,x2:number,y2:number,color:string,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 function circle(x:number,y:number,r:number,color:string){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 function ring(x:number,y:number,r:number,color:string,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
 function label(text:string,color=CREAM){rect(0,174,256,18,INK);c.fillStyle=color;c.font='bold 10px sans-serif';c.textAlign='center';c.fillText(text,128,186);}
 function goal(x:number,y:number,w=44){rect(x-w/2,y,w,14,INK);c.strokeStyle=CREAM;c.lineWidth=2;c.strokeRect(x-w/2,y,w,14);for(let n=1;n<5;n++)line(x-w/2+n*w/5,y,x-w/2+n*w/5,y+14,'#9bb5a4',.7);line(x-w/2,y+7,x+w/2,y+7,'#9bb5a4',.7);}
 function football(x:number,y:number,r=4){circle(x+1,y+2,r+1,'#244f4e');circle(x,y,r,CREAM);circle(x+.6,y-.3,r*.36,INK);}
 function bean(x:number,y:number,color:string,angle=0,hop=0,pose=0){c.save();c.translate(x,y);c.fillStyle='#23534d';c.beginPath();c.ellipse(0,5,7,3,0,0,Math.PI*2);c.fill();c.translate(0,-hop);c.rotate(angle);line(-3,4,-4+pose*5,9,color,3);line(3,4,4+pose*7,9-pose*8,color,3);line(-5,-1,-8,-1-pose*3,color,3);line(5,-1,8,-2+pose*3,color,3);c.fillStyle=color;c.beginPath();c.ellipse(0,0,6,8,0,0,Math.PI*2);c.fill();circle(0,-7,4,'#e6bb91');rect(-3,-11,6,3,INK);c.restore();}
 function pitch(){rect(13,21,230,151,TEAL);for(let i=0;i<5;i++)rect(15,23+i*30,226,15,'#419b86');c.strokeStyle=CREAM;c.lineWidth=1.5;c.strokeRect(25,30,206,133);line(25,96,231,96,CREAM,1);ring(128,96,23,CREAM,1);goal(128,23);}
 function burst(x:number,y:number,p:number,color=GOLD){if(p<=0||p>=1)return;ring(x,y,6+p*20,color,2);for(let i=0;i<6;i++){const a=i*Math.PI/3;line(x+Math.cos(a)*(9+p*12),y+Math.sin(a)*(9+p*12),x+Math.cos(a)*(12+p*21),y+Math.sin(a)*(12+p*21),color,2);}}
 function pathBall(path:readonly number[],progress:number){const n=path.length/2-1,k=Math.min(n-1,Math.floor(clamp(progress)*n)),p=ease(clamp(progress)*n-k);ballX=path[k*2]+(path[k*2+2]-path[k*2])*p;ballY=path[k*2+1]+(path[k*2+3]-path[k*2+1])*p;}
 function drawRunner(t:number){
  const p=(t%7)/7;rect(0,20,256,154,'#c7aa79');rect(53,20,150,154,TEAL);for(let i=0;i<7;i++){const y=24+(i*27+t*29)%149;line(54,y,202,y,'#4a9d85',5);}line(103,25,103,170,CREAM,1);line(153,25,153,170,CREAM,1);goal(128,24,73);
  const dodge=ease((p-.18)/.13)-ease((p-.43)/.14),x=128+dodge*48;
  for(let i=0;i<3;i++){const y=48+(t*31+i*53)%93;bean(i===1?177:128,y,CORAL,0,0,Math.sin(t*7+i)*.12);}
  const charge=clamp((p-.58)/.18),shot=clamp((p-.76)/.15);bean(x,145,GOLD,0,0,shot>0?.8:Math.sin(t*9)*.13);football(shot>0?x+(128-x)*ease(shot):x+6,shot>0?140-105*ease(shot):136,4);
  if(charge>0&&shot===0){ring(x,145,11+charge*3,GOLD,2);}burst(128,36,clamp((p-.9)/.1));label(p>.9?'GOAL!':p>.58?'HOLD · AIM · SHOOT':'DODGE THE TACKLE',p>.9?GOLD:CREAM);
 }
 function drawTennis(t:number){
  const p=(t%5)/5,flight=p<.5?p*2:(p-.5)*2,returning=p>=.5,x=returning?177-95*flight:82+95*flight,y=returning?145-90*flight:55+90*flight,lift=Math.sin(flight*Math.PI)*24;
  rect(25,24,206,147,'#307b70');c.strokeStyle=CREAM;c.lineWidth=2;c.strokeRect(34,31,188,132);line(34,96,222,96,CREAM,3);for(let n=0;n<20;n++)line(35+n*9.8,90,35+n*9.8,101,'#b7d6bd',.8);for(let n=0;n<3;n++)line(34,91+n*4,222,91+n*4,'#b7d6bd',.8);
  const kick=returning&&flight<.22?Math.sin((1-flight/.22)*Math.PI/2):0;bean(82,48,CORAL);bean(177,152,GOLD,-kick*1.35,kick*9,kick);
  circle(x,y+3,4,'#1d574c');for(let n=3;n>0;n--)circle(x+(returning?1:-1)*n*3,y-lift+n*2,1.6,returning?CORAL:BLUE);football(x,y-lift,5);if(flight<.12)burst(returning?177:82,returning?145:55,flight/.12,returning?CORAL:BLUE);
  label(returning?'SCISSOR · EXTRA PACE':'ONE BOUNCE · FIND YOUR ANGLE',returning?CORAL:CREAM);
 }
 function drawPinball(t:number){
  const p=(t%6)/6;rect(37,22,182,151,'#358873');c.strokeStyle=CREAM;c.lineWidth=3;c.strokeRect(43,28,159,137);goal(124,25,66);line(207,30,207,166,GOLD,3);ring(124,105,27,CREAM,1);
  for(let i=0;i<3;i++){const x=87+i*37,y=i===1?61:84;ring(x,y,12,CORAL,4);circle(x,y,6,GOLD);}const dive=Math.sin(clamp((p-.72)/.23)*Math.PI);bean(126+Math.sin(t*2)*20,48,CORAL,dive*1.2,dive*4);
  const hit=Math.max(0,Math.sin(t*7));bean(83,151,GOLD,-.45,0,hit);bean(166,151,GOLD,.45,0,Math.max(0,Math.cos(t*7)));pathBall(PINBALL_PATH,p);
  football(ballX,ballY,5);burst(ballX,ballY,(p*7)%1<.16?(p*7)%1/.16:0);label(p>.9?'TOP CORNER!':'READ THE REBOUND · TIME THE FEET',p>.9?GOLD:CREAM);
 }
 function drawPuzzle(t:number){
  const p=(t%8)/8;pitch();bean(60,149,GOLD);bean(105,118,GOLD);bean(171,91,GOLD);bean(135,101,CORAL);bean(92,74,CORAL);
  const progress=clamp(p/.42);c.setLineDash(DASH);for(let i=0;i<3;i++){const q=clamp(progress*3-i);line(PUZZLE_PATH[i*2],PUZZLE_PATH[i*2+1],PUZZLE_PATH[i*2]+(PUZZLE_PATH[i*2+2]-PUZZLE_PATH[i*2])*q,PUZZLE_PATH[i*2+1]+(PUZZLE_PATH[i*2+3]-PUZZLE_PATH[i*2+1])*q,BLUE,3);}c.setLineDash(SOLID);
  const play=clamp((p-.45)/.43);pathBall(PUZZLE_PATH,play);football(ballX,ballY,4);if(p<.42){pathBall(PUZZLE_PATH,progress);ring(ballX,ballY,7,CREAM,2);}burst(136,34,clamp((p-.88)/.12));label(p<.45?'DRAW THE PASS INTO SPACE':p>.88?'TEAM GOAL!':'PASS · RECEIVE · FINISH',p<.45?BLUE:GOLD);
 }
 function drawStrikers(t:number){
  const p=(t%7)/7;pitch();const run=ease((p-.33)/.3);bean(67,142,GOLD);bean(155+18*run,124-52*run,GOLD);bean(181,111,CORAL,-.9*ease((p-.35)/.12),0,ease((p-.35)/.12));bean(93,74,CORAL);bean(128+Math.sin(t*2)*15,45,CORAL);bean(48,86,GOLD);
  pathBall(STRIKER_PATH,clamp(p/.85));for(let n=3;n>0;n--)circle(ballX+n*2,ballY+n*3,1.5,GOLD);football(ballX,ballY,4);burst(124,31,clamp((p-.85)/.15));label(p<.3?'PASS TO YOUR TEAMMATE':p<.62?'MOVE BEYOND THE TACKLE':p<.85?'PLACE THE FINISH':'GOAL!',p>.85?GOLD:CREAM);
 }
 function draw(time:number){c.setTransform(1,0,0,1,0,0);rect(0,0,256,192,INK);c.lineCap='round';c.fillStyle=CREAM;c.font='bold 12px sans-serif';c.textAlign='center';c.fillText(TITLES[id],128,14);if(id==='runner')drawRunner(time);else if(id==='tennis')drawTennis(time);else if(id==='pinball')drawPinball(time);else if(id==='puzzle')drawPuzzle(time);else drawStrikers(time);texture.needsUpdate=true;frames++;}
 draw(id==='tennis'?2.65:id==='runner'?4.7:id==='puzzle'?3.2:2.7);
 return{texture,get frames(){return frames;},update(_dt:number,time:number,active:boolean,reduced:boolean){if(disposed||!active)return;if(reduced){if(!lastReduced){draw(id==='tennis'?2.65:id==='runner'?4.7:id==='puzzle'?3.2:2.7);lastReduced=true;}return;}lastReduced=false;const slot=Math.floor(time*8);if(slot===lastSlot)return;lastSlot=slot;draw(time);},dispose(){if(disposed)return;disposed=true;texture.dispose();canvas.width=canvas.height=1;}};
}
