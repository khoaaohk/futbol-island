// Air Futbol (Nov 11 2026, docs/arcade-aaa/airhockey-direction.md): the seeded physics and rules, the opponents' ramp, the fingers,
// the device save and its arcade wiring.
// Run: node tests/airhockey-core.cjs   (--bots prints the scripted player against every level, --ladder the finger players, for tuning)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/airhockey/core.ts'),S=require('../lib/arcade/airhockey/save.ts'),TT=require('../lib/arcade/airhockey/touch.ts'),V=require('../lib/arcade/airhockey/view.ts'),L=require('../lib/arcade/leaderboard.ts');
const {arcadeCabinets,arcadeAnalyticsId,ARCADE_TABLE_ID,arcadeStand}=require('../lib/arcade/arcadeCatalog.ts'),T=require('../lib/arcade/arcadeTodayCore.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
const {isSyncKey}=require('../lib/saves/snapshot.ts');
const read=p=>fs.readFileSync(p,'utf8'),{AH,RAMP,SCRIPTED}=K,{W,H,PR,SR,GOAL0,GOAL1}=AH,R=PR+SR;
let n=0;const ok=(name,fn)=>{fn();n++;};
const run=(g,seconds,each)=>{const ev=[];for(let i=0;i<seconds*AH.HZ;i++){g.tick();g.drain(e=>ev.push({...e}));if(each&&each(g,ev)===false)break;}return ev;};
/** A live physics table (the test hook `bots:[null,null]` lets a test drive both strikers by hand; the game itself always sets the
 *  ramp opponent on side 1) with the strikers parked out of the way (bottom-left and top-left corners) and the puck where the test wants it. */
function table(px=W/2,py=H/2,vx=0,vy=0){const g=K.createAirFutbol({seed:9,bots:[null,null]}),s=g.state;s.phase='play';for(const i of [0,1]){s.sx[i]=s.tx[i]=SR;s.sy[i]=s.ty[i]=i?SR:H-SR;}s.px=px;s.py=py;s.pvx=vx;s.pvy=vy;return g;}
const speed=s=>Math.hypot(s.pvx,s.pvy);
/** Sends the puck into a goal: side 0 scores in the top goal, side 1 in the bottom one. Stops on the goal (the beat is still to run). */
function score(g,side,o={}){const s=g.state;s.phase='play';s.inGoal=false;s.px=W/2;s.py=side===0?5:H-5;s.pvx=0;s.pvy=side===0?-220:220;s.lastHit=side;s.lastHitT=s.t;s.bank=!!o.bank;s.serveT=o.quick?s.t:s.t-60;s.saveT=o.counter?s.t:-99;
 return run(g,3,x=>x.state.phase==='play');}

/** Finger players (Nov 18 2026): they drive aim() like a child: they see the puck `delay` s late, the hand moves at most `hand` u/s, the
 *  aim shakes by `jit`, they look away now and then (`lapse`). camp = a keeper who only clears. Used for the ladder tests. */
const FINGERS={kid:{delay:.34,hand:190,jit:13,swing:26,smart:.15,bank:.05,guard:.75,lapse:.25,patience:150},mid:{delay:.24,hand:300,jit:8,swing:30,smart:.5,bank:.15,guard:.9,lapse:.1,patience:160},
 strong:{delay:.15,hand:460,jit:3.5,swing:32,smart:.9,bank:.3,guard:1,lapse:.02,patience:170},camper:{delay:.3,hand:300,jit:4,swing:0,smart:0,bank:0,guard:1,lapse:0,patience:0,camp:true}};
function finger(p,seed){let sd=seed>>>0||1;const rng=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296;},hist=[],m={swing:0,tx:50,ty:H-26,fx:50,fy:H-26,ax:50,pickT:-9,lapse:0};
 return (g,s)=>{hist.push(s.px,s.py,s.pvx,s.pvy);const lag=Math.round(p.delay*AH.HZ)*4;if(hist.length>lag+4)hist.splice(0,4);const X=hist[0],Y=hist[1],VX=hist[2],VY=hist[3],sp=Math.hypot(VX,VY);let tx,ty;
  if(m.swing>0){m.swing--;tx=m.tx;ty=m.ty;}
  else if(p.camp&&Y>H/2+2&&sp<12&&s.phase==='play'){const bx=X,by=Math.min(H-SR,Y+R+4);if(Math.hypot(m.fx-bx,m.fy-by)<4){m.swing=Math.round(AH.HZ*.1);m.tx=X;m.ty=Y-6;tx=m.tx;ty=m.ty;}else{tx=bx;ty=by;}}
  else if(!p.camp&&Y>H/2+2&&VY>-40&&sp<p.patience&&s.phase==='play'){
   if(s.t-m.pickT>1.2){m.pickT=s.t;const smart=rng()<p.smart;let ax=smart?(s.sx[1]<W/2?67:33):33+rng()*34;ax+=(rng()*2-1)*p.jit;if(rng()<p.bank)ax=X<W/2?-ax:2*W-ax;m.ax=ax;}
   const px=X+VX*p.delay,py=Math.min(H-PR,Y+VY*p.delay),dx=m.ax-px,dy=-py,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,bx=px-ux*(R+5),by=Math.min(H-SR,py-uy*(R+5));
   if(Math.hypot(m.fx-bx,m.fy-by)<4){m.swing=Math.round(AH.HZ*.14);m.tx=px+ux*p.swing;m.ty=py+uy*p.swing;tx=m.tx;ty=m.ty;}else{tx=bx;ty=by;}}
  else{if(rng()<p.lapse/AH.HZ*2)m.lapse=s.t+.5;const gx=W/2+(X+VX*p.delay*.5-W/2)*p.guard*.55;tx=s.t<m.lapse?m.fx:gx;ty=H-SR-7;}
  const dx=tx-m.fx,dy=ty-m.fy,d=Math.hypot(dx,dy),max=p.hand/AH.HZ;if(d>max){m.fx+=dx/d*max;m.fy+=dy/d*max;}else{m.fx=tx;m.fy=ty;}g.aim(0,m.fx,m.fy);};}
/** One match of a finger against a level: res 1 won, -1 lost, 0 not finished inside `cap` seconds. */
function fingerMatch(p,l,seed,cap=300){const g=K.createAirFutbol({seed,level:l}),s=g.state,f=finger(p,seed*3+1);g.hold(0,true);let res=0,gf=0,ga=0;
 for(let i=0;i<AH.HZ*cap&&!res;i++){f(g,s);g.tick();g.drain(e=>{if(e.type==='win')res=1;else if(e.type==='lose')res=-1;else if(e.type==='goal'){if(e.a===0)gf++;else ga++;}});}return {res,gf,ga,t:s.t};}
if(process.argv.includes('--ladder')){const N=16;
 for(const name of Object.keys(FINGERS)){const row=[];for(let l=1;l<=RAMP.length;l++){let w=0,gf=0,ga=0,tt=0;for(let k=0;k<N;k++){const r=fingerMatch(FINGERS[name],l,1000+k*7919+l*31);if(r.res>0)w++;gf+=r.gf;ga+=r.ga;tt+=r.t;}row.push(`L${l} ${w}/${N} ${gf}-${ga} ${Math.round(tt/N)}s`);}console.log(name.padEnd(7),row.join(' | '));}
 process.exit(0);
}
if(process.argv.includes('--bots')){
 for(let l=1;l<=RAMP.length;l++){let gf=0,ga=0,w=0;for(let seed=1;seed<=6;seed++){const g=K.createAirFutbol({seed:seed*7919,bots:[SCRIPTED,RAMP[l-1]]});for(let i=0;i<AH.HZ*300&&!g.state.over;i++)g.tick();const st=g.state.stats;gf+=st.goalsFor;ga+=st.goalsAgainst;w+=st.wins;}
  console.log(`L${l} ${RAMP[l-1].name}: scripted ${gf} - ${ga}, scripted match wins ${w} over 6 runs (5 min cap)`);}
 process.exit(0);
}

ok('deterministic with a seed',()=>{
 const play=seed=>{const g=K.createAirFutbol({seed,bots:[SCRIPTED,RAMP[5]]});for(let i=0;i<AH.HZ*20;i++)g.tick();const s=g.state;return [s.px,s.py,s.pvx,s.pvy,s.sx[0],s.sy[1],s.goals[0],s.goals[1]].join(',');};
 assert.equal(play(42),play(42));assert.notEqual(play(42),play(43));
 const a=K.createAirFutbol({seed:5,bots:[SCRIPTED,RAMP[5]]}),b=K.createAirFutbol({seed:5,bots:[SCRIPTED,RAMP[5]]});
 for(let i=0;i<600;i++)a.step(1/60);for(let i=0;i<1200;i++)b.step(1/120);assert(Math.abs(a.state.px-b.state.px)<1e-6&&Math.abs(a.state.py-b.state.py)<1e-6,'the frame rate does not change the physics');assert.equal(AH.HZ,120);
});
ok('no tunnelling at max speed: every angle stays on the table, bounces off the boards and never passes through a striker',()=>{
 let goals=0;
 for(let a=0;a<180;a++){const ang=a*Math.PI/90+.013,g=table(W/2,H/2,Math.cos(ang)*AH.VMAX,Math.sin(ang)*AH.VMAX),s=g.state;
  run(g,2.5,()=>{if(s.phase!=='play'){goals++;return false;}assert(s.px>=PR-1e-6&&s.px<=W-PR+1e-6,`x on the table at angle ${a}`);const mouth=s.px>GOAL0&&s.px<GOAL1;assert(mouth?s.py>=-PR-1e-6&&s.py<=H+PR+1e-6:s.py>=PR-1e-6&&s.py<=H-PR+1e-6,`y on the table at angle ${a}`);assert(speed(s)<=AH.VMAX+1e-6);});}
 assert(goals>10&&goals<170,`some angles score, most rebound (${goals})`);
 // a fast puck against a striker standing still, from every side: the centres never get closer than touching
 for(let a=0;a<72;a++){const ang=a*Math.PI/36,g=table(),s=g.state;s.sx[0]=s.tx[0]=W/2;s.sy[0]=s.ty[0]=H*.75;s.px=W/2+Math.cos(ang)*30;s.py=H*.75+Math.sin(ang)*30;s.pvx=-Math.cos(ang)*AH.VMAX;s.pvy=-Math.sin(ang)*AH.VMAX;
  let hit=false;run(g,.4,(x,ev)=>{if(ev.some(e=>e.type==='hit'))hit=true;assert(Math.hypot(s.px-s.sx[0],s.py-s.sy[0])>=R-.02,`no overlap at angle ${a}`);});assert(hit,`the striker was hit at angle ${a}`);}
 // a striker driven across a resting puck at its speed cap pushes it, never jumps over it
 for(const dx of [-6,-3,0,3,6]){const g=table(W/2+dx,H*.7),s=g.state;s.sx[0]=W/2;s.sy[0]=H-SR;g.hold(0,true);g.aim(0,W/2,H/2+SR);run(g,.5,()=>assert(Math.hypot(s.px-s.sx[0],s.py-s.sy[0])>=R-.02));assert(s.py<H*.7-10,'the puck was driven up the table');}
});
ok('collisions keep sensible energy: boards and posts give back a little less, a striker adds its own speed, nothing passes the cap',()=>{
 let g=table(20,H/2,-200,0),s=g.state;let ev=run(g,.3);assert(s.pvx>0,'bounced');assert(Math.abs(s.pvx)<200&&Math.abs(s.pvx)>200*AH.E_WALL*.9,`left board keeps ~${AH.E_WALL} (${s.pvx})`);assert(ev.some(e=>e.type==='wall'));
 g=table(10,20,0,-150);s=g.state;run(g,.2);assert(s.pvy>0&&s.pvy<150,'the end board outside the goal mouth bounces');
 // a resting puck hit by a striker at speed v leaves at about (1+E_HIT)*v, capped
 g=table(W/2,H*.7);s=g.state;s.sx[0]=W/2;s.sy[0]=H*.7+R+14;const b=K.createAirFutbol({seed:1,bots:[{...SCRIPTED},null]});void b;
 g.hold(0,true);g.aim(0,W/2,H/2+SR);ev=run(g,.2);const hit=ev.find(e=>e.type==='hit');assert(hit&&hit.a===0&&hit.b>100,'a hard hit is reported with its impact speed');assert(s.pvy<-200&&speed(s)<=AH.VMAX+AH.SMASH_ADD+1e-6,`capped at VMAX plus the smash (${speed(s)})`);assert(ev.some(e=>e.type==='smash'&&e.a===0),'a full swipe is a smash');run(g,AH.SMASH_S+.2);assert(speed(s)<=AH.VMAX+1e-6,'the smash wears off: back under VMAX');
 // a puck into a striker that stands still comes back slower than it went in
 g=table(W/2,H*.5,0,180);s=g.state;s.sx[0]=s.tx[0]=W/2;s.sy[0]=s.ty[0]=H*.8;run(g,.4);assert(s.pvy<0&&Math.abs(s.pvy)<180*.75,'a dead striker absorbs');
 // post: a puck onto the goal post rebounds and is reported
 g=table(GOAL0+.5,20,0,-160);s=g.state;ev=run(g,.3);assert(ev.some(e=>e.type==='post'),'post');assert.equal(s.goals[0],0);
 // friction is light: a free puck is still moving after 3 seconds, and stops in the end
 g=table(W/2,H/2,60,20);s=g.state;run(g,3);assert(speed(s)>10);run(g,40);assert.equal(speed(s),0);
 assert(AH.E_WALL<1&&AH.E_WALL>=.8&&AH.E_HIT<1&&AH.VMAX*(1/AH.HZ)<PR,'one step never moves the puck a whole radius');
});
ok('strikers: confined to their own half, never faster than the cap, released strikers stop',()=>{
 const g=table(W-5,20),s=g.state;g.hold(0,true);g.hold(1,true);g.aim(0,W/2,0);g.aim(1,W/2,H);let last=[s.sy[0],s.sy[1]];
 run(g,1,()=>{for(const i of [0,1]){assert(Math.abs(s.sy[i]-last[i])<=AH.HUMAN_CAP/AH.HZ+1e-6,'speed cap');last[i]=s.sy[i];}assert(s.sy[0]>=H/2+SR-1e-6&&s.sy[1]<=H/2-SR+1e-6,'own half');});
 assert.equal(s.sy[0],H/2+SR);assert.equal(s.sy[1],H/2-SR);g.aim(0,-50,999);run(g,1);assert.equal(s.sx[0],SR);assert.equal(s.sy[0],H-SR);
 g.aim(0,W/2,H*.7);run(g,.02);g.hold(0,false);const at=[s.sx[0],s.sy[0]];run(g,.2);assert.deepEqual([s.sx[0],s.sy[0]],at,'a lifted finger leaves the striker where it is');
 assert.equal(K.clampStrikerY(1,H),H/2-SR);
 // a finger cannot cross the table in one frame: the cap is under four table lengths a second
 assert(AH.HUMAN_CAP/AH.HZ<SR&&AH.HUMAN_CAP<H*4);// Nov 18 2026: 460 -> 600 (a fast swipe left the striker behind the finger); micro-steps still stop tunnelling
});
ok('dead zones: a puck that rests on a board for 2 s is nudged back into play; a puck resting in open play waits for a striker',()=>{
 for(const [x,y] of [[PR,PR],[W-PR,H-PR],[PR,H/2],[W/2+30,H-PR]]){const g=table(x,y),s=g.state;s.sx[0]=s.tx[0]=W-SR;s.sx[1]=s.tx[1]=W-SR;if(x>W/2){s.sx[0]=s.tx[0]=SR;}
  let ev=run(g,AH.DEAD_S-.1);assert.equal(speed(s),0,'still resting');assert(!g.idle,'the clock keeps running while a nudge is due');ev=run(g,.3);assert(ev.some(e=>e.type==='nudge'),`nudged at ${x},${y}`);assert(speed(s)>AH.NUDGE_V*.8);
  const toMid=(W/2-x)*s.pvx+((y<H/2?H*.3:H*.7)-y)*s.pvy;assert(toMid>0,'toward the middle of that half');run(g,1.5);assert(s.px>PR+AH.DEAD_EDGE&&s.px<W-PR-AH.DEAD_EDGE,'off the board');}
 const g=table(W/2,H*.7),s=g.state;const ev=run(g,5);assert(!ev.some(e=>e.type==='nudge'));assert.equal(s.px,W/2);
});
ok('fix round: a puck resting in your half gets one "Your ball" cue after 3 s, then the table sleeps; a touch clears it',()=>{
 const g=table(W/2,H*.7),s=g.state;let ev=run(g,AH.YOURS_S-.2);assert(!ev.some(e=>e.type==='yours'));assert.equal(s.yours,false);assert(!g.idle,'the clock keeps running while the cue is due');
 ev=run(g,.4);assert.equal(ev.filter(e=>e.type==='yours').length,1);assert.equal(s.yours,true);assert.equal(s.px,W/2,'the puck is not moved');
 ev=run(g,6);assert(!ev.some(e=>e.type==='yours'),'one cue, not a loop');assert(g.idle,'then the table may sleep');
 g.hold(0,true);g.aim(0,W/2,H*.7+2);run(g,.6);assert.equal(s.yours,false,'playing the ball clears the cue');
});
ok('goals and serves: the whole puck over the line, a beat, then a serve toward the side that conceded once a finger is down',()=>{
 const g=K.createAirFutbol({seed:3}),s=g.state;assert.equal(s.phase,'wait');assert(g.idle,'nothing moves before the first touch');run(g,2);assert.equal(s.phase,'wait','no serve without a finger');assert.equal(s.px,W/2);
 g.hold(0,true);let ev=run(g,AH.WAIT+.05);assert.equal(s.phase,'play');assert(ev.some(e=>e.type==='serve'));assert(Math.abs(s.pvy)>=AH.SERVE_V*.9&&Math.abs(s.pvx)<=13,'a gentle serve');g.hold(0,false);
 ev=score(g,0);const goal=ev.find(e=>e.type==='goal');assert(goal&&goal.a===0);assert.deepEqual(s.goals,[1,0]);assert.equal(s.phase,'goal');assert(s.inGoal);
 ev=run(g,AH.GOAL_BEAT+.1);assert.equal(s.phase,'wait');assert(ev.some(e=>e.type==='ready'));assert.equal(s.px,W/2);assert.equal(s.py,H/2);assert.equal(s.serveTo,1,'toward the side that conceded');
 g.hold(1,true);assert(!s.held[1],'the machine’s striker never takes a finger');g.hold(0,true);run(g,AH.WAIT+.05);assert(s.pvy<0,'the child’s finger serves, and the puck slides to the top side');g.hold(0,false);
 score(g,1);run(g,AH.GOAL_BEAT+.1);assert.deepEqual(s.goals,[1,1]);assert.equal(s.serveTo,0);g.hold(0,true);run(g,AH.WAIT+.05);assert(s.pvy>0);
 // just wide of the post is not a goal
 const t=table(GOAL0-PR-1,10,0,-200);run(t,.5);assert.equal(t.state.goals[0],0);assert.equal(t.state.phase,'play');
});
ok('the ramp is a table: every level is at least as quick, fast, smart and bold as the one before; level 1 is gentle',()=>{
 assert(RAMP.length>=12);const up=['speed','shot','predict','guard','attack','bank'];
 for(let i=1;i<RAMP.length;i++){assert(RAMP[i].react<=RAMP[i-1].react,`react ${i+1}`);assert(RAMP[i].err<=RAMP[i-1].err,`err ${i+1}`);for(const k of up)assert(RAMP[i][k]>=RAMP[i-1][k],`${k} ${i+1}`);}
 // Nov 17 2026 (owner: "increase the beginning difficulty of the ai"): level 1 moves and attacks from the first serve, yet is still the easiest row.
 assert(RAMP[0].react>=.35&&RAMP[0].react<=.4&&RAMP[0].speed>=90&&RAMP[0].speed<=110&&RAMP[0].shot<=135&&RAMP[0].attack>=.45&&RAMP[0].attack<=.5,'level 1 is a real opponent, and the easiest');assert(RAMP[11].speed>RAMP[0].speed*2.5&&RAMP[11].predict===1);
 assert(RAMP.every(r=>r.name&&r.tip.length>20&&r.shot<=AH.VMAX&&r.speed<AH.HUMAN_CAP));assert.equal(new Set(RAMP.map(r=>r.name)).size,RAMP.length);
 assert.equal(K.opponentFor(1).name,'Sandy');assert.equal(K.opponentFor(12),RAMP[11]);const lap=K.opponentFor(13);assert.equal(lap.name,'Sandy II');assert.equal(lap.speed,RAMP[11].speed,'past the table the last row plays on');assert.equal(K.opponentFor(26).name,'Pip III');
});
ok('level 1 is beatable by a simple scripted player; level 10 beats it',()=>{
 for(const seed of [11,222,3333]){const g=K.createAirFutbol({seed,bots:[SCRIPTED,RAMP[0]]}),st=g.state.stats;for(let i=0;i<AH.HZ*600&&st.wins===0&&g.state.lives===AH.LIVES;i++)g.tick();assert.equal(st.wins,1,`scripted beats level 1 in its first match (seed ${seed}: ${st.goalsFor}-${st.goalsAgainst})`);assert(st.goalsAgainst<=3);}
 // Nov 18 2026 (AAA pass): the judge is now a FINGER player (it plays through aim() as a child does: late sight, a hand-speed limit, shaky
 // aim, no shot cap), because rally heat made machine-against-machine results too even to prove anything (they still run: --bots).
 let gf=0,ga=0;for(const seed of [11,222,3333,44444]){const r=fingerMatch(FINGERS.mid,10,seed);gf+=r.gf;ga+=r.ga;}
 assert(ga>=gf+3&&ga>=gf*2,`level 10 outscores a middling finger (${gf} - ${ga})`);
});
ok('the ladder is a fair set of steps: a child wins at level 1 and meets a wall later; a strong finger can beat the last one, and finds it the hardest; a keeper who only camps loses up the ladder',()=>{
 const wins=(p,l,n=24)=>{let w=0;for(let k=0;k<n;k++)if(fingerMatch(p,l,1000+k*7919+l*31).res>0)w++;return w;};
 const kid=[1,2,3,5,8].map(l=>wins(FINGERS.kid,l)),strong=[1,7,12].map(l=>wins(FINGERS.strong,l));if(process.argv.includes('--print'))console.log('kid',kid,'strong',strong);
 assert(kid[0]>=19,`a child beats level 1 nearly every time (${kid})`);assert(kid[1]>=10&&kid[1]<=kid[0],`and level 2 more often than not (${kid})`);assert(kid[2]>=5&&kid[2]<=kid[1]+2,`level 3 is a real match (${kid})`);assert(kid[3]<=7&&kid[4]<=2,`then the wall (${kid})`);
 assert.equal(strong[0],24);assert(strong[1]>=14,`a strong finger wins at level 7 (${strong})`);assert(strong[2]>=2&&strong[2]<=14&&strong[2]<strong[1],`and can beat the last opponent, not often (${strong})`);
 let gf=0,ga=0;for(const l of [9,12]){const r=fingerMatch(FINGERS.camper,l,77+l);gf+=r.gf;ga+=r.ga;assert.equal(r.res,-1,`a keeper who never shoots loses to level ${l}`);}assert(ga>=gf*3,`camping does not hold out (${gf} - ${ga})`);
});
ok('rally heat, the smash and the serve: a long rally warms the table in three steps and speeds the puck; a serve nobody touches stops in the receiver’s half',()=>{
 // heat: alternate hits by hand
 const g=table(W/2,H/2),s=g.state,ev=[];const knock=i=>{s.px=W/2;s.py=i?H/2-30:H/2+30;s.pvx=0;s.pvy=0;s.sx[i]=s.tx[i]=W/2;s.sy[i]=i?s.py-R-3:s.py+R+3;g.hold(i,true);g.aim(i,W/2,s.py);ev.push(...run(g,.15));s.sx[i]=s.tx[i]=SR;s.sy[i]=s.ty[i]=i?SR:H-SR;};
 for(let k=0;k<AH.HEAT_FROM;k++)knock(k%2);assert.equal(s.heat,0,'the first hits are cold');assert.equal(s.rally,AH.HEAT_FROM);knock((AH.HEAT_FROM-1)%2);assert.equal(s.rally,AH.HEAT_FROM,'two hits by the same side count once');
 for(let k=AH.HEAT_FROM;k<AH.HEAT_FROM+AH.HEAT_HITS+2;k++)knock(k%2);assert.equal(s.heat,1);assert.deepEqual(ev.filter(e=>e.type==='heat').map(e=>e.a),[1,2,3],'three steps, each told once');
 s.px=W/2;s.py=H/2;s.pvx=0;s.pvy=-900;s.smashT=-9;g.tick();assert(Math.abs(speed(s)-AH.VHOT)<AH.VHOT*.01,'a hot table lifts the top speed to VHOT');assert(AH.VHOT+AH.SMASH_ADD<=AH.HZ*PR*4,'still inside what the micro-steps cover');
 const hot=score(g,0).find(e=>e.type==='goal');assert(hot.b&K.GOAL_HOT,'a goal off a hot rally is flagged');assert.equal(s.score,AH.pts.goal,'and pays no extra: the score scale is unchanged');run(g,AH.GOAL_BEAT+.1);assert.equal(s.heat,0);assert.equal(s.rally,0,'a goal cools the table');
 // the serve: nobody touches it
 for(const seed of [1,2,3,4,5,6]){const k=K.createAirFutbol({seed}),z=k.state;k.hold(0,true);k.aim(0,SR,H-SR);const e2=run(k,8);assert.equal(z.goals[1],0,'an untouched serve never rolls into the goal');assert(!e2.some(e=>e.type==='goal'));assert(z.py>H/2+20&&z.py<H-30,`it rests in the receiver’s half (${z.py})`);assert.equal(speed(z),0);}
 // the machine fetches a puck that dies on the halfway line
 const m=K.createAirFutbol({seed:8}),ms=m.state;ms.phase='play';ms.px=30;ms.py=H/2+1;ms.pvx=ms.pvy=0;const e3=run(m,6);assert(e3.some(e=>e.type==='hit'&&e.a===1),'a puck resting on the line is played, not left');
});
ok('habits: every opponent has its own (how high it stands, how long it admires a shot, how often it is caught flat-footed), and they are human sized',()=>{
 for(const r of RAMP){assert(r.high>=0&&r.high<=1&&r.recover>=0&&r.recover<=.7&&r.slip>=0&&r.slip<=.4,r.name);}
 assert(RAMP[0].slip>RAMP[11].slip&&RAMP[11].slip===0&&RAMP[3].high>=.5&&RAMP[8].high>=.5,'Sandy slips most, the Lighthouse never; Rafa and Dax stand high');
 assert(new Set(RAMP.map(r=>`${r.high}/${r.recover}/${r.slip}`)).size===RAMP.length,'no two play alike');
});
ok('solo scoring: goals, quick goals, board goals, counters, clean sheets, match wins; the next opponent walks on',()=>{
 const g=K.createAirFutbol({seed:4}),s=g.state;assert.equal(g.opponent.name,'Sandy');assert.equal(s.lives,AH.LIVES);
 let ev=score(g,0);assert.equal(s.score,AH.pts.goal);assert.equal(ev.find(e=>e.type==='goal').b,0);
 ev=score(g,0,{quick:true});assert.equal(s.score,2*AH.pts.goal+AH.pts.quick);assert.equal(ev.find(e=>e.type==='goal').b&K.GOAL_QUICK,K.GOAL_QUICK);
 score(g,0,{bank:true});assert.equal(s.score,3*AH.pts.goal+AH.pts.quick+AH.pts.bank);assert.equal(s.stats.bank,1);
 s.saveT=s.t;score(g,0,{counter:true});assert.equal(s.score,4*AH.pts.goal+AH.pts.quick+AH.pts.bank+AH.pts.counter);assert.equal(s.stats.counters,1);
 const before=s.score;score(g,0);ev=run(g,AH.GOAL_BEAT+.1);const win=ev.find(e=>e.type==='win');assert(win&&win.a===1);const bonus=AH.pts.win+AH.pts.winLevel*1+AH.pts.clean;assert.equal(win.b,bonus);assert.equal(s.score,before+AH.pts.goal+bonus);
 assert.equal(s.level,2);assert.equal(g.opponent.name,'Pip');assert.deepEqual(s.goals,[0,0]);assert.equal(s.phase,'between');assert(ev.some(e=>e.type==='next'&&e.a===2));assert.equal(s.stats.wins,1);assert.equal(s.stats.clean,1);
 g.skip();run(g,.2);assert.equal(s.phase,'wait','a tap skips the walk-on');assert.equal(s.serveTo,0,'a new match serves to the child');
 // an own goal pays nothing extra and is not a board goal
 const o=K.createAirFutbol({seed:4});o.state.phase='play';o.state.px=W/2;o.state.py=5;o.state.pvy=-200;o.state.lastHit=1;o.state.bank=true;o.state.serveT=o.state.t;const oe=run(o,1,x=>x.state.phase==='play');assert.equal(oe.find(e=>e.type==='goal').b,K.GOAL_OWN);assert.equal(o.state.score,AH.pts.goal);
 assert.equal(K.airCoins(249),0);assert.equal(K.airCoins(250),1);assert.equal(K.airCoins(1e7),AH.coinCap);
 // the most one match can pay, for the board's plausibility rate
 const most=AH.SOLO_TO*(AH.pts.goal+AH.pts.quick+AH.pts.bank+AH.pts.counter)+AH.pts.win+AH.pts.clean;assert(most+AH.pts.winLevel*RAMP.length<=2600,'the level bonus is capped with the table');assert(L.BOARD_RULES.airhockey.perSecond*12>=2600,'the board allows the fastest honest match (over 12 s)');
});
ok('lives: a lost match costs one of three and the same opponent plays again; the run ends on the third; every third win gives one back',()=>{
 const g=K.createAirFutbol({seed:8}),s=g.state;const lose=()=>{let ev=[];for(let i=0;i<AH.SOLO_TO;i++){ev=score(g,1);ev=ev.concat(run(g,AH.GOAL_BEAT+.1));g.skip();}return ev;};
 let ev=lose();assert.equal(s.lives,2);assert.equal(s.level,1,'the same opponent again');assert(ev.some(e=>e.type==='lose'&&e.a===2));assert(!s.over);assert.deepEqual(s.goals,[0,0]);assert.equal(s.stats.goalsAgainst,5);
 lose();assert.equal(s.lives,1);ev=lose();assert.equal(s.lives,0);assert(s.over);assert.equal(s.phase,'over');assert(ev.some(e=>e.type==='over'));assert.equal(s.score,0);
 const w=K.createAirFutbol({seed:8}),ws=w.state;const winMatch=()=>{for(let i=0;i<AH.SOLO_TO;i++){score(w,0);run(w,AH.GOAL_BEAT+.1);w.skip();}};
 for(let i=0;i<AH.SOLO_TO;i++){score(w,1);run(w,AH.GOAL_BEAT+.1);w.skip();}assert.equal(ws.lives,2);winMatch();winMatch();assert.equal(ws.lives,2);winMatch();assert.equal(ws.lives,3,'three wins give a life back');assert.equal(ws.level,4);
 winMatch();winMatch();winMatch();assert.equal(ws.lives,AH.LIVES,'never more than three');assert.equal(AH.LIVES,3);assert.equal(AH.SOLO_TO,5);
});
ok('one player against the machine: the core has no two-player mode; conceded goals are sorted for the coach',()=>{
 // owner, Nov 11 2026: single player only. No mode switch, no first-to-7, no winner side, no half-of-the-table finger picking.
 assert(!('DUO_TO' in AH)&&!('sideOf' in K),'no two-player rules or helpers');const g=K.createAirFutbol({seed:6,mode:'duo'}),s=g.state;
 assert(!('mode' in s)&&!('winner' in s),'no mode or winner in the state');assert.equal(g.opponent.name,'Sandy','even asked for "duo", side 1 is the machine');
 g.hold(1,true);assert(!s.held[1],'no finger can drive the machine’s striker');g.aim(1,W/2,H/2-SR);assert.notEqual(s.ty[1],H/2-SR);
 for(let i=0;i<AH.SOLO_TO;i++){score(g,1);run(g,AH.GOAL_BEAT+.1);g.skip();}assert.equal(s.lives,AH.LIVES-1,'five against costs a life: there is no first-to-7 match');
 for(const f of ['core','touch','view'])assert(!/\bduo\b|two-player|DUO_TO|player 2/i.test(read(`lib/arcade/airhockey/${f}.ts`)),f+'.ts has no two-player code');
 // how the goals against went in: near post, caught up the pitch, off the boards
 const c=K.createAirFutbol({seed:6}),cs=c.state;const concede=(shotX,inX,defY,bank)=>{cs.phase='play';cs.inGoal=false;cs.sx[0]=cs.tx[0]=SR;cs.sy[0]=cs.ty[0]=defY;cs.px=inX;cs.py=H-5;cs.pvx=0;cs.pvy=220;cs.lastHit=1;cs.prevHit=-1;cs.lastHitT=cs.t;cs.bank=bank;cs.shotX[1]=shotX;cs.shotDefY[1]=defY;run(c,1,x=>x.state.phase==='play');run(c,AH.GOAL_BEAT+.1);c.skip();};
 concede(20,GOAL0+6,H-SR,false);assert.equal(cs.stats.concNear,1,'shot from the left, in at the left post');concede(20,GOAL1-6,H-SR,false);assert.equal(cs.stats.concFar,1);
 concede(50,50,H/2+SR,false);assert.equal(cs.stats.concCaught,1,'the striker was up the pitch');concede(20,50,H-SR,true);assert.equal(cs.stats.concBank,1);assert.equal(cs.stats.goalsAgainst,4);
});
ok('the coaching line is tied to what happened, from an authored set, and rotates',()=>{
 const st=o=>({...K.emptyAirStats(),...o});
 assert.equal(S.coachKey(st({goalsAgainst:5,concNear:3,concFar:1,concBank:1})),'near');assert.match(S.coachLine(st({goalsAgainst:5,concNear:3}),0),/near post: stay between the puck and the goal/);
 assert.equal(S.coachKey(st({goalsAgainst:4,concCaught:3,concNear:1})),'caught');assert.equal(S.coachKey(st({goalsAgainst:3,concBank:2})),'bank');assert.equal(S.coachKey(st({goalsAgainst:2,own:2})),'own');assert.equal(S.coachKey(st({goalsAgainst:2,concFar:2})),'far');
 assert.equal(S.coachKey(st({goalsFor:10,bank:3,goalsAgainst:1,concFar:1})),'bankGood');assert.equal(S.coachKey(st({goalsFor:6,counters:1})),'counterGood');assert.equal(S.coachKey(st({goalsFor:5,clean:1})),'clean');assert.equal(S.coachKey(st({})),'start');
 for(const [k,lines] of Object.entries(S.AIR_COACH)){assert(lines.length>=2,k);for(const l of lines)assert(l.length>30&&l.length<140&&!/—/.test(l),l);assert.notEqual(S.coachLine(st(k==='near'?{goalsAgainst:3,concNear:3}:{}),0),S.coachLine(st(k==='near'?{goalsAgainst:3,concNear:3}:{}),1),'rotates');}
 const all=Object.values(S.AIR_COACH).flat().join(' ');assert(/boards/.test(all)&&/near post/.test(all)&&/counter/.test(all)&&/between the puck and/.test(all),'angles, the keeper’s rule, the counter');
});
ok('save: sanitised, settled once per run, an old save with the removed head-to-head tally loads cleanly; near-miss line',()=>{
 assert.deepEqual(S.sanitizeAirSave(null),S.emptyAirSave());assert.deepEqual(S.sanitizeAirSave({best:-5,level:'x',duo:{day:'nope',p1:1e9,p2:2}}),S.emptyAirSave());assert(!('duo' in S.emptyAirSave()));
 // a save written before Nov 11 2026 (two-player mode) keeps every solo field; the tally is dropped, and the key is unchanged
 const old={v:1,best:1200,level:4,beaten:3,plays:5,tip:2,duo:{day:'2026-11-11',p1:3,p2:1}};assert.deepEqual(S.sanitizeAirSave(old),{v:1,best:1200,level:4,beaten:3,plays:5,tip:2});assert.equal(S.AIR_KEY,'fi2-airhockey-v1');
 {const mem=new Map([[S.AIR_KEY,JSON.stringify(old)]]);global.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
  const got=S.readAirSave();assert.equal(got.best,1200);const r0=S.settleAir(got,{score:1500,level:5,goals:[1,5],stats:{...K.emptyAirStats(),wins:4}});S.writeAirSave(r0.save);const back=JSON.parse(mem.get(S.AIR_KEY));
  assert.equal(back.best,1500);assert.equal(back.beaten,7);assert(!('duo' in back),'the old tally is gone after the next run');delete global.localStorage;assert.equal(S.readAirSave().best,0,'no storage: a fresh save, no error');}
 assert(!/settleDuo|duoToday/.test(Object.keys(S).join(' ')),'no head-to-head helpers');assert.equal(S.sanitizeAirSave({best:9e9}).best,S.AIR_SCORE_MAX);
 const stats={...K.emptyAirStats(),wins:2,goalsFor:12,goalsAgainst:7,concNear:4};let r=S.settleAir(S.emptyAirSave(),{score:1450,level:3,goals:[2,5],stats});
 assert(r.newBest);assert.equal(r.save.best,1450);assert.equal(r.save.level,3);assert.equal(r.save.beaten,2);assert.equal(r.save.plays,1);assert.equal(r.coachKey,'near');const first=r.coach;
 r=S.settleAir(r.save,{score:900,level:2,goals:[0,5],stats});assert(!r.newBest);assert.equal(r.previousBest,1450);assert.equal(r.save.best,1450);assert.equal(r.save.level,3);assert.notEqual(r.coach,first,'the next card shows the next line');
 assert.equal(S.nearLine({score:300,best:0,newBest:true,level:1,goals:[3,5]}),'2 goals from beating Sandy');assert.equal(S.nearLine({score:300,best:0,newBest:true,level:1,goals:[4,5]}),'1 goal from beating Sandy');
 assert.equal(S.nearLine({score:1300,best:1450,newBest:false,level:2,goals:[1,5]}),'150 points from your best');assert.equal(S.nearLine({score:300,best:9000,newBest:false,level:2,goals:[0,5]}),'Beat Pip to reach level 3');
 assert(isSyncKey(S.AIR_KEY),'the save travels with the save code');assert(read('docs/accounts-design.md').includes('fi2-airhockey-v1'));
});
ok('fingers: the first finger drives the striker, palms are ignored, and a lifted finger can never keep it (lost pointer-ups)',()=>{
 const log=[];const make=()=>TT.createStrikerTouches(()=>log.push('release'),(x,y)=>log.push(`take@${x},${y}`));
 let t=make();assert.equal(t.down(1,100,600),true);assert.equal(t.owner(),1);assert.equal(t.down(2,300,100),false,'a second touch anywhere is ignored');assert.equal(t.owner(),1);
 assert.equal(t.move(1,110,590),true);assert.equal(t.move(2,10,10),false,'the palm moves nothing');
 t.reconcile([110,590,10,10]);assert.equal(t.owner(),1,'the finger that is really down keeps the striker');
 t.up(1);assert.equal(t.owner(),-1);assert.deepEqual(log.splice(0),['release']);t.up(1);assert.deepEqual(log,[],'a second release is harmless');
 // lost pointer-up 1: the finger left but no pointerup came. The next touch event shows no touch near it: released.
 t=make();t.down(1,100,600);t.reconcile([]);assert.equal(t.owner(),-1);assert.deepEqual(log.splice(0),['release']);
 // lost pointer-up 2: a ghost owner, and a NEW finger lands. It is turned away for one event, then takes over.
 t=make();t.down(1,100,600);assert.equal(t.down(2,300,700),false);t.reconcile([300,700]);assert.equal(t.owner(),2,'the new finger takes the ghost’s striker');assert.deepEqual(log.splice(0),['take@300,700']);assert.equal(t.move(2,310,690),true);
 // a real second finger never steals: both touches are on the glass
 t=make();t.down(1,100,600);t.down(2,300,700);t.reconcile([100,600,300,700]);assert.equal(t.owner(),1);t.up(2);t.reconcile([100,600]);assert.equal(t.owner(),1);assert.deepEqual(log,[]);
 t.clear();assert.equal(t.owner(),-1);assert.deepEqual(log.splice(0),['release']);
 const c=read('components/games/AirFutbolGame.tsx');assert(/window\.addEventListener\('pointerup',up,cap\)/.test(c)&&/window\.addEventListener\('touchend',reconcile,pcap\)/.test(c)&&/window\.addEventListener\('touchcancel',reconcile,pcap\)/.test(c)&&/window\.addEventListener\('touchstart',reconcile,pcap\)/.test(c),'window-level safety net');
 assert(/const away=\(\)=>pause\(\)/.test(c)&&/touches\.current\?\.clear\(\)/.test(c)&&/window\.addEventListener\('pagehide',hide\)/.test(c),'pause, blur and page hide let go of everything');
 assert(/const take=\(e:PointerEvent\)=>\{if\(t\.down\(e\.pointerId,e\.clientX,e\.clientY\)\)\{game\.current!\.hold\(0,true\)/.test(c),'every finger and the mouse drive the child’s striker (side 0)');
 assert(!/\bduo\b|sideOf|AirMode|data-air-duo|W A S D drive|2 players|head-to-head|Player 2|DUO_TO|settleDuo/i.test(c),'the shell has no two-player mode');
 assert(!/duo|data-mode|data-end=top|\.winner|\.tally|\.flip/.test(read('components/games/AirFutbolGame.module.css')),'no two-player CSS');
});
ok('arcade wiring: seventh game (the table), one board, coins, today, save code, room route and prompt, SQL',()=>{
 assert.equal(arcadeCabinets.length,13);/* Nov 21 2026: Keepy-Uppy Beat and Hold the Line on the east wall: thirteen machines *//* Nov 18 2026: Clear the Box and Street Dash retired, Roll It In and Ball Blaster took their places: eleven machines *//* Nov 17 2026: Roll It In is the twelfth (tests/rollball-core.cjs) *//* Nov 17 2026: Ball Blaster is the twelfth (tests/ballblaster-core.cjs) *//* Nov 17 2026: Line Up! (tests/lineup-core.cjs), Trophy Drop (tests/trophydrop-core.cjs) and a retired tap puzzle were the eighth to tenth */const cab=arcadeCabinets.find(c=>c.id==='airhockey');assert(cab&&cab.name==='Air Futbol'&&cab.short==='AIR FUTBOL'&&cab.lesson);assert.equal(arcadeAnalyticsId('airhockey'),'airhockey');assert.equal(ARCADE_TABLE_ID,'airhockey');
 const props=read('lib/arcade/arcadeRoomProps.ts');assert(/box\(-10,1\.44,-1,2\.56,\.08,4\.2,cream\)/.test(props)&&/\{x:-10,z:-1,halfX:1\.55,halfZ:2\.4\}/.test(props),'the table prop and its collider are unchanged');assert.equal(cab.x,-10);assert.equal(cab.z,-1);assert(arcadeStand('airhockey')>1.55+.5&&arcadeStand('snake')===1.8);
 for(const c of arcadeCabinets)if(c!==cab)assert(Math.hypot(c.x-cab.x,c.z-cab.z)>=4,'clear of '+c.id);
 const scene=read('lib/arcade/arcadeRoomScene.ts');assert(/if\(cabinet\.id===ARCADE_TABLE_ID\)\{\/\*[\s\S]*?\*\/highlights\.push\(createBuildingGlow\(g,4\.6,2\.9,1\.66,'vending'\)\)/.test(scene),'its own outline: one box that hugs the table (4.6 x 2.9, floor to the 1.66 m rim), no cabinet body');assert(/FREE PLAY · BEAT THE MACHINE/.test(scene)&&!/1 OR 2 PLAYERS/.test(scene),'the table sign is for one player');
 assert(/box\(-10,1\.13,-1,2\.9,\.55,4\.6,coral\)/.test(props)&&/box\(-10,1\.55,z,2\.9,\.2,\.18,wood\)/.test(props),'the outline matches the table body and rails');assert(/\$\{ARCADE_GAME_WORD\.toUpperCase\(\)\} GAMES · ALL FOOTBALL/.test(scene)&&!/(SIX|SEVEN) GAMES/.test(scene),'the sign counts the catalog (Nov 17 2026)');
 assert(/near = within 1\.2 m of any edge of the table/.test(scene)&&/if\(c\.id===ARCADE_TABLE_ID\)projected\.set\(c\.x,1\.8,c\.z\)/.test(scene)&&/dest=c\.id===ARCADE_TABLE_ID\?\{x:c\.x\+arcadeStand\(c\.id\),z:c\.z\}/.test(scene),'near, the prompt above the table, tap walks to it');
 assert(L.isBoardGame('airhockey'));assert(L.HALL_MACHINES.includes('airhockey'));assert.equal(L.HALL_MACHINES.length,arcadeCabinets.length,'one Hall chip per machine in the room');assert.equal(L.hallMachineOf('airhockey'),'airhockey');assert.equal(L.BOARD_TIER_TABS.airhockey,undefined,'one board');
 assert.deepEqual(L.BOARD_GAMES.slice(0,24),['runner','pinball','tennis','live','puzzle','kick','cupfinal','legend','livepro','livelgnd','tenpro','tenlgnd','pinderby','pinfinal','puzpro','puzlgnd','runwarm','runnight','runstorm','rundaily','kitrush','kitdaily','snake','snakedaily'],'no existing board is renamed or moved');
 assert.equal(L.scorePlausible('airhockey',1500,90_000),'ok');assert.equal(L.scorePlausible('airhockey',200_000,60_000),'fast');assert.equal(L.scorePlausible('airhockey',300,3000),'short');assert(L.scoreInBounds('airhockey',2_000_000)&&!L.scoreInBounds('airhockey',2_000_001));assert.equal(L.BOARD_RULES.airhockey.max,S.AIR_SCORE_MAX);
 assert.equal(arcadeCoinTarget('airhockey',{points:749}),2);assert.equal(arcadeCoinTarget('airhockey',{points:1e7}),ARCADE_COIN_CAPS.airhockey);assert.equal(ARCADE_COIN_CAPS.airhockey,ARCADE_COIN_CAPS.snake,'the cap is the same as the other 2D games');assert.equal(K.airCoins(749),2);
 assert(T.TODAY_CABINETS.includes('airhockey'));const ch=T.todayChallenge('2026-11-11','airhockey');assert(ch.line&&ch.point);const ids=new Set(Array.from({length:30},(_,i)=>T.todayChallenge(`2026-11-${String(1+i).padStart(2,'0')}`,'airhockey').id));assert(ids.size>=3);
 assert.equal(T.todayMet('2026-11-11',{kind:'airhockey',score:9999,wins:9,bank:9,clean:9,level:9}),'airhockey');assert.equal(T.todayMet('2026-11-11',{kind:'airhockey',score:0,wins:0,bank:0,clean:0,level:1}),null);
 const room=read('components/ArcadeRoom.tsx');assert(/game==='airhockey'\?<AirFutbol onExit=\{back\}\/>/.test(room));assert(/import\('\.\/games\/AirFutbolGame'\)/.test(room));assert(/data-arcade-play=\{chosen\.id\}/.test(room),'the room’s Play prompt is the shared one');
 assert(/airhockey:airhockey\.skin/.test(read('components/games/skins/index.ts')));const shell=read('components/games/AirFutbolGame.tsx');assert(/data-game="airhockey"/.test(shell));assert(/airhockey:'AIR FUTBOL'/.test(read('lib/arcade/arcadeCabinetAttract.ts')));
 // one player: every finished run goes through the board session, the save, coins and today
 assert(/run\.current=\{id,done:false\};\n  beginBoardSession\('airhockey'\);/.test(shell)&&/saveArcadeRecord\('airhockey',score\)/.test(shell));
 assert(/data-air-again autoFocus>Play again</.test(shell)&&/data-air-play autoFocus>Play</.test(shell),'Play on the start card, Play again on the results card');/* Nov 17 2026: results order near line, slot, Play again; no 'Best 0' pill */assert(/data-air-near>\{result\.near\}<\/ComicPanel>\n\s*<div className=\{styles\.hsSlot\} data-hs-slot\/>\n(\s*\{\/\*[\s\S]*?\*\/\}\n)?\s*<div className=\{styles\.actions\}>\n\s*<ComicButton[^\n]*data-air-again/.test(shell),'Play again right under the near line and the high-score slot');assert(/best=\{result\.settled\.save\.best>0\?/.test(shell));/* in-run NEW BEST! once per run, timed, reduced-motion safe */assert(/bestCalled\.current=true;setBestCall\(true\)/.test(shell)&&/setTimeout\(\(\)=>setBestCall\(false\),1800\)/.test(shell)&&/data-air-best-call/.test(shell),'in-run new-best burst');
 // the owner's ONE file names every board and checks the new one; it carries everything the endless file does; the newest migrations too
 const sql=read('docs/arcade-aaa/airhockey-supabase.sql'),code=sql.replace(/--.*$/gm,'');const list=/check \(game in \(([^)]*)\)\)/.exec(code)[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES].filter(g=>g!=='lineup'&&g!=='clearbox'/* Nov 17 2026: Clear the Box's board comes in docs/arcade-aaa/clearbox-supabase.sql and 20261127_clearbox_boards.sql *//* Nov 17 2026: Line Up!'s board comes in docs/arcade-aaa/lineup-supabase.sql, which names every board (tests/lineup-core.cjs) */).slice(0,L.BOARD_GAMES.indexOf('airhockey')+1));/* Nov 17 2026: boards added after Air Futbol are in their own owner files (docs/arcade-aaa/trophydrop-supabase.sql) */
 assert(/like '%''airhockey''%'/.test(sql)&&/like '%''snake''%' and pg_get_constraintdef\(oid\) like '%''snakedaily''%'/.test(sql),'the self-check verifies the new board and the earlier ones');assert(/prosrc like '%arcade_snake%' and prosrc like '%arcade_airhockey%'/.test(sql)&&/'arcade_puzzle','arcade_snake','arcade_airhockey'/.test(sql),'and the analytics keys');
 assert(/drop constraint if exists arcade_scores_game_check/.test(code)&&/score between 1 and 9000000/.test(code)&&/OK, Air Futbol board installed/.test(sql)&&/NOT INSTALLED: /.test(sql),'idempotent, self-checking, with the endless ceiling');
 const old=read('docs/arcade-aaa/endless-supabase.sql').replace(/--.*$/gm,'');for(const key of old.match(/'[a-z_0-9-]+'/g))assert(code.includes(key),'everything in the endless file is restated: '+key);
 const mig=read('supabase/migrations/20261116_airhockey_boards.sql');for(const g of L.BOARD_GAMES.filter(g=>g!=='lineup'&&g!=='clearbox'/* Nov 17 2026: Clear the Box's board comes in docs/arcade-aaa/clearbox-supabase.sql and 20261127_clearbox_boards.sql *//* Nov 17 2026: 20261123_lineup_boards.sql */).slice(0,L.BOARD_GAMES.indexOf('airhockey')+1)/* Nov 17 2026: later boards come in their own migrations (20261125_trophydrop_board.sql) */)assert(mig.includes(`'${g}'`),'migration names '+g);assert(/'arcade_puzzle','arcade_snake','arcade_airhockey'/.test(read('supabase/migrations/20261117_analytics_airhockey.sql')));
 const ids2=require('../lib/analytics/islandIds.ts');assert(ids2.ARCADE_GAMES.includes('airhockey')&&ids2.ACTIVITY_IDS.includes('arcade_airhockey'));
});
ok('sound: one limiter, wired to the output and nowhere else; made on the first tap; the hum exists only while the puck moves',()=>{
 const a=read('lib/arcade/airhockey/audio.ts');assert.equal((a.match(/createDynamicsCompressor\(\)/g)||[]).length,1);assert(/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/.test(a));
 assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1,'the limiter has exactly one output');assert(!/\.connect\(ctx\.destination\)/.test(a.replace('limiter.connect(ctx.destination)','')),'no voice bypasses the limiter');assert(!/\.connect\(limiter\)/.test(a.replace('master.connect(limiter)','')),'only the master feeds the limiter');
 assert(!/new Audio\(|\.mp3|\.ogg|\.wav|fetch\(/.test(a),'no audio files');assert(/ctx\.state==='suspended'\)void ctx\.resume\(\)/.test(a));assert(!/setInterval|setTimeout/.test(a),'no timers');
 assert(/if\(speed<=4\|\|!on\(\)\|\|!ctx\|\|!master\|\|!noise\)\{stopHum\(\);return;\}/.test(a)&&/quiet\(\)\{stopHum\(\);\}/.test(a)&&/h\.a\.stop\(\);h\.b\.stop\(\);h\.n\.stop\(\);/.test(a),'the hum is freed when the puck stops');
 for(const cue of ['hit(impact:number','wall(speed:number','post(','serve()','goal(big:boolean)','conceded()','win()','save()'])assert(a.includes(cue),cue);
 const shell=read('components/games/AirFutbolGame.tsx');assert(/case 'hit':a\?\.hit\(e\.b,e\.a\)/.test(shell)&&/case 'wall':a\?\.wall\(e\.b\)/.test(shell),'hits and rebounds are scaled by speed');assert(/createAirAudio\(\)\)\.unlock\(\)/.test(shell));
 assert(/const sleep=useCallback\(\(\)=>\{if\(raf\.current\)cancelAnimationFrame\(raf\.current\);raf\.current=0;audio\.current\?\.quiet\(\);\}/.test(shell)&&/p\.sleeps\+\+;audio\.current\?\.quiet\(\);return;/.test(shell),'the hum stops when the game sleeps');
 for(const other of ['snake','kitrush']){const o=read(`lib/arcade/${other}/audio.ts`);assert(!/hum\(|horn/.test(o),'its own voice');}
});
ok('heat and layout: the loop lives only while something moves; DPR cap; four phones, sideways and desktop all show both goals',()=>{
 const c=read('components/games/AirFutbolGame.tsx'),v=read('lib/arcade/airhockey/view.ts'),css=read('components/games/AirFutbolGame.module.css');
 assert(/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/.test(c));assert(/Math\.min\(2,window\.devicePixelRatio\|\|1\)/.test(c));assert(/frameCapSlot\(now,slot\.current,FRAME_MS\)/.test(c));assert(/document\.hidden\)pause\(\)/.test(c));
 assert(/else if\(g\.idle&&!v\.busy\(\)\)\{p\.sleeps\+\+/.test(c),'at rest with no finger down the loop stops');assert(/touch-action:none/.test(css)&&/el\.addEventListener\('touchmove',noScroll,opt\)/.test(c));
 assert(!/requestAnimationFrame|setInterval|setTimeout/.test(v)&&!/three/.test(v),'the view has no loop and no three.js');assert(/opts\.reduced/.test(v)&&/prefers-reduced-motion/.test(css));assert(/g\.alpha/.test(v),'drawn between physics steps');
 assert(/comicRoot/.test(c)&&/ComicCard/.test(c)&&/ArcadePauseCard/.test(c)&&/HighScoreEntry/.test(c),'the shared comic kit and board flow');
 assert(/<ArcadeTopBar game="airhockey"/.test(c));assert(/\.topBar\{[^}]*--btn-gold:#24223e;[^}]*--btn-rim:#81fbed/.test(css));assert(!/BackButton|data-arcade-back/.test(read('components/games/skins/airhockey.module.css')),'the skin never restyles the Arcade back button');
 assert(!/IslandBrush/.test(css),'no IslandBrush in the shell CSS');assert(/"test":.*tests\/airhockey-core\.cjs/.test(read('package.json')),'in the core test chain');
 assert(/visualViewport/.test(c)&&/--air-cut/.test(c)&&/var\(--air-cut,0px\)/.test(css)&&/height:100vh;height:100dvh/.test(css),'laid out for the visible viewport, with a fallback');assert(/requestAnyOrientation\(\)/.test(c),'no rotate card: sideways still plays');
 // the table fits under the 62 px bar with both goals in view, and the striker is big enough for a small finger
 for(const [w,h,min] of [[390,844,3.4],[390,664,3.3],[375,553,2.7],[360,560,2.7],[506,900,4.4]]){const l=V.airLayout(w,h,62,8);assert(!l.side);assert(l.scale>=min,`${w}x${h}: scale ${l.scale}`);assert(l.y0>=62-1e-6&&l.y0+l.fh<=h-8+1e-6&&l.x0>=5&&l.x0+l.fw<=w-5,`${w}x${h} fits`);assert(SR*2*l.scale>=43,`${w}x${h}: striker ${SR*2*l.scale}px`);}
 const side=V.airLayout(844,390,62,8);assert(side.side&&side.scale>=2.8&&side.x0>=5&&side.y0>=62&&side.y0+side.fh<=382+1e-6,'a phone held sideways: the table lies on its side and still fits');
 // screen <-> table is exact both ways, upright and sideways; player 1's end is the bottom (upright) or the right (sideways)
 for(const l of [V.airLayout(390,664,62,8),side])for(const [x,y] of [[0,0],[W,H],[37,121]]){const px=V.toScreenX(l,x,y),py=V.toScreenY(l,x,y);assert(Math.abs(V.toTableX(l,px,py)-x)<1e-9&&Math.abs(V.toTableY(l,px,py)-y)<1e-9);}
 assert(V.toScreenY(V.airLayout(390,664,62,8),W/2,H)>V.toScreenY(V.airLayout(390,664,62,8),W/2,0));assert(V.toScreenX(side,W/2,H)>V.toScreenX(side,W/2,0));
});
console.log(`airhockey-core: ${n} groups passed`);
