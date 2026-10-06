// Island Strikers set pieces (G1, Oct 4 2026): fouls from behind, free kicks with a jumping wall, penalties with a
// keeper guess, corners from tipped saves, crosses and headers, and the stalled-kick auto take.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,STRIKER_WALL_GAP,STRIKER_PENALTY_X}=m.exports;
const fresh=(level=1)=>{const g=createStrikerMatch(),s=g.state;s.level=level;g.reset();return{g,s,i:strikerInput()};};
// A Blue slide that hits a runner from behind is a foul: free kick outside the box, penalty inside it.
function fouled(x,z){const {g,s,i}=fresh();for(const p of s.players)if(p.id!==0&&p.id!==4)p.stun=99;const me=s.players[0];Object.assign(me,{x,z,vx:7,vz:0,yaw:Math.PI/2});Object.assign(s.ball,{owner:0,x:x+.82,z,lock:0});s.selected=0;
 const d=s.players[4];Object.assign(d,{x:x-1.2,z,vx:16,vz:0,tackle:.2,stun:0,cooldown:1});i.x=1;g.step(1/60,i);return{g,s,i};}
{const {s}=fouled(7,3);assert.equal(s.fouls[1],1,'blue fouls');assert.equal(s.setPiece.kind,'free');assert.equal(s.setPiece.team,0);assert.equal(s.ball.owner,s.setPiece.taker);
 const wall=s.players.filter(p=>p.wall>0);assert.equal(wall.length,2,'two-player wall');for(const w of wall){const d=Math.hypot(w.x-s.ball.x,w.z-s.ball.z);assert(Math.abs(d-STRIKER_WALL_GAP)<.3,'wall stands the scaled distance');assert(w.x>s.ball.x,'wall between ball and goal');}}
{const {s}=fouled(19,1);assert.equal(s.setPiece.kind,'penalty','foul in the box');assert(Math.abs(s.ball.x-STRIKER_PENALTY_X)<.1&&Math.abs(s.ball.z)<.05,'ball on the spot');assert(s.players.filter(p=>p.team===1&&!p.keeper).every(p=>p.x<17),'defenders wait outside the box');}
// While a set piece is set, nobody moves; a stalled Gold kick is taken for the player.
{const {g,s,i}=fouled(0,3);const before=s.players.map(p=>[p.x,p.z]);i.x=0;for(let n=0;n<60;n++)g.step(1/60,i);assert.deepEqual(s.players.map(p=>[p.x,p.z]),before,'frozen while set');assert(s.setPiece.kind);
 for(let n=0;n<60*6;n++)g.step(1/60,i);assert.equal(s.setPiece.kind,'','auto taken after the wait');}
// The player's own tackle from behind a runner is held back with a coaching line (no foul).
{const {g,s,i}=fresh();for(const p of s.players)if(p.id!==0&&p.id!==4)p.stun=99;const b=s.players[4];Object.assign(b,{x:0,z:0,vx:-6,vz:0,yaw:-Math.PI/2,think:9});Object.assign(s.ball,{owner:4,x:-.82,z:0,lock:0});
 Object.assign(s.players[0],{x:2,z:0,cooldown:0});s.selected=0;i.pass=true;g.step(1/60,i);assert.equal(s.eventKind,'behind');assert.equal(s.players[0].tackle,0);assert.equal(s.fouls[0],0);}
// Free kick: a low drive into the wall is blocked; a chip clears it.
for(const chip of [false,true]){const {g,s,i}=fouled(6,0);const t=s.players[s.setPiece.taker];assert.equal(s.selected,t.id);i.x=0;i.shoot=true;i.power=.45;i.sprint=chip;i.z=0;g.step(1/60,i);i.shoot=i.sprint=false;
 let blocked=false;for(let n=0;n<90&&s.score[0]===0;n++){g.step(1/60,i);if(s.ball.owner>=4&&!s.players[s.ball.owner].keeper){blocked=true;break;}}
 if(chip)assert(!blocked,'chip clears the wall');else assert(blocked,'low drive hits the jumping wall');}
// Curl: aimed at the far corner and bent with aftertouch, it beats the wall side and is a set-piece shot.
{const {g,s,i}=fouled(8,-2);i.shoot=true;i.power=.55;i.z=.95;g.step(1/60,i);i.shoot=false;assert(s.setPieceShot,'set-piece shot tracked');i.z=1;let blocked=false;for(let n=0;n<60;n++){g.step(1/60,i);if(s.ball.owner>=4&&!s.players[s.ball.owner].keeper)blocked=true;}assert(!blocked,'curled around the wall');}
// Blue penalty: the player's held stick picks the Gold keeper's dive. Right guess saves, wrong guess concedes.
function bluePenalty(guess){const {g,s,i}=fresh();for(const p of s.players)if(p.id!==3&&p.id!==4)p.stun=99;const me=s.players[4];Object.assign(me,{x:-20,z:1,vx:-6,vz:0,yaw:-Math.PI/2});Object.assign(s.ball,{owner:4,x:-20.8,z:1,lock:0});
 const d=s.players[0];Object.assign(d,{x:-18.8,z:1,vx:-16,vz:0,tackle:.2,stun:0,cooldown:1});s.selected=0;g.step(1/60,i);assert.equal(s.setPiece.kind,'penalty');assert.equal(s.setPiece.team,1);const side=s.setPiece.aimSide;
 i.z=guess==='right'?side:guess==='wrong'?-side:0;for(let n=0;n<130&&s.score[1]===0;n++)g.step(1/60,i);return s;}
assert.equal(bluePenalty('right').score[1],0,'right guess: saved');assert.equal(bluePenalty('wrong').score[1],1,'wrong guess: goal');
// Gold penalty into the corner the keeper did not guess scores.
{const {g,s,i}=fouled(19,1);const guess=[-1,0,1,1,-1,0][(s.fouls[1]+s.shots[0])%6];i.shoot=true;i.power=.7;i.z=guess>0?-.9:.9;g.step(1/60,i);i.shoot=false;i.z=0;for(let n=0;n<60&&s.score[0]===0;n++)g.step(1/60,i);assert.equal(s.score[0],1,'penalty to the open corner');assert.equal(s.setPieceGoals,1);}
// A hard wide shot tipped round the post gives a corner; the cross is whipped to the chosen post and headed.
{const {g,s,i}=fresh();for(const p of s.players)if(!p.keeper)p.stun=99;const k=s.players[7];Object.assign(k,{x:22.6,z:1.6});Object.assign(s.ball,{owner:-1,x:21.8,z:2.6,y:.8,vx:30,vz:2,vy:0,lock:0,lastTeam:0});s.lastKicker=0;
 for(let n=0;n<90&&!s.setPiece.kind;n++)g.step(1/60,i);assert.equal(s.setPiece.kind,'corner','tipped wide becomes a corner');assert.equal(s.setPiece.team,0);assert(Math.abs(s.ball.x-24.3)<.2&&Math.abs(Math.abs(s.ball.z)-13.2)<.2,'ball at the flag');
 for(const p of s.players)p.stun=0;const first=s.selected;i.switchPlayer=true;g.step(1/60,i);i.switchPlayer=false;assert.notEqual(s.selected,first,'Switch picks the other post');
 i.pass=true;g.step(1/60,i);i.pass=false;assert(s.ball.vy>5,'lofted cross');assert.equal(s.setPiece.kind,'');let shot=false;for(let n=0;n<120&&!shot;n++){i.shoot=s.touchWindow>0;g.step(1/60,i);if(s.shots[0]>0)shot=true;}i.shoot=false;assert(shot,'attacked the cross first time');}
console.log('PASS Strikers set pieces: fouls from behind, wall, penalty guesses, corners, crosses, auto take');
