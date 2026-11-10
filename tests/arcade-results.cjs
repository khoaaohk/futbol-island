// Arcade result adapters (Nov 10 2026, arcade audit part 1): lib/arcade/results/*. Run: node tests/arcade-results.cjs
// The game-over code of components/games/ArcadeGame3D.tsx moved into one adapter per game + settleArcadeResult with NO behaviour
// change. EXPECTED below was produced by running the OLD inline code (transcribed verbatim, before the refactor) on these end states:
// same coins and wallet line, same records, tier bests, board ids, board scores and storage keys.
// Deliberate changes since (each marked CHANGED): Warm-up / Night Derby / Storm Final post to their own boards (item 4).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const R=require('../lib/arcade/results/settle.ts'),Rec=require('../lib/arcade/arcadeRecords.ts'),Mo=require('../lib/arcade/runnerModes.ts');
const CASES=[
  {"name":"runner classic new best","kind":"runner","storage":{"fi2-arcade-record-runner-v1":"{\"best\":10000,\"unlocked\":3}","fi.game.runner.best":"9000"},"state":{"runner":{"mode":"classic","score":12345,"level":4,"goals":3,"collected":21}},"expect":{"coins":10,"reason":"Goals and collected footballs","record":{"best":12345,"unlocked":4},"boardScore":12345,"board":"runner","storage":{"fi.game.runner.best":"12345","fi2-arcade-record-runner-v1":"{\"best\":12345,\"unlocked\":4}"}}},
  {"name":"runner classic below best","kind":"runner","storage":{"fi2-arcade-record-runner-v1":"{\"best\":50000,\"unlocked\":6}","fi.game.runner.best":"50000"},"state":{"runner":{"mode":"classic","score":800.6,"level":9,"goals":0,"collected":4}},"expect":{"coins":0,"reason":"Goals and collected footballs","record":{"best":50000,"unlocked":6},"boardScore":800,"board":"runner","storage":{"fi.game.runner.best":"50000","fi2-arcade-record-runner-v1":"{\"best\":50000,\"unlocked\":6}"}}},
  {"name":"runner warm-up","kind":"runner","storage":{},"state":{"runner":{"mode":"warmup","score":4200,"level":2,"goals":2,"collected":12}},"expect":{"coins":6,"reason":"Goals and collected footballs","record":{"best":4200,"unlocked":2},"boardScore":4200,"board":"runner","storage":{"fi.game.runner.best":"4200","fi2-arcade-record-runner-v1":"{\"best\":4200,\"unlocked\":2}"}}},
  {"name":"runner night","kind":"runner","storage":{},"state":{"runner":{"mode":"night","score":23000,"level":5,"goals":5,"collected":30}},"expect":{"coins":12,"reason":"Goals and collected footballs","record":{"best":23000,"unlocked":5},"boardScore":23000,"board":"runner","storage":{"fi.game.runner.best":"23000","fi2-arcade-record-runner-v1":"{\"best\":23000,\"unlocked\":5}"}}},
  {"name":"runner storm zero","kind":"runner","storage":{},"state":{"runner":{"mode":"storm","score":0,"level":4,"goals":0,"collected":0}},"expect":{"coins":0,"reason":"Goals and collected footballs","record":{"best":0,"unlocked":4},"board":"runner","storage":{"fi2-arcade-record-runner-v1":"{\"best\":0,\"unlocked\":4}"}}},
  {"name":"runner cup final","kind":"runner","storage":{"fi2-arcade-record-runner-v1":"{\"best\":10000,\"unlocked\":3}"},"state":{"runner":{"mode":"cup","score":51000,"level":6,"goals":9,"collected":80}},"expect":{"coins":12,"reason":"Goals and collected footballs","boardScore":51000,"board":"cupfinal","storage":{"fi2-arcade-record-runner-v1":"{\"best\":10000,\"unlocked\":3}","fi2-runner-routes-v1":"{\"v\":1,\"mode\":\"warmup\",\"stars\":{\"warmup\":0,\"classic\":0,\"night\":0,\"storm\":0,\"cup\":0,\"legend\":0},\"played\":0,\"best\":{\"cup\":51000}}"}}},
  {"name":"runner legend","kind":"runner","storage":{},"state":{"runner":{"mode":"legend","score":77777,"level":6,"goals":40,"collected":400}},"expect":{"coins":12,"reason":"Goals and collected footballs","boardScore":77777,"board":"legend","storage":{"fi2-runner-routes-v1":"{\"v\":1,\"mode\":\"warmup\",\"stars\":{\"warmup\":0,\"classic\":0,\"night\":0,\"storm\":0,\"cup\":0,\"legend\":0},\"played\":0,\"best\":{\"legend\":77777}}"}}},
  {"name":"pinball classic best","kind":"pinball","storage":{"fi2-arcade-record-pinball-v1":"{\"best\":5000,\"unlocked\":2}"},"state":{"pinball":{"tier":0,"score":9000,"goals":4,"moves":3,"level":4,"table":{"stars":[0,0,0,1]}}},"expect":{"coins":15,"reason":"Goals and passing moves","pinballFresh":true,"record":{"best":9000,"unlocked":5},"boardScore":9000,"board":"pinball","storage":{"fi2-arcade-record-pinball-v1":"{\"best\":9000,\"unlocked\":5}"}}},
  {"name":"pinball classic lower","kind":"pinball","storage":{"fi2-arcade-record-pinball-v1":"{\"best\":20000,\"unlocked\":2}"},"state":{"pinball":{"tier":0,"score":9000,"goals":1,"moves":0,"level":2,"table":{"stars":[0,0,0,0]}}},"expect":{"coins":3,"reason":"Goals and passing moves","pinballFresh":false,"record":{"best":20000,"unlocked":2},"boardScore":9000,"board":"pinball","storage":{"fi2-arcade-record-pinball-v1":"{\"best\":20000,\"unlocked\":2}"}}},
  {"name":"pinball derby","kind":"pinball","storage":{},"state":{"pinball":{"tier":1,"score":30000,"goals":2,"moves":5,"level":1,"table":{"stars":[0,0,0,0]}}},"expect":{"coins":15,"reason":"Goals and passing moves","pinballFresh":true,"boardScore":30000,"board":"pinderby","storage":{"fi2-pinball-tiers-v1":"{\"derby\":{\"best\":30000,\"goals\":2},\"final\":{\"best\":0,\"goals\":0}}"}}},
  {"name":"pinball final zero","kind":"pinball","storage":{},"state":{"pinball":{"tier":2,"score":0,"goals":0,"moves":0,"level":1,"table":{"stars":[0,0,0,0]}}},"expect":{"coins":0,"reason":"Goals and passing moves","pinballFresh":false,"board":"pinfinal","storage":{"fi2-pinball-tiers-v1":"{\"derby\":{\"best\":0,\"goals\":0},\"final\":{\"best\":0,\"goals\":0}}"}}},
  {"name":"tennis classic win","kind":"tennis","storage":{"fi2-arcade-record-tennis-v1":"{\"best\":5,\"unlocked\":2}"},"state":{"tennis":{"tour":0,"bestRally":7,"level":2,"winner":"you","cleanReturns":10,"score":{"you":4},"tourScore":0}},"expect":{"coins":15,"reason":"Clean returns and points","newBest":true,"record":{"best":7,"unlocked":3},"boardScore":7,"board":"tennis","storage":{"fi2-arcade-record-tennis-v1":"{\"best\":7,\"unlocked\":3}"}}},
  {"name":"tennis classic loss top court","kind":"tennis","storage":{},"state":{"tennis":{"tour":0,"bestRally":3,"level":9,"winner":"cpu","cleanReturns":2,"score":{"you":1},"tourScore":0}},"expect":{"coins":2,"reason":"Clean returns and points","record":{"best":3,"unlocked":9},"boardScore":3,"board":"tennis","storage":{"fi2-arcade-record-tennis-v1":"{\"best\":3,\"unlocked\":9}"}}},
  {"name":"tennis pro tour","kind":"tennis","storage":{"fi2-arcade-record-tennis-pro-v1":"{\"best\":1000,\"unlocked\":1}"},"state":{"tennis":{"tour":1,"bestRally":12,"level":3,"winner":null,"cleanReturns":30,"score":{"you":6},"tourScore":3210}},"expect":{"coins":18,"reason":"Clean returns and points","tourBest":3210,"newBest":true,"boardScore":3210,"board":"tenpro","storage":{"fi2-arcade-record-tennis-pro-v1":"{\"best\":3210,\"unlocked\":1}"}}},
  {"name":"tennis legend tour","kind":"tennis","storage":{},"state":{"tennis":{"tour":2,"bestRally":2,"level":1,"winner":null,"cleanReturns":1,"score":{"you":0},"tourScore":450}},"expect":{"coins":0,"reason":"Clean returns and points","tourBest":450,"newBest":true,"boardScore":450,"board":"tenlgnd","storage":{"fi2-arcade-record-tennis-legend-v1":"{\"best\":450,\"unlocked\":1}"}}}
];
const CHANGED={'runner warm-up':{board:'runwarm'},'runner night':{board:'runnight'},'runner storm zero':{board:'runstorm'}};
for(const c of CASES){
 store.clear();for(const [k,v] of Object.entries(c.storage))store.set(k,v);Mo.resetRunnerRoutes();
 const log={};
 // The component's tennisOver (ArcadeGame3D.tsx), passed as the beforeRecord hook exactly as the component does.
 const tennisOver=t=>{if(t.tour){const id=t.tour===1?'tennis-pro':'tennis-legend',before=Rec.readArcadeRecord(id).best,next=Rec.saveArcadeRecord(id,t.tourScore).best;log.tourBest=next;if(t.tourScore>before)log.newBest=true;return;}
  const before=Rec.readArcadeRecord('tennis').best;if(before>0&&t.bestRally>before)log.newBest=true;};
 const res=R.arcadeResultFor(c.kind,c.state);
 const out=R.settleArcadeResult(res,{beforeRecord:()=>{if(c.kind==='tennis')tennisOver(c.state.tennis);}});
 const got={coins:res.coins,reason:res.coinReason,board:res.board,...log};
 if(c.kind==='pinball')got.pinballFresh=out.pinballFresh;if(out.record)got.record=out.record;if(out.boardScore!==null)got.boardScore=out.boardScore;
 got.storage=Object.fromEntries([...store.entries()].sort());
 const want={...c.expect,...CHANGED[c.name]};
 // CHANGED (Nov 10 2026): the routes save also keeps Daily Run stars (one more key, 0 for every old save).
 if(want.storage['fi2-runner-routes-v1'])want.storage={...want.storage,'fi2-runner-routes-v1':want.storage['fi2-runner-routes-v1'].replace('"legend":0}','"legend":0,"daily":0}')};
 assert.deepEqual(got,want,c.name);
 // Elite routes keep their own best in the routes save, exactly as before.
 if(c.kind==='runner'&&Mo.runnerKeepsOwnBest(c.state.runner.mode))assert.equal(Mo.runnerTierBest(c.state.runner.mode),c.state.runner.score,c.name+': tier best');
}
// The component uses the adapters (one place), not its old inline branches.
const g=fs.readFileSync('components/games/ArcadeGame3D.tsx','utf8');
assert(/settleArcadeResult\(/.test(g)&&/arcadeResultFor\(/.test(g),'ArcadeGame3D settles through the adapters');
assert(!/fi\.game\.runner\.best/.test(g)&&!/saveArcadeRecord\(kind,/.test(g),'no inline record code left in the component');
console.log('arcade results: '+CASES.length+' end states match the old game-over code');
