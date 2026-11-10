// Island Strikers "Scan first" cue (Nov 10 2026, arcade part 3): a risky pass while a clearly safer teammate was open is named
// at the next dead ball, never during live play, never in the first minute, at most twice a match.
// Run: node -r ./scripts/test-ts-cache.cjs tests/striker-scan-cue.cjs
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const load=file=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});return m.exports;};
const M=load('lib/arcade/strikerMatch.ts'),C=load('lib/arcade/strikerCoach.ts');
// 1. Who was free, in football words (Gold attack +x, so left is -z).
assert.equal(M.scanMateWords(0,2,-8),'Your left winger was free.');
assert.equal(M.scanMateWords(0,2,8),'Your right winger was free.');
assert.equal(M.scanMateWords(0,9,0),'Your striker was free.');
assert.equal(M.scanMateWords(5,2,1),'Your teammate in the middle was free.');
// 2. Safer mate: open (> .6) and clearly more open than the receiver (+.3); never the receiver.
assert.equal(M.saferMate([.1,.9,.2],[0,1,2],0),1);
assert.equal(M.saferMate([.1,.9,.2],[0,1,2],1),-1,'the receiver itself was the open one');
assert.equal(M.saferMate([.5,.7,.2],[0,1,2],0),-1,'not clearly safer');
assert.equal(M.saferMate([.1,.5,.2],[0,1,2],0),-1,'nobody open');
// 3. The cue waits for a dead ball, skips minute one, caps at two, and leaves when play restarts.
const c=C.createScanCue(),s={time:30,goalPause:0,setPiece:{kind:''},finished:false,scanMissAt:-99,scanMissText:''};
const step=now=>C.stepScanCue(c,s,now);
s.scanMissAt=29;s.scanMissText='Your left winger was free.';s.goalPause=1;assert.equal(step(1),'','first minute: no cue');s.goalPause=0;step(1.1);
s.time=70;s.scanMissAt=68;assert.equal(step(2),'','live play: no cue');
s.goalPause=1.8;assert.equal(step(2.1),'Your left winger was free.','shown at the dead ball');
assert.equal(step(3),'Your left winger was free.','still up during the pause');
s.goalPause=0;assert.equal(step(3.1),'','gone when play restarts');
s.time=100;s.scanMissAt=90;s.setPiece.kind='corner';assert.equal(step(4),'','stale (> SCAN_CUE_FRESH s old): no cue');s.setPiece.kind='';step(4.1);
s.scanMissAt=99;s.setPiece.kind='corner';assert.equal(step(5),'Your left winger was free.');assert.equal(step(5+C.SCAN_CUE_SHOW),'','times out');s.setPiece.kind='';step(9);
s.time=130;s.scanMissAt=129;s.goalPause=1;assert.equal(step(10),'','two a match at most');assert.equal(c.shown,C.SCAN_CUE_MAX);
s.goalPause=0;s.time=2;step(11);assert.equal(c.shown,0,'a new match resets the cap');
// 4. Wiring: the match records it at the risky-pass count (no new AI), the HUD reuses the coach line.
const match=fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),view=fs.readFileSync('components/LiveArcadeMatch.tsx','utf8');
assert.match(match,/if\(laneCover\/2\.4>\.5\)\{state\.riskyPasses\+\+;.*saferMate\(state\.laneOpen,goldOutfield,target\.id\)/);
assert.doesNotMatch(match,/^import /m,'strikerMatch stays import-free');
assert.match(view,/className=\{`\$\{styles\.takeaway\} \$\{styles\.scanCue\}`\}[^>]*data-scan-cue><b>Scan first:<\/b> \{scanText\}/);
const m=M.createStrikerMatch?M.createStrikerMatch():null;if(m){assert.equal(m.state.scanMissAt,-99);m.state.scanMissAt=50;m.reset();assert.equal(m.state.scanMissAt,-99,'reset clears it');}
console.log('striker-scan-cue: ok');
