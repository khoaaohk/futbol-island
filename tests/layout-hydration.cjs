// <html> hydration (Oct 9 2026 QA): IslandLoading's pre-paint boot script writes <html data-island-handoff> (the /start →
// game hand-off after a full reload) before React hydrates, so the root layout's <html> must carry suppressHydrationWarning,
// or dev logs "Extra attributes from the server: data-island-handoff" on every restored-save entry.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const boot=/documentElement\.dataset\.islandHandoff=/.test(read('components/IslandLoading.tsx'));
if(boot)assert.match(read('app/layout.tsx'),/<html lang="en" suppressHydrationWarning>/,'root <html> tolerates the pre-hydration handoff attribute');
console.log('PASS layout hydration: <html> tolerates the pre-paint island hand-off attribute'+(boot?'':' (no boot script found)'));
