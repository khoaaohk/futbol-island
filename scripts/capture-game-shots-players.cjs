// Scripted players for scripts/capture-game-shots.cjs: per game, the start button, the game state to log next to each frame, and
// a loop that plays (real touches through CDP) until H.stop.
const airState=()=>{const k=window.__airhockey,g=k&&k.game,s=g&&g.state;return s?{phase:k.phase,p:s.phase,px:+s.px.toFixed(1),py:+s.py.toFixed(1),v:+Math.hypot(s.pvx,s.pvy).toFixed(0),sx:+s.sx[0].toFixed(0),sy:+s.sy[0].toFixed(0),goals:[...s.goals],level:s.level,heat:+s.heat.toFixed(2),rally:s.rally,smash:+(s.t-s.smashT).toFixed(2),bank:s.bank}:null;};
module.exports={
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
};
