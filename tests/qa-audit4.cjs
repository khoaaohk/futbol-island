// QA audit 4 (Oct 26 2026, docs/QA_AUDIT4_OCT26.md): regression checks for the fixes from the headless play-test round.
// usage: node tests/qa-audit4.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');

// #1 Summit Kick high score: the board dialog mounts inside the click-through Summit HUD (.hud{pointer-events:none}); a top-layer
// <dialog> still inherits pointer-events from its DOM parent, so Save / Skip could not be tapped and the round was stuck behind it.
{
 const hud=read('components/SummitActivities.module.css'),kick=read('components/SummitKickHud.tsx'),board=read('components/arcade/Leaderboard.module.css');
 assert.match(hud,/\.hud\{[^}]*pointer-events:none/,'the Summit HUD is click-through (the reason for the fix)');
 assert.ok(kick.indexOf('<HighScoreEntry')>kick.indexOf('data-summit-kick-hud'),'the high-score entry renders inside that HUD');
 const dialog=board.slice(board.indexOf('.dialog{'),board.indexOf('}',board.indexOf('.dialog{')));
 assert.match(dialog,/pointer-events:auto/,'the board dialog takes taps whatever its host');
}
// #3 Jersey studio, phone and tablet: the Front/Back chips sat half under the resizable sheet (it overlaps the stage by 22 + 26 px).
{
 const css=read('components/shop/JerseyStudio.module.css'),m=css.match(/\.stageWrap>\[data-studio-bottom\]\{bottom:(\d+)px\}/);
 assert.ok(m,'the jersey chips have their own lift');assert.ok(Number(m[1])>=22+26+8,`chips ${m[1]}px up clear the 48px the sheet laps over the stage`);
 assert.match(read('components/shop/StudioControls.module.css'),/\.sheetResizable\.sheetResizable\{margin-top:-26px;/,'the sheet still laps 26px (re-check the lift if this changes)');
 assert.match(css,/\.stage\{position:absolute;inset:0 0 22px;/,'the stage still runs 22px under');
}
console.log('qa-audit4 ok');
