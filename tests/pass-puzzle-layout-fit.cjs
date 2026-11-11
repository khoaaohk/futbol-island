// Pass Puzzles: no piece under the controls (Nov 11 2026, owner on a tablet: "the puzzle game controls cover the players").
// Source pins: the camera fit reserves the tray's MEASURED box (never a fixed height), re-fits with a bounded eased glide, and the
// tray docks at the side on wide landscape screens. The browser proof is scripts/check-pass-puzzle-layout.cjs --port=<n>.
const assert=require('assert'),fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
const tsx=fs.readFileSync(path.join(root,'components/games/PassPuzzleGame.tsx'),'utf8'),css=fs.readFileSync(path.join(root,'components/games/PassPuzzleGame.module.css'),'utf8'),scene=fs.readFileSync(path.join(root,'lib/arcade/passPuzzleScene.ts'),'utf8');
assert.match(tsx,/<div ref=\{trayRef\} className=\{styles\.passControls\} data-pp-tray/,'the tray is observed (callback ref) and tagged');
assert.match(tsx,/const tray=root\.querySelector<HTMLElement>\('\[data-pp-tray\]'\)/,'measureRoom reads the tray element');
assert.match(tsx,/const b=tray\.getBoundingClientRect\(\),side=getComputedStyle\(tray\)\.getPropertyValue\('--pp-dock'\)/,'the fit uses the tray\'s real box and dock side');
assert.match(tsx,/scene\.fit\(room,smooth\)/,'measured room goes to the camera fit');
assert.match(tsx,/new ResizeObserver\(\(\)=>measureRoom\.current\(true\)\)/,'a tray size change (Shoot sliders, rotation) re-fits');
assert.match(tsx,/new ResizeObserver\(\(\)=>\{cancelDrawing\.current\(\);measureRoom\.current\(true\);\}\)/,'a canvas resize re-measures too');
assert.match(tsx,/data-endless-hud\],\.\$\{styles\.hintDock\}/,'the top bar, Endless chips and hint key are reserved at the top');
assert.match(scene,/export type FitRoom=\{top:number;bottom:number;left:number;right:number\}/,'the fit takes measured insets');
assert.match(scene,/bottom=R\?R\.bottom:/,'bottom room comes from the measured tray when known');
assert.match(scene,/left=R\?R\.left:0,right=R\?R\.right:0/,'side room for the side dock');
assert.match(scene,/view\.x=\(e\.x0\+e\.x1\)\/2\*w\/2\+\(right-left\)\/2/,'the play is centred in the free room');
assert.match(scene,/Each piece's footprint/,'feet rings and body width join the frame-up');
assert.match(scene,/let busy=stepGlide\(dt\)/,'the glide is stepped by update and ends (no loop)');
assert.match(scene,/if\(smooth&&was&&!stage\.reduced/,'instant under reduced motion');
assert.match(scene,/function layoutProbe\(\)/,'tests can read every piece\'s screen box');
assert.match(css,/orientation:landscape\)\{\n \.game \.passControls\{--pp-dock:side;/,'wide landscape screens dock the tray at the side');
assert.match(css,/min-width:700px\) and \(min-height:521px\) and \(orientation:portrait\)/,'upright tablets: compact bottom dock');
assert.match(css,/@media\(min-height:521px\)\{\.game \.lowOverlay>section>\.go\{position:sticky/,'the result card\'s main action never falls below a tablet\'s fold');
console.log('pass-puzzle layout fit: ok');
