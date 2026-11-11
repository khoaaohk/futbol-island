// Futbol Tennis first-touch target (Nov 10 2026, arcade part 3): on two-touch courts a trap that sets the ball down in the
// spot in front of you is "on target" (an upgraded trap call + a full-time stat). Read only: a bot match with the feature
// stripped out of the source plays out identically, so rally physics and difficulty are unchanged.
// Run: node -r ./scripts/test-ts-cache.cjs tests/tennis-first-touch.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..');
const compile=src=>ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function loadTennis(transform=s=>s){const file=path.join(root,'lib/games/soccerTennis.ts'),m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));
 const req=id=>{const f=path.resolve(path.dirname(file),id)+'.ts';const sub=new Module(f,m);sub.filename=f;sub._compile(compile(fs.readFileSync(f,'utf8')),f);return sub.exports;};
 m.require=req;m._compile(compile(transform(fs.readFileSync(file,'utf8'))),file);return m.exports;}
const src=fs.readFileSync('lib/games/soccerTennis.ts','utf8');
const A=loadTennis();
// The same source with the first-touch lines removed (what the code did before Nov 10).
const strip=s=>s.replace(/if\(side==='you'\)\{const spot=tennisFirstTouchSpot[^\n]*\n\s*/,"if(side==='you'){").replace("s.trapOnTarget?`${TENNIS_FIRST_TOUCH.tip} Now strike!`:","");
assert.notEqual(strip(src),src,'strip pattern still matches the source');
const B=loadTennis(strip);
// 1. The spot: a stride toward the net, a little toward the ball, inside your half.
assert.deepEqual(A.tennisFirstTouchSpot(0,4,1),{x:.35,y:4-A.TENNIS_FIRST_TOUCH.ahead});
assert.equal(A.tennisFirstTouchSpot(0,.9,0).y,.7,'never into the net');
// 2. A bot plays a two-touch court: traps when it can, kicks otherwise. Both builds must match frame for frame.
function play(T,level){const s=T.createTennis(47,level);T.beginTennis(s);const trace=[];
 for(let i=0;i<60*90&&s.phase!=='over';i++){
  if(s.phase==='serve'&&s.server==='you')T.requestTennisKick(s,0,'auto');
  else if(T.canTennisTrap(s,'you')&&!s.youTrapped)T.requestTennisKick(s,.2,'trap');
  else if(T.canTennisKick(s,'you'))T.requestTennisKick(s,.3,'auto');
  else{const b=s.ball;s.you.x+=Math.max(-.06,Math.min(.06,b.x-s.you.x));}
  T.tickTennis(s,1/60);if(i%15===0)trace.push(s.ball.x.toFixed(5),s.ball.y.toFixed(5),s.ball.z.toFixed(5),s.score?.you??'',s.rally);}
 return{s,trace:trace.join('|')};}
let tries=0,hits=0;
for(const level of [3,4,6]){
 const a=play(A,level),b=play(B,level);
 assert.equal(A.TENNIS_COURTS[level-1].touches,2);
 assert.equal(a.trace,b.trace,`court ${level}: rally physics unchanged`);
 assert.equal(a.s.trapEvents,b.s.trapEvents);
 tries+=a.s.firstTouchTries;hits+=a.s.firstTouchOnTarget;
 assert.ok(a.s.firstTouchOnTarget<=a.s.firstTouchTries);
}
assert.ok(tries>0,'the bot trapped at least once');
// 3. A fresh match starts the stat at zero; one-touch courts never count a try.
{const s=A.createTennis(47,1);assert.equal(s.firstTouchTries,0);assert.equal(s.firstTouchOnTarget,0);const p=play(A,1);assert.equal(p.s.firstTouchTries,0);}
// 4. Wiring: the ring module (bounce-spot pattern), the upgraded trap call and the full-time line.
const ring=fs.readFileSync('lib/arcade/tennisFirstTouch.ts','utf8'),games=fs.readFileSync('lib/arcade/games/tennisGame.ts','utf8'),feel=fs.readFileSync('lib/arcade/tennisFeel.ts','utf8'),card=fs.readFileSync('components/games/TennisCard.tsx','utf8');
assert.match(ring,/if\(!set&&!ready\)\{if\(mesh\.visible\)/,'hidden outside a live trappable/set ball');
assert.doesNotMatch(ring.slice(ring.indexOf('function sync')),/new T\./,'no allocation per frame');
assert.match(games,/if\(tennisTouchRing\?\.sync\(dt,tennis\)\)tennisFxLive=true;/);
assert.match(games,/tennisTouchRing\?\.dispose\(\)/);
assert.match(feel,/s\.trapOnTarget\)\{draw\(touch,'ON TARGET · SET!'/);
assert.match(card,/First touches on target: <b>\{t\.firstTouchOnTarget\}<\/b>/);
console.log(`tennis-first-touch: ok (${hits}/${tries} bot traps on target)`);
