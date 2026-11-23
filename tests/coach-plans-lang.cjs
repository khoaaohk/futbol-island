// The coach app's practice plans in the ten app languages (round 4F, Nov 22 2026; lib/coach/plansData.ts, lib/coach/plans/*.json).
//  1. Every plan and drill key of the English pack exists in each of the eight translation files, nothing extra, no empty string.
//  2. Nothing left in English (beyond a short allowlist), no yards, the coach-app glossary words (keeper, coach) used, one word per
//     plan stage, and a plan row that names a drill uses that drill's translated name.
//  3. Served per language on demand (one static file each), the "Plan text in English" note only when a language has no file.
// usage: node tests/coach-plans-lang.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(/\.css$/.test(id))return {};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
process.chdir(root);
const P=load(path.join(root,'lib/coach/plansData.ts')),A=load(path.join(root,'lib/i18n/appLangs.ts'));
const all=P.coachPlans(),en=all.en,keys=P.planKeys(en),K=Object.keys(keys);
ok(K.length>800&&en.plans.length>=12&&Object.keys(en.drills).length>=30,'the English pack: plans, drills and their strings');
ok(JSON.stringify(P.PLAN_TEXT_LANGS)===JSON.stringify(A.APP_LANGS.filter(l=>l!=='en'&&l!=='es')),'the eight languages after EN/ES');
// English words a translation may keep (formats, ages, letters, numbers, game words that are the same in many languages)
const SAME=/^(?:[\d\s.,:;x×/–-]+|U\d+|\d+v\d+.*|[A-Z]{1,2}|OK|Rondo|Futsal|Stop!?)$/i;
const KEEPER={pt:/goleir/i,fr:/gardien/i,de:/Torwart|Torhüter/i,it:/portier/i,nl:/keeper/i,pl:/bramkar/i,fi:/maalivah/i,ja:/キーパー|GK/};
const COACH={pt:/técnic|treinador/i,fr:/coach|entraîneu|éducat/i,de:/Trainer/i,it:/allenator|mister/i,nl:/trainer/i,pl:/trener/i,fi:/valmentaj/i,ja:/コーチ/};
for(const l of P.PLAN_TEXT_LANGS){
 const f=`lib/coach/plans/${l}.json`;ok(fs.existsSync(path.join(root,f)),`${f} exists`);
 const t=JSON.parse(read(f)),tk=Object.keys(t);
 const missing=K.filter(k=>!(k in t)),extra=tk.filter(k=>!(k in keys)),empty=tk.filter(k=>typeof t[k]!=='string'||!t[k].trim());
 ok(!missing.length,`${l}: missing keys ${missing.slice(0,5).join(', ')}`);ok(!extra.length,`${l}: extra keys ${extra.slice(0,5).join(', ')}`);ok(!empty.length,`${l}: empty ${empty.slice(0,5).join(', ')}`);
 const same=K.filter(k=>t[k]===keys[k]&&!SAME.test(keys[k].trim()));
 ok(same.length<=3,`${l}: left in English: ${same.slice(0,6).map(k=>`${k}=${keys[k]}`).join(' | ')}`);
 const text=tk.map(k=>t[k]).join('\n');
 ok(!/(?<![\p{L}])yards?(?![\p{L}])|\d\s*yd\b/iu.test(text)&&(l!=='ja'||!/ヤード/.test(text)),`${l}: metres, not yards`);
 ok(KEEPER[l].test(text),`${l}: the app's keeper word`);ok(COACH[l].test(text),`${l}: the app's coach word`);
 const stage={};for(const k of K.filter(k=>k.endsWith('.stage'))){(stage[keys[k]]??=new Set()).add(t[k]);}
 for(const [s,v] of Object.entries(stage))ok(v.size===1,`${l}: one word for the stage "${s}" (${[...v].join(' / ')})`);
 const pack=all[l];ok(!pack.en&&pack.plans.length===en.plans.length,`${l}: a translated pack, no English note`);
 for(const p of pack.plans)p.rows.forEach((r,i)=>{const er=en.plans.find(x=>x.slug===p.slug).rows[i];
  if(r.drill&&er.activity===en.drills[r.drill].name)ok(r.activity===pack.drills[r.drill].name,`${l}: ${p.slug} row ${i} names the drill as the drill card does`);});
 ok(Object.values(pack.drills).every(d=>d.scene.dots.length===en.drills[d.slug].scene.dots.length),`${l}: diagrams unchanged`);
}
ok(all.es.plans.every(p=>!/yards/.test(p.field)),'es: the field line in Spanish too');
// a language without a file falls back to English, flagged for the note
const route=read('app/coach/plans-data/[lang]/route.ts'),tool=read('components/coach/PlansTool.tsx');
ok(/generateStaticParams=\(\)=>APP_LANGS\.map/.test(route)&&/dynamicParams=false/.test(route)&&/force-static/.test(route),'one static JSON file per language, nothing else');
ok(/plans-data\/\$\{lang\}\?v=/.test(tool)&&/data\.en&&p\.lang!=='en'/.test(tool)&&/en&&lang!=='en'/.test(tool),'fetched on demand per language; the English note only for a language without plans');
ok(/catch\{return null;\}/.test(read('lib/coach/plansData.ts'))&&/\{\.\.\.en,en:true\}/.test(read('lib/coach/plansData.ts')),'a missing file means the English plans with the note; a missing string falls back to English');
console.log(`coach-plans-lang: ${checks} checks passed`);
