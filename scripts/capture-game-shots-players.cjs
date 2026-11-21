// Scripted players for scripts/capture-game-shots.cjs: per game, the start button, the game state to log next to each frame, and
// a loop that plays (real touches through CDP) until H.stop.
const airState=()=>{const k=window.__airhockey,g=k&&k.game,s=g&&g.state;return s?{phase:k.phase,p:s.phase,px:+s.px.toFixed(1),py:+s.py.toFixed(1),v:+Math.hypot(s.pvx,s.pvy).toFixed(0),sx:+s.sx[0].toFixed(0),sy:+s.sy[0].toFixed(0),goals:[...s.goals],level:s.level,heat:+s.heat.toFixed(2),rally:s.rally,smash:+(s.t-s.smashT).toFixed(2),bank:s.bank}:null;};
/** Safe Hands (Nov 21 2026): a keeper who reads the tells, with real touches. Before the kick it drags to the ideal spot; on the
 *  planted foot it swipes the way the foot points (up and across for a high shot), so the clip shows the tell and the save. It
 *  answers the wall and the cross with the right button and taps "Kick off" on each round card. SH_MISS=n lets every n-th shot in. */
const shState=()=>{const h=window.__safehands,g=h&&h.game,s=g&&g.state;return s?{ui:h.phase,phase:s.phase,tier:s.tier,shotN:s.shotN,kind:s.shot&&s.shot.kind,score:s.score,lives:s.lives,saves:s.stats.saves,goals:s.stats.goals,res:s.res&&s.res.kind,over:s.over}:null;};
const safehands={start:'[data-safehands-play]',meta:shState,async play(H){const {page,cdp,wait}=H,MISS=+(process.env.SH_MISS||0);let n=0,mem=null;
 const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 const drag=async pts=>{await touch('touchStart',...pts[0]);for(const p of pts.slice(1)){await wait(30);await touch('touchMove',...p);}await wait(20);await touch('touchEnd');};
 while(!H.stop){const s=await page.evaluate(()=>{const h=window.__safehands,g=h&&h.game;if(!g||h.phase!=='playing')return null;const s=g.state,sh=s.shot,tl=g.tells(),r=h.stage;
   return {phase:s.phase,pt:s.pt,over:s.over,act:!!s.act,dec:s.decision,wantX:s.wantX,wantD:s.wantD,gain:h.view.gain,r:{x:r.left,y:r.top,w:r.width,h:r.height},plant:tl.plant,hidden:tl.hidden,loose:!!g.looseBall(),
    sh:sh&&{kind:sh.kind,bx:sh.bx,bz:sh.bz,near:sh.near,wallN:sh.wallN,wallBest:sh.wallBest,closeIn:sh.closeIn,crowd:sh.crowd,wet:sh.wet}};});
  if(!s){const b=page.locator('[data-safehands-again],[data-safehands-play]').first();if(await b.isVisible().catch(()=>false)){await wait(1500);await b.tap().catch(()=>{});}await wait(150);continue;}
  if(s.phase==='tip'){await wait(900);await page.locator('[data-safehands-ack]').first().tap().catch(()=>{});await wait(300);continue;}
  const sh=s.sh;if(!sh||s.over){await wait(100);continue;}
  if(!mem||mem.sh!==JSON.stringify(sh)){mem={sh:JSON.stringify(sh),placed:false,told:false,done:false,miss:MISS>0&&(++n%MISS===0)};}
  const cx=s.r.x+s.r.w/2,by=s.r.y+s.r.h-170;
  if(s.phase==='wall'){await wait(700);await page.locator(`[data-safehands-wall="${sh.wallBest}"]`).first().tap().catch(()=>{});await wait(200);continue;}
  if(s.phase==='set'&&!mem.placed&&s.pt>.35&&sh.kind!=='reb'){mem.placed=true;const d=sh.kind==='far'?2.5:sh.kind==='one'?sh.bz-5:sh.kind==='cross'?1:0,x=sh.kind==='free'?-sh.near*sh.wallN*.4:sh.kind==='pen'?0:sh.bx*d/sh.bz;
   const dx=(x-s.wantX)*s.gain.x/1.15,dy=-(d-s.wantD)*s.gain.d;if(Math.abs(dx)>2||Math.abs(dy)>2)await drag([[cx,by],[cx+dx*.35,by+dy*.35],[cx+dx*.7,by+dy*.7],[cx+dx,by+dy]]);continue;}
  if(s.phase==='set'&&s.loose&&!mem.done){mem.done=true;await page.locator('[data-safehands-smother]').first().tap().catch(()=>{});continue;}
  if(s.phase==='cross'&&!s.dec&&s.pt>.7&&!mem.done){mem.done=true;await page.locator(`[data-safehands-choose="${sh.closeIn?(sh.crowd?'punch':'claim'):'stay'}"]`).first().tap().catch(()=>{});continue;}
  if((s.phase==='run'||s.phase==='fly')&&!s.act&&!mem.told&&(s.plant||(s.hidden&&s.phase==='fly'))){mem.told=true;if(mem.miss)continue;await wait(140);// a child's beat to read the foot
   const p=s.plant||{side:0,high:false,power:.5},hard=p.power>(sh.wet?.5:.72),a=p.side===0?(hard?(p.high?[0,-80]:[-80,0]):null):[p.side*80,p.high?-60:6];
   if(a)await drag([[cx,by],[cx+a[0]*.5,by+a[1]*.5],[cx+a[0],by+a[1]]]);continue;}
  await wait(30);}}};
/** Keepy-Uppy Beat (Nov 21 2026): a juggler who plays every ball on the beat with real touches, timed on the game's own song clock
 *  (as scripts/check-keepyuppy-browser.cjs does): taps, swipes for the swipe tricks, holds for the Neck Stall. It taps through the
 *  track card and Play again. Seed the save with --ls (every track open, every lesson seen, timing set) and pick a track with --pre. */
const kuState=()=>{const h=window.__keepyuppy,g=h&&h.game,s=g&&g.state;return s?{ui:h.phase,mode:g.mode,track:g.track.id,t:+h.time.toFixed(2),score:s.score,combo:s.combo,lives:s.lives,next:(g.next()||{}).trick||''}:{ui:h&&h.phase};};
const keepyuppy={start:'[data-keepyuppy-play]',meta:kuState,async play(H){const {page,cdp,wait}=H;let last=-1,id=0;
 const touch=(type,x,y,i)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:i}]});
 const until=async at=>{const d=at-Date.now();if(d>4)await wait(d-3);while(Date.now()<at);};
 while(!H.stop){const t0=Date.now(),s=await page.evaluate(()=>{const h=window.__keepyuppy,g=h&&h.game;if(!h||!g||h.phase!=='playing'||!h.loop)return null;const L=h.view.layout,r=h.stage,n=g.chart.notes.filter(x=>x.st===0)[0];
   return {time:h.time,n:n&&{i:n.i,t:n.t,tEnd:n.tEnd,lane:n.lane,kind:n.kind,dir:n.dir},x:r.left,y:r.top+L.padTop+L.padH*.45,w:L.laneW};}),t1=Date.now();
  if(!s){const b=page.locator('[data-keepyuppy-go],[data-keepyuppy-again]').first();if(await b.isVisible().catch(()=>false)){await wait(900);await b.tap().catch(()=>{});}await wait(150);continue;}
  const n=s.n;if(!n||n.i<=last){await wait(40);continue;}
  const at=(t0+t1)/2+(n.t-s.time)*1000-8;if(at-Date.now()>380){await wait(Math.min(at-Date.now()-250,400));continue;}
  last=n.i;const x=s.x+(n.lane+.5)*s.w,y=s.y,k=++id;await until(at);await touch('touchStart',x,y,k);
  if(n.kind==='swipe'){const dx=n.dir==='side'?(n.lane===0?34:-34):n.dir==='up'?0:26,dy=n.dir==='side'?0:n.dir==='up'?-40:-26;await wait(24);await touch('touchMove',x+dx/2,y+dy/2,k);await wait(24);await touch('touchMove',x+dx,y+dy,k);await wait(24);}
  else if(n.kind==='hold')await until(at+(n.tEnd-n.t)*1000+50);else await wait(34);await touch('touchEnd');}}};
/** Hold the Line (Nov 21 2026): a back-line reader who answers what a player can see with real touches, the reader of
 *  scripts/check-holdtheline-browser.cjs: drag the line up before a through ball or a ball to feet (OFFSIDE), drop for a long ball,
 *  slide across when the ball is switched wide, tap a defender to press a heavy touch or a passer who waits. Taps through the team
 *  card and "Next match". Seed the save with --ls (e.g. {"fi2-holdtheline-v1":"{\"v\":1,\"intro\":true,...}"}) to skip the guided step
 *  or to open the Island Premier (night) matches. */
const hlState=()=>{const h=window.__holdtheline,g=h&&h.game,s=g&&g.state;return s?{ui:h.phase,phase:s.phase,stage:s.stage,wave:s.wave,res:s.res&&s.res.kind,press:!!s.press,goals:s.goals,stops:s.stops,score:s.score,team:g.team.id,over:s.over}:{ui:h&&h.phase};};
const holdtheline={start:'[data-holdtheline-play]',meta:hlState,async play(H){const {page,cdp,wait}=H;let wave=-1,seen='';
 const touch=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[{x:p[0],y:p[1],id:1}]:[]});
 const gesture=async pts=>{await touch('touchStart',pts[0]);for(const p of pts.slice(1)){await wait(12);await touch('touchMove',p);}await wait(12);await touch('touchEnd');};
 const drag=async(R,dx,dy)=>{const x=R.x+R.w/2,y=R.y+R.h*.8;await gesture([[x,y],[x+dx*.2,y+dy*.2],[x+dx*.6,y+dy*.6],[x+dx,y+dy]]);};
 const tapAt=async(x,y)=>{await touch('touchStart',[x,y]);await wait(30);await touch('touchEnd');};
 const read=()=>page.evaluate(()=>{const h=window.__holdtheline,g=h&&h.game;if(!g||h.phase!=='playing'||g.state.phase==='tip')return null;const s=g.state,L=g.look(),r=h.stage,near=g.nearest(),d=s.defs[near],p=h.view.project(d.x,d.y),gn=h.view.gain(s.lineY);
  return {phase:s.phase,over:s.over,wave:s.wave,wantY:s.wantY,wantX:s.wantX,press:!!s.press,stage:s.stage,L,rect:{x:r.left,y:r.top,w:r.width,h:r.height},def:{x:r.left+p.x,y:r.top+p.y-p.s*1.4},gain:gn};});
 while(!H.stop){const s=await read().catch(()=>null);
  if(!s||s.over){const b=page.locator('[data-holdtheline-ack],[data-hs-skip],[data-holdtheline-next],[data-holdtheline-again]').first();if(await b.isVisible().catch(()=>false)){await wait(1200);await b.tap().catch(()=>{});wave=-1;}await wait(200);continue;}
  if(s.wave!==wave){wave=s.wave;seen='';}const L=s.L;
  if(L.play){const tag=L.tell?'tell:'+L.tell.kind:L.wide?'wide:'+L.wide:L.heavy?'heavy':L.waiting?'waiting':L.deepPasser?'deep':'';
   if(tag&&tag!==seen){seen=tag;const R=s.rect;
    if(L.tell&&(L.tell.kind==='thru'||L.tell.kind==='feet'))await drag(R,0,-2.8*s.gain.y/1.25);
    else if(L.tell&&L.tell.kind==='long'||(!L.tell&&L.deepPasser))await drag(R,0,Math.max(0,s.wantY-15.5)*s.gain.y/1.25);
    else if(L.wide)await drag(R,(L.wide*5-s.wantX)*s.gain.x/1.25,0);
    else if(L.heavy||L.waiting||(L.tell&&L.tell.kind==='shot'))await tapAt(s.def.x,s.def.y);
    continue;}}
  await wait(22);}}};
module.exports={
 safehands,keepyuppy,holdtheline,
 airhockey:{start:'[data-air-play]',meta:airState,async play(H){const {page,cdp,wait}=H;
  await page.waitForFunction(()=>window.__airhockey&&window.__airhockey.phase==='playing',null,{timeout:10000});
  const L=await page.evaluate(()=>{const k=window.__airhockey;const r=document.querySelector('[data-air-stage]').getBoundingClientRect();return {...k.layout,left:r.left,top:r.top};});
  const P=(x,y)=>({x:L.left+(L.side?L.cx+(y-80)*L.scale:L.cx+(x-50)*L.scale),y:L.top+(L.side?L.cy-(x-50)*L.scale:L.cy+(y-80)*L.scale)});
  let down=false;const send=async(type,x,y)=>{const p=P(x,y);await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[{x:p.x,y:p.y,id:1}]});};
  while(!H.stop){const s=await page.evaluate(airState);if(!s||s.p==='between'||s.phase!=='playing'){await wait(60);continue;}
   let tx=50,ty=132;if(s.p==='play'&&s.py>82){const ax=50+(s.px<50?9:-9),dx=ax-s.px,dy=-s.py,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,rx=s.px-s.sx,ry=s.py-s.sy,along=rx*ux+ry*uy,lat=Math.abs(rx*uy-ry*ux);
     if(along>5&&lat<6){tx=s.px+ux*26;ty=s.py+uy*26;}else if(s.sy<s.py+2){tx=s.px+(s.sx<s.px?-16:16);ty=s.py+10;}else{tx=s.px-ux*15;ty=s.py-uy*15;}}
   else if(s.p==='play'){tx=50+(s.px-50)*.45;ty=138;}
   tx=Math.max(9,Math.min(91,tx));ty=Math.max(89,Math.min(151,ty));if(!down){await send('touchStart',tx,ty);down=true;}else await send('touchMove',tx,ty);await wait(24);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}},
 kitrush:{start:'[data-kitrush-play]',async play(H){let i=0;while(!H.stop){const y=260+((i*97)%330);await H.swipe(30,y+40,360,y-40,140);await H.wait(380);i++;}}},
 snake:{start:'[data-snake-play]',meta:()=>{const g=window.__snake&&window.__snake.game,s=g&&g.state;return s?{len:s.len,level:s.level,over:s.over,score:s.score}:null;},async play(H){await H.page.evaluate(()=>{const DX=[0,1,0,-1],DY=[-1,0,1,0];
   window.__snakeBot=setInterval(()=>{const k=window.__snake,g=k&&k.game,s=g&&g.state;if(!s||s.over)return;const C=s.cols,R=s.rows,bad=new Set();
    for(let i=0;i<s.len-1;i++)bad.add(s.xs[i]+','+s.ys[i]);for(const c of s.cones)if(c.on)bad.add(c.x+','+c.y);for(const f of s.foes)if(f.on){bad.add(f.x+','+f.y);bad.add((f.x+f.dx)+','+(f.y+f.dy));}
    const goals=new Set(s.picks.filter(p=>p.on).map(p=>p.x+','+p.y));if(s.ball&&s.ball.on)goals.add(s.ball.x+','+s.ball.y);
    const hx=s.xs[0],hy=s.ys[0],seen=new Map([[hx+','+hy,-1]]),q=[[hx,hy,-1]];let first=-1;
    while(q.length){const [x,y,f]=q.shift();if(f>=0&&goals.has(x+','+y)){first=f;break;}for(let d=0;d<4;d++){if(f<0&&d===(s.moved+2)%4)continue;const nx=x+DX[d],ny=y+DY[d],key=nx+','+ny;if(nx<0||ny<0||nx>=C||ny>=R||bad.has(key)||seen.has(key))continue;seen.set(key,1);q.push([nx,ny,f<0?d:f]);}}
    if(first<0){for(let d=0;d<4;d++){const nx=hx+DX[d],ny=hy+DY[d];if(d!==(s.moved+2)%4&&nx>=0&&ny>=0&&nx<C&&ny<R&&!bad.has(nx+','+ny)){first=d;break;}}}
    if(first>=0&&first!==s.dir&&s.qn===0)g.turn(first);else if(s.hold)g.turn(first>=0?first:0);},40);});
   while(!H.stop)await H.wait(200);}},
 pinball:{start:'role:^play',async play(H){const b=n=>H.page.getByRole('button',{name:n,exact:true});let i=0;while(!H.stop){if(await b('Launch').isVisible().catch(()=>false)){await H.page.keyboard.down('Space');await H.wait(900);await H.page.keyboard.up('Space');}
   const side=i%2?'Right flipper':'Left flipper';await b(side).tap({timeout:800}).catch(()=>{});await H.wait(450+((i*137)%500));i++;}}},
 runner:{start:'role:^play',async play(H){const b=n=>H.page.getByRole('button',{name:n,exact:true});const acts=['Move one lane left','Jump','Move one lane right','Shoot','Jump','Move one lane left','Move one lane right'];let i=0;
   while(!H.stop){await b(acts[i%acts.length]).tap({timeout:800}).catch(()=>{});await H.wait(700+((i*173)%600));i++;}}},
 tennis:{start:'role:^play',async play(H){const kick=H.page.getByRole('button',{name:/^(Serve|Kick)/}).first();let i=0;
   while(!H.stop){const k=i%3===0?'KeyA':i%3===1?'KeyD':null;if(k)await H.page.keyboard.down(k);await kick.tap({timeout:600}).catch(()=>{});await H.wait(350+((i*131)%400));if(k)await H.page.keyboard.up(k);i++;}}},
 trophydrop:{start:'[data-trophy-play]',async play(H){let i=0;while(!H.stop){const x=80+((i*137)%230);await H.swipe(195,330,x,330,200,6);await H.wait(900);i++;}}},
 ballblaster:{start:'[data-ballblaster-play]',async play(H){let i=0;while(!H.stop){const x=60+((i*113)%270);const y=470+((i*71)%110),xx=110+((i*89)%170);await H.swipe(xx,y,xx,y-2,420+((i*53)%300),3);await H.wait(500);i++;}}},
 rollball:{start:'[data-rollball-play]',settle:2500,async play(H){await H.page.evaluate(()=>{const k=window.__rollball,P=window.__rbPlan||[5];k.load(P,window.__rbLevel||2);const w=k.game.state.world;let bots=w.mods.filter(m=>m.def&&m.def.bot).map(m=>k.scriptBot(m.def,m.z,{noise:.15}));let i=0;
   k.botTick=()=>{while(i<bots.length&&bots[i].done)i++;if(i<bots.length)bots[i].next(k.game);else k.game.input(0,1);};k.useBot=true;});while(!H.stop)await H.wait(200);}},
 // Line Up!: the careful greedy player of scripts/capture-lineup-media.cjs (its `bot` function, read from that file)
 lineup:{start:'[data-lineup-play]',meta:()=>{const k=window.__lineup,s=k&&k.game&&k.game.state;if(!s)return null;let f=0;for(let i=0;i<64;i++)f+=s.grid[i]?1:0;return {fill:f,over:s.over,score:s.score};},async play(H){
   const src=require('node:fs').readFileSync(require('node:path').join(__dirname,'capture-lineup-media.cjs'),'utf8'),a=src.indexOf('const bot=()=>'),b=src.indexOf('\n(async()=>');const botSrc=src.slice(a+'const bot='.length,b).trim().replace(/;$/,'');
   await H.page.waitForFunction(()=>window.__lineup&&window.__lineup.phase==='playing',null,{timeout:30000});
   const touch=(type,x,y)=>H.cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
   while(!H.stop){const m=await H.page.evaluate(`(${botSrc})()`);if(!m){await H.wait(300);continue;}await touch('touchStart',m.sx,m.sy);await H.wait(90);
    for(let k=1;k<=14;k++){const e=k/14,u=e*e*(3-2*e);await touch('touchMove',m.sx+(m.tx-m.sx)*u,m.sy+(m.ty-m.sy)*u);await H.wait(20);}await H.wait(110);await touch('touchEnd');await H.wait(m.lines?700:350);}}},
 puzzle:{start:process.env.PZ_START||'role:^play',ready:()=>window.__passPuzzle&&window.__passPuzzle.world,settle:2500,meta:()=>{const w=window.__passPuzzle&&window.__passPuzzle.world,s=w&&w.state;return s?{phase:s.phase,passes:s.passes,attempt:s.attempt,result:s.result&&s.result.kind}:null;},async play(H){let i=0;
   const touch=(type,p)=>H.cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:p.x,y:p.y,id:1}]});
   while(!H.stop){const r=await H.page.evaluate(i=>{const g=window.__passPuzzle,w=g&&g.world,s=w&&w.state;if(!s||s.phase!=='aiming')return null;const b=s.ball.p,L=(w.scenario||{}).pitch||{length:40};
     const opts=s.attackers.map((a,k)=>({k,x:(a.p||a).x,z:(a.p||a).z})).filter(o=>o.k!==s.carrier).sort((u,v)=>v.z-u.z);const goalZ=L.length/2;
     const t=(b.z>goalZ-12)?{x:0,z:goalZ}:(opts[i%Math.min(2,opts.length)]||{x:0,z:goalZ});return {a:g.scene.toScreen(b.x,0,b.z),b:g.scene.toScreen(t.x,0,t.z)};},i);
    if(!r){const ph=await H.page.evaluate(()=>{const w=window.__passPuzzle&&window.__passPuzzle.world;return w&&w.state.phase;});if(ph==='success'||ph==='fail'){await H.wait(2500);await H.page.getByRole('button',{name:/^(next|try again|retry|continue|play next)/i}).first().tap({timeout:1500}).catch(()=>{});}await H.wait(250);continue;}await touch('touchStart',r.a);for(let k=1;k<=22;k++){await touch('touchMove',{x:r.a.x+(r.b.x-r.a.x)*k/22,y:r.a.y+(r.b.y-r.a.y)*k/22});await H.wait(16);}await H.wait(120);await touch('touchEnd');i++;await H.wait(1500);}}},
};
