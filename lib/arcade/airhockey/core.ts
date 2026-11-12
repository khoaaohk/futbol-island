/**
 * Air Futbol rules (Nov 11 2026, docs/arcade-aaa/airhockey-direction.md): football air hockey on the arcade room's table. Pure and
 * seeded: no DOM, no clock, no allocation while a match runs (tests/airhockey-core.cjs). The shell feeds finger targets (aim / hold),
 * steps the clock and drains pooled events for the picture and the sound.
 * Table units: 100 wide, 160 long. Side 0 defends the bottom goal (y = H), side 1 the top goal (y = 0).
 * Physics: fixed 120 Hz steps, each cut into micro-steps so nothing moves more than 0.4 puck radii at a time (no tunnelling at any
 * legal speed); strikers are driven bodies with a speed cap (a finger cannot teleport one through the puck) and give way when the
 * puck is pinned on a board; boards and posts give back a little less than they get; a puck that rests on a board is nudged out.
 * Teaches (AGENTS.md): angles and rebounds (a board pass), the goalkeeper's rule (stay between ball and goal, guard the near
 * post), and the counter-attack after a save.
 */
export const AH={W:100,H:160,PR:4.4,SR:8,GOAL0:27,GOAL1:73,HZ:120,VMAX:340,HUMAN_CAP:460,E_HIT:.55,E_WALL:.9,DRAG:.3,REST:3,
 SERVE_V:50,WAIT:.35,GOAL_BEAT:1.15,BETWEEN:2.2,DEAD_V:7,DEAD_S:2,DEAD_EDGE:2.5,NUDGE_V:46,SOLO_TO:5,LIVES:3,LIFE_EVERY:3,
 QUICK_S:4,COUNTER_S:3.5,pts:{goal:100,quick:50,bank:75,counter:50,clean:300,win:250,winLevel:50},coinPer:250,coinCap:12} as const;
const {W,H,PR,SR,GOAL0,GOAL1}=AH,R=PR+SR,STEP=1/AH.HZ;

/** One opponent: how they play. react = seconds between decisions; speed = striker cap; shot = fastest puck off their striker;
 *  predict = how often they read a rebound off the boards (and shoot away from your striker); guard = how well they stand on the
 *  line between puck and goal; attack = how often they go for a puck in their half; err = aim and position error (table units);
 *  bank = how often they shoot off a board. */
export type AirBot={react:number;speed:number;shot:number;predict:number;guard:number;attack:number;err:number;bank:number};
export type AirOpponent=AirBot&{name:string;tip:string};
/** The endless ramp, read by tests (monotone) and by docs. Level 1 is gentle: slow, stands in the middle, rarely attacks. */
export const RAMP:readonly AirOpponent[]=[
 {name:'Sandy',tip:'Sandy stands still. Shoot for the corner of the goal.',react:.5,speed:62,shot:90,predict:0,guard:.25,attack:.3,err:18,bank:0},
 {name:'Pip',tip:'Pip watches the puck, not the boards. Try a shot off the side.',react:.42,speed:80,shot:110,predict:.1,guard:.35,attack:.4,err:15,bank:0},
 {name:'Coco',tip:'Coco leaves the near post open. Shoot from wide.',react:.36,speed:98,shot:130,predict:.2,guard:.45,attack:.5,err:13,bank:0},
 {name:'Rafa',tip:'Rafa likes to attack. Save, then counter fast.',react:.3,speed:116,shot:150,predict:.32,guard:.55,attack:.58,err:11,bank:.1},
 {name:'Mina',tip:'Mina reads straight shots. Use the boards.',react:.26,speed:134,shot:170,predict:.44,guard:.64,attack:.65,err:9.5,bank:.15},
 {name:'Bruno',tip:'Bruno hits hard. Stay between the puck and your goal.',react:.22,speed:152,shot:190,predict:.55,guard:.72,attack:.72,err:8,bank:.2},
 {name:'Kiko',tip:'Kiko banks shots off the side. Watch the angle in, it is the angle out.',react:.19,speed:170,shot:210,predict:.65,guard:.79,attack:.78,err:7,bank:.25},
 {name:'Zuri',tip:'Zuri covers both posts. Make her move first, then shoot.',react:.16,speed:190,shot:230,predict:.74,guard:.85,attack:.83,err:6,bank:.3},
 {name:'Dax',tip:'Dax counters in a flash. Drop back the moment you shoot.',react:.135,speed:210,shot:250,predict:.82,guard:.9,attack:.88,err:5,bank:.35},
 {name:'Vela',tip:'Vela reads every rebound. Change your angle each time.',react:.115,speed:232,shot:270,predict:.9,guard:.94,attack:.92,err:4,bank:.4},
 {name:'Captain Coral',tip:'The captain rarely misses. Guard the near post first.',react:.1,speed:255,shot:290,predict:.95,guard:.97,attack:.95,err:3.2,bank:.45},
 {name:'The Lighthouse',tip:'Nothing gets past easily. Be patient and pick your moment.',react:.085,speed:280,shot:310,predict:1,guard:1,attack:.97,err:2.5,bank:.5},
];
/** The opponent for a level (1-based). Past the table the last row plays on under the earlier names ("Sandy II"). */
export function opponentFor(level:number):AirOpponent{const n=RAMP.length,l=Math.max(1,Math.floor(level));if(l<=n)return RAMP[l-1];const lap=Math.floor((l-1)/n)+1,base=RAMP[(l-1)%n];return {...RAMP[n-1],name:`${base.name} ${'I'.repeat(Math.min(3,lap))}`,tip:RAMP[n-1].tip};}
/** The simple scripted player the tests set against the ramp: beats level 1, loses to level 10. */
export const SCRIPTED:AirBot={react:.24,speed:140,shot:180,predict:.3,guard:.55,attack:.7,err:9,bank:.1};

export type AirPhase='wait'|'play'|'goal'|'between'|'over';
/** goal: a = scorer, b = flags (GOAL_*). hit: a = side, b = impact speed. wall / post: b = speed. win: a = level beaten, b = bonus
 *  points. lose: a = lives left. next: a = the level that walks on. life: a = lives now. over: a = -1 (the run is over). */
export type AirEvent={type:'ready'|'serve'|'hit'|'wall'|'post'|'goal'|'save'|'win'|'lose'|'next'|'life'|'nudge'|'over';a:number;b:number;x:number;y:number};
export const GOAL_BANK=1,GOAL_QUICK=2,GOAL_OWN=4,GOAL_COUNTER=8;
/** Run numbers for the results card and the coaching line. conc* = how the goals against went in. */
export type AirStats={goalsFor:number;goalsAgainst:number;bank:number;quick:number;counters:number;saves:number;wins:number;clean:number;hits:number;
 concNear:number;concFar:number;concBank:number;concCaught:number;own:number};
export const emptyAirStats=():AirStats=>({goalsFor:0,goalsAgainst:0,bank:0,quick:0,counters:0,saves:0,wins:0,clean:0,hits:0,concNear:0,concFar:0,concBank:0,concCaught:0,own:0});
export const airCoins=(score:number)=>Math.max(0,Math.min(AH.coinCap,Math.floor(score/AH.coinPer)));
export const clampStrikerX=(x:number)=>Math.max(SR,Math.min(W-SR,x));
export const clampStrikerY=(side:number,y:number)=>side===0?Math.max(H/2+SR,Math.min(H-SR,y)):Math.max(SR,Math.min(H/2-SR,y));

export type AirFutbol=ReturnType<typeof createAirFutbol>;
/** One player against the machine: side 0 is the child's finger, side 1 the named opponent of the current level. */
export function createAirFutbol(opts:{seed:number;/** tests: scripted players per side (null = a finger), in place of the ramp */bots?:readonly [AirBot|null,AirBot|null];level?:number}){
 let seed=(opts.seed>>>0)||1;const rng=()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
 const s={phase:'wait' as AirPhase,over:false,t:0,level:Math.max(1,opts.level??1),lives:AH.LIVES as number,score:0,goals:[0,0],serveTo:0,serves:0,
  px:W/2,py:H/2,pvx:0,pvy:0,ppx:W/2,ppy:H/2,inGoal:false,
  sx:[W/2,W/2],sy:[H-26,26],svx:[0,0],svy:[0,0],psx:[W/2,W/2],psy:[H-26,26],tx:[W/2,W/2],ty:[H-26,26],held:[false,false],
  lastHit:-1,lastHitT:-9,prevHit:-1,prevT:-9,bank:false,shotX:[W/2,W/2] as number[],shotDefY:[H,H] as number[],serveT:0,saveT:-99,beat:0,waitT:0,dead:0,matchT:0,stats:emptyAirStats()};
 const bots:[AirBot|null,AirBot|null]=opts.bots?[opts.bots[0],opts.bots[1]]:[null,opponentFor(s.level)];
 const mem=[0,1].map(()=>({next:0,tx:W/2,ty:26,cap:60,mode:0,rest:0,ax:W/2,aimFor:0,since:0,until:0})),cap=[AH.HUMAN_CAP as number,AH.HUMAN_CAP as number],hitAt=[-9,-9];
 mem[0].ty=H-26;
 /* pooled events */
 const ring:AirEvent[]=Array.from({length:48},()=>({type:'ready' as AirEvent['type'],a:0,b:0,x:0,y:0}));let head=0,count=0;
 function emit(type:AirEvent['type'],a=0,b=0,x=s.px,y=s.py){const e=ring[(head+count)%ring.length];e.type=type;e.a=a;e.b=b;e.x=x;e.y=y;if(count<ring.length)count++;else head=(head+1)%ring.length;}
 function drain(fn:(e:AirEvent)=>void){while(count>0){const e=ring[head];head=(head+1)%ring.length;count--;fn(e);}}

 function resetPuck(){s.px=s.ppx=W/2;s.py=s.ppy=H/2;s.pvx=s.pvy=0;s.inGoal=false;s.lastHit=-1;s.prevHit=-1;s.bank=false;s.dead=0;s.waitT=0;}
 function launch(){const to=s.serveTo;s.pvx=(rng()*2-1)*13;s.pvy=to===0?AH.SERVE_V:-AH.SERVE_V;s.serveT=s.t;s.serves++;s.phase='play';emit('serve',to);}
 /** A scripted side decides where its striker goes. Plans every `react` seconds; the strike itself is triggered on the step the
  *  striker is lined up behind the puck. Mirrored so its own goal is always at y = 0. */
 function think(i:number,p:AirBot,dt:number){
  const m=mem[i],f=i===1,X=s.px,Y=f?s.py:H-s.py,VX=s.pvx,VY=f?s.pvy:-s.pvy,SX=s.sx[i],SY=f?s.sy[i]:H-s.sy[i],sp=Math.hypot(VX,VY),inHalf=Y<H/2-1,live=s.phase==='play'&&!s.inGoal;
  const set=(tx:number,ty:number,c:number)=>{m.tx=clampStrikerX(tx);m.ty=clampStrikerY(i,f?ty:H-ty);m.cap=c;};
  m.rest=inHalf&&sp<9&&live?m.rest+dt:0;m.next-=dt;
  if(m.mode===2){if(live&&s.t<m.until&&!(s.lastHit===i&&s.lastHitT>=m.since))return;m.mode=0;m.next=Math.min(m.next,p.react*.5);}// the swing is over: back to guarding
  if(m.mode===1&&live&&inHalf){let dx=m.ax-X,dy=H-Y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const rx=X-SX,ry=Y-SY,along=rx*dx+ry*dy,lat=Math.abs(rx*dy-ry*dx);
   if(along>R*.4&&along<R*1.6&&lat<R*.45){m.mode=2;m.since=s.t;m.until=s.t+.3;set(X+dx*22+VX*.06,Y+dy*22+VY*.06,p.speed);return;}}// lined up behind it: drive through the puck
  if(m.next>0)return;m.next=p.react*(.8+.4*rng());
  const GY=SR+9,threat=VY<-25;
  if(!live){m.mode=0;set(W/2,GY,p.speed);return;}
  if(inHalf&&(!threat||sp<60)&&sp<150&&(m.mode===1||m.rest>.6||rng()<p.attack)){
   if(m.mode!==1||s.t>m.aimFor){// pick a target: the corner away from the other striker when they read the game, off a board now and then
    const ox=s.sx[1-i],smart=rng()<p.predict,corner=(GOAL1-GOAL0)/2-PR-3;let ax=W/2+(smart?(ox<W/2?1:-1)*corner:(rng()*2-1)*corner)+(rng()*2-1)*p.err;
    if(rng()<p.bank)ax=rng()<.5?-ax:2*W-ax;m.ax=ax;m.aimFor=s.t+1.5;}
   m.mode=1;const lead=Math.min(.3,Math.hypot(X-SX,Y-SY)/Math.max(40,p.speed)),XP=Math.max(PR,Math.min(W-PR,X+VX*lead)),YP=Math.max(PR,Math.min(H/2,Y+VY*lead));
   let dx=m.ax-XP,dy=H-YP;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
   if(SY>YP-2&&Math.abs(SX-XP)<R+2){let tx=XP+(SX<XP?-1:1)*(R+5);if(tx<SR||tx>W-SR)tx=XP+(SX<XP?1:-1)*(R+5);set(tx,YP-R,p.speed);}// wrong side of it: go round, never push it home
   else set(XP-dx*(R+3),YP-dy*(R+3),p.speed);
   return;}
  m.mode=0;
  if(threat&&Y>GY){const tt=(GY-Y)/VY;let ix=X+VX*tt;
   if(rng()<p.predict){const span=W-2*PR;let u=(ix-PR)%(2*span);if(u<0)u+=2*span;ix=PR+(u>span?2*span-u:u);}// reads the rebound off the boards
   set(Math.max(GOAL0-2,Math.min(GOAL1+2,ix+(rng()*2-1)*p.err)),GY,p.speed);}
  else if(threat)set(X,Math.max(SR,Y-2),p.speed);
  else{const gx=W/2+(X-W/2)*GY/Math.max(Y,GY+1);set(W/2+(gx-W/2)*p.guard+(rng()*2-1)*p.err*.5,GY+(Y>H/2?9*p.guard:0),p.speed*.8);}// the keeper's rule: on the line from the puck to the goal
 }
 function goal(scorer:number){
  const st=s.stats,deflect=s.lastHit===1-scorer&&s.prevHit===scorer&&s.t-s.prevT<1.5,/* a save that went in is the shooter's goal */own=(s.lastHit===1-scorer&&!deflect)||s.lastHit<0;let flags=own?GOAL_OWN:0;
  if(!own&&s.bank)flags|=GOAL_BANK;if(!own&&s.t-s.serveT<=AH.QUICK_S)flags|=GOAL_QUICK;if(!own&&scorer===0&&s.t-s.saveT<=AH.COUNTER_S)flags|=GOAL_COUNTER;
  s.goals[scorer]++;
  if(scorer===0){st.goalsFor++;let pts:number=AH.pts.goal;if(flags&GOAL_BANK){pts+=AH.pts.bank;st.bank++;}if(flags&GOAL_QUICK){pts+=AH.pts.quick;st.quick++;}if(flags&GOAL_COUNTER){pts+=AH.pts.counter;st.counters++;}s.score+=pts;}
  else{st.goalsAgainst++;const sx=s.shotX[1];if(s.lastHit<0)st.concFar++;else if(own)st.own++;else if(s.bank&&!deflect)st.concBank++;else if(s.shotDefY[1]<H/2+30)st.concCaught++;else if(Math.abs(sx-W/2)>10&&(sx<W/2)===(s.px<W/2))st.concNear++;else st.concFar++;}
  s.phase='goal';s.beat=AH.GOAL_BEAT;s.serveTo=1-scorer;s.pvx=s.pvy=0;s.inGoal=true;emit('goal',scorer,flags);
 }
 function afterGoal(){
  const to=AH.SOLO_TO,g=s.goals;
  if(g[0]<to&&g[1]<to){resetPuck();s.phase='wait';emit('ready',s.serveTo,0,W/2,H/2);return;}
  if(g[0]>=to){const clean=g[1]===0,bonus=AH.pts.win+AH.pts.winLevel*Math.min(s.level,RAMP.length)/* the level bonus stops growing with the table */+(clean?AH.pts.clean:0);s.score+=bonus;s.stats.wins++;if(clean)s.stats.clean++;emit('win',s.level,bonus,W/2,H/2);
   s.level++;bots[1]=opts.bots?opts.bots[1]:opponentFor(s.level);if(s.stats.wins%AH.LIFE_EVERY===0&&s.lives<AH.LIVES){s.lives++;emit('life',s.lives,0,W/2,H/2);}emit('next',s.level,0,W/2,H/2);}
  else{s.lives--;emit('lose',s.lives,0,W/2,H/2);if(s.lives<=0){s.over=true;s.phase='over';emit('over',-1,0,W/2,H/2);return;}}
  g[0]=g[1]=0;s.matchT=0;s.serveTo=0;resetPuck();s.phase='between';s.beat=AH.BETWEEN;
 }
 function strike(i:number){
  const dx=s.px-s.sx[i],dy=s.py-s.sy[i],d2=dx*dx+dy*dy;if(d2>=R*R)return;const d=Math.sqrt(d2);let nx=0,ny=i===0?-1:1;if(d>1e-4){nx=dx/d;ny=dy/d;}
  const before=i===0?s.pvy:-s.pvy,vn=(s.pvx-s.svx[i])*nx+(s.pvy-s.svy[i])*ny;s.px=s.sx[i]+nx*R;s.py=s.sy[i]+ny*R;
  if(vn>=0)return;const j=-(1+AH.E_HIT)*vn;s.pvx+=j*nx;s.pvy+=j*ny;const bot=bots[i];
  if(bot){const sp=Math.hypot(s.pvx,s.pvy);if(sp>bot.shot){s.pvx*=bot.shot/sp;s.pvy*=bot.shot/sp;}}
  if(-vn<4)return;
  if(before>60&&(i===0?s.py>H-52:s.py<52)){if(i===0){s.stats.saves++;s.saveT=s.t;}emit('save',i,-vn);}// it was heading for this side's goal
  if(i===0)s.stats.hits++;if(s.lastHit!==i){s.prevHit=s.lastHit;s.prevT=s.lastHitT;}s.lastHit=i;s.lastHitT=s.t;s.bank=false;s.shotX[i]=s.px;s.shotDefY[i]=i===1?s.sy[0]:H-s.sy[1];
  if(s.t-hitAt[i]>.07){hitAt[i]=s.t;emit('hit',i,-vn);}
 }
 /** Boards, posts and the goal mouths. Returns true when a goal went in. */
 function boards():boolean{
  if(s.px<PR){s.px=PR;if(s.pvx<0){const v=-s.pvx;s.pvx=v*AH.E_WALL;s.bank=true;if(v>12)emit('wall',0,v);}}
  else if(s.px>W-PR){s.px=W-PR;if(s.pvx>0){const v=s.pvx;s.pvx=-v*AH.E_WALL;s.bank=true;if(v>12)emit('wall',1,v);}}
  for(let e=0;e<2;e++){// e 0: top end (y = 0), e 1: bottom end (y = H); worked in mirrored space so the end is at y = 0
   let y=e?H-s.py:s.py,vy=e?-s.pvy:s.pvy;if(y>=PR)continue;
   if(s.px<=GOAL0||s.px>=GOAL1){y=PR;if(vy<0){const v=-vy;vy=v*AH.E_WALL;if(v>12)emit('wall',2+e,v);}}
   else{
    for(const gx of [GOAL0,GOAL1]){const dx=s.px-gx,d2=dx*dx+y*y;if(d2<PR*PR&&y>-PR*.2){const d=Math.sqrt(d2)||1e-4,nx=dx/d,ny=y/d,vn=s.pvx*nx+vy*ny;s.px=gx+nx*PR;y=ny*PR;if(vn<0){s.pvx-=(1+AH.E_WALL)*vn*nx;vy-=(1+AH.E_WALL)*vn*ny;if(-vn>12)emit('post',e,-vn);}}}
    if(y<0)s.px=Math.max(GOAL0+PR*.5,Math.min(GOAL1-PR*.5,s.px));
    if(y<-PR){s.py=e?H-y:y;s.pvy=e?-vy:vy;goal(e===0?0:1);return true;}
   }
   s.py=e?H-y:y;s.pvy=e?-vy:vy;
  }
  return false;
 }
 function fixed(){
  const dt=STEP;s.t+=dt;s.ppx=s.px;s.ppy=s.py;for(let i=0;i<2;i++){s.psx[i]=s.sx[i];s.psy[i]=s.sy[i];}
  if(s.phase==='over')return;
  for(let i=0;i<2;i++){const b=bots[i];if(b){think(i,b,dt);s.tx[i]=mem[i].tx;s.ty[i]=mem[i].ty;cap[i]=mem[i].cap;}else cap[i]=AH.HUMAN_CAP;}
  // strikers: toward the target, never faster than the cap
  let far=0;const mx=[0,0],my=[0,0];
  for(let i=0;i<2;i++){const tx=clampStrikerX(s.tx[i]),ty=clampStrikerY(i,s.ty[i]);let dx=tx-s.sx[i],dy=ty-s.sy[i];const d=Math.hypot(dx,dy),max=cap[i]*dt;if(d>max){dx*=max/d;dy*=max/d;}mx[i]=dx;my[i]=dy;
   s.svx[i]=s.svx[i]*.4+dx/dt*.6;s.svy[i]=s.svy[i]*.4+dy/dt*.6;if(d<.01){s.svx[i]=0;s.svy[i]=0;}far=Math.max(far,Math.min(d,max));}
  if(s.phase!=='play'){for(let i=0;i<2;i++){s.sx[i]+=mx[i];s.sy[i]+=my[i];}
   if(s.phase==='goal'){s.beat-=dt;if(s.beat<=0)afterGoal();}
   else if(s.phase==='between'){s.beat-=dt;if(s.beat<=0){s.phase='wait';emit('ready',s.serveTo,0,W/2,H/2);}}
   else if(s.phase==='wait'){if(s.held[0]||s.held[1]||bots[0]){s.waitT+=dt;if(s.waitT>=AH.WAIT)launch();}else s.waitT=0;}
   return;}
  s.matchT+=dt;
  const n=Math.max(1,Math.ceil((Math.hypot(s.pvx,s.pvy)*dt+far)/(PR*.4))),h=dt/n;
  for(let k=0;k<n;k++){
   for(let i=0;i<2;i++){s.sx[i]+=mx[i]/n;s.sy[i]+=my[i]/n;}
   s.px+=s.pvx*h;s.py+=s.pvy*h;strike(0);strike(1);if(boards())return;
   for(let i=0;i<2;i++){const dx=s.px-s.sx[i],dy=s.py-s.sy[i],d=Math.hypot(dx,dy);if(d<R-.01&&d>1e-4){// pinned on a board: the striker gives way
     const nx=dx/d,ny=dy/d,push=R-d;s.sx[i]=clampStrikerX(s.sx[i]-nx*push);s.sy[i]=clampStrikerY(i,s.sy[i]-ny*push);const vn=s.svx[i]*nx+s.svy[i]*ny;if(vn>0){s.svx[i]-=vn*nx;s.svy[i]-=vn*ny;}}}
  }
  const drag=1-AH.DRAG*dt;s.pvx*=drag;s.pvy*=drag;let sp=Math.hypot(s.pvx,s.pvy);
  if(sp>AH.VMAX){s.pvx*=AH.VMAX/sp;s.pvy*=AH.VMAX/sp;sp=AH.VMAX;}else if(sp<AH.REST){s.pvx=0;s.pvy=0;sp=0;}
  const e=PR+AH.DEAD_EDGE;
  if(sp<AH.DEAD_V&&(s.px<e||s.px>W-e||s.py<e||s.py>H-e)){s.dead+=dt;if(s.dead>=AH.DEAD_S){s.dead=0;const ax=W/2-s.px,ay=(s.py<H/2?H*.3:H*.7)-s.py,d=Math.hypot(ax,ay)||1;s.pvx=ax/d*AH.NUDGE_V;s.pvy=ay/d*AH.NUDGE_V;emit('nudge');}}
  else s.dead=0;
 }
 let acc=0;
 return {
  state:s,drain,opponentFor,
  get alpha(){return acc/STEP;},
  get opponent():AirOpponent{return opponentFor(s.level);},
  /** Where a side's finger is (table units). The striker heads there at its speed cap, inside its own half. */
  aim(side:number,x:number,y:number){if(bots[side])return;s.tx[side]=clampStrikerX(x);s.ty[side]=clampStrikerY(side,y);},
  /** Finger down / up for a side. A held side serves the waiting puck; a released striker stops where it is. */
  hold(side:number,on:boolean){if(bots[side])return;s.held[side]=on;if(!on){s.tx[side]=s.sx[side];s.ty[side]=s.sy[side];}},
  /** Skips the walk-on beat between opponents. */
  skip(){if(s.phase==='between')s.beat=Math.min(s.beat,.05);},
  /** Everything at rest and nobody touching: the shell may stop drawing until the next touch. */
  get idle(){if(s.held[0]||s.held[1]||s.dead>0)return false;if(s.phase!=='wait'&&!(s.phase==='play'&&s.pvx===0&&s.pvy===0))return s.phase==='over';
   for(let i=0;i<2;i++)if(Math.hypot(s.tx[i]-s.sx[i],s.ty[i]-s.sy[i])>.3||(bots[i]&&mem[i].rest>0))return false;return true;},
  step(dt:number){acc+=Math.min(.1,Math.max(0,dt));let guard=0;while(acc>=STEP&&guard++<16){acc-=STEP;fixed();}if(acc>=STEP)acc=0;},
  /** Tests: one fixed step. */
  tick(){fixed();},
 };
}
