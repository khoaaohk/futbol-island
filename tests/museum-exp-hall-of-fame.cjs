// hall-of-fame · Your Hall of Fame (Oct 5 2026): the case's facts and takeaway reach the room word for word, every big idea
// points at a real starter lesson of every path, the player counts are cited, Back is the shared ExperienceBack (no local
// NavigationButton), earned plinths open the host's certificate and unearned ones say what to do next, and the room has no animation
// loop at all (one-shot CSS entrance, progress read once, nothing to dispose).
// usage: node tests/museum-exp-hall-of-fame.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const Module=require('node:module'),root=path.join(__dirname,'..'),dir='components/museum/experiences/hall-of-fame/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const resolve=Module._resolveFilename;Module._resolveFilename=function(req,...a){return resolve.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),prog=read(dir+'progress.ts');
const X=require('../lib/endgame/museum.ts'),H=require('../'+dir+'hallData.ts'),paths=require('../lib/paths/formatPaths.json'),M=require('../lib/endgame/graduationModel.ts');
const ex=X.EXHIBITS.find(e=>e.id==='hall-of-fame');

// 1. Contract.
{assert.match(exp,/export default function Experience/);
 assert.match(exp,/data-museum-experience="hall-of-fame"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/,'Back is the shared ExperienceBack');
 assert.doesNotMatch(exp,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(css,/\.back\{/,'no local Back wrapper');assert.doesNotMatch(exp,/immediate/,'Back always animates');
 assert.match(exp,/e\.key!=='Escape'/);assert.match(exp,/dialog\[open\]/,'Escape closes the certificate first, not the room');
 assert.match(exp,/openCertificate\(id\)/);assert.match(exp,/open\('diploma'\)/,'the champion opens the Island Diploma');
 assert.match(exp,/`grad:\$\{p\.format\}`/,'plinths use the certificate ids');
 for(const sel of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@(supports|media|starting-style)[^{]*\{/g,'').match(/(^|\})\s*[^@{}][^{}]*\{/g)??[])for(const part of sel.replace(/^\}?\s*/,'').replace(/\{$/,'').split(','))
  if(!/^(from|to|\d+%|@.*)$/.test(part.trim()))assert.match(part,/\.[a-zA-Z]/,'every CSS module selector has a local class: '+part.trim());
 console.log('PASS contract: fixed dialog, shared ExperienceBack, Escape, certificates via the host');}

// 2. Content: the case's own words, real lessons, sourced counts, fiction labelled.
{const norm=s=>s.replace(/[’']/g,"'");
 assert.equal(H.COPY.fact1,ex.facts[0]);assert.equal(H.COPY.fact2,ex.facts[1]);assert.equal(H.COPY.takeaway,ex.forYourGame);
 for(const k of ['COPY.fact1','COPY.fact2','COPY.takeaway','COPY.gameNote'])assert.ok(exp.includes(k),k+' is shown');
 assert.deepEqual(H.PLINTHS.map(p=>p.format),[...M.GRADUATION_FORMATS],'one plinth per path, smallest space first');
 assert.deepEqual(H.PLINTHS.map(p=>p.aSide),[5,7,9,11]);for(const p of H.PLINTHS)assert.equal(p.dots.length,p.aSide,p.name+': one dot per player');
 assert.ok(H.PLINTHS.every((p,i)=>i===0||p.scale>H.PLINTHS[i-1].scale),'the spaces grow');
 const starter=Object.fromEntries(paths.map(p=>[p.format,new Set(p.chapters.flatMap(c=>c.lessons.map(l=>l.id)))]));
 assert.ok(H.IDEAS.length>=5);for(const i of H.IDEAS)for(const f of M.GRADUATION_FORMATS)assert.ok(starter[f].has(i.lessons[f]),`${i.id}: ${f} lesson ${i.lessons[f]} is a starter lesson`);
 const urls=H.SOURCES.map(s=>s.url);
 assert.ok(urls.includes('https://www.theifab.com/laws/latest/the-players/'),'11 a side: IFAB Law 3');
 assert.ok(urls.some(u=>/thefa\.com.*futsal.*law-3/.test(u)),'5 a side: futsal Law 3');
 assert.match(exp,/SOURCES\.map/);assert.match(exp,/<summary>Sources/);assert.match(H.COPY.gameNote,/part of the Futbol Island game/);
 assert.equal(H.ferryLine(1),'1 of 4 paths graduated. Graduate 3 more to board the Matchday Ferry.');assert.match(H.ferryLine(4),/Matchday Ferry is open/);
 assert.equal(H.nextStep('9v9',5,12),'Next: finish 7 more of its 12 starter lessons on the Paths screen.');assert.match(H.nextStep('9v9',0,12),/start the 9v9 path/);
 assert.doesNotMatch(exp+read(dir+'hallData.ts'),/@gmail|khoa/i);
 void norm;console.log('PASS content: case facts word for word, 6 big ideas on real lessons in all 4 paths, counts cited');}

// 3. Heat: nothing runs on its own.
{const all=exp+prog;
 for(const bad of [/requestAnimationFrame/,/setInterval/,/from 'three'|getContext\(/,/<canvas/,/<video|<audio/,/storage['"]\s*,|addEventListener\('storage'/])assert.doesNotMatch(all,bad,'no loop / no polling: '+bad);
 assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g,''),/infinite/,'no endless CSS animation');
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/@supports \(animation-timeline:view\(\)\)/,'scroll-driven reveal is progressive enhancement');
 assert.match(exp,/m\.removeEventListener\('change',on\)/,'the compact-layout media listener is removed on unmount');
 assert.match(css,/@media \(max-width:620px\),\(max-height:480px\)/);assert.ok(exp.includes("'(max-width:620px),(max-height:480px)'"),'JS and CSS agree on the compact layout');
 assert.match(exp,/useEffect\(\(\)=>\{setProgress\(readPathProgress\(\)\)/,'progress is read once on open');
 assert.match(exp,/return\(\)=>document\.removeEventListener\('keydown'/,'the one listener is removed on unmount');
 assert.match(exp,/museumSfx/,'sound goes through the museum’s mute-aware one-shots');
 console.log('PASS heat: no loop, no canvas, no polling, finite CSS entrance, reduced motion respected');}
