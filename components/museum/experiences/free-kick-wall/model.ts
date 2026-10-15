/**
 * free-kick-wall · the model behind the free-kick test bench (pure, no DOM: tests/museum-exp-free-kick-wall.cjs runs it in Node).
 * Every number the bench shows (the dial, the counter on the measuring wheel, the height staff, the result) comes from here.
 *
 * REAL numbers (IFAB Laws 1 and 13): the goal is 7.32 m wide and 2.44 m high; at a free kick every opponent stays at least
 * 9.15 m (10 yds) from the ball; with three or more defenders in a wall, attackers stay at least 1 m from it (since 2019).
 * Everything else is a SIMPLE TEACHING MODEL (labelled in the UI): players are 0.5 m wide, a standing wall reaches 1.85 m, a
 * jumping wall lifts 0.35 m (top 2.2 m, a gap under its feet), a player lying behind it is 0.3 m high; the keeper's reach grows
 * with the time the ball takes; the flight is a parabola that bends sideways more and more as it goes (late curl).
 *
 * Pitch coordinates in metres: x across the goal (0 = the middle, + = right as the kicker looks at the goal), y out from the goal
 * line (0 = the line, + = towards the kicker), z up.
 */
export const GOAL_W=7.32,POST=GOAL_W/2,BAR=2.44,BALL_R=.11;
export const WALL_MIN=9.15,ATTACK_GAP=1,PLAYER_W=.5,WALL_DEPTH=.4;
export const STAND_TOP=1.85,JUMP=.35,JUMP_TOP=STAND_TOP+JUMP,LYING_TOP=.3,LYING_BACK=.8;
export const G=9.81;
/** The free kick spot: 20 m out, 2 m left of the middle, so the LEFT post is the near post (the wall's job). */
export const SPOT={x:-2,y:20} as const;
export const NEAR_POST=-POST,FAR_POST=POST;
export type V2={x:number;y:number};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const len=(v:V2)=>Math.hypot(v.x,v.y);
const sub=(a:V2,b:V2):V2=>({x:a.x-b.x,y:a.y-b.y});
const unit=(v:V2):V2=>{const l=len(v)||1;return {x:v.x/l,y:v.y/l};};

// ── The controls on the bench ──────────────────────────────────────────────────────────────────────────────────────────────
/** power 0–1 (the knob winds the leg's spring), lift in degrees (the lever), contact −1 (left of the ball's middle) … +1 (right),
 *  aim in degrees (the turntable: + = to the right of straight at the goal line). */
export type Controls={power:number;lift:number;contact:number;aim:number};
export const LIFT=[4,26] as const,AIM=[-24,20] as const;
export const speedOf=(power:number)=>16+14*clamp(power,0,1);// m/s off the boot
export const kmh=(ms:number)=>Math.round(ms*3.6);
/** The spin bends the ball AWAY from the side you strike: right of centre curves left (the Magnus effect). */
export const curveOf=(contact:number)=>-clamp(contact,-1,1);
/** The turntable's aim → the point on the goal line the leg points at (before any curl). */
export const aimX=(aimDeg:number,ball:V2=SPOT)=>ball.x+ball.y*Math.tan(aimDeg*Math.PI/180);
/** The leg's back-swing (degrees) for a power: the knob winds the spring, the spring pulls the leg back further. */
export const cockOf=(power:number)=>18+52*clamp(power,0,1);

// ── The wall ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** A wall: n players shoulder to shoulder, `dist` metres from the ball, square to the line from the ball to the goal-line point
 *  `aim`. `jump`: they jump as the ball is kicked. `lying`: a team-mate lies on the grass behind it. */
export type Wall={n:number;dist:number;aim:number;jump:boolean;lying:boolean};
export function wallGeom(w:Pick<Wall,'n'|'dist'|'aim'>,ball:V2=SPOT){
 const u=unit(sub({x:w.aim,y:0},ball)),c={x:ball.x+u.x*w.dist,y:ball.y+u.y*w.dist},side={x:-u.y,y:u.x},half=w.n*PLAYER_W/2;
 return {u,c,side,half,a:{x:c.x-side.x*half,y:c.y-side.y*half},b:{x:c.x+side.x*half,y:c.y+side.y*half},
  players:Array.from({length:w.n},(_,i)=>{const o=(i+.5)*PLAYER_W-half;return {x:c.x+side.x*o,y:c.y+side.y*o};}).sort((p,q)=>p.x-q.x)};
}
export const wallLegal=(w:Pick<Wall,'dist'>)=>w.dist>=WALL_MIN-1e-9;
/** The referee's fix: pace out 9.15 m and move the wall back to it (a wall further away is left where it is). */
export const refFix=<T extends Pick<Wall,'dist'>>(w:T):T=>wallLegal(w)?w:{...w,dist:WALL_MIN};
/** The wall's line: where its outer (near-post) end sits on the line from the ball to 0.3 m outside the near post. */
export function wallAim(n:number,ball:V2=SPOT){
 const d=sub({x:NEAR_POST-.3,y:0},ball),f=(aim:number)=>{const a=wallGeom({n,dist:WALL_MIN,aim},ball).a;return d.x*(a.y-ball.y)-d.y*(a.x-ball.x);};
 let lo=-8,hi=8;const flo=Math.sign(f(lo));for(let k=0;k<50;k++){const mid=(lo+hi)/2;if(Math.sign(f(mid))===flo)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
/** Where the wall body is, low and high, as the ball goes by (a jumping wall leaves a gap under its feet). */
export const wallBand=(w:Pick<Wall,'jump'>)=>w.jump?{low:JUMP,high:JUMP_TOP}:{low:0,high:STAND_TOP};
/** Distance from a point to the wall's segment (the 1 m rule measures from the wall). */
export function distToWall(p:V2,w:Pick<Wall,'n'|'dist'|'aim'>,ball:V2=SPOT){const g=wallGeom(w,ball),ab=sub(g.b,g.a),t=clamp(((p.x-g.a.x)*ab.x+(p.y-g.a.y)*ab.y)/(ab.x*ab.x+ab.y*ab.y),0,1);
 return Math.hypot(p.x-(g.a.x+ab.x*t),p.y-(g.a.y+ab.y*t));}
/** Law 13 (2019): with three or more defenders in the wall, an attacker must stay at least 1 m away. Two in a wall: no rule. */
export const attackerLegal=(p:V2,w:Pick<Wall,'n'|'dist'|'aim'>,ball:V2=SPOT)=>w.n<3||distToWall(p,w,ball)>=ATTACK_GAP-1e-9;

// ── The keeper ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** How far (m, sideways) the keeper gets before the ball arrives: a short reaction, then a dive on his spring. */
export const keeperReach=(t:number)=>clamp(.8+2.6*(t-.4),.8,3);
/** The keeper stands on the side the wall leaves open: halfway between the wall's shadow and the far post, but never so far
 *  across that the far post is out of his reach. */
export function keeperSpot(w:Pick<Wall,'n'|'dist'|'aim'>,ball:V2=SPOT){
 const g=wallGeom(w,ball),edge=ball.x+(g.b.x-ball.x)*ball.y/(ball.y-g.b.y);
 return clamp((edge+FAR_POST)/2,-1,FAR_POST-1.6);
}

// ── The flight ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** How far a full curve bends the ball sideways by the goal line (metres): about what a top free-kick taker gets with a full curler. */
export const CURL=4.6;
/** Air drag: the ball loses about 1.3% of its speed every metre (a 0.43 kg ball of radius 0.11 m), so it slows, drops and bends late. */
export const DRAG=.013;
/** Time (s) to cover d metres of ground at a starting ground speed vh, slowing with drag. */
export const timeAt=(d:number,vh:number)=>(Math.exp(DRAG*d)-1)/(DRAG*vh);
export type Pt={x:number;y:number;z:number;d:number};
/** The flight, sampled every 0.2 m of ground distance, from the ball to the goal line. Pure and deterministic. */
export function flight(c:Controls,ball:V2=SPOT){
 const ax=aimX(c.aim,ball),u=unit(sub({x:ax,y:0},ball)),side={x:-u.y,y:u.x},L=len(sub({x:ax,y:0},ball));
 const th=c.lift*Math.PI/180,v=speedOf(c.power),vh=v*Math.cos(th),tan=Math.tan(th),curve=curveOf(c.contact);
 const pts:Pt[]=[];
 // the sideways bend grows with the square of the distance (the ball bends more and more as it slows); + curve = bends right
 for(let i=0;i<=600;i++){const d=i*.2,s=d/L,off=curve*CURL*s*s;
  const x=ball.x+u.x*d+side.x*off,y=ball.y+u.y*d+side.y*off;
  const t=timeAt(d,vh),z=Math.max(BALL_R,BALL_R+d*tan-G*t*t/2);pts.push({x,y,z,d});
  if(y<=0)break;}
 const n=pts.length;if(n>1&&pts[n-1].y<0){const a=pts[n-2],b=pts[n-1],f=a.y/(a.y-b.y);pts[n-1]={x:a.x+(b.x-a.x)*f,y:0,z:a.z+(b.z-a.z)*f,d:a.d+(b.d-a.d)*f};}
 return {pts,vh,speed:v,time:timeAt(pts[pts.length-1].d,vh)};
}
/** The flight where it crosses the wall's line (interpolated), and how it passed: over, under, round its end, or into it. */
export function atWall(pts:readonly Pt[],w:Wall,ball:V2=SPOT){
 const g=wallGeom(w,ball),along=(p:Pt)=>(p.x-g.c.x)*g.u.x+(p.y-g.c.y)*g.u.y;
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],fa=along(a),fb=along(b);if(fa<0&&fb>=0){const f=-fa/(fb-fa||1e-9);
  const p={x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f,d:a.d+(b.d-a.d)*f},off=(p.x-g.c.x)*g.side.x+(p.y-g.c.y)*g.side.y,band=wallBand(w);
  const how:'round'|'over'|'under'|'hit'=Math.abs(off)>g.half+BALL_R?'round':p.z-BALL_R>=band.high?'over':p.z+BALL_R<=band.low?'under':'hit';
  return {p,i,off,how};}}
 return null;
}
/** Where the ball meets the player lying behind a jumping wall (a low shot that went under the jump), or null. */
export function lyingHit(pts:readonly Pt[],w:Wall,ball:V2=SPOT){
 if(!w.lying)return null;const g=wallGeom(w,ball);
 for(let i=0;i<pts.length;i++){const p=pts[i],along=(p.x-g.c.x)*g.u.x+(p.y-g.c.y)*g.u.y-LYING_BACK,off=(p.x-g.c.x)*g.side.x+(p.y-g.c.y)*g.side.y;
  if(Math.abs(along)<=.25+BALL_R&&Math.abs(off)<=g.half+.2&&p.z-BALL_R<LYING_TOP)return {p,i};}
 return null;
}
export type KickResult='goal'|'blocked'|'over'|'wide'|'post'|'bar'|'saved';
export type Via='over'|'under'|'round';
/** The whole kick: blocked by the wall (or the player lying behind it), over, wide, off the woodwork, saved or a goal. */
export function kick(c:Controls,w:Wall,ball:V2=SPOT){
 const f=flight(c,ball),end=f.pts[f.pts.length-1],wall=atWall(f.pts,w,ball),keeperX=keeperSpot(w,ball);
 const lie=wall?.how==='under'?lyingHit(f.pts,w,ball):null;
 const curve=Math.abs(curveOf(c.contact));
 // a bending ball is harder to read, and a ball that went under or round the wall was hidden from the keeper for longer
 const hidden=wall&&wall.how!=='over'?.12:0;
 const reach=keeperReach(f.time-curve*.14-hidden)-(end.z>1.9?.45:0);
 const ax=Math.abs(end.x);let result:KickResult;
 if(wall?.how==='hit'||lie)result='blocked';
 else if(ax>POST+BALL_R)result='wide';
 else if(end.z>BAR+BALL_R)result='over';
 else if(ax>POST-BALL_R)result='post';
 else if(end.z>BAR-BALL_R)result='bar';
 else if(Math.abs(end.x-keeperX)<=reach)result='saved';
 else result='goal';
 const stop=wall?.how==='hit'?wall.i:lie?lie.i:f.pts.length-1;
 return {result,via:(wall&&wall.how!=='hit'?wall.how:null) as Via|null,end,wall,lie,keeperX,reach,time:f.time,speed:f.speed,vh:f.vh,pts:f.pts,stop,
  /** Height of the ball (m) as it went by the wall: what the height staff's telltale shows. */
  wallZ:wall?wall.p.z:null};
}

// ── The bench's steps ──────────────────────────────────────────────────────────────────────────────────────────────────────
/** The wall creeps in before the referee measures: 7.4 m. */
export const CREEP=7.4;
export type ChallengeId='over'|'round'|'under';
/** Three free kicks, each against a different wall: the way to beat it is the lesson. */
export const CHALLENGE:Record<ChallengeId,{wall:Wall;via:Via}>={
 over:{via:'over',wall:{n:4,dist:WALL_MIN,aim:0,jump:false,lying:false}},
 round:{via:'round',wall:{n:5,dist:WALL_MIN,aim:0,jump:true,lying:false}},
 under:{via:'under',wall:{n:4,dist:WALL_MIN,aim:0,jump:true,lying:false}},
};
export const CHALLENGE_IDS:readonly ChallengeId[]=['over','round','under'];
/** The challenge's wall, lined up on the near post. */
export const wallFor=(id:ChallengeId):Wall=>{const w=CHALLENGE[id].wall;return {...w,aim:wallAim(w.n)};};
/** A kick that does it (for "Show me", and the tests prove each challenge can be beaten). */
export const SOLUTION:Record<ChallengeId,Controls>={
 over:{power:.5,lift:19,contact:0,aim:0},
 round:{power:.6,lift:9,contact:-1,aim:-14},
 under:{power:.7,lift:4,contact:0,aim:-3},
};
export const START:Controls={power:.5,lift:10,contact:0,aim:0};
/** Did this kick beat the challenge? A goal the challenge's way. */
export const passes=(id:ChallengeId,r:{result:KickResult;via:Via|null})=>r.result==='goal'&&r.via===CHALLENGE[id].via;

// ── The breakdown: the wall taken apart ────────────────────────────────────────────────────────────────────────────────────
export type PartId='line'|'players'|'jump'|'lying'|'gap';
export const PARTS:readonly PartId[]=['line','players','jump','lying','gap'];
/** How far each part moves (metres, along the wall's line u towards the goal, across it, and up) when the wall is fully apart. */
export const APART:Record<PartId,{u:number;s:number;z:number}>={
 line:{u:-1.2,s:0,z:0},players:{u:0,s:0,z:0},jump:{u:0,s:0,z:JUMP},lying:{u:1.4,s:0,z:0},gap:{u:-.4,s:1.6,z:0},
};
/** The attacker in the breakdown: exactly 1 m from the wall's inner end. */
export function attackerSpot(w:Pick<Wall,'n'|'dist'|'aim'>,ball:V2=SPOT){const g=wallGeom(w,ball);return {x:g.b.x+g.side.x*ATTACK_GAP,y:g.b.y+g.side.y*ATTACK_GAP};}
