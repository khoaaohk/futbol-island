#!/usr/bin/env node
// Play-now posters (Nov 22 2026, lib/site/gamePlay.ts): the first screen of every game page and the /games quick-play grid show the
// game's first real screenshots small. Their full-size files are 22-64 KB each at 480 px; these copies are the top of each phone
// still (480x760, the part with the play area) at 360 px, or a wide still at 720 px, WebP q72, in public/games/play/<same name>.
// Needs cwebp and ffprobe (Homebrew). Re-run after a game's shots change; tests/seo-games-playnow.cjs checks every poster exists.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),{execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id);}
function load(file){if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const m={default:JSON.parse(fs.readFileSync(file,'utf8'))};loaded.set(file,m);return m;}
 const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,
  {module:m,exports:m.exports,URL,Date,Math,JSON,Intl,console,process:{env:{}},require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const P=load(path.join(ROOT,'lib/site/gamePlay.ts'));
let made=0;
for(const src of P.allPosterSources()){
 const from=path.join(ROOT,'public',src),to=path.join(ROOT,'public',P.posterPath(src));
 if(fs.existsSync(to)&&fs.statSync(to).mtimeMs>=fs.statSync(from).mtimeMs)continue;
 fs.mkdirSync(path.dirname(to),{recursive:true});
 const [w,h]=execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',from]).toString().trim().split(',').map(Number);
 const args=w>h?['-resize','720','0']:['-crop','0','0',String(w),String(Math.min(h,Math.round(w*760/480))),'-resize','360','0'];
 execFileSync('cwebp',['-quiet','-q','72',...args,from,'-o',to]);made++;
}
console.log(`play posters: ${made} made, ${P.allPosterSources().length} in all`);
