// Squad Snake (Nov 10 2026, docs/arcade-aaa/snake-direction.md): the seeded rules, the device save and its arcade wiring.
// Run: node tests/snake-core.cjs   (--bots prints bot medians for tuning)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/snake/core.ts'),S=require('../lib/arcade/snake/save.ts'),L=require('../lib/arcade/leaderboard.ts');
const {arcadeCabinets,arcadeAnalyticsId}=require('../lib/arcade/arcadeCatalog.ts'),T=require('../lib/arcade/arcadeTodayCore.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
const {isSyncKey}=require('../lib/saves/snapshot.ts');
const read=p=>fs.readFileSync(p,'utf8'),{SN,RAMP,POS,DX,DY,CAUSE}=K;
let n=0;const ok=(name,fn)=>{fn();n++;};
/** Steps a game and records every event (copied out of the pooled ring). `think` runs before each frame. */
function trace(g,seconds,think,fps=60){const ev=[];for(let i=0;i<seconds*fps&&!g.state.over;i++){if(think)think(g);g.step(1/fps);g.drain(e=>ev.push({...e}));}return ev;}
const game=(seed=1,daily=false)=>K.createSquadSnake({seed,daily});
/** Runs the kick-off beat out, so the next step() ticks. */
const kickOff=g=>{g.step(g.state.ready);g.state.acc=0;g.drain(()=>{});return g;};
/** One whole tick, whatever the level's speed. */
const tick=g=>{const t=g.state.ticks,ev=[];for(let i=0;i<400&&g.state.ticks===t&&!g.state.over;i++){g.step(1/240);g.drain(e=>ev.push({...e}));}return ev;};
/** A careful player: shortest safe path (BFS) to the pick-up it wants; `skill` 0..1 = how often it thinks before a tick. */
function bot(prefer='call',skill=1){let lastTick=-1,r=12345;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
 return g=>{const s=g.state;if(s.over||s.beat>0||s.ticks===lastTick||s.qn>0)return;lastTick=s.ticks;if(rnd()>skill)return;
  const C=s.cols,R=s.rows,block=new Uint8Array(C*R);for(let i=1;i<s.len-1;i++)block[s.ys[i]*C+s.xs[i]]=1;
  for(const f of s.foes)if(f.on&&s.dash<=0){block[f.y*C+f.x]=1;if(f.kind===0){const x=f.x+f.dx,y=f.y+f.dy;if(x>=0&&y>=0&&x<C&&y<R)block[y*C+x]=1;const x2=f.x-f.dx,y2=f.y-f.dy;if(x2>=0&&y2>=0&&x2<C&&y2<R)block[y2*C+x2]=1;}}
  const call=K.CALLS[s.call],picks=s.picks.filter(p=>p.on);let want=picks[0];
  if(picks.length===2&&prefer==='call'){const more=p=>p.pos===POS.def?s.d<call[0]:p.pos===POS.mid?(s.m===0?s.d===call[0]:s.m<call[1]):p.pos===POS.fwd?s.m===call[1]:true;want=picks.find(more)||picks[0];}
  else if(picks.length===2&&prefer==='near'){const d=p=>Math.abs(p.x-s.xs[0])+Math.abs(p.y-s.ys[0]);want=d(picks[0])<=d(picks[1])?picks[0]:picks[1];}
  if(prefer==='call')for(const p of picks)if(p!==want)block[p.y*C+p.x]=1;
  const hx=s.xs[0],hy=s.ys[0],dist=new Int16Array(C*R).fill(-1),first=new Int8Array(C*R).fill(-1),q=[hy*C+hx];dist[hy*C+hx]=0;
  const back=(s.dir+2)%4;let target=want?want.y*C+want.x:-1,found=-1;
  for(let qi=0;qi<q.length;qi++){const c=q[qi],x=c%C,y=(c-x)/C;if(c===target){found=c;break;}
   for(let d=0;d<4;d++){if(qi===0&&d===back)continue;const nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=C||ny>=R)continue;const nc=ny*C+nx;if(block[nc]||dist[nc]>=0)continue;dist[nc]=dist[c]+1;first[nc]=qi===0?d:first[c];q.push(nc);}}
  let d=found>=0?first[found]:-1;
  if(d<0){let best=-1;for(let k=0;k<4;k++){if(k===back)continue;const nx=hx+DX[k],ny=hy+DY[k];if(nx<0||ny<0||nx>=C||ny>=R||block[ny*C+nx])continue;let room=0;for(const c of q)if(first[c]===k)room++;if(room>best){best=room;d=k;}}}
  if(d>=0&&d!==s.dir)g.turn(d);};}

ok('same seed and inputs, same run; another seed, another run; the daily seed is one per day',()=>{
 const sig=seed=>{const g=game(seed);return trace(g,60,bot()).map(e=>`${e.type}:${e.x},${e.y}:${e.a}`).join('|');};
 assert.equal(sig(4242),sig(4242));assert.notEqual(sig(4242),sig(4243));assert(sig(4242).split('pick').length>8,'a run calls team-mates');
 assert.equal(K.snakeDailySeed('2026-11-10'),K.snakeDailySeed('2026-11-10'));assert.notEqual(K.snakeDailySeed('2026-11-10'),K.snakeDailySeed('2026-11-11'));assert(K.snakeDailySeed('2026-11-10')>0&&K.snakeDailySeed('2026-11-10')<=2_000_000_000);
 assert.notEqual(K.snakeDailySeed('2026-11-10'),require('../lib/arcade/kitrush/core.ts').kitRushDailySeed('2026-11-10'),'not Kit Rush\'s seed');
 const a=game(K.snakeDailySeed('2026-11-10'),true),b=game(K.snakeDailySeed('2026-11-10'),true);assert.deepEqual([a.state.call,a.state.picks[0].x,a.state.picks[0].y],[b.state.call,b.state.picks[0].x,b.state.picks[0].y],'the same call and first pick-up for everyone');
 assert(!/Math\.random|Date\.now|performance\.now/.test(read('lib/arcade/snake/core.ts')),'the rules are deterministic');
});
ok('movement: one cell a tick on a fixed step, drawn between cells, the same at any frame rate',()=>{
 const g=game(5),s=g.state;assert.deepEqual([s.xs[0],s.ys[0],s.dir,s.len],[SN.startX,SN.startY,0,1]);
 g.step(SN.ready-.01);assert.equal(s.ticks,0,'the kick-off beat holds the captain');kickOff(g);
 const y0=s.ys[0];g.step(RAMP[0].step*.5);assert.equal(s.ticks,0);assert(g.frac>.4&&g.frac<.6,'half a cell is drawn half-way');g.step(RAMP[0].step*.55);assert.equal(s.ticks,1);assert.equal(s.ys[0],y0-1);assert.equal(s.pys[0],y0,'the cell before is kept for the drawing');
 const at=fps=>{const h=game(9);h.turn(1);for(let i=0;i<Math.round(2.35*fps);i++)h.step(1/fps);return [h.state.xs[0],h.state.ys[0],h.state.ticks];};
 assert.deepEqual(at(30),at(120));assert.deepEqual(at(60),at(144));
 const h=game(9);kickOff(h);h.step(5);assert(h.state.ticks<=6,'a long frame never fast-forwards the run');
});
ok('turns: two are buffered, a reversal is refused, a fast double swipe is the legal two-step U-turn',()=>{
 const g=kickOff(game(3)),s=g.state;assert.equal(s.dir,0);
 assert.equal(g.turn(0),false,'already heading up');assert.equal(g.turn(2),false,'straight back is refused');assert.equal(s.qn,0);
 assert.equal(g.turn(1),true);assert.equal(g.turn(3),false,'the second turn may not reverse the first');assert.equal(g.turn(1),false);assert.equal(g.turn(2),true,'right then down: a U-turn in two steps');assert.equal(s.qn,2);
 assert.equal(g.turn(0),true,'a third swipe replaces the second held turn');assert.equal(s.q1,0);assert.equal(g.turn(3),false);assert.equal(g.turn(2),true);
 const x=s.xs[0],y=s.ys[0];tick(g);assert.deepEqual([s.xs[0],s.ys[0],s.dir],[x+1,y,1]);tick(g);assert.deepEqual([s.xs[0],s.ys[0],s.dir],[x+1,y+1,2]);assert(!s.over);assert.equal(s.qn,0);
 for(const bad of [-1,4,1.5,NaN])assert.equal(g.turn(bad),false);
 // hammering every direction every frame never produces a reversal between two ticks
 const h=kickOff(game(8)),hs=h.state;let k=0,prev=hs.dir;for(let i=0;i<4000&&!hs.over;i++){h.turn((k=(k*7+3)%4));const t=hs.ticks;h.step(1/120);if(hs.ticks!==t){assert.notEqual(hs.moved,(prev+2)%4,'never a 180 between two cells run');prev=hs.moved;}}
 // a turn into the touchline is a skid, not a death, and the captain keeps his heading
 const w=kickOff(game(8)),ws=w.state;ws.picks[0].on=ws.picks[1].on=false;while(ws.ys[0]>0)tick(w);w.turn(3);tick(w);assert.equal(ws.dir,3);const wx=ws.xs[0];w.turn(0);w.turn(1);tick(w);assert.equal(ws.stall,1);assert.equal(ws.dir,3,'the turn into the wall is taken back');tick(w);assert.equal(ws.xs[0],wx-1,'and the U-turn behind it is refused: he runs on');assert.equal(ws.saves,1);assert(!ws.over);
});
ok('the line joins in position order and the pitch offers a real choice of shape',()=>{
 const g=game(1),s=g.state,off=()=>[...g.offers()];
 assert.deepEqual(off(),[POS.gk,0],'keeper first');assert(s.picks.filter(p=>p.on).length===1&&s.picks.find(p=>p.on).pos===POS.gk);
 s.gk=1;assert.deepEqual(off(),[POS.def,0]);s.d=2;assert.deepEqual(off(),[POS.def,0],'at least three at the back');
 s.d=3;assert.deepEqual(off(),[POS.def,POS.mid],'three or four at the back: your call');s.d=5;assert.deepEqual(off(),[0,POS.mid],'five is the most');
 s.d=3;s.m=3;assert.deepEqual(off(),[POS.mid,0],'3-3 would need four forwards');s.m=5;assert.deepEqual(off(),[0,POS.fwd]);
 s.d=4;s.m=3;assert.deepEqual(off(),[POS.mid,POS.fwd],'4-3-3 or on to 4-4-2');s.m=5;assert.deepEqual(off(),[0,POS.fwd]);s.d=5;s.m=4;assert.deepEqual(off(),[0,POS.fwd]);s.d=4;s.m=4;s.f=1;assert.deepEqual(off(),[POS.fwd,0]);
 // whole runs: every line is in order and every squad is one of the seven shapes
 const seen=new Set();for(const prefer of ['call','near','first'])for(let seed=1;seed<=8;seed++){const h=game(seed*31),hs=h.state,think=bot(prefer);
  for(let i=0;i<60*150&&!hs.over;i++){think(h);h.step(1/60);h.drain(e=>{if(e.type==='squad'){const name=K.shapeOfCode(e.a);assert(K.SHAPES.includes(name),'shape '+name);seen.add(name);assert.equal(hs.joined,11);assert.equal(hs.gk+hs.d+hs.m+hs.f,11);assert.equal(hs.len,12);}});
   for(let j=2;j<hs.len;j++)assert(hs.pos[j]>=hs.pos[j-1],'keeper, defenders, midfielders, forwards');assert(hs.d<=5&&hs.m<=5&&hs.f<=3&&hs.len<=SN.maxLine);}}
 assert(seen.size>=4,'different choices build different shapes: '+[...seen].join(' '));for(const c of K.CALLS)assert(K.SHAPES.includes(K.shapeName(...c)));
 assert.equal(K.shapeName(4,3,3),'4-3-3');assert.equal(K.shapeOfCode(K.shapeCode(3,5,2)),'3-5-2');assert.equal(K.shapeOfCode(0),'');assert.equal(K.SHAPES.length,7);
 for(const sh of K.SHAPES){const [d,m,f]=sh.split('-').map(Number);assert.equal(d+m+f,10);assert(d>=3&&d<=5&&m>=3&&m<=5&&f>=1&&f<=3);}
});
ok('FULL SQUAD banks the bonus, names the shape, doubles on the coach\'s call, resets the line and raises the level',()=>{
 let doubled=0,plain=0;
 for(const prefer of ['call','first'])for(let seed=1;seed<=6;seed++){const g=game(seed*7),s=g.state,think=bot(prefer);let sq=null,before=0,call=null;
  for(let i=0;i<60*120&&!s.over&&!sq;i++){think(g);before=s.score;call=K.CALLS[s.call];const lvl=s.level;g.step(1/60);g.drain(e=>{if(e.type==='squad')sq={...e,lvl};});}
  if(!sq)continue;const called=K.shapeOfCode(sq.a)===K.shapeName(...call);assert.equal(sq.c,called?1:0);assert.equal(sq.b,SN.squadBonus*sq.lvl*(called?SN.callMult:1));called?doubled++:plain++;
  assert(s.score-before>=sq.b,'the bonus is banked at once');assert.equal(s.beat,SN.beat);assert.equal(s.stats.squads,1);assert.equal(s.stats.bestCode,sq.a);
  const t=s.ticks;g.step(SN.beat-.05);assert.equal(s.ticks,t,'the beat holds the pitch still');assert.equal(s.len,12);
  const ev=[];g.step(.1);g.drain(e=>ev.push({...e}));assert(ev.some(e=>e.type==='level'&&e.a===sq.lvl+1));
  assert.deepEqual([s.len,s.joined,s.gk,s.d,s.m,s.f,s.level,s.saves],[1,0,0,0,0,0,sq.lvl+1,1],'back to the captain, next level, save refilled');
  assert.equal(s.step,K.rampFor(s.level).step);assert.equal(s.foes.filter(f=>f.on&&f.kind===0).length,K.rampFor(s.level).press);assert(s.picks.some(p=>p.on&&p.pos===POS.gk),'the next squad starts with a keeper');assert(!s.over);}
 assert(doubled>=2&&plain>=1,`coach's call built ${doubled} times, another shape ${plain}`);
});
ok('the ramp is a table that only ever gets harder, and level 1 is slow and empty',()=>{
 assert.equal(RAMP[0].step,.3);assert.equal(RAMP[0].press+RAMP[0].refs,0,'no opponents on level 1');assert(RAMP[1].press>=1,'pressers from level 2');assert(RAMP.findIndex(r=>r.refs>0)===2,'referees from level 3');
 for(let i=1;i<RAMP.length;i++){const a=RAMP[i-1],b=RAMP[i];assert.equal(b.level,a.level+1);assert(b.step<a.step&&b.step>=a.step*.9,'speed rises gently at level '+b.level);assert(b.press>=a.press&&b.refs>=a.refs&&b.boot<a.boot);}
 const last=RAMP[RAMP.length-1];assert(last.step>=.14,'never faster than a child can read');assert(last.press+last.refs<=SN.maxFoes);assert.equal(K.rampFor(99),last);assert.equal(K.rampFor(0),RAMP[0]);assert.equal(K.rampFor(3).level,3);
 assert.deepEqual([...SN.medals],[...SN.medals].sort((a,b)=>a-b));assert.equal(K.medalFor(299),0);assert.equal(K.medalFor(300),1);assert.equal(K.medalFor(6000),4);assert.deepEqual(K.nextMedalLine(250),{medal:0,next:'Bronze',gap:50});assert.equal(K.nextMedalLine(9999).next,null);
});
ok('crashes are kind: a skid tick first, then the one last-ditch save, then the run ends',()=>{
 // straight up into the touchline with no input
 const g=kickOff(game(2)),s=g.state;s.picks[0].on=s.picks[1].on=false;s.ballIn=s.bootIn=999;let ev=[];while(s.ys[0]>0)tick(g);
 ev=tick(g);assert(ev.some(e=>e.type==='skid'&&e.a===CAUSE.wall));assert(!s.over);assert.equal(s.ys[0],0,'the captain waits on the line');assert.equal(s.stall,1);
 ev=tick(g);assert(ev.some(e=>e.type==='save'));assert(!s.over);assert.equal(s.saves,0);assert.equal(s.ys[0],0);assert(s.dir===1||s.dir===3,'turned along the touchline into open grass');assert.equal(s.stats.saves,1);
 const dir=s.dir;while(s.xs[0]>0&&s.xs[0]<s.cols-1)tick(g);ev=tick(g);assert(ev.some(e=>e.type==='skid'));ev=tick(g);assert(s.over);assert.equal(s.cause,CAUSE.wall);assert(ev.some(e=>e.type==='crash'&&e.a===CAUSE.wall));assert.equal(s.dir,dir);
 const t=s.ticks;g.step(1);assert.equal(s.ticks,t,'nothing moves after the crash');assert.equal(g.turn(1),false);
 // a late turn during the skid keeps the save
 const h=kickOff(game(2)),hs=h.state;hs.picks[0].on=hs.picks[1].on=false;while(hs.ys[0]>0)tick(h);tick(h);assert.equal(hs.stall,1);assert.equal(h.turn(1),true);tick(h);assert.deepEqual([hs.xs[0],hs.ys[0],hs.saves,hs.stall],[SN.startX+1,0,1,0]);assert(!hs.over);
 // your own line: tail cell is free (it moves away), any other member blocks
 const o=kickOff(game(4)),os=o.state;os.picks[0].on=os.picks[1].on=false;os.saves=0;os.len=6;os.dir=0;const cells=[[5,8],[6,8],[6,7],[5,7],[4,7],[4,8]];cells.forEach(([x,y],i)=>{os.xs[i]=os.pxs[i]=x;os.ys[i]=os.pys[i]=y;os.pos[i]=i?POS.def:0;});
 ev=tick(o);assert(ev.some(e=>e.type==='skid'&&e.a===CAUSE.own));ev=tick(o);assert(os.over&&os.cause===CAUSE.own);
 const o2=kickOff(game(4)),p=o2.state;p.picks[0].on=p.picks[1].on=false;p.saves=0;p.len=4;p.dir=0;[[5,8],[6,8],[6,7],[5,7]].forEach(([x,y],i)=>{p.xs[i]=p.pxs[i]=x;p.ys[i]=p.pys[i]=y;p.pos[i]=i?POS.def:0;});tick(o2);assert(!p.over&&p.stall===0,'chasing your own tail is legal');assert.deepEqual([p.xs[0],p.ys[0]],[5,7]);
 // a pressing defender ahead: skid, then tackled; in a through-pass dash he is run past
 const set=(g2,kind)=>{const z=g2.state;z.picks[0].on=z.picks[1].on=false;z.ballIn=z.bootIn=999;for(const f of z.foes)f.on=false;Object.assign(z.foes[0],{on:true,kind,x:z.xs[0],y:z.ys[0]-1,px:z.xs[0],py:z.ys[0]-1,dx:0,dy:0,lo:0,hi:0});return z;};
 const a=kickOff(game(6)),as=set(a,0);as.saves=0;as.foes[0].dx=1;as.foes[0].lo=as.foes[0].hi=as.xs[0];ev=tick(a);assert(ev.some(e=>e.type==='skid'&&e.a===CAUSE.tackle));tick(a);assert(as.over&&as.cause===CAUSE.tackle);
 const b=kickOff(game(6)),bs=set(b,0);bs.dash=3;const sc=bs.score;ev=tick(b);assert(ev.some(e=>e.type==='knock'));assert(!bs.over);assert.equal(bs.score,sc+SN.knock+SN.dashStep);assert.equal(bs.stats.knocks,1);
 // the referee: the last team-mate is sent back; with nobody behind, 50 points
 const c=kickOff(game(6)),cs=set(c,1);cs.len=3;cs.gk=1;cs.d=1;cs.joined=2;cs.pos[1]=POS.gk;cs.pos[2]=POS.def;cs.xs[1]=cs.xs[0];cs.ys[1]=cs.ys[0]+1;cs.xs[2]=cs.xs[0];cs.ys[2]=cs.ys[0]+2;
 ev=tick(c);assert(ev.some(e=>e.type==='card'&&e.a===1));assert.deepEqual([cs.len,cs.joined,cs.gk,cs.d],[2,1,1,0]);assert(!cs.over);assert(cs.picks.some(q=>q.on&&q.pos===POS.def),'the pitch offers a defender again');
 const d=kickOff(game(6)),ds=set(d,1);ds.score=70;ev=tick(d);assert(ev.some(e=>e.type==='card'&&e.a===0));assert.equal(ds.score,20);assert(!ds.over);
});
ok('loose ball = through-pass dash, golden boot = a timed touchline bonus',()=>{
 const g=kickOff(game(12)),s=g.state;s.picks[0].on=s.picks[1].on=false;s.bootIn=999;s.ball.on=true;s.ball.x=s.xs[0];s.ball.y=s.ys[0]-1;
 let ev=tick(g);assert(ev.some(e=>e.type==='ball'));assert.equal(s.dash,SN.dashSteps);assert(Math.abs(g.stepSeconds-RAMP[0].step/1.5)<1e-9,'the dash is 1.5x speed');const sc=s.score;g.turn(1);
 for(let i=0;i<4;i++)tick(g);assert.equal(s.score,sc+4*SN.dashStep);assert.equal(s.dash,SN.dashSteps-4);
 const h=kickOff(game(13)),hs=h.state;let boot=null,gone=false;for(let i=0;i<60*40&&!hs.over;i++){if(hs.ys[0]<3&&hs.dir===0)h.turn(1);else if(hs.xs[0]>7&&hs.dir===1)h.turn(2);else if(hs.ys[0]>11&&hs.dir===2)h.turn(3);else if(hs.xs[0]<3&&hs.dir===3)h.turn(0);h.step(1/60);h.drain(e=>{if(e.type==='bootIn')boot={x:e.x,y:e.y,max:hs.boot.max};if(e.type==='bootGone')gone=true;});}
 assert(boot,'a golden boot appears');assert(boot.x===0||boot.y===0||boot.x===hs.cols-1||boot.y===hs.rows-1,'on a touchline cell: a tight turn by design');assert.equal(boot.max,RAMP[0].boot);assert(gone,'and leaves when its timer runs out');
});
ok('bots: a run goes on as long as the player lasts, gets harder, and fits the board\'s rate',()=>{
 const play=(seed,skill,prefer)=>{const g=game(seed),s=g.state,think=bot(prefer,skill);let t=0;for(;t<60*900&&!s.over;t++){think(g);g.step(1/60);g.drain(()=>{});}return {score:s.score,level:s.level,t:t/60,over:s.over,squads:s.stats.squads};};
 const med=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)],runs=(skill,prefer,nn=14)=>Array.from({length:nn},(_,i)=>play(1000+i*17,skill,prefer));
 const sharp=runs(1,'call'),steady=runs(.93,'near'),slow=runs(.8,'near');
 if(process.argv.includes('--bots'))for(const [name,r] of [['sharp',sharp],['steady',steady],['slow',slow]])console.log(name,'score',med(r.map(x=>x.score)),'level',med(r.map(x=>x.level)),'secs',Math.round(med(r.map(x=>x.t))),'squads',med(r.map(x=>x.squads)),'pts/s',Math.round(Math.max(...r.map(x=>x.score/x.t))));
 assert(med(sharp.map(r=>r.level))>=4,'a sharp player climbs the ramp: level '+med(sharp.map(r=>r.level)));assert(med(sharp.map(r=>r.score))>med(slow.map(r=>r.score)),'skill shows in the score');
 assert(med(slow.map(r=>r.score))>=100,'a slow reader still calls a few team-mates');
 for(const r of [...sharp,...steady,...slow]){assert(r.score/Math.max(8,r.t)<L.BOARD_RULES.snake.perSecond*.5,'bot pace '+Math.round(r.score/r.t)+'/s');assert.equal(L.scorePlausible('snake',Math.max(1,r.score),Math.max(8,r.t)*1000),'ok');assert(r.score<L.BOARD_RULES.snake.max);}
 // the fastest honest scoring at the level cap still fits the rate
 const top=(SN.squad*SN.pick+SN.squadBonus*SN.callMult)*SN.levelCap,least=SN.squad*3*RAMP[RAMP.length-1].step*SN.dashSpeed+SN.beat+SN.levelReady;assert(top/least<L.BOARD_RULES.snake.perSecond*2.2,'board rate is the right order of size');
});
ok('device save: best, medal, shapes album, Daily Squad claim, day streak, facts and the near-miss line',()=>{
 const stats=(o={})=>({picks:0,squads:0,calls:0,bestCode:0,bestBonus:0,bestCall:false,shapes:0,balls:0,boots:0,knocks:0,cards:0,saves:0,skids:0,turns:0,longest:1,...o});
 const run=(o={})=>({score:0,daily:false,day:'2026-11-10',stats:stats(),joined:0,line:[0,0,0,0],level:1,cause:1,call:0,...o});
 let s=S.emptySnakeSave();let r=S.settleSnake(s,run({score:420,stats:stats({squads:1,bestCode:433,shapes:1<<K.SHAPES.indexOf('4-3-3')})}));
 assert(r.newBest&&r.newMedal&&r.newShape);assert.equal(r.medal,1);assert.equal(r.save.best,420);assert.equal(r.save.plays,1);assert.equal(r.save.shapes,4);assert.equal(r.fact.key,'4-3-3');assert.equal(r.save.streak.n,0,'endless runs do not touch the streak');
 s=r.save;r=S.settleSnake(s,run({score:100}));assert(!r.newBest&&!r.newMedal&&!r.newShape);assert.equal(r.save.best,420);assert.equal(r.previousBest,420);
 r=S.settleSnake(s,run({score:150,daily:true}));assert(r.dailyFirst&&r.streakUp);assert.equal(r.streak,1);assert.equal(r.save.best,420,'the daily does not overwrite the endless best');s=r.save;
 r=S.settleSnake(s,run({score:900,daily:true}));assert(!r.dailyFirst&&!r.streakUp&&r.newBest);assert.equal(r.dailyBest,900);assert.equal(r.save.daily.runs,2);s=r.save;
 r=S.settleSnake(s,run({score:10,daily:true,day:'2026-11-11'}));assert(r.dailyFirst);assert.equal(r.streak,2);s=r.save;r=S.settleSnake(s,run({score:10,daily:true,day:'2026-11-13'}));assert.equal(r.streak,1,'a missed day starts again');
 assert.equal(S.liveStreak(s,'2026-11-12'),2);assert.equal(S.liveStreak(s,'2026-11-13'),0);assert.equal(S.dayBefore('2026-03-01'),'2026-02-28');assert.equal(S.dayBefore('2027-01-01'),'2026-12-31');
 assert.deepEqual(S.sanitizeSnakeSave({best:-5,medal:99,shapes:1e9,pad:'yes',daily:{day:'x',best:1e12},streak:{day:'2026-11-10',n:3.7}}),{...S.emptySnakeSave(),medal:4,shapes:127,daily:{day:'',best:S.SNAKE_SCORE_MAX,counted:false,runs:0},streak:{day:'2026-11-10',n:3,best:0}});
 assert.deepEqual(S.sanitizeSnakeSave(null),S.emptySnakeSave());assert.equal(S.SNAKE_KEY,'fi2-snake-v1');assert(S.SNAKE_SCORE_MAX>=L.BOARD_RULES.snake.max);
 // facts: every shape and every position has one; short, and rotated
 for(const sh of K.SHAPES)assert(S.SNAKE_FACTS.some(f=>f.key===sh),'a fact for '+sh);for(const k of ['gk','def','mid','fwd','numbers'])assert(S.SNAKE_FACTS.some(f=>f.key===k),k);
 for(const f of S.SNAKE_FACTS){assert(f.line.length>40&&f.line.length<175,f.title+' '+f.line.length);assert(!/[—–]/.test(f.line));}
 assert.equal(S.factFor({stats:stats({bestCode:442}),line:[0,0,0,0]},0).key,'4-4-2');assert.notEqual(S.factFor({stats:stats({bestCode:442}),line:[0,0,0,0]},0).title,S.factFor({stats:stats({bestCode:442}),line:[0,0,0,0]},1).title);assert.equal(S.factFor({stats:stats({bestCode:442}),line:[0,0,0,0]},3).key,'numbers');
 assert.equal(S.factFor({stats:stats(),line:[0,0,0,0]},0).key,'gk');assert.equal(S.factFor({stats:stats(),line:[1,2,0,0]},0).key,'def');assert.equal(S.factFor({stats:stats(),line:[1,4,2,0]},0).key,'mid');assert.equal(S.factFor({stats:stats(),line:[1,4,3,1]},0).key,'fwd');
 const near=o=>S.nearMissLine({score:0,best:0,newBest:false,joined:0,stats:stats(),daily:false,call:1,...o});
 assert.equal(near({joined:9,score:90}),'2 players from a Full Squad');assert.equal(near({joined:10}),'1 player from a Full Squad');assert.equal(near({score:260}),'40 points from Bronze');assert.equal(near({score:500,best:560}),'60 from your best');
 assert.equal(near({score:1300,stats:stats({squads:2})}),'Build the coach’s 4-3-3 for double points');assert.match(near({score:99999}),/Captain medal/);assert.equal(near({joined:3,score:30}),'8 players from a Full Squad');
 for(const c of [1,2,3,0])assert(S.coachLine(c).length>20);assert.notEqual(S.coachLine(1),S.coachLine(2));
 assert.equal(S.builtLine(stats({bestCode:352}),[1,2,0,0]),'3-5-2');assert.equal(S.builtLine(stats(),[0,0,0,0]),'No keeper yet');assert.equal(S.builtLine(stats(),[1,3,1,0]),'Keeper + 3 defenders + 1 mid');
});
ok('arcade wiring: sixth cabinet, boards, coins, today, save code, room route, SQL',()=>{
 assert.equal(arcadeCabinets.length,7);/* Nov 11 2026: Air Futbol, the table, is the seventh (tests/airhockey-core.cjs) */const cab=arcadeCabinets.find(c=>c.id==='snake');assert(cab&&cab.name==='Squad Snake'&&cab.short==='SQUAD SNAKE');assert.equal(arcadeAnalyticsId('snake'),'snake');
 for(const c of arcadeCabinets)if(c!==cab)assert(Math.abs(c.x-cab.x)>=4||Math.abs(c.z-cab.z)>=4,'clear of '+c.id);assert(Math.abs(cab.x)<=12&&cab.z>=-10.5,'inside the room');
 assert(L.isBoardGame('snake')&&L.isBoardGame('snakedaily'));assert.deepEqual(L.BOARD_TIER_TABS.snake,['snakedaily']);assert(L.HALL_MACHINES.includes('snake'));assert.equal(L.HALL_MACHINES.length,arcadeCabinets.length,'one Hall chip per machine in the room');assert.equal(L.hallMachineOf('snakedaily'),'snake');
 assert.deepEqual(L.BOARD_GAMES.slice(0,22),['runner','pinball','tennis','live','puzzle','kick','cupfinal','legend','livepro','livelgnd','tenpro','tenlgnd','pinderby','pinfinal','puzpro','puzlgnd','runwarm','runnight','runstorm','rundaily','kitrush','kitdaily'],'no existing board is renamed or moved');
 assert.equal(L.scorePlausible('snake',3000,120_000),'ok');assert.equal(L.scorePlausible('snake',300_000,20_000),'fast');assert.equal(L.scorePlausible('snake',300,3000),'short');assert(L.scoreInBounds('snakedaily',3_000_000)&&!L.scoreInBounds('snakedaily',3_000_001));
 assert.equal(arcadeCoinTarget('snake',{points:449}),2);assert.equal(arcadeCoinTarget('snake',{points:1e6}),ARCADE_COIN_CAPS.snake);assert.equal(K.snakeCoins(449),2);
 assert(T.TODAY_CABINETS.includes('snake'));const c=T.todayChallenge('2026-11-10','snake');assert(c.line&&c.point);const ids=new Set(Array.from({length:30},(_,i)=>T.todayChallenge(`2026-11-${String(1+i).padStart(2,'0')}`,'snake').id));assert(ids.size>=3);
 assert.equal(T.todayMet('2026-11-10',{kind:'snake',daily:true,day:'2026-11-10',score:9999,squads:9,calls:9,level:9}),'snake');assert.equal(T.todayMet('2026-11-10',{kind:'snake',daily:false,day:'2026-11-09',score:0,squads:0,calls:0,level:1}),null);
 assert(isSyncKey(S.SNAKE_KEY),'the save travels with the save code');assert(read('docs/accounts-design.md').includes('fi2-snake-v1'));
 const room=read('components/ArcadeRoom.tsx');assert(/game==='snake'\?<SquadSnake onExit=\{back\}\/>/.test(room));assert(/import\('\.\/games\/SquadSnakeGame'\)/.test(room));
 assert(/snake:snake\.skin/.test(read('components/games/skins/index.ts')));const shell=read('components/games/SquadSnakeGame.tsx');assert(/data-game="snake"/.test(shell));assert(/snake:'SQUAD SNAKE'/.test(read('lib/arcade/arcadeCabinetAttract.ts')));
 // the owner's ONE file names every board and checks the new ones; the newest board migration does too
 const sql=read('docs/arcade-aaa/endless-supabase.sql'),code=sql.replace(/--.*$/gm,'');const list=/check \(game in \(([^)]*)\)\)/.exec(code)[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,L.BOARD_GAMES.slice(0,24));/* Nov 11 2026: this file is the list as of Squad Snake; docs/arcade-aaa/airhockey-supabase.sql restates it with 'airhockey' (tests/airhockey-core.cjs) */
 assert(/like '%''snake''%' and pg_get_constraintdef\(oid\) like '%''snakedaily''%'/.test(sql),'the self-check verifies the two new boards');assert(/prosrc like '%arcade_snake%'/.test(sql)&&/'arcade_puzzle','arcade_snake'/.test(sql),'and the analytics key');assert(/drop constraint if exists arcade_scores_game_check/.test(code),'idempotent');
 const mig=read('supabase/migrations/20261114_snake_boards.sql');for(const g of L.BOARD_GAMES.slice(0,24))assert(mig.includes(`'${g}'`),'migration names '+g);assert(/'arcade_puzzle','arcade_snake'/.test(read('supabase/migrations/20261115_analytics_snake.sql')));
 const ids2=require('../lib/analytics/islandIds.ts');assert(ids2.ARCADE_GAMES.includes('snake')&&ids2.ACTIVITY_IDS.includes('arcade_snake'));
});
ok('sound: one limiter, wired to the output and nowhere else; made on the first tap; a rising squad tune',()=>{
 const a=read('lib/arcade/snake/audio.ts');assert.equal((a.match(/createDynamicsCompressor\(\)/g)||[]).length,1);assert(/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/.test(a));
 assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1,'the limiter has exactly one output');assert(!/\.connect\(ctx\.destination\)/.test(a.replace('limiter.connect(ctx.destination)','')),'no voice bypasses the limiter');assert(!/\.connect\(limiter\)/.test(a.replace('master.connect(limiter)','')),'only the master feeds the limiter');
 assert(!/new Audio\(|\.mp3|\.ogg|\.wav|fetch\(/.test(a),'no audio files');assert(/ctx\.state==='suspended'\)void ctx\.resume\(\)/.test(a));assert(!/setInterval|setTimeout/.test(a),'no timers');
 const tune=require('../lib/arcade/snake/audio.ts').SQUAD_TUNE;assert.equal(tune.length,SN.squad,'one note per team-mate');assert(tune[tune.length-1]>tune[0]&&tune[10]>tune[8]&&tune[8]>tune[4],'the phrase rises');
 const shell=read('components/games/SquadSnakeGame.tsx');assert(/case 'pick':a\?\.pick\(e\.b\)/.test(shell),'each pick-up plays the next note');assert(/createSnakeAudio\(\)\)\.unlock\(\)/.test(shell));
});
ok('heat and input: the loop lives only while playing; pools, DPR cap, reduced motion; swipes, keys, optional d-pad',()=>{
 const c=read('components/games/SquadSnakeGame.tsx'),v=read('lib/arcade/snake/view.ts'),css=read('components/games/SquadSnakeGame.module.css');
 assert(/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/.test(c));assert(/Math\.min\(2,window\.devicePixelRatio\|\|1\)/.test(c));assert(/frameCapSlot\(now,slot\.current,FRAME_MS\)/.test(c));assert(/document\.hidden\)pause\(\)/.test(c));
 assert(/getCoalescedEvents/.test(c)&&/touch-action:none/.test(css));assert(/SWIPE_PX=22/.test(c));assert(/ArrowUp:0,KeyW:0,ArrowRight:1,KeyD:1,ArrowDown:2,KeyS:2,ArrowLeft:3,KeyA:3/.test(c));assert(/data-snake-pad/.test(c)&&/save\.pad/.test(c));assert(/if\(!e\.repeat\)steer\(d\)/.test(c),'a held key is one turn');
 assert(!/requestAnimationFrame|setInterval/.test(v)&&!/three/.test(v),'the view has no loop and no three.js');assert(/opts\.reduced/.test(v)&&/prefers-reduced-motion/.test(css));assert(/g\.frac/.test(v),'drawn between ticks');
 assert(/comicRoot/.test(c)&&/ComicCard/.test(c)&&/ArcadePauseCard/.test(c)&&/HighScoreEntry/.test(c),'the shared comic kit and board flow');
 // the Arcade back button is the shared one, with the standard dark + teal-rim colours (not Kit Rush's gold)
 assert(/<ArcadeTopBar game="snake"/.test(c));assert(/\.topBar\{[^}]*--btn-gold:#24223e;[^}]*--btn-rim:#81fbed/.test(css));assert(!/BackButton|data-arcade-back/.test(read('components/games/skins/snake.module.css')),'the skin never restyles it');
 assert(!/IslandBrush/.test(css),'no IslandBrush in the shell CSS (numerals come from the kit token)');assert(/"test":.*tests\/snake-core\.cjs/.test(read('package.json')),'in the core test chain');
 // the pitch fits the three phone sizes with cells a child can see
 const {snakeLayout}=require('../lib/arcade/snake/view.ts');for(const [w,h] of [[390,844],[375,667],[360,640]]){const l=snakeLayout(w,h,122,false);assert(l.cell>=29,`${w}x${h}: cell ${l.cell}`);assert(l.x0>=4&&l.x0+l.pw<=w-4&&l.y0+l.ph<=h-20,`${w}x${h} fits`);}
 assert(snakeLayout(390,844,122,false).free>=150,'tall phones keep a swipe zone below the pitch');assert(snakeLayout(390,844,122,true).free>=176,'the d-pad has its own room');
});
ok('kick-off waits for the first input (Nov 11 2026): the clock stands still, the first press aims the lone captain, the rules then hold',()=>{
 const {createSquadSnake}=K,g=createSquadSnake({seed:7,hold:true}),s=g.state;assert.equal(s.hold,true);for(let i=0;i<300;i++)g.step(1/60);assert.equal(s.ticks,0,'no tick before the first input');assert.equal(g.frac,0);assert(!s.over);
 const x=s.xs[0];assert.equal(g.turn(3),true,'the first press is taken');assert.equal(s.hold,false);assert.equal(s.dir,3,'alone at kick-off the captain may face any way');assert.equal(g.turn(1),false,'then a reversal is refused as always');
 for(let i=0;i<120&&s.ticks<1;i++)g.step(1/60);assert.equal(s.xs[0],x-1,'it runs the way it was aimed');
 const h=createSquadSnake({seed:7,hold:true});assert.equal(h.turn(0),true,'a press along the heading just starts');assert.equal(h.state.dir,0);assert.equal(h.state.hold,false);
 const plain=createSquadSnake({seed:7});assert.equal(plain.state.hold,false,'without the option nothing waits (rules tests, replays)');
 const c=read('components/games/SquadSnakeGame.tsx'),css=read('components/games/SquadSnakeGame.module.css');assert(/createSquadSnake\(\{seed,daily,hold:true\}\)/.test(c));assert(/data-snake-hint/.test(c)&&/Swipe or tap the arrows/.test(c));
});
ok('phones (Nov 11 2026): the d-pad is on by default on touch screens, docked inside the visible viewport, and the pitch makes room',()=>{
 const c=read('components/games/SquadSnakeGame.tsx'),css=read('components/games/SquadSnakeGame.module.css'),{snakeLayout}=require('../lib/arcade/snake/view.ts');
 assert(/padOn=save\.pad\|\|coarse/.test(c)&&/matchMedia\('\(pointer:coarse\)'\)/.test(c),'touch screens always get the d-pad');assert(/visualViewport/.test(c)&&/--snake-cut/.test(c)&&/var\(--snake-cut,0px\)/.test(css),'laid out for the visible viewport');
 assert(/height:100vh;height:100dvh/.test(css),'dynamic viewport height with a fallback');assert(/\.pad\{[^}]*pointer-events:none/.test(css)&&/58px "l d r" 58px\/62px 62px 62px/.test(css),'big keys; swipes pass between them');
 assert(/el\.addEventListener\('pointerdown',down,opt\)/.test(c)&&/closest\('button'\)/.test(c),'the whole stage is the swipe surface; a d-pad key keeps its own press');assert(/el\.addEventListener\('touchmove',noScroll,opt\)/.test(c));
 // cells (CSS px) with the measured pad room (~140 px) under the 122 px bar + team sheet
 for(const [w,h,min] of [[390,844,34],[390,664,26],[375,553,18],[360,560,19]]){const l=snakeLayout(w,h,122,140);assert(l.cell>=min,`${w}x${h}: cell ${l.cell}`);assert(l.y0+l.ph<=h-140,`${w}x${h}: the pitch ends above the d-pad`);}
});
console.log(`snake-core: ${n} groups passed`);
