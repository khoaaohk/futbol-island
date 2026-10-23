const assert=require('assert'),fs=require('fs'),path=require('path'),ts=require('typescript');
const src=fs.readFileSync(path.join(__dirname,'..','lib/town/coinFormat.ts'),'utf8');
const m={exports:{}};new Function('module','exports',ts.transpileModule(src,{compilerOptions:{module:'commonjs',target:'es2020'}}).outputText)(m,m.exports);
const {shortCoins}=m.exports;
for(const [n,e] of [[0,'0'],[240,'240'],[999,'999'],[1000,'1k'],[1099,'1k'],[1100,'1.1k'],[1250,'1.2k'],[9999,'9.9k'],[10000,'10k'],[12500,'12k'],[123456,'123k'],[999999,'999k'],[1000000,'1M'],[1250000,'1.2M'],[-5,'0'],[NaN,'0']])assert.equal(shortCoins(n),e,`${n} -> ${e}`);
// never shows more than you have, and at most 4 characters from 1,000 up
for(let n=1000;n<5_000_000;n+=137){const s=shortCoins(n),v=parseFloat(s)*(s.endsWith('M')?1e6:1e3);assert(v<=n,`${s} <= ${n}`);assert(s.length<=4,`${s} fits 4 chars`);}
const jobs=fs.readFileSync(path.join(__dirname,'..','components/IslandJobs.tsx'),'utf8'),css=fs.readFileSync(path.join(__dirname,'..','components/IslandJobs.module.css'),'utf8');
assert.match(jobs,/aria-label=\{`Your island pocket: \$\{wallet\.balance\} coins/,'the full balance stays in the aria-label');
assert.match(jobs,/styles\.coinShort[^>]*aria-hidden="true">\{shortCoins\(wallet\.balance\)\}/);
assert.match(css,/\.coinShort\{display:none\}/,'desktop keeps the full number');
assert.match(css,/\(max-device-width:480px\)\{\.wallet\[data-job-wallet\] \.coinFull\{display:none\}\.wallet\[data-job-wallet\] \.coinShort\{display:inline\}\}/,'phones show the short number');
assert.match(css,/@media\(max-width:660px\),\(max-height:480px\) and \(orientation:landscape\),\(max-device-width:480px\)\{\.wallet\[data-job-wallet\] \.coinFull\{display:none\}/,'narrow windows (HUD_NARROW 660 px, the stretched bar) show the short number too');
console.log('coin-format ok');
