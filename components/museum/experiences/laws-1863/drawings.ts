/**
 * laws-1863 · the line drawings (Oct 9 2026). One drawing per rule per version of the Laws: as the visitor scrubs the year, the
 * strokes with the same name morph (LineMorph), new ones draw themselves on and retired ones draw themselves off. The ACCENT
 * stroke is always the thing that version changed. And one small story per 1863 card in the sorter: a first state that draws on,
 * then a second state the lines move into (a goal goes in and the ball comes back to the centre; a leg hooks an ankle).
 * Rule figures: viewBox 0 0 240 110, ground at y 94. Card figures: viewBox 0 0 200 96, ground at y 84.
 */
import {arc,ball,cross,curve,foot,hands,line,person,rect,ring,type Drawing,type Pt,type Stroke} from './lines';

export const FIG_VB='0 0 240 110',CARD_VB='0 0 200 96';
const G=94;
const ground=(o:Partial<Stroke>={}):Record<string,Stroke>=>({ground:line([10,G],[230,G],{tone:'dim',...o})});

// ---- Of the Goal: posts, then a tape that sags, then a crossbar, then a net ----
function goal(i:number):Drawing{
 const top=i===0?14:42,bar=i>=1;
 const d:Record<string,Stroke>={...ground(),
  postL:line([72,G],[72,top],{tone:'ink'}),postR:line([168,G],[168,top],{tone:'ink'}),
  span:line([72,103],[168,103],{tone:'dim'}),spanL:line([72,100],[72,106],{tone:'dim'}),spanR:line([168,100],[168,106],{tone:'dim'}),
  // The shot: in 1863 it sails high between the posts and counts; with a top on the goal it has to go under.
  flight:i===0?arc([112,G-3],[132,12],-30,{tone:'dim',dash:true}):arc([112,G-3],[136,58],-22,{tone:'dim',dash:true}),
  ball:i===0?ball([132,12],3.6,{tone:i===0?'accent':'ink'}):ball([136,58],3.6),
 };
 if(bar)d.bar=i===1?curve([[72,top],[96,top+6],[120,top+8],[144,top+6],[168,top]],{tone:'accent'}):line([72,top],[168,top],{tone:i===2?'accent':'ink'});
 if(i>=3){for(const [k,x] of [[1,88],[2,104],[3,120],[4,136],[5,152]] as const)d['netV'+k]=line([x,top+3],[x,G-1],{tone:'dim'});
  for(const [k,y] of [[1,56],[2,70],[3,84]] as const)d['netH'+k]=line([75,y],[165,y],{tone:'dim'});d.bar.tone='ink';}
 return d;
}

// ---- Of the Players: no number, then eleven a side, then eleven with a goalkeeper ----
const FORM:Pt[]=[[26,48],[52,22],[52,40],[52,56],[52,74],[80,22],[80,40],[80,56],[80,74],[106,34],[106,62]];
const SCAT_L:Pt[]=[[34,30],[48,62],[62,22],[70,72],[86,46],[100,26],[104,68]];
const SCAT_R:Pt[]=[[140,24],[144,60],[158,40],[170,18],[174,74],[188,50],[204,28],[208,64],[194,78]];
function players(i:number):Drawing{
 const d:Record<string,Stroke>={pitch:rect(14,10,226,86,{tone:'dim'},4),half:line([120,10],[120,86],{tone:'dim'}),centre:ring([120,48],11,{tone:'dim'})};
 const L=i===0?SCAT_L:FORM,R=i===0?SCAT_R:FORM.map(([x,y]):Pt=>[240-x,y]);
 L.forEach((p,k)=>{d['a'+k]=ring(p,4.2,{tone:i===2&&k===0?'accent':'ink'},4.2,14);});
 R.forEach((p,k)=>{d['b'+k]=ring(p,4.2,{tone:i===2&&k===0?'accent':i===1?'ink':'dim'},4.2,14);});
 if(i===1){for(const k in d)if(/^[ab]\d/.test(k))d[k]={...d[k],tone:'ink'};d.a10.tone='accent';d.b10.tone='accent';}
 if(i===2){d.glove=arc([20,40],[20,56],-6,{tone:'accent'});d.glove2=arc([220,40],[220,56],6,{tone:'accent'});}
 return d;
}

// ---- Of Hands: a fair catch, then feet only, then the goalkeeper, his box, the back-pass ----
const PS=1.45;// players in the rule figures are drawn a little larger than the sorter's
function handsFig(i:number):Drawing{
 const d:Record<string,Stroke>={...ground()};
 // the goal, side-on, from 1871 (the keeper's goal)
 if(i>=2){d.gpost=line([216,G],[216,22],{tone:'ink'});d.gbar=line([216,22],[232,27],{tone:'ink'});d.gnet=line([232,27],[232,G],{tone:'dim'});}
 if(i===0){Object.assign(d,person('a',112,G,'catch',{s:PS}));d.ball=ball(hands(112,G,'catch',1,PS),3.6,{tone:'ink'});Object.assign(d,cross([122,G+6],2.6,'heel',{tone:'accent'}));
  d.flight=arc([24,70],[106,22],-22,{tone:'dim',dash:true});}
 else if(i===1){Object.assign(d,person('a',104,G,'kick',{s:PS}));d.ball=ball([foot(104,G,'kick',1,PS)[0]+5,G-4],3.6,{tone:'accent'});}
 else{Object.assign(d,person('a',70,G,'kick',{s:PS}));
  const keeperPose=i===4?'stand':'catch',kx=188;Object.assign(d,person('k',kx,G,keeperPose,{face:-1,s:PS,tone:i===2?'accent':'ink'}));
  if(i===4){d.ball=ball([kx-12,G-4],3.6);d.pass=arc([96,G-6],[kx-16,G-6],-12,{tone:'accent',dash:true});Object.assign(d,cross(hands(kx,G,'stand',-1,PS),2.8,'nohands',{tone:'accent'}));}
  else{d.ball=ball(hands(kx,G,'catch',-1,PS),3.6);d.flight=arc([96,G-8],[kx-2,G-58],-18,{tone:'dim',dash:true});}
  if(i>=3){d.box=line([146,G+7],[232,G+7],{tone:i===3?'accent':'dim'});d.boxEnd=line([146,G+3],[146,G+11],{tone:i===3?'accent':'dim'});}}
 return d;
}

// ---- Of Offside: who is in front of the ball, and how many opponents must be ahead of you ----
const OFF=[{me:116,defs:[150,190],line:56,off:true},{me:112,defs:[124,154,190],line:124},{me:126,defs:[140,190],line:140},{me:144,defs:[144,190],line:144},{me:144,defs:[144,190],line:144}];
function offside(i:number):Drawing{
 const c=OFF[Math.min(i,4)],y=60;
 const d:Record<string,Stroke>={...ground({pts:[[10,78],[214,78]]}),gl:line([214,22],[214,82],{tone:'ink'}),
  mate:ring([36,y],6,{tone:'ink'},6,16),ball:ball([50,y+8],3.2),
  pass:arc([56,y+4],[c.me-8,y-6],-26,{tone:'dim',dash:true}),me:ring([c.me,y-6],6.5,{tone:'accent'},6.5,16),
  level:line([c.line,16],[c.line,84],{tone:'accent',dash:true})};
 // defenders: always three named strokes, the third walks off when there are only two
 const defs=c.defs.length===3?c.defs:[c.defs[0],c.defs[1]];
 defs.forEach((x,k)=>{d['d'+k]=ring([x,k===defs.length-1?y-12:y+2],5.6,{tone:'ink'},5.6,16);});
 if(c.off)Object.assign(d,cross([c.me,y-22],4,'x',{tone:'accent'}));
 return d;
}

// ---- Of the Throw-in: a race to the ball, then the other team's throw (1873), then two hands (1883), then over the head ----
function throwIn(i:number):Drawing{
 const d:Record<string,Stroke>={ground:line([10,G],[150,G],{tone:'ink'}),out:line([150,G],[230,G],{tone:'dim',dash:true}),touch:line([150,G-4],[150,G+6],{tone:'accent'})};
 if(i===0){Object.assign(d,person('a',96,G,'run',{s:PS}));Object.assign(d,person('b',216,G,'run',{face:-1,s:PS}));d.ball=ball([176,G-3.6],3.6,{tone:'accent'});
  d.dashA=line([70,G-44],[84,G-44],{tone:'dim'});d.dashB=line([228,G-44],[236,G-44],{tone:'dim'});}
 else if(i===1){// 1873: no race. The other team's player waits at the line and slings it in with one hand; the kicker walks away.
  const x=154;Object.assign(d,person('a',x,G,'point',{face:-1,s:PS}));d.ball=ball([x-14*PS-3,G-18*PS-15*PS],3.6,{tone:'accent'});
  Object.assign(d,person('b',206,G,'stand',{face:-1,s:PS,tone:'ink'}));Object.assign(d,person('c',50,G,'stand',{s:PS}));d.toss=arc([x-26,G-56],[66,G-50],-14,{tone:'dim',dash:true});}
 else{const x=i===2?152:144;Object.assign(d,person('a',x,G,'throw',{face:-1,s:PS}));d.ball=ball(hands(x,G,'throw',-1,PS),3.6,{tone:'accent'});
  Object.assign(d,person('c',50,G,'stand',{s:PS}));d.toss=arc([x-8,G-66],[66,G-52],-16,{tone:'dim',dash:true});}
 return d;
}

// ---- Of Fair Play: no tripping, then a referee, his cards, a video screen ----
function fair(i:number):Drawing{
 const d:Record<string,Stroke>={...ground(),...person('a',54,G,'kick',{s:PS}),...person('b',96,G,'fall',{s:PS}),...cross([82,G-12],3.4,'x',{tone:i===0||i===4?'accent':'dim'})};
 if(i>=1){Object.assign(d,person('r',180,G,i===2?'card':'point',{face:-1,s:PS,tone:i===1?'accent':'ink'}));
  d.whistle=ring([176,G-44],1.8,{tone:'dim'},1.8,8);}
 if(i===2)d.card=rect(168,G-82,180,G-64,{tone:'accent'},1.6);
 if(i===3){d.screen=rect(200,G-74,232,G-50,{tone:'accent'},3);d.stand=line([216,G-50],[216,G],{tone:'dim'});}
 return d;
}

const BUILD:Record<string,(i:number)=>Drawing>={goal,players,hands:handsFig,offside,throw:throwIn,fair};
export const ruleDrawing=(id:string,i:number):Drawing=>(BUILD[id]??(()=>({})))(i);

// ---- the sorter's cards: [first state, second state] ----
const C=84;
const cground=():Record<string,Stroke>=>({ground:line([12,C],[188,C],{tone:'dim'})});
const pitchTop=():Record<string,Stroke>=>({pitch:rect(14,10,186,86,{tone:'dim'},4),half:line([100,10],[100,86],{tone:'dim'}),centre:ring([100,48],13,{tone:'dim'}),
 goalL:line([14,38],[8,38],{tone:'ink'}),goalL2:line([8,38],[8,58],{tone:'ink'}),goalL3:line([8,58],[14,58],{tone:'ink'}),
 goalR:line([186,38],[192,38],{tone:'ink'}),goalR2:line([192,38],[192,58],{tone:'ink'}),goalR3:line([192,58],[186,58],{tone:'ink'})});
export const CARD_STORY:Record<string,[Drawing,Drawing]>={
 // After a goal, the team that let it in kicks off: the ball goes in on the left, comes back to the spot, and they kick off.
 kickoff:[{...pitchTop(),ball:ball([12,48],3),trail:arc([60,30],[14,46],-6,{tone:'dim',dash:true}),a:ring([88,48],4.5,{tone:'dim'},4.5,14)},
  {...pitchTop(),ball:ball([100,48],3,{tone:'accent'}),trail:arc([16,48],[96,48],-12,{tone:'dim',dash:true}),a:ring([92,48],4.5,{tone:'accent'},4.5,14)}],
 // No crossbar: the ball goes up and up between the posts, and still counts.
 height:[{...cground(),postL:line([70,C],[70,14],{tone:'ink'}),postR:line([130,C],[130,14],{tone:'ink'}),ball:ball([100,C-4],3.4),flight:arc([100,C-4],[100,C-6],0,{tone:'dim',dash:true})},
  {...cground(),postL:line([70,C],[70,14],{tone:'ink'}),postR:line([130,C],[130,14],{tone:'ink'}),ball:ball([104,8],3.4,{tone:'accent'}),flight:arc([96,C-4],[104,12],-6,{tone:'dim',dash:true})}],
 // No tripping: a leg hooks an ankle.
 trip:[{...cground(),...person('a',66,C,'windup',{s:1.3}),...person('b',118,C,'run',{s:1.3})},
  {...cground(),...person('a',72,C,'kick',{s:1.3}),...person('b',110,C,'fall',{s:1.3}),...cross([100,C-10],3.4,'x',{tone:'accent'})}],
 // Swap ends after every goal: the two teams cross over.
 ends:[{...pitchTop(),t1:ring([60,48],7,{tone:'ink'},7,16),t2:{pts:[[140,40],[148,56],[132,56]],closed:true,tone:'ink'},sw1:arc([70,30],[130,30],-14,{tone:'dim',dash:true}),sw2:arc([130,66],[70,66],14,{tone:'dim',dash:true})},
  {...pitchTop(),t1:ring([140,48],7,{tone:'accent'},7,16),t2:{pts:[[60,40],[68,56],[52,56]],closed:true,tone:'accent'},sw1:arc([70,30],[130,30],-14,{tone:'dim',dash:true}),sw2:arc([130,66],[70,66],14,{tone:'dim',dash:true})}],
 // In front of the ball is offside: the forward pass is flagged.
 offside:[{gl:line([180,14],[180,82],{tone:'ink'}),mate:ring([40,48],6,{tone:'ink'},6,16),ball:ball([52,54],3),me:ring([110,40],6,{tone:'ink'},6,16),d1:ring([150,52],5.6,{tone:'ink'},5.6,16),level:line([52,14],[52,82],{tone:'dim',dash:true})},
  {gl:line([180,14],[180,82],{tone:'ink'}),mate:ring([40,48],6,{tone:'ink'},6,16),ball:ball([104,46],3),pass:arc([56,50],[100,44],-18,{tone:'dim',dash:true}),me:ring([110,40],6,{tone:'accent'},6,16),d1:ring([150,52],5.6,{tone:'ink'},5.6,16),level:line([52,14],[52,82],{tone:'accent',dash:true}),...cross([110,22],4,'x',{tone:'accent'})}],
 // Ten yards at kick-off: the other team steps back to the circle.
 ten:[{half:line([100,8],[100,88],{tone:'dim'}),centre:ring([100,48],30,{tone:'dim'}),ball:ball([100,48],3),o1:ring([118,40],5,{tone:'ink'},5,14),o2:ring([114,60],5,{tone:'ink'},5,14),r:line([100,48],[100,48],{tone:'accent'})},
  {half:line([100,8],[100,88],{tone:'dim'}),centre:ring([100,48],30,{tone:'dim'}),ball:ball([100,48],3),o1:ring([132,36],5,{tone:'ink'},5,14),o2:ring([128,66],5,{tone:'ink'},5,14),r:line([100,48],[130,48],{tone:'accent'})}],
 // Whoever touches it first throws it in: a race to the ball.
 throw:[{ground:line([12,C],[120,C],{tone:'ink'}),out:line([120,C],[188,C],{tone:'dim',dash:true}),touch:line([120,C-4],[120,C+5],{tone:'dim'}),...person('a',40,C,'run',{s:1.3}),...person('b',184,C,'run',{s:1.3,face:-1}),ball:ball([150,C-3.2],3.2,{tone:'accent'})},
  {ground:line([12,C],[120,C],{tone:'ink'}),out:line([120,C],[188,C],{tone:'dim',dash:true}),touch:line([120,C-4],[120,C+5],{tone:'dim'}),...person('a',128,C,'run',{s:1.3}),...person('b',170,C,'run',{s:1.3,face:-1}),ball:ball([150,C-3.2],3.2,{tone:'accent'})}],
 // No nails or iron plates on your boots: a boot, and the dangerous studs are taken away.
 nails:[{boot:{pts:[[50,70],[50,40],[70,36],[86,44],[110,56],[146,60],[156,68],[150,76],[56,76]],smooth:true,closed:true,tone:'ink'},lace:line([68,44],[96,52],{tone:'dim'}),
   n1:{pts:[[64,76],[66,86],[68,76]],tone:'accent'},n2:{pts:[[96,76],[98,86],[100,76]],tone:'accent'},n3:{pts:[[128,76],[130,86],[132,76]],tone:'accent'}},
  {boot:{pts:[[50,70],[50,40],[70,36],[86,44],[110,56],[146,60],[156,68],[150,76],[56,76]],smooth:true,closed:true,tone:'ink'},lace:line([68,44],[96,52],{tone:'dim'}),
   n1:{pts:[[64,76],[66,79],[68,76]],tone:'ink'},n2:{pts:[[96,76],[98,79],[100,76]],tone:'ink'},n3:{pts:[[128,76],[130,79],[132,76]],tone:'ink'}}],
};

/** The single line that carries the visitor from one beat to the next: it runs across, loops once round a ball, and runs on. */
export const THREAD_VB='0 0 600 44';
export const THREAD_LINE:Drawing={
 // one stroke: along the ground, round the ball (it sits on the line) and on again
 thread:{pts:[[0,38],[150,38],[250,38],[300,38],...Array.from({length:33},(_,k):Pt=>{const a=Math.PI/2-k/32*Math.PI*2;return [300+16*Math.cos(a),22+16*Math.sin(a)];}).slice(1),[350,38],[450,38],[600,38]],smooth:true,tone:'dim'},
 seam:ring([300,22],6,{tone:'accent'},6,5)};

/**
 * The prologue (Oct 9 2026 story pass): three line drawings, each with a second state it moves into once it has drawn on.
 *  1. Before 1863: at one school you carry the ball between tall posts; at another you may only kick it.
 *  2. 26 October 1863, the Freemasons' Tavern: men round a table, and a sheet of paper grows into a rulebook page.
 *  3. December 1863: thirteen Laws on the page, and Blackheath walking out.
 */
const tavern=(page:Stroke):Record<string,Stroke>=>({table:line([36,74],[204,74],{tone:'ink'}),legL:line([48,74],[48,G],{tone:'dim'}),legR:line([192,74],[192,G],{tone:'dim'}),
 ...Object.fromEntries([60,90,150,180].flatMap((x,k)=>[[`h${k}`,ring([x,48],6.5,{tone:'ink'},6.5,18)],[`s${k}`,arc([x-11,72],[x+11,72],-16,{tone:'ink'})]])),page});
const lawLines=(on:boolean):Record<string,Stroke>=>Object.fromEntries(Array.from({length:13},(_,k)=>{const col=k<7?0:1,row=col?k-7:k,x=col?126:80,y=26+row*9.5;
 return [`law${k}`,line([x,y],on?[x+(k%3===1?28:36),y]:[x,y],{tone:k===9?'accent':'dim'})];}));
export const PROLOGUE:{vb:string;a:Drawing;b:Drawing}[]=[
 {vb:FIG_VB,
  a:{...ground(),rpL:line([24,G],[24,14],{tone:'ink'}),rpR:line([64,G],[64,14],{tone:'ink'}),rpBar:line([24,56],[64,56],{tone:'ink'}),...person('r',90,G,'catch',{s:PS}),
   rBall:ball(hands(90,G,'catch',1,PS),3.6,{tone:'accent'}),split:line([120,18],[120,G-4],{tone:'dim',dash:true}),
   gpL:line([196,G],[196,50],{tone:'ink'}),gpR:line([226,G],[226,50],{tone:'ink'}),...person('k',150,G,'windup',{s:PS}),kBall:ball([166,G-4],3.6,{tone:'ink'})},
  b:{...ground(),rpL:line([24,G],[24,14],{tone:'ink'}),rpR:line([64,G],[64,14],{tone:'ink'}),rpBar:line([24,56],[64,56],{tone:'ink'}),...person('r',44,G,'catch',{s:PS}),
   rBall:ball(hands(44,G,'catch',1,PS),3.6,{tone:'accent'}),split:line([120,18],[120,G-4],{tone:'dim',dash:true}),
   gpL:line([196,G],[196,50],{tone:'ink'}),gpR:line([226,G],[226,50],{tone:'ink'}),...person('k',150,G,'kick',{s:PS}),kBall:ball([211,G-12],3.6,{tone:'accent'}),kTrail:arc([172,G-6],[206,G-12],-10,{tone:'dim',dash:true})}},
 {vb:FIG_VB,
  a:tavern(rect(108,66,132,72,{tone:'accent'},1.5)),
  b:{...tavern(rect(98,10,142,70,{tone:'accent'},2)),pen:line([118,26],[134,26],{tone:'accent'}),pen2:line([108,36],[132,36],{tone:'dim'}),pen3:line([108,46],[128,46],{tone:'dim'})}},
 {vb:FIG_VB,
  a:{...ground(),page:rect(70,10,170,100,{tone:'ink'},2),title:line([90,17],[150,17],{tone:'accent'}),...lawLines(false),...person('bh',190,G,'stand',{s:PS,face:-1})},
  b:{...ground(),page:rect(70,10,170,100,{tone:'ink'},2),title:line([90,17],[150,17],{tone:'accent'}),...lawLines(true),...person('bh',208,G,'run',{s:PS,tone:'accent'})}},
];
