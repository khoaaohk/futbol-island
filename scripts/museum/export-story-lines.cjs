// Writes public/voice/museum/lines.json ({hash: line}) from lib/museum/museumStories.ts, for scripts/museum/kokoro-museum.py.
// usage: node scripts/museum/export-story-lines.cjs
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const S=require('../../lib/museum/museumStories.ts'),out=path.join(__dirname,'../../public/voice/museum/lines.json');
const lines=Object.fromEntries(S.storyLines().map(l=>[S.storyLineHash(l),l]));
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(lines,null,1)+'\n');
console.log(Object.keys(lines).length+' lines → '+path.relative(process.cwd(),out));
