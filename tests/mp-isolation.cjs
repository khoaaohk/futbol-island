// Multiplayer isolation (Task F): multiplayer code never imports saves/analytics/deviceMarks, never names the save keys,
// and multiplayer/** never touches localStorage. Pure regex scan of source files. No network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..');
function walk(rel){const abs=path.join(ROOT,rel);if(!fs.existsSync(abs))return[];const st=fs.statSync(abs);if(st.isFile())return[abs];
  return fs.readdirSync(abs).flatMap(f=>{if(f==='node_modules')return[];return walk(path.join(rel,f));});}
const rel=f=>path.relative(ROOT,f);
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const list=[...walk('lib/multiplayer'),...walk('components/party'),...walk('multiplayer'),...walk('lib/graphics/remoteAvatars.ts')]
  .filter(f=>/\.(ts|tsx|js|mjs|cjs)$/.test(f));
t('scan set is not empty',()=>assert.ok(list.length>0));
const importRe=/(?:import[^'"`]*from\s*|import\s*\(\s*|require\s*\(\s*)['"`]([^'"`]+)['"`]/g;
const banned=/(lib\/saves|lib\/analytics|deviceMarks)/;
for(const f of list){
  const src=fs.readFileSync(f,'utf8');
  t(`no banned import in ${rel(f)}`,()=>{
    for(const m of src.matchAll(importRe))assert.ok(!banned.test(m[1]),`${rel(f)} imports ${m[1]}`);
  });
  t(`no save key in ${rel(f)}`,()=>{
    assert.ok(!/fi2-install-v1|fi2-save-code-v1/.test(src),`${rel(f)} names a save key`);
  });
  if(rel(f).startsWith('multiplayer'+path.sep)||rel(f).startsWith('multiplayer/'))
    t(`no localStorage in ${rel(f)}`,()=>assert.ok(!/localStorage/.test(src),`${rel(f)} uses localStorage`));
}
console.log(`mp-isolation: ${n} checks passed over ${list.length} files`);
