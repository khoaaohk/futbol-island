/**
 * Squad Snake rules (Nov 10 2026, docs/arcade-aaa/snake-direction.md). Pure and deterministic: no DOM, no storage, no clock.
 * The captain runs a pitch grid; team-mates join the line in position order (keeper, defenders, midfielders, forwards) until
 * eleven stand as a formation. Teaches: the eleven and their jobs, reading a formation from the back, building the coach's shape.
 * Fixed tick for the rules (one cell a tick), `frac` for interpolated drawing. Everything is pooled: a frame's step() allocates
 * nothing. The view drains `events` each frame. Cells: x 0..cols-1 left to right, y 0..rows-1 top to bottom.
 */
export const SN={
 cols:11,rows:15,squad:11,maxLine:12,startX:5,startY:10,
 ready:.7,beat:1.5,levelReady:.4,
 pick:10,squadBonus:200,callMult:2,boot:50,dashStep:5,dashSteps:8,dashSpeed:1/1.5,knock:25,card:50,levelCap:12,
 defMin:3,defMax:5,midMin:3,midMax:5,
 ballEvery:[8,14] as const,bootEvery:[9,15] as const,firstBall:6,firstBoot:12,
 pressEvery:2,refEvery:3,safe:4,pickGap:4,
 medals:[300,1000,2500,6000] as const,
 maxFoes:8,maxEvents:48,
} as const;
/** The ramp, one row per level (the last row repeats for ever). step = seconds per cell, press = pressing defenders,
 *  refs = referees, boot = seconds a golden boot stays. tests/snake-core.cjs checks every column only ever gets harder. */
export const RAMP=[
 {level:1,step:.30,press:0,refs:0,boot:9},
 {level:2,step:.28,press:1,refs:0,boot:8.5},
 {level:3,step:.26,press:1,refs:1,boot:8},
 {level:4,step:.245,press:2,refs:1,boot:7.5},
 {level:5,step:.23,press:2,refs:1,boot:7},
 {level:6,step:.215,press:2,refs:2,boot:6.5},
 {level:7,step:.20,press:3,refs:2,boot:6},
 {level:8,step:.19,press:3,refs:2,boot:5.6},
 {level:9,step:.18,press:3,refs:2,boot:5.2},
 {level:10,step:.17,press:4,refs:2,boot:4.8},
 {level:11,step:.16,press:4,refs:3,boot:4.5},
 {level:12,step:.15,press:4,refs:3,boot:4.2},
] as const;
export const rampFor=(level:number)=>RAMP[Math.max(1,Math.min(RAMP.length,Math.floor(level)))-1];

/** Line positions. 0 is the captain at the head; 1-4 join in this order. */
export const POS={captain:0,gk:1,def:2,mid:3,fwd:4} as const;
export const POS_LABEL=['C','GK','DEF','MID','FWD'] as const;
export const POS_NAME=['Captain','Goalkeeper','Defender','Midfielder','Forward'] as const;
export const POS_COLOR=['#fff3d6','#ff8a3c','#19b5a5','#ffc83a','#f0452e'] as const;
export const POS_DARK=['#d9c9a4','#c95f1e','#0f7f86','#d98a1c','#b02a3a'] as const;
/** Every shape the line rules allow (3-5 defenders, 3-5 midfielders, 1-3 forwards, ten outfield players). */
export const SHAPES=['3-4-3','3-5-2','4-3-3','4-4-2','4-5-1','5-3-2','5-4-1'] as const;
/** The coach's calls: the three shapes named in the brief. */
export const CALLS=[[4,4,2],[4,3,3],[3,5,2]] as const;
export const shapeName=(d:number,m:number,f:number)=>`${d}-${m}-${f}`;
export const shapeCode=(d:number,m:number,f:number)=>d*100+m*10+f;
export const shapeOfCode=(code:number)=>code>0?shapeName(Math.floor(code/100),Math.floor(code/10)%10,code%10):'';
export const MEDAL_NAMES=['Bronze','Silver','Gold','Captain'] as const;
/** 0 = none, 1 Bronze ... 4 Captain. */
export function medalFor(score:number){let m=0;for(const t of SN.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=SN.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:SN.medals[m]-score};}
export const snakeCoins=(score:number)=>Math.floor(Math.max(0,score)/150);
/** One seed per local play day: the same calls and pick-ups for everyone (FNV-1a, like Kit Rush's Daily Rush). */
export function snakeDailySeed(day:string){let h=0x811c9dc5;const s='snake:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}

/** Directions: 0 up, 1 right, 2 down, 3 left. */
export const DX=[0,1,0,-1] as const,DY=[-1,0,1,0] as const;
export const CAUSE={none:0,wall:1,own:2,tackle:3} as const;
export const CAUSE_WORD=['','OUT!','TANGLED!','TACKLED!'] as const;
export type SnakePick={on:boolean;x:number;y:number;pos:number};
/** kind 0 = pressing defender (patrols lo..hi along its axis), 1 = referee (wanders). px/py = the cell before this tick. */
export type SnakeFoe={on:boolean;kind:number;x:number;y:number;px:number;py:number;dx:number;dy:number;lo:number;hi:number};
export type SnakeEventType='ready'|'turn'|'pick'|'squad'|'level'|'ball'|'ballIn'|'dashEnd'|'boot'|'bootIn'|'bootGone'|'skid'|'save'|'card'|'knock'|'crash';
/** One slot of the event ring. pick: a=position b=players joined c=points; squad: a=shape code b=bonus c=1 when it is the coach's call;
 *  level: a=level; ball: a=dash cells; boot: a=points; skid/crash: a=cause; card: a=1 when a team-mate was sent back; knock: a=points. */
export type SnakeEvent={type:SnakeEventType;x:number;y:number;a:number;b:number;c:number};
export type SnakeStats={picks:number;squads:number;calls:number;bestCode:number;bestBonus:number;bestCall:boolean;shapes:number;balls:number;boots:number;knocks:number;cards:number;saves:number;skids:number;turns:number;longest:number};
export type SnakeState={
 cols:number;rows:number;seed:number;daily:boolean;level:number;score:number;t:number;ticks:number;
 /** The line, head first. xs/ys = cell now, pxs/pys = cell before this tick (draw between them with `frac`). */
 len:number;xs:Int8Array;ys:Int8Array;pxs:Int8Array;pys:Int8Array;pos:Uint8Array;
 dir:number;/** The direction of the last cell actually run (a turn is never allowed to reverse it). */moved:number;q0:number;q1:number;qn:number;acc:number;step:number;ready:number;beat:number;
 gk:number;d:number;m:number;f:number;joined:number;call:number;
 picks:SnakePick[];ball:{on:boolean;x:number;y:number};ballIn:number;boot:{on:boolean;x:number;y:number;t:number;max:number};bootIn:number;
 foes:SnakeFoe[];dash:number;stall:number;saves:number;over:boolean;cause:number;stats:SnakeStats;
 /** Kick-off waits for the first input (Nov 11 2026, owner: a child who has not found the controls crashed at once). While true the
  *  clock stands still after the ready beat; the first turn() ends it and, with the captain still alone, may aim any way. */
 hold:boolean;
};

function mulberry(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

export type SquadSnake=ReturnType<typeof createSquadSnake>;
export function createSquadSnake(opts:{seed:number;daily?:boolean;hold?:boolean}){
 const rnd=mulberry(opts.seed),int=(n:number)=>Math.floor(rnd()*n),range=(r:readonly [number,number])=>r[0]+rnd()*(r[1]-r[0]);
 const C=SN.cols,R=SN.rows,N=SN.maxLine;
 const s:SnakeState={cols:C,rows:R,seed:opts.seed,daily:!!opts.daily,level:1,score:0,t:0,ticks:0,
  len:1,xs:new Int8Array(N),ys:new Int8Array(N),pxs:new Int8Array(N),pys:new Int8Array(N),pos:new Uint8Array(N),
  dir:0,moved:0,q0:0,q1:0,qn:0,acc:0,step:RAMP[0].step,ready:SN.ready,beat:0,
  gk:0,d:0,m:0,f:0,joined:0,call:int(CALLS.length),
  picks:[{on:false,x:0,y:0,pos:0},{on:false,x:0,y:0,pos:0}],ball:{on:false,x:0,y:0},ballIn:SN.firstBall,boot:{on:false,x:0,y:0,t:0,max:1},bootIn:SN.firstBoot,
  foes:Array.from({length:SN.maxFoes},()=>({on:false,kind:0,x:0,y:0,px:0,py:0,dx:0,dy:0,lo:0,hi:0})),dash:0,stall:0,saves:1,over:false,cause:0,hold:!!opts.hold,
  stats:{picks:0,squads:0,calls:0,bestCode:0,bestBonus:0,bestCall:false,shapes:0,balls:0,boots:0,knocks:0,cards:0,saves:0,skids:0,turns:0,longest:1}};
 s.xs[0]=s.pxs[0]=SN.startX;s.ys[0]=s.pys[0]=SN.startY;
 const events:SnakeEvent[]=Array.from({length:SN.maxEvents},()=>({type:'ready' as SnakeEventType,x:0,y:0,a:0,b:0,c:0}));let en=0;
 function emit(type:SnakeEventType,x:number,y:number,a=0,b=0,c=0){if(en>=events.length)return;const e=events[en++];e.type=type;e.x=x;e.y=y;e.a=a;e.b=b;e.c=c;}
 const mult=()=>Math.min(s.level,SN.levelCap);
 const stepNow=()=>s.dash>0?s.step*SN.dashSpeed:s.step;

 /* ---- what stands where ---- */
 /** Index of the line member on a cell (from..len-1), else -1. */
 function bodyAt(x:number,y:number,from:number,to:number){for(let i=from;i<to;i++)if(s.xs[i]===x&&s.ys[i]===y)return i;return -1;}
 function foeAt(x:number,y:number){for(let i=0;i<s.foes.length;i++){const f=s.foes[i];if(f.on&&f.x===x&&f.y===y)return i;}return -1;}
 function itemAt(x:number,y:number){return (s.picks[0].on&&s.picks[0].x===x&&s.picks[0].y===y)||(s.picks[1].on&&s.picks[1].x===x&&s.picks[1].y===y)||(s.ball.on&&s.ball.x===x&&s.ball.y===y)||(s.boot.on&&s.boot.x===x&&s.boot.y===y);}
 const taken=(x:number,y:number)=>bodyAt(x,y,0,s.len)>=0||foeAt(x,y)>=0||itemAt(x,y);
 const inside=(x:number,y:number)=>x>=0&&y>=0&&x<C&&y<R;
 const edge=(x:number,y:number)=>x===0||y===0||x===C-1||y===R-1;
 /** In the three cells straight ahead of the captain: nothing new ever lands there. */
 function ahead(x:number,y:number){const hx=s.xs[0],hy=s.ys[0];for(let k=1;k<=3;k++)if(hx+DX[s.dir]*k===x&&hy+DY[s.dir]*k===y)return true;return false;}
 const spot={x:0,y:0};
 /** A free cell at least `far` steps from the captain. border: 0 anywhere, 1 never on a touchline cell, 2 only on one. */
 function place(far:number,border:number,ox=-99,oy=-99,gap=0):boolean{
  const fits=(x:number,y:number,need:number,b:number)=>!taken(x,y)&&Math.abs(x-s.xs[0])+Math.abs(y-s.ys[0])>=need&&!ahead(x,y)&&(b===0||(b===1)!==edge(x,y))&&Math.abs(x-ox)+Math.abs(y-oy)>=gap;
  for(let k=0;k<48;k++){const x=int(C),y=int(R);if(fits(x,y,far,border)){spot.x=x;spot.y=y;return true;}}
  const o=int(C*R);for(let k=0;k<C*R;k++){const c=(o+k)%(C*R),x=c%C,y=Math.floor(c/C);if(fits(x,y,2,0)){spot.x=x;spot.y=y;return true;}}
  return false;
 }

 /* ---- the line's next players ---- */
 /** Which line is open: 1 keeper, 2 defence, 3 midfield, 4 attack. */
 const line=()=>s.f>0?4:s.m>0?3:s.gk?2:1;
 const opt=[0,0];
 /** opt[0] = one more of the open line, opt[1] = the first of the next line (0 = not on offer). */
 function options(){const L=line();
  if(L===1){opt[0]=POS.gk;opt[1]=0;}
  else if(L===2){opt[0]=s.d<SN.defMax?POS.def:0;opt[1]=s.d>=SN.defMin?POS.mid:0;}
  else if(L===3){opt[0]=s.m<SN.midMax&&s.d+s.m<9?POS.mid:0;opt[1]=s.m>=SN.midMin&&s.d+s.m>=7?POS.fwd:0;}
  else{opt[0]=POS.fwd;opt[1]=0;}
 }
 function spawnPicks(){options();const border=s.level<=2?1:0;
  for(const p of s.picks)if(p.on&&p.pos!==opt[0]&&p.pos!==opt[1])p.on=false;
  for(let k=0;k<2;k++){const want=opt[k];if(!want||s.picks.some(p=>p.on&&p.pos===want))continue;const p=s.picks[0].on?s.picks[1]:s.picks[0],other=p===s.picks[0]?s.picks[1]:s.picks[0];
   if(p.on)continue;if(!place(3,border,other.on?other.x:-99,other.on?other.y:-99,SN.pickGap))continue;p.on=true;p.pos=want;p.x=spot.x;p.y=spot.y;}
 }
 function spawnPresser(f:SnakeFoe):boolean{
  for(let k=0;k<40;k++){const horiz=rnd()<.5,span=horiz?C:R,across=horiz?R:C,len=5+int(4),lo=int(span-len+1),hi=lo+len-1,at=1+int(across-2),c=lo+int(len);
   const x=horiz?c:at,y=horiz?at:c,hx=s.xs[0],hy=s.ys[0];
   if(Math.abs((horiz?hy:hx)-at)<2||taken(x,y)||Math.abs(x-hx)+Math.abs(y-hy)<SN.safe)continue;
   f.on=true;f.kind=0;f.x=f.px=x;f.y=f.py=y;f.dx=horiz?(rnd()<.5?1:-1):0;f.dy=horiz?0:(rnd()<.5?1:-1);f.lo=lo;f.hi=hi;return true;}
  f.on=false;return false;
 }
 function spawnRef(f:SnakeFoe):boolean{if(!place(SN.safe+1,1)){f.on=false;return false;}f.on=true;f.kind=1;f.x=f.px=spot.x;f.y=f.py=spot.y;f.dx=0;f.dy=0;f.lo=0;f.hi=0;return true;}
 function spawnFoes(){const r=rampFor(s.level);let i=0;for(const f of s.foes)f.on=false;
  for(let k=0;k<r.press&&i<s.foes.length;k++)spawnPresser(s.foes[i++]);for(let k=0;k<r.refs&&i<s.foes.length;k++)spawnRef(s.foes[i++]);}
 const relocate=(f:SnakeFoe)=>{f.on=false;if(f.kind===0)spawnPresser(f);else spawnRef(f);};

 function crash(cause:number){s.over=true;s.cause=cause;s.acc=0;emit('crash',s.xs[0],s.ys[0],cause,11-s.joined);}
 function squad(){
  const code=shapeCode(s.d,s.m,s.f),c=CALLS[s.call],called=c[0]===s.d&&c[1]===s.m&&c[2]===s.f,bonus=SN.squadBonus*mult()*(called?SN.callMult:1),st=s.stats;
  s.score+=bonus;st.squads++;if(called)st.calls++;if(bonus>=st.bestBonus){st.bestBonus=bonus;st.bestCode=code;st.bestCall=called;}
  const at=SHAPES.indexOf(shapeName(s.d,s.m,s.f) as typeof SHAPES[number]);if(at>=0)st.shapes|=1<<at;
  s.picks[0].on=s.picks[1].on=false;s.beat=SN.beat;s.acc=0;s.dash=0;s.qn=0;emit('squad',s.xs[0],s.ys[0],code,bonus,called?1:0);
 }
 /** The beat is over: the line goes back to the captain, the next level starts where he stands. */
 function nextLevel(){
  s.level++;s.len=1;s.gk=s.d=s.m=s.f=s.joined=0;s.pxs[0]=s.xs[0];s.pys[0]=s.ys[0];s.step=rampFor(s.level).step;s.saves=1;s.stall=0;s.acc=0;s.ready=SN.levelReady;
  s.call=(s.call+1+int(CALLS.length-1))%CALLS.length;spawnFoes();spawnPicks();emit('level',s.xs[0],s.ys[0],s.level,s.call);
 }
 function join(pos:number,tx:number,ty:number){
  const i=s.len;s.xs[i]=s.pxs[i]=tx;s.ys[i]=s.pys[i]=ty;s.pos[i]=pos;s.len++;s.joined++;
  if(pos===POS.gk)s.gk=1;else if(pos===POS.def)s.d++;else if(pos===POS.mid)s.m++;else s.f++;
  const pts=SN.pick*mult();s.score+=pts;s.stats.picks++;if(s.len>s.stats.longest)s.stats.longest=s.len;emit('pick',s.xs[0],s.ys[0],pos,s.joined,pts);
  if(s.joined>=SN.squad)squad();else spawnPicks();
 }
 function sendBack(){const i=s.len-1,pos=s.pos[i];s.len--;s.joined--;if(pos===POS.gk)s.gk=0;else if(pos===POS.def)s.d--;else if(pos===POS.mid)s.m--;else s.f--;spawnPicks();}

 /* ---- one tick: the captain moves a cell, the line follows, opponents take their turn ---- */
 function tick(){
  s.ticks++;for(let i=0;i<s.len;i++){s.pxs[i]=s.xs[i];s.pys[i]=s.ys[i];}for(const f of s.foes){f.px=f.x;f.py=f.y;}
  if(s.qn>0){if(s.q0!==(s.moved+2)%4)s.dir=s.q0;s.q0=s.q1;s.qn--;}
  let nx=s.xs[0]+DX[s.dir],ny=s.ys[0]+DY[s.dir],cause=0;const fi=inside(nx,ny)?foeAt(nx,ny):-1;
  if(!inside(nx,ny))cause=CAUSE.wall;else if(bodyAt(nx,ny,1,s.len-1)>=0)cause=CAUSE.own;else if(fi>=0&&s.dash<=0&&s.foes[fi].kind===0)cause=CAUSE.tackle;
  if(cause){
   // first blocked tick: a skid. The captain waits one tick and a turn into a wall or the line is taken back (he keeps his heading).
   if(!s.stall){s.stall=1;s.stats.skids++;emit('skid',s.xs[0],s.ys[0],cause);s.dir=s.moved;moveFoes();return;}
   // second blocked tick: the one last-ditch save turns the captain into open grass, else the run is over
   let out=-1;if(s.saves>0){let best=-1;for(const turn of [1,3]){const d=(s.dir+turn)%4,x=s.xs[0]+DX[d],y=s.ys[0]+DY[d];if(!inside(x,y)||bodyAt(x,y,1,s.len-1)>=0||foeAt(x,y)>=0)continue;
     let room=0;for(let k=1;k<Math.max(C,R);k++){const fx=s.xs[0]+DX[d]*k,fy=s.ys[0]+DY[d]*k;if(!inside(fx,fy)||bodyAt(fx,fy,1,s.len)>=0||foeAt(fx,fy)>=0)break;room++;}if(room>best){best=room;out=d;}}}
   if(out<0){crash(cause);return;}
   s.saves--;s.stats.saves++;s.dir=out;s.qn=0;nx=s.xs[0]+DX[out];ny=s.ys[0]+DY[out];emit('save',s.xs[0],s.ys[0],cause);
  }
  s.stall=0;
  if(!cause&&fi>=0){const f=s.foes[fi];
   if(s.dash>0){const pts=SN.knock*mult();s.score+=pts;s.stats.knocks++;emit('knock',nx,ny,pts,f.kind);relocate(f);}
   else{s.stats.cards++;const lost=s.len>1?1:0;if(lost)sendBack();else s.score=Math.max(0,s.score-SN.card*mult());emit('card',nx,ny,lost);relocate(f);}}
  const tx=s.xs[s.len-1],ty=s.ys[s.len-1];
  for(let i=s.len-1;i>0;i--){s.xs[i]=s.xs[i-1];s.ys[i]=s.ys[i-1];}s.xs[0]=nx;s.ys[0]=ny;s.moved=s.dir;
  if(s.dash>0){s.dash--;s.score+=SN.dashStep*mult();if(s.dash===0)emit('dashEnd',nx,ny);}
  if(s.ball.on&&s.ball.x===nx&&s.ball.y===ny){s.ball.on=false;s.ballIn=range(SN.ballEvery);s.dash=SN.dashSteps;s.stats.balls++;emit('ball',nx,ny,SN.dashSteps);}
  if(s.boot.on&&s.boot.x===nx&&s.boot.y===ny){const pts=SN.boot*mult();s.boot.on=false;s.bootIn=range(SN.bootEvery);s.score+=pts;s.stats.boots++;emit('boot',nx,ny,pts);}
  for(const p of s.picks)if(p.on&&p.x===nx&&p.y===ny){p.on=false;join(p.pos,tx,ty);break;}
  if(s.beat<=0)moveFoes();
 }
 function moveFoes(){
  for(let i=0;i<s.foes.length;i++){const f=s.foes[i];if(!f.on)continue;
   if(f.kind===0){if((s.ticks+i)%SN.pressEvery)continue;const nx=f.x+f.dx,ny=f.y+f.dy,c=f.dx?nx:ny;
    if(c<f.lo||c>f.hi||bodyAt(nx,ny,1,s.len)>=0||itemAt(nx,ny)||foeAt(nx,ny)>=0){f.dx=-f.dx;f.dy=-f.dy;continue;}
    if(nx===s.xs[0]&&ny===s.ys[0]){// the presser reaches the captain
     if(s.dash>0){const pts=SN.knock*mult();s.score+=pts;s.stats.knocks++;emit('knock',nx,ny,pts,0);relocate(f);}
     else if(s.saves>0){s.saves--;s.stats.saves++;emit('save',nx,ny,CAUSE.tackle);relocate(f);}
     else{f.x=nx;f.y=ny;crash(CAUSE.tackle);return;}
     continue;}
    f.x=nx;f.y=ny;}
   else{if((s.ticks+i)%SN.refEvery)continue;const d=int(4),nx=f.x+DX[d],ny=f.y+DY[d];if(inside(nx,ny)&&!edge(nx,ny)&&!taken(nx,ny))f.x=nx,f.y=ny;}
  }
 }

 spawnPicks();emit('ready',s.xs[0],s.ys[0],s.call);
 return {
  state:s,events,
  /** 0..1: how far through the current cell the drawing is. */
  get frac(){return s.over||s.hold||s.ready>0||s.beat>0?0:Math.min(1,s.acc/stepNow());},
  get stepSeconds(){return stepNow();},
  /** What the pitch offers now: [one more of this line, first of the next line] as positions (0 = not on offer). */
  offers(){options();return opt;},
  /** Ask for a turn (0 up, 1 right, 2 down, 3 left). Up to two are held. A turn onto the current heading or straight back is refused,
   *  so a fast double swipe is the legal two-step U-turn. Returns whether it was taken. */
  turn(d:number):boolean{
   if(s.over||d<0||d>3||d!==Math.floor(d))return false;
   if(s.hold){s.hold=false;if(s.len===1&&s.qn===0&&d!==s.dir){s.dir=s.moved=d;s.stats.turns++;emit('turn',s.xs[0],s.ys[0],d);}return true;}// kick-off: the first press starts the run (alone, the captain may face any way)
   const base=s.qn===0?s.dir:s.qn===1?s.q0:s.q1,prev=s.qn===2?s.q0:base;
   if(s.qn<2){if(d===base||d===(base+2)%4)return false;if(s.qn===0)s.q0=d;else s.q1=d;s.qn++;}
   else{if(d===prev||d===(prev+2)%4)return false;s.q1=d;}// a third quick swipe replaces the second held turn
   s.stats.turns++;emit('turn',s.xs[0],s.ys[0],d);return true;
  },
  step(dt:number){
   if(s.over||!(dt>0))return;s.t+=dt;
   if(s.ready>0){s.ready-=dt;if(s.ready>0)return;dt=-s.ready;s.ready=0;}if(s.hold)return;// the rest of the frame is played, so the tick times do not depend on the frame rate
   if(s.beat>0){s.beat-=dt;if(s.beat<=0){s.beat=0;nextLevel();}return;}
   if(!s.ball.on){s.ballIn-=dt;if(s.ballIn<=0){if(place(4,1)){s.ball.on=true;s.ball.x=spot.x;s.ball.y=spot.y;emit('ballIn',spot.x,spot.y);}else s.ballIn=2;}}
   if(s.boot.on){s.boot.t-=dt;if(s.boot.t<=0){s.boot.on=false;s.bootIn=range(SN.bootEvery);emit('bootGone',s.boot.x,s.boot.y);}}
   else{s.bootIn-=dt;if(s.bootIn<=0){if(place(5,2)){const b=s.boot;b.on=true;b.x=spot.x;b.y=spot.y;b.max=b.t=rampFor(s.level).boot;emit('bootIn',b.x,b.y);}else s.bootIn=2;}}
   s.acc+=dt;let guard=0;
   while(!s.over&&s.beat<=0&&s.ready<=0&&s.acc>=stepNow()&&guard++<6){s.acc-=stepNow();tick();}
   if(guard>=6)s.acc=0;
  },
  /** Hands every event since the last drain to `fn`, then empties the ring. */
  drain(fn:(e:SnakeEvent)=>void){for(let i=0;i<en;i++)fn(events[i]);en=0;},
 };
}
