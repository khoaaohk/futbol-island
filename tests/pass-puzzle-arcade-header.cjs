// Pass Puzzles header in short landscape (Oct 9 2026 QA): ArcadeGame3D.module.css hides every `.header>div` at
// max-height:520px (the shared arcade title block). PassPuzzleGame's Puzzles + hint strip is a div in that same header, so it
// vanished on 844×390 phones. This pins the override and the markup it relies on. Browser check: scratchpad puzzle-landscape.cjs.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const arcadeCss=read('components/games/ArcadeGame3D.module.css'),puzzleCss=read('components/games/PassPuzzleGame.module.css'),tsx=read('components/games/PassPuzzleGame.tsx');
// Media blocks (one level of nesting is all these files use).
const blocks=css=>{const out=[];const re=/@media([^{]+)\{((?:[^{}]|\{[^{}]*\})*)\}/g;let m;while((m=re.exec(css)))out.push({q:m[1].replace(/\s+/g,''),body:m[2]});return out;};
const short=q=>/max-height:(\d+)px/.test(q)&&Number(q.match(/max-height:(\d+)px/)[1])>=390;
const hidesDivs=blocks(arcadeCss).some(b=>short(b.q)&&/\.header>div\{[^}]*display:none/.test(b.body));
// The navigation strip is a direct div child of the arcade header.
assert.match(tsx,/<header className=\{`\$\{arcade\.header\} \$\{styles\.header\}`\}>[\s\S]*?<div className=\{styles\.navigation\}>[\s\S]*?Puzzles<\/button>[\s\S]*?cycleHint[\s\S]*?<\/header>/,'Puzzles + hint live in a div inside the arcade header');
if(hidesDivs){
 const shows=blocks(puzzleCss).some(b=>short(b.q)&&/\.header>\.navigation\{[^}]*display:flex/.test(b.body));
 assert.ok(shows,'PassPuzzleGame.module.css must re-show .header>.navigation in short landscape (ArcadeGame3D hides .header>div)');
 // Specificity: .header>.navigation (0,2,0) beats .header>div (0,1,1) whatever order the CSS modules load in.
}
console.log('PASS pass-puzzle header: Puzzles + hint stay visible in short landscape'+(hidesDivs?' (override of the arcade .header>div rule present)':''));
