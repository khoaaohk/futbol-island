// The playing-time planner's scheduler (lib/site/tools/rotation.ts; /tools/soccer-playing-time-calculator, Nov 10 2026).
// A pure function, so everything is checked here with no browser:
//  1. Shape of a plan: the field is full in every block, nobody twice, block times join up, minutes add up.
//  2. Fairness: every rotating player's block count is within ONE of the others, over a grid of squad sizes, formats,
//     periods and intervals, with the goalkeeper fixed and rotating.
//  3. Nobody sits out two blocks in a row when there are places to avoid it.
//  4. Edge cases: exactly enough players, one substitute, 14 players in 7v7, goalkeeper fixed vs rotating, a huge squad.
//  5. Input cleaning, block lengths, the text for a team chat and the link code (round trip, garbage in).
// usage: node tests/tools-rotation.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');
const src=ts.transpileModule(fs.readFileSync(path.join(root,'lib/site/tools/rotation.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const R={};new Function('exports','require',src)(R,require);
assert(!/Math\.random|Date\.now|new Date|fetch\(|localStorage|window\./.test(fs.readFileSync(path.join(root,'lib/site/tools/rotation.ts'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'')),'the scheduler is pure: no randomness, clock, network or browser state');
const plan=(players,onField,o={})=>R.planRotation({players,onField,periods:2,periodMin:25,subEvery:5,keeperRotates:false,...o});
const doubleSits=r=>{let n=0;for(let b=1;b<r.blocks.length;b++)for(const p of r.blocks[b].off)if(r.blocks[b-1].off.includes(p))n++;return n;};
function shape(r,where){
 const {players:P,onField:F,periods,periodMin}=r.input;
 assert.equal(r.blocks.length,periods*r.blocksPerPeriod,`${where}: blocks`);
 r.blocks.forEach((b,n)=>{
  assert.equal(b.on.length,F,`${where}: block ${n} is full`);assert.equal(new Set(b.on).size,F,`${where}: block ${n} has nobody twice`);
  assert(b.on.includes(b.keeper),`${where}: the keeper is on`);assert.equal(b.on.length+b.off.length,P,`${where}: on + off = squad`);
  assert(b.on.every(p=>p>=0&&p<P&&!b.off.includes(p)),`${where}: on and off do not overlap`);
  const first=n%r.blocksPerPeriod===0;assert.equal(b.start,first?0:r.blocks[n-1].end,`${where}: block ${n} starts where the last ended`);
  assert.equal(b.end-b.start,b.minutes);if(n%r.blocksPerPeriod===r.blocksPerPeriod-1)assert.equal(b.end,periodMin,`${where}: the period is ${periodMin} min`);
  if(n>0)assert.deepEqual(b.comingOn,b.on.filter(p=>!r.blocks[n-1].on.includes(p)),`${where}: who comes on`);});
 assert.equal(r.minutes.reduce((a,m)=>a+m,0),F*periods*periodMin,`${where}: minutes add up to every place for the whole game`);
 r.counts.forEach((c,p)=>assert.equal(c,r.blocks.filter(b=>b.on.includes(p)).length,`${where}: count of player ${p}`));
 assert.equal(r.names.length,P);
}
const spread=xs=>xs.length?Math.max(...xs)-Math.min(...xs):0;

// ---- 4. edge cases, by hand -------------------------------------------------------------------------------------------------
{const r=plan(7,7);shape(r,'exactly enough');assert(r.blocks.every(b=>b.off.length===0),'7 players in 7v7: nobody sits');assert(r.minutes.every(m=>m===50),'everyone plays the whole game');}
{const r=plan(7,7,{keeperRotates:true});shape(r,'exactly enough, rotating keeper');assert(r.minutes.every(m=>m===50));assert.notEqual(r.blocks[0].keeper,r.blocks[5].keeper,'a new keeper in the second half');}
for(const keeperRotates of [false,true]){const r=plan(8,7,{keeperRotates}),w=`one sub (keeper ${keeperRotates?'rotates':'fixed'})`;shape(r,w);
 assert(r.blocks.every(b=>b.off.length===1),`${w}: one player off in each block`);assert.equal(doubleSits(r),0,`${w}: nobody sits twice in a row`);
 assert(spread(keeperRotates?r.counts:r.counts.slice(1))<=1,`${w}: within one block`);
 if(!keeperRotates){assert.equal(r.counts[0],10,'the fixed keeper plays every block');assert(r.blocks.every(b=>b.keeper===0));assert(new Set(r.blocks.flatMap(b=>b.off)).size===7,'every outfield player takes a turn off');}}
{const r=plan(14,7,{keeperRotates:true});shape(r,'14 in 7v7');assert(r.counts.every(c=>c===5),'14 players in 7v7, ten blocks: five blocks each');assert(r.minutes.every(m=>m===25),'exactly half the game each');
 assert.equal(new Set(r.blocks.slice(0,5).map(b=>b.keeper)).size,1,'one keeper for the whole first half');assert.equal(r.fairShare,25);}
{const r=plan(14,7);shape(r,'14 in 7v7, fixed keeper');assert.equal(r.counts[0],10);assert(spread(r.counts.slice(1))<=1);assert.deepEqual([...new Set(r.counts.slice(1))].sort(),[4,5],'thirteen players share sixty places: four or five blocks');}
{const r=plan(10,7,{keeperRotates:true});shape(r,'10 in 7v7');assert(r.counts.every(c=>c===7),'the page says: ten players in 7v7 are on for seven blocks each');assert.equal(doubleSits(r),0,'and nobody sits out twice in a row');}
{const r=R.planRotation({players:12,onField:9,periods:2,periodMin:30,subEvery:10,keeperRotates:true});shape(r,'12 in 9v9');assert.deepEqual([...new Set(r.counts)].sort(),[4,5],'the page says: four or five blocks of six');}
{const r=plan(20,7,{keeperRotates:true});shape(r,'huge squad');assert(spread(r.counts)<=1,'20 in 7v7: still within one block');
 const stints=[];for(const b of r.blocks){if(!stints.length||stints[stints.length-1][0]!==b.keeper)stints.push([b.keeper,0]);stints[stints.length-1][1]++;}
 assert(stints.every(s=>s[1]<=Math.max(...r.counts)),'a keeper stint is never more than a fair share');assert(stints.length>2,'so the keeper changes inside a half');}
{const r=plan(5,5,{periods:1,periodMin:20,subEvery:20});shape(r,'one block');assert.equal(r.blocks.length,1);}
assert.deepEqual(plan(11,7,{keeperRotates:true}),plan(11,7,{keeperRotates:true}),'the same input gives the same plan');
{const r=plan(9,7,{names:['Ava','Ben']});assert.deepEqual(r.names.slice(0,3),['Ava','Ben','Player 3'],'missing names are numbered');}

// ---- 2 + 3. the grid --------------------------------------------------------------------------------------------------------
let cases=0;
for(const F of [5,7,9,11])for(let P=F;P<=Math.min(R.MAX_PLAYERS,2*F+3);P++)for(const periods of [1,2,4])for(const bpp of [1,2,3,5])for(const keeperRotates of [false,true]){
 const r=R.planRotation({players:P,onField:F,periods,periodMin:bpp*6,subEvery:6,keeperRotates}),w=`${P} players, ${F} on, ${periods}x${bpp} blocks, keeper ${keeperRotates?'rotates':'fixed'}`;cases++;
 shape(r,w);
 assert(spread(keeperRotates?r.counts:r.counts.slice(1))<=1,`${w}: everyone within one block of equal (${r.counts.join(' ')})`);
 if(!keeperRotates){assert.equal(r.counts[0],r.blocks.length,`${w}: the fixed keeper plays it all`);if(P-1<=2*(F-1))assert.equal(doubleSits(r),0,`${w}: nobody sits out twice in a row`);}
 else if(P-F<=(F-1)/2-1)assert.equal(doubleSits(r),0,`${w}: nobody sits out twice in a row`);
 if(keeperRotates&&periods>1&&P>1)assert(new Set(r.blocks.map(b=>b.keeper)).size>1,`${w}: the keeper changes`);
}

// ---- 5. cleaning, block lengths, text, link code ---------------------------------------------------------------------------
assert.deepEqual(R.blockLengths(25,5),[5,5,5,5,5]);assert.deepEqual(R.blockLengths(25,8),[8,8,9]);assert.deepEqual(R.blockLengths(30,7),[7,7,8,8]);assert.deepEqual(R.blockLengths(10,20),[10]);assert.deepEqual(R.blockLengths(12,1).length,12);
{const c=R.cleanInput({players:4,onField:7,periods:99,periodMin:-3,subEvery:'x',keeperRotates:1,names:['  <b>Ava</b>  ','x'.repeat(80)]});
 assert.equal(c.onField,4,'never more on the field than players');assert.equal(c.periods,6);assert.equal(c.periodMin,1);assert.equal(c.subEvery,1);assert.equal(c.keeperRotates,true);
 assert.equal(c.names[0],'b Ava /b','angle brackets never survive');assert.equal(c.names[1].length,24);
 assert.equal(R.cleanInput({players:1e9}).players,R.MAX_PLAYERS);assert.equal(R.cleanInput({}).players,10,'defaults');}
{const r=plan(9,7,{names:['Ava','Ben','Cal','Dee','Eli','Fay','Gus','Hal','Ivy']}),t=R.rotationText(r,'Blue Sharks');
 assert(t.startsWith('Blue Sharks: playing time plan'));for(const n of r.names)assert(t.includes(n),`text names ${n}`);
 assert(/1ST HALF[\s\S]*2ND HALF[\s\S]*MINUTES/.test(t)&&/0-5 min: GK Ava \|/.test(t)&&/Off: /.test(t),'periods, blocks and minutes');assert(t.includes('futbolisland.app/tools/soccer-playing-time-calculator'),'the text points back');
 assert.equal(R.periodName(1,2),'2nd half');assert.equal(R.periodName(3,4),'Quarter 4');}
{const s={players:11,onField:7,periods:4,periodMin:12,subEvery:6,keeperRotates:true,team:'Tiburones ⚽',names:['Zoë','José','李']},code=R.encodePlan(s),back=R.decodePlan(code);
 assert(/^[A-Za-z0-9_-]+$/.test(code),'the code is URL-fragment safe');assert.deepEqual(back,s,'a plan survives the link, accents and all');
 for(const bad of ['','%%%','e30','W10',R.base64url.encode('[2,1,1]'),R.base64url.encode('{"a":1}')])assert.equal(R.decodePlan(bad),null,`garbage link ${JSON.stringify(bad)}`);
 const big=R.decodePlan(R.base64url.encode(JSON.stringify([1,999,999,999,999,999,1,'<script>',['<img>']])));assert.equal(big.players,R.MAX_PLAYERS);assert(!/[<>]/.test(big.team+big.names.join('')),'a hostile link is cleaned');}
console.log(`tools-rotation: ok (${cases} grid cases)`);
