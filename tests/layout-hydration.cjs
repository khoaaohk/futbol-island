// <html> hydration (Oct 9 2026 QA): two pre-paint boot scripts write <html> attributes before React hydrates: IslandLoading's
// (components/islandLoadingBoot.ts → data-island-handoff, the title screen → game hand-off after a full reload) and `/`'s
// (lib/rootView.ts → data-root-view, title screen or game). So the root layout's <html> must carry suppressHydrationWarning, or
// dev logs "Extra attributes from the server" on every load of `/`.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const boot=/documentElement\.dataset\.islandHandoff=/.test(read('components/islandLoadingBoot.ts'));
const root=/documentElement\.dataset\.rootView=/.test(read('lib/rootView.ts'))&&/ROOT_VIEW_BOOT/.test(read('app/page.tsx'));
assert(boot&&root,'both boot scripts are where this test expects them');
assert.match(read('app/layout.tsx'),/<html lang="en" suppressHydrationWarning>/,'root <html> tolerates the pre-hydration attributes');
console.log('PASS layout hydration: <html> tolerates the pre-paint hand-off and root-view attributes');
