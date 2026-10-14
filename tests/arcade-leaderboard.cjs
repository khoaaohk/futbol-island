// Arcade leaderboards (Oct 12 2026; docs/arcade-leaderboards.md). Run: node tests/arcade-leaderboard.cjs
//  1. initials: three letters A–Z, the blocklist, the picture ids
//  2. score bounds per game, the scoring-rate rule, Strikers match points, the puzzle star ceiling
//  3. the device board: order, ties, top-10 cut, qualifying, puzzle rows, repair of junk
//  4. the API on the file-backed local store: session tokens, every validation, one post per play, top-10 only, replace
//  5. the rate limit (per IP bucket and the start limiter)
//  6. no PII stored (no IP, no user agent, no claim, no token)
//  7. the migration on a throwaway Postgres: self-check row, idempotent, additive, locked down, SQL = the TypeScript twin
//  8. wiring: lazy UI, no timers or polling, the device key, the route, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const L=require(path.join(ROOT,'lib/arcade/leaderboard.ts')),ST=require(path.join(ROOT,'lib/arcade/leaderboardStore.ts')),SV=require(path.join(ROOT,'lib/arcade/leaderboardServer.ts'));
let failed=0,skipped=0;const results=[];
async function ok(name,fn){try{const r=await fn();results.push(r==='skip'?'SKIP':'ok');if(r==='skip')skipped++;console.log(`${r==='skip'?'SKIP':'ok  '} ${name}`);}catch(e){failed++;console.log(`FAIL ${name}\n  ${e&&e.stack||e}`);}}
const SECRET='x'.repeat(40);
const headers=(h={})=>{const m=new Map(Object.entries({host:'futbol.test','x-forwarded-for':'203.0.113.7','user-agent':'KidPhone/1.0 Safari',...h}).map(([k,v])=>[k.toLowerCase(),v]));return {get:k=>m.get(k.toLowerCase())??null};};

(async()=>{
await ok('initials: three letters A–Z, blocklist, pictures',()=>{
 assert.equal(L.cleanInitials('abc'),'ABC');assert.equal(L.cleanInitials('ZED'),'ZED');
 for(const bad of ['AB','ABCD','A1C','ÄBC',' AB','A-C','',null,undefined,123,['A','B','C'],'a b'])assert.equal(L.cleanInitials(bad),null,String(bad));
 assert(L.BLOCKED_INITIALS.size>=40,'a real blocklist');
 for(const w of L.BLOCKED_INITIALS){assert.match(w,/^[A-Z]{3}$/,'blocklist entries are wheel letters: '+w);assert.equal(L.cleanInitials(w),null,w);assert.equal(L.cleanInitials(w.toLowerCase()),null,w);assert.equal(L.initialsBlocked(w.toLowerCase()),true);}
 for(const w of ['ASS','FUK','KKK','NIG','SEX','KYS','WTF','FAG'])assert(L.BLOCKED_INITIALS.has(w),w);
 for(const w of ['AAA','ACE','LEO','MIA','SAM','GOL','POW','ZOE','BOB','TOM'])assert.equal(L.cleanInitials(w),w,'ordinary letters pass: '+w);
 assert.equal(L.cleanIcon('lion'),'lion');assert.equal(L.cleanIcon(''),'');assert.equal(L.cleanIcon(undefined),'');
 for(const bad of ['🦁','Lion','dragon','<b>',' lion',5])assert.equal(L.cleanIcon(bad),null,String(bad));
 assert(L.BOARD_ICONS.every(i=>/^[a-z]{1,12}$/.test(i.id)&&i.emoji&&i.label),'picture ids fit the SQL check');
 assert.equal(new Set(L.BOARD_ICONS.map(i=>i.id)).size,L.BOARD_ICONS.length);
});

await ok('score bounds and plausibility',()=>{
 assert.deepEqual([...L.BOARD_GAMES],['runner','pinball','tennis','live','puzzle','kick']);// kick: Summit Kick (tests/summit-kick.cjs)
 for(const g of L.BOARD_GAMES){const r=L.BOARD_RULES[g];
  for(const bad of [0,-1,1.5,NaN,Infinity,r.max+1,'10',null])assert.equal(L.scoreInBounds(g,bad),false,`${g} ${bad}`);
  for(const good of [1,r.max])assert.equal(L.scoreInBounds(g,good),true,`${g} ${good}`);
  assert.equal(L.scorePlausible(g,1,r.minSeconds*1000-1),'short',g+' too short');
  assert.equal(L.scorePlausible(g,1,r.minSeconds*1000),'ok',g);
  if(r.perSecond>0)assert.equal(L.scorePlausible(g,r.base+r.perSecond*60+1,60_000),'fast',g+' faster than the game scores');
  assert.equal(L.scorePlausible(g,Math.min(r.max,r.base+r.perSecond*60),60_000),'ok');}
 assert.equal(L.isBoardGame('runner'),true);assert.equal(L.isBoardGame('island'),false);assert.equal(L.isBoardGame('__proto__'),false);
 // Strikers: passing scores, not just goals.
 assert.equal(L.strikerBoardPoints({goals:2,passes:14,won:true}),2*100+14*10+200);assert.equal(L.strikerBoardPoints({goals:0,passes:0,won:false}),0);
 assert.equal(L.strikerBoardPoints({goals:-3,passes:NaN,won:false}),0);
 // The puzzle ceiling holds every star the catalog can give, and the SQL ceiling holds every game's.
 const cat=require(path.join(ROOT,'lib/passPuzzle/catalog.ts'));assert(3*cat.ALL_SCENARIOS.length<=L.BOARD_RULES.puzzle.max,'puzzle max ≥ 3 × puzzles');
 const sql=read('supabase/migrations/20261013_arcade_leaderboards.sql'),cap=Number(/score between 1 and (\d+)/.exec(sql)[1]);
 assert.equal(cap,Math.max(...L.BOARD_GAMES.map(g=>L.BOARD_RULES[g].max)),'SQL score ceiling = the highest game ceiling');
 assert.equal(L.weekOf(Date.parse('2026-10-18T23:59:00Z')),'2026-10-12','Sunday belongs to the Monday before');
 assert.equal(L.weekOf(Date.parse('2026-10-12T00:00:00Z')),'2026-10-12');assert.equal(L.weekOf(Date.parse('2026-10-11T23:59:59Z')),'2026-10-05');
 assert.equal(L.weekOf(Date.parse('2027-01-01T12:00:00Z')),'2026-12-28','across a year');
});

await ok('device board: order, ties, top 10, qualifying',()=>{
 let b=L.emptyLocalBoards();const now=Date.parse('2026-10-14T10:00:00Z');
 const add=(score,initials='AAA',g='runner')=>{const r=L.addLocalScore(b,g,{initials,icon:'',score,now});b=r.boards;return r;};
 assert.equal(add(500,'AAA').rank,1);assert.equal(add(900,'BBB').rank,1);assert.equal(add(500,'CCC').rank,3,'a tie goes below the earlier equal score');
 assert.deepEqual(b.boards.runner.map(e=>e.initials),['BBB','AAA','CCC']);
 for(let i=0;i<7;i++)add(100+i,'DDD');assert.equal(b.boards.runner.length,10);
 assert.equal(L.qualifies(b.boards.runner,100),false,'a tie with the last row does not get in');assert.equal(L.qualifies(b.boards.runner,101),true);
 assert.equal(L.qualifies(b.boards.runner,0),false);
 const r=add(50,'EEE');assert.equal(r.rank,null,'off the board');assert.equal(b.boards.runner.length,10);assert(!b.boards.runner.some(e=>e.initials==='EEE'));
 assert.equal(add(1000,'FFF').rank,1);assert.equal(b.boards.runner.length,10);assert.equal(b.boards.runner.at(-1).score,101,'the lowest fell off');
 assert.equal(L.rankFor([{score:9},{score:5},{score:5}],5),4);assert.equal(L.rankFor([],1),1);
 // Pass Puzzles' running star total keeps one row per set of letters.
 add(10,'PUZ','puzzle');add(12,'PUZ','puzzle');add(11,'ZIP','puzzle');assert.deepEqual(b.boards.puzzle.map(e=>e.initials+e.score),['PUZ12','ZIP11']);
 // Posted island rows: highlight + replace the device's own lower entry with the same letters.
 b=L.addPosted(b,'runner',{id:7,claim:'a'.repeat(32),initials:'AAA',score:500});b=L.addPosted(b,'runner',{id:9,claim:'b'.repeat(32),initials:'BBB',score:900});
 assert.equal(L.replaceable(b,'runner','AAA',600).id,7);assert.equal(L.replaceable(b,'runner','AAA',400),null,'never replaces a better score');assert.equal(L.replaceable(b,'runner','ZZZ',999),null);
 b=L.addPosted(b,'runner',{id:12,claim:'c'.repeat(32),initials:'AAA',score:600},7);assert.deepEqual([...L.ownServerIds(b,'runner')].sort((x,y)=>x-y),[9,12]);
 // Repair: the stored JSON goes back through the same rules.
 const round=L.sanitizeLocalBoards(JSON.parse(JSON.stringify(b)));assert.deepEqual(round.boards.runner,b.boards.runner);assert.deepEqual(round.mine,b.mine);
 const junk=L.sanitizeLocalBoards({version:1,seq:-4,me:{initials:'ASS',icon:'lion'},boards:{runner:[{initials:'ASS',icon:'',score:5,day:'2026-10-14',seq:1},{initials:'ok',icon:'',score:5,day:'x',seq:2},{initials:'abc',icon:'🦁',score:5,day:'2026-10-14',seq:3},{initials:'abc',icon:'fox',score:5e9,day:'2026-10-14',seq:4},{initials:'abc',icon:'fox',score:7,day:'2026-10-14',seq:5}],island:[{}]},mine:{runner:[{id:-1,claim:'x'},{id:3,claim:'d'.repeat(32),initials:'ABC',score:7}]}});
 assert.deepEqual(junk.boards.runner.map(e=>e.initials+e.score),['ABC7']);assert.equal(junk.me,undefined,'blocked remembered letters are dropped');assert.equal(junk.boards.island,undefined);assert.equal(junk.mine.runner.length,1);
 assert.deepEqual(L.sanitizeLocalBoards('nope'),L.emptyLocalBoards());
});

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fiboard-')),FILE=path.join(tmp,'boards.json');
let clock=Date.parse('2026-10-14T10:00:00Z');const now=()=>new Date(clock);
const store=ST.createMemoryBoardStore(FILE),deps={store,secret:SECRET,now};
const call=(action,body,h,query)=>SV.handleBoard(action,{body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body),headers:headers(h),query:query&&new URLSearchParams(query)},deps);
const start=async(game,h)=>{const r=await call('start',{game},h);assert.equal(r.status,200);return r.body.token;};
const play=async(game,score,{initials='ACE',icon='lion',seconds=60,h,replace}={})=>{const token=await start(game,h);clock+=seconds*1000;return call('submit',{token,score,initials,icon,...(replace?{replace}:{})},h);};

await ok('API: tokens and validation (local file store)',async()=>{
 assert.equal((await SV.handleBoard('submit',{body:'{}',headers:headers()},{store,secret:undefined})).status,503,'no secret: unavailable');
 assert.equal((await SV.handleBoard('top',{query:new URLSearchParams('game=runner'),headers:headers()},{store:null,secret:SECRET})).status,503,'no store: unavailable');
 assert.equal(SV.boardSecret({}),undefined);assert.equal(SV.boardSecret({SAVE_CODE_PEPPER:'short'}),undefined);
 assert.equal(SV.boardSecret({LEADERBOARD_SECRET:SECRET}),SECRET);assert.match(SV.boardSecret({SAVE_CODE_PEPPER:'p'.repeat(40)}),/^[0-9a-f]{64}$/);assert.notEqual(SV.boardSecret({SAVE_CODE_PEPPER:'p'.repeat(40)}),'p'.repeat(40));
 assert.equal((await call('nope',{})).status,404);
 assert.equal((await call('start',{game:'island'})).status,400);assert.equal((await call('start','not json')).status,400);assert.equal((await call('start',{game:'runner',pad:'x'.repeat(3000)})).status,400,'body cap');
 assert.equal((await call('start',{game:'runner'},{origin:'https://evil.example'})).status,403,'cross-site');
 const token=await start('runner');assert.match(token,/^v1\.runner\./);
 const tampered=[token.replace('v1.runner.','v1.pinball.'),token.slice(0,-2)+(token.endsWith('AA')?'BB':'AA'),'v1.runner.1.'+'0'.repeat(32)+'.'+'A'.repeat(32),'',42];
 clock+=60_000;
 for(const t of tampered)assert.deepEqual((await call('submit',{token:t,score:100,initials:'ACE'})).body,{ok:false,reason:'token'},'tampered: '+String(t).slice(0,20));
 const cases=[[{initials:'AB'},'initials'],[{initials:'ass'},'initials'],[{initials:'A C'},'initials'],[{icon:'🦁'},'icon'],[{score:0},'score'],[{score:1.5},'score'],[{score:L.BOARD_RULES.runner.max+1},'score'],[{score:'100'},'score']];
 for(const [patch,reason] of cases){const r=await call('submit',{token,score:100,initials:'ACE',icon:'',...patch});assert.equal(r.status,400);assert.equal(r.body.reason,reason,JSON.stringify(patch));}
 assert.deepEqual((await call('submit',{token,score:L.BOARD_RULES.runner.base+L.BOARD_RULES.runner.perSecond*60+5,initials:'ACE'})).body,{ok:false,reason:'fast'});
 const fresh=await start('runner');clock+=2000;assert.deepEqual((await call('submit',{token:fresh,score:10,initials:'ACE'})).body,{ok:false,reason:'short'},'a real play lasts the minimum');
 const old=await start('runner'),late={...deps,now:()=>new Date(clock+L.SESSION_MAX_MS+1)};assert.equal((await SV.handleBoard('submit',{body:JSON.stringify({token:old,score:10,initials:'ACE'}),headers:headers()},late)).body.reason,'token','expired');
 // A good post: ranked, both boards returned, a claim handed back once.
 const ok1=await call('submit',{token,score:1200,initials:'ace',icon:'lion'});
 assert.equal(ok1.status,200);assert.equal(ok1.body.ok,true);assert.deepEqual(ok1.body.rank,{all:1,week:1});assert.match(ok1.body.claim,/^[0-9a-f]{32}$/);
 assert.deepEqual(ok1.body.all.map(r=>[r.initials,r.icon,r.score]),[['ACE','lion',1200]]);assert.equal(ok1.body.weekly.length,1);
 assert.deepEqual((await call('submit',{token,score:1300,initials:'ACE'})).body,{ok:false,reason:'used'},'one post per play');
 // Order and ties on the island board.
 await play('runner',1200,{initials:'BEN'});await play('runner',1500,{initials:'CAT'});
 const top=await call('top',undefined,{},'game=runner');assert.equal(top.status,200);assert.match(top.cache,/s-maxage=\d+/);
 assert.deepEqual(top.body.all.map(r=>r.initials),['CAT','ACE','BEN'],'higher first; a tie keeps the earlier entry above');
 assert.equal((await call('top',undefined,{},'game=nope')).status,400);
 // Only a top-10 score is kept.
 for(let i=0;i<8;i++)await play('runner',2000+i,{initials:'DAN'});
 const low=await play('runner',100,{initials:'EVE'});assert.deepEqual(low.body,{ok:false,reason:'not-top'});
 // The week board: last week's rows are not on it, and a lower score can still make this week's board.
 clock+=7*86_400_000;const wk=await play('runner',100,{initials:'FAY'});assert.equal(wk.body.ok,true);assert.deepEqual(wk.body.rank,{all:null,week:1});
 assert.deepEqual(wk.body.weekly.map(r=>r.initials),['FAY']);assert.equal(wk.body.all.length,10);
 // Replace: the device's own lower entry (matching claim) makes way; a wrong claim leaves it.
 const mine=await play('pinball',3000,{initials:'GIL'});const claim=mine.body.claim,id=mine.body.id;
 const wrong=await play('pinball',3500,{initials:'GIL',replace:{id,claim:'0'.repeat(32)}});assert.equal(wrong.body.ok,true);
 let pins=(await call('top',undefined,{},'game=pinball')).body.all;assert.deepEqual(pins.map(r=>r.score),[3500,3000],'wrong claim: the old row stays');
 const better=await play('pinball',4000,{initials:'GIL',replace:{id,claim}});assert.equal(better.body.ok,true);
 pins=(await call('top',undefined,{},'game=pinball')).body.all;assert.deepEqual(pins.map(r=>r.score),[4000,3500],'own row replaced');
 const worse=await play('pinball',1000,{initials:'GIL',replace:{id:better.body.id,claim:better.body.claim}});assert.equal(worse.body.ok,true);
 assert.equal((await call('top',undefined,{},'game=pinball')).body.all.length,3,'a lower score never replaces a better one');
 // Puzzles have no rate rule, only the ceiling and a short minimum.
 assert.equal((await play('puzzle',120,{initials:'HAL',seconds:9})).body.ok,true);
 // The file store: a second instance (another route bundle) sees the same rows.
 const again=ST.createMemoryBoardStore(FILE);assert.equal((await again.top('runner',L.weekOf(clock))).week.length,1);
 // Purge: keeps the best 50 of all time and the last two weeks.
 const p=ST.createMemoryBoardStore();for(let i=0;i<60;i++)await p.submit({game:'tennis',score:i+1,initials:'AAA',icon:'',nonce:i.toString(16).padStart(32,'0'),claimHash:null,replace:null,day:'2026-01-05',week:'2026-01-05'});
 assert.equal(p.data.rows.length,60,'each rising score made the top 10 as it was played');
 assert.deepEqual(await p.purge('2026-01-12'),{rows:0},'last week is kept');
 assert.deepEqual(await p.purge('2026-03-02'),{rows:10},'older weeks keep only the best 50');assert.equal(Math.min(...p.data.rows.map(r=>r.score)),11);
});

await ok('rate limit: per IP bucket, site-wide, start limiter',async()=>{
 clock=Date.parse('2026-10-21T10:00:00Z');const s=ST.createMemoryBoardStore(),d={store:s,secret:SECRET,now};
 const go=async ip=>{const t=(await SV.handleBoard('start',{body:'{"game":"tennis"}',headers:headers({'x-forwarded-for':ip})},d)).body.token;clock+=20_000;return SV.handleBoard('submit',{body:JSON.stringify({token:t,score:12,initials:'RAT'}),headers:headers({'x-forwarded-for':ip})},d);};
 const answers=[];for(let i=0;i<ST.BOARD_LIMITS.postPerIp+1;i++)answers.push((await go('198.51.100.9')).status);
 assert(answers.slice(0,ST.BOARD_LIMITS.postPerIp).every(x=>x===200),'within the hourly cap');assert.equal(answers.at(-1),429,'over the cap');
 assert.equal((await go('198.51.100.10')).status,200,'another network is not blocked');
 const limited={store:s,secret:SECRET,now,limiter:{allow:()=>false}};assert.equal((await SV.handleBoard('start',{body:'{"game":"tennis"}',headers:headers()},limited)).status,429,'start limiter');
 const {createLimiter}=require(path.join(ROOT,'lib/analytics/ingest.ts'));const lim=createLimiter({capacity:40,refillPerSec:0.2});const route=read('app/api/arcade-board/[action]/route.ts');
 assert(/createLimiter\(\{capacity:40,refillPerSec:0\.2\}\)/.test(route),'the route limits starts');let n=0;for(let i=0;i<50;i++)if(lim.allow('k',0))n++;assert.equal(n,40);
 const sql=read('supabase/migrations/20261013_arcade_leaderboards.sql');assert(/save_hit/.test(sql)&&/BOARD_LIMITS/.test(read('lib/arcade/leaderboardServer.ts')));
 assert.match(read('lib/arcade/leaderboardServer.ts'),/store\.hit\('b:'\+bucket,BOARD_LIMITS\.postPerIp,60,now\)/);
 assert(('b:'+SV.ipBucket('s'.repeat(64),'203.0.113.7')).length<=48,'fits save_throttle.bucket');
});

await ok('no PII stored',async()=>{
 const data=fs.readFileSync(FILE,'utf8'),json=JSON.parse(data);
 for(const bad of ['203.0.113.7','198.51.100','KidPhone','Safari','futbol.test'])assert(!data.includes(bad),'not stored: '+bad);
 for(const r of json.rows)assert.deepEqual(Object.keys(r).sort(),['claimHash','day','game','icon','id','initials','nonce','score','week'],'only these fields');
 assert(json.rows.every(r=>/^[A-Z]{3}$/.test(r.initials)&&/^\d{4}-\d{2}-\d{2}$/.test(r.day)&&(r.claimHash===null||/^[0-9a-f]{64}$/.test(r.claimHash))),'letters, a day and hashes only');
 assert(Object.keys(json.throttle).every(k=>/^b:(ip:[0-9a-f]{32}|global)\|\d+$/.test(k)),'throttle keys are salted hashes');
 // The claim travels back once and only its hash is kept; the token's signature isn't stored either.
 const t=await start('tennis');clock+=30_000;const r=await call('submit',{token:t,score:40,initials:'NED'});assert.equal(r.body.ok,true);
 const after=fs.readFileSync(FILE,'utf8');assert(!after.includes(r.body.claim),'claim not stored');assert(!after.includes(t.split('.').pop()),'token signature not stored');
 const src=read('lib/arcade/leaderboardServer.ts')+read('lib/arcade/leaderboardStore.ts')+read('app/api/arcade-board/[action]/route.ts');
 assert(!/console\./.test(src),'nothing logged');assert(!/user-agent/i.test(src),'no user agent read');
});

await ok('migration: self-check, idempotent, locked down, SQL = TypeScript twin',async()=>{
 const sql=read('supabase/migrations/20261013_arcade_leaderboards.sql'),code=sql.replace(/--.*$/gm,'');
 assert(!/\bdrop\b|\btruncate\b|\brename\b|alter table [^;]* drop/i.test(code),'additive');
 assert.match(sql.trim().split('\n').slice(-1)[0],/\) as missing\) x;$/,'ends with the self-check select');
 assert(/'OK, arcade leaderboards installed'/.test(sql));
 const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
 assert(files.indexOf('20261013_arcade_leaderboards.sql')>files.indexOf('20261010_game_saves.sql'),'runs after the save migration (save_hit, save_salt)');
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgb-')),port=String(40000+(process.pid+53)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(q,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+q],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(q,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${q}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const out=files.map(f=>runFile(path.join('supabase/migrations',f)));
  assert.equal(out[files.indexOf('20261013_arcade_leaderboards.sql')],'OK, arcade leaderboards installed','self-check row');
  assert.equal(out[files.indexOf('20261010_game_saves.sql')],'OK, game saves installed','the save migration still passes');
  const FILE_SQL='supabase/migrations/20261013_arcade_leaderboards.sql';
  assert.equal(runFile(FILE_SQL),'OK, arcade leaderboards installed','idempotent');
  for(const role of ['anon','authenticated']){
   assert.match(fails('select * from arcade_scores',role),/permission denied/,role+' table');
   for(const fn of [`board_top('runner','2026-10-12')`,`board_purge('2026-10-12')`,`board_submit('runner',5,'AAA','','${'a'.repeat(32)}',null,null,null,'2026-10-12','2026-10-12')`])assert.match(fails(`select ${fn}`,role),/permission denied/,`${role} ${fn}`);
  }
  assert.equal(psql(`select count(*) from pg_policies where tablename='arcade_scores'`),'0');assert.equal(psql(`select relrowsecurity from pg_class where relname='arcade_scores'`),'t');
  assert.deepEqual(psql(`select column_name from information_schema.columns where table_name='arcade_scores' order by ordinal_position`).split('\n'),['id','game','score','initials','icon','played_on','week','session_nonce','claim_hash'],'only these columns: no IP, device or name');
  // The table refuses what the API refuses.
  for(const bad of [`'runner',0,'AAA',''`,`'island',5,'AAA',''`,`'runner',5,'aaa',''`,`'runner',5,'AAAA',''`,`'runner',5,'AAA','🦁'`,`'runner',500000,'AAA',''`])
   assert.match(fails(`insert into arcade_scores (game,score,initials,icon,played_on,week,session_nonce) values (${bad},'2026-10-14','2026-10-12','${'b'.repeat(32)}')`,'service_role'),/violates check constraint/,bad);
  assert.match(fails(`insert into arcade_scores (game,score,initials,icon,played_on,week,session_nonce) values ('runner',5,'AAA','','2026-10-14','2026-10-13','${'c'.repeat(32)}')`,'service_role'),/check constraint/,'week must be a Monday');
  // A self-check that fails loudly, and re-running repairs it.
  psql('drop function public.board_submit(text, integer, text, text, text, text, bigint, text, date, date)');
  assert.match(psql(sql.slice(sql.lastIndexOf('select case when missing'))),/^NOT INSTALLED: board_submit$/);
  assert.equal(runFile(FILE_SQL),'OK, arcade leaderboards installed','re-running repairs it');
  // PostgREST stand-in: /rest/v1/rpc/<fn> with named JSON args → select to_json(fn(p => …)) as service_role.
  const lit=v=>v===null?'null':typeof v==='boolean'||typeof v==='number'?String(v):'$q$'+(typeof v==='string'?v:JSON.stringify(v))+'$q$';
  const pgFetch=async(url,init)=>{const fn=url.split('/').pop(),a=JSON.parse(init.body);
   try{const o=psql(`select to_json(${fn}(${Object.entries(a).map(([k,v])=>`${k} => ${lit(v)}`).join(', ')}))`,{role:'service_role'});return new Response(o||'null',{status:200});}
   catch(e){return new Response('{}',{status:/does not exist/.test(String(e.stderr))?404:400});}};
  const pg=ST.createSupabaseBoardStore('http://pg.local','service-key',pgFetch),mem=ST.createMemoryBoardStore();
  assert.equal(await pg.schemaVersion(),1);
  async function script(st){const o=[],n=i=>i.toString(16).padStart(32,'0'),W='2026-10-12',LW='2026-10-05',D='2026-10-14';
   const sub=(i,score,initials,week=W,extra={})=>st.submit({game:'runner',score,initials,icon:i%2?'lion':'',nonce:n(i),claimHash:null,replace:null,day:week===W?D:'2026-10-06',week,...extra});
   o.push(await sub(1,500,'AAA'),await sub(2,900,'BBB'),await sub(3,500,'CCC'),await sub(3,800,'DUP'));
   for(let i=10;i<20;i++)o.push(await sub(i,1000+i,'LST',LW));
   o.push(await sub(30,50,'LOW'),await sub(31,40,'OLD',LW));
   o.push(await sub(40,600,'OWN',W,{claimHash:'f'.repeat(64)}));
   const own=(await st.top('runner',W)).week.find(r=>r.initials==='OWN');
   o.push(await sub(41,650,'OWN',W,{claimHash:'e'.repeat(64),replace:{id:own.id,claimHash:'0'.repeat(64)}}));
   o.push(await sub(42,700,'OWN',W,{claimHash:'d'.repeat(64),replace:{id:own.id,claimHash:'f'.repeat(64)}}));
   const t=await st.top('runner',W);o.push({all:t.all.map(r=>[r.initials,r.icon,r.score,r.day]),week:t.week.map(r=>[r.initials,r.score])},await st.top('pinball',W));
   o.push(await st.purge('2026-11-30'),(await st.top('runner','2026-11-30')).all.length);
   return JSON.parse(JSON.stringify(o).replace(/"id":\d+/g,'"id":0'));}
  assert.deepEqual(await script(pg),await script(mem),'SQL = memory twin');
  // The rate limit reaches the save throttle functions.
  const day='2026-10-14';const salt=await pg.salt(day);assert.match(salt,/^[0-9a-f]{64}$/);assert.equal(await pg.salt(day),salt);
  assert.equal(await pg.hit('b:ip:'+'1'.repeat(32),2,60,new Date()),true);assert.equal(await pg.hit('b:ip:'+'1'.repeat(32),2,60,new Date()),true);assert.equal(await pg.hit('b:ip:'+'1'.repeat(32),2,60,new Date()),false);
  // Through the real handler on SQL: no IP or user agent anywhere.
  let c=Date.parse('2026-10-14T10:00:00Z');const d={store:pg,secret:SECRET,now:()=>new Date(c)};
  const tk=(await SV.handleBoard('start',{body:'{"game":"live"}',headers:headers()},d)).body.token;c+=120_000;
  const r=await SV.handleBoard('submit',{body:JSON.stringify({token:tk,score:740,initials:'MIA',icon:'fox'}),headers:headers()},d);assert.equal(r.body.ok,true,JSON.stringify(r.body));
  const everything=psql(`select coalesce(string_agg(t, ' '), '') from (select to_jsonb(a)::text t from arcade_scores a union all select to_jsonb(s)::text from save_throttle s union all select to_jsonb(x)::text from save_salts x) z`);
  for(const bad of ['203.0.113.7','KidPhone','futbol.test',r.body.claim])assert(!everything.includes(bad),'not in the database: '+bad);
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

await ok('wiring: lazy UI, no timers or polling, device key, route, npm test',()=>{
 assert(/node tests\/arcade-leaderboard\.cjs/.test(read('package.json')),'part of npm test');
 const S=require(path.join(ROOT,'lib/saves/snapshot.ts'));assert(S.DEVICE_KEYS.includes(L.LOCAL_BOARDS_KEY),'the device board never syncs');assert.equal(S.isSyncKey(L.LOCAL_BOARDS_KEY),false);
 for(const f of ['components/games/ArcadeGame3D.tsx','components/LiveArcadeMatch.tsx','components/games/PassPuzzleGame.tsx','components/ArcadeRoom.tsx']){const src=read(f);
  assert(!/^import [^;]*(HighScoreEntry|ArcadeBoards|BoardsPanel)/m.test(src),'board UI is never a static import: '+f);
  assert(/dynamic\(\(\)=>import\('\.{1,2}\/arcade\/ArcadeBoards'\)/.test(src),'lazy hall: '+f);}
 for(const f of ['components/games/ArcadeGame3D.tsx','components/LiveArcadeMatch.tsx','components/games/PassPuzzleGame.tsx'])assert(/beginBoardSession\('?\w*'?\)|beginBoardSession\(kind\)/.test(read(f))&&/HighScoreEntry/.test(read(f)),'session + high score: '+f);
 for(const f of ['lib/arcade/boardClient.ts','components/arcade/HighScoreEntry.tsx','components/arcade/BoardsPanel.tsx','components/arcade/ArcadeBoards.tsx','components/arcade/BoardTable.tsx'])
  assert(!/setInterval|setTimeout|requestAnimationFrame/.test(read(f)),'no timers or loops: '+f);
 assert(/\/top\?game=/.test(read('lib/arcade/boardClient.ts'))&&/20_000/.test(read('lib/arcade/boardClient.ts')),'boards fetched on open, reused briefly');
 assert(!/save-code|SAVE_CODE_KEY|pictureFor/.test(read('lib/arcade/boardClient.ts')+read('components/arcade/HighScoreEntry.tsx')),'the save code (and its pictures) never reach a board');
 assert(!/<input|<textarea|contentEditable/.test(read('components/arcade/HighScoreEntry.tsx')),'no free text: letter wheels only');
 assert(fs.existsSync('app/api/arcade-board/[action]/route.ts'));
 const css=read('components/arcade/Leaderboard.module.css');assert(/\.step\{[^}]*min-height:48px/.test(css)&&/\.icon\{[^}]*min-height:48px/.test(css),'big tap targets');
 assert(/boardsPurge|purgeBoards\(\)/.test(read('app/api/cron/analytics/route.ts')),'nightly purge');
});

fs.rmSync(tmp,{recursive:true,force:true});
console.log(failed?`\n${failed} FAILED`:`\narcade-leaderboard: all ${results.length} groups passed${skipped?` (${skipped} skipped)`:''}`);
process.exit(failed?1:0);
})();
