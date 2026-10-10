// hall-of-fame · Your Hall of Fame (Oct 5 2026; ukiyo-e print gallery Oct 9 2026: six legends' prints whose position move the
// visitor plays with a finger, then the player's own four-panel print): the case's facts and takeaway reach the room word for word, every big idea
// points at a real starter lesson of every path, the player counts are cited, Back is the shared ExperienceBack (no local
// NavigationButton), earned plinths open the host's certificate and unearned ones say what to do next, and the room has no animation
// loop at all (one-shot CSS entrance, progress read once, nothing to dispose).
// usage: node tests/museum-exp-hall-of-fame.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const Module=require('node:module'),root=path.join(__dirname,'..'),dir='components/museum/experiences/hall-of-fame/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const resolve=Module._resolveFilename;Module._resolveFilename=function(req,...a){return resolve.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),prog=read(dir+'progress.ts'),print=read(dir+'Print.tsx'),motion=read(dir+'motion.ts'),legendsSrc=read(dir+'legends.ts');
const L=require('../'+dir+'legends.ts'),X=require('../lib/endgame/museum.ts'),H=require('../'+dir+'hallData.ts'),paths=require('../lib/paths/formatPaths.json'),M=require('../lib/endgame/graduationModel.ts');
const ex=X.EXHIBITS.find(e=>e.id==='hall-of-fame');

// 1. Contract.
{assert.match(exp,/export default function Experience/);
 assert.match(exp,/data-museum-experience="hall-of-fame"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/,'Back is the shared ExperienceBack');
 assert.doesNotMatch(exp,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(css,/\.back\{/,'no local Back wrapper');assert.doesNotMatch(exp,/immediate/,'Back always animates');
 assert.match(exp,/e\.key!=='Escape'/);assert.match(exp,/dialog\[open\]/,'Escape closes the certificate first, not the room');
 assert.match(exp,/openCertificate\(id\)/);assert.match(exp,/openCert\('diploma'\)/,'the champion opens the Island Diploma');
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
 assert.match(exp,/\[\.\.\.SOURCES,\.\.\.LEGEND_SOURCES\]\.map/);assert.match(exp,/<summary>Sources/);assert.match(H.COPY.gameNote,/part of the Futbol Island game/);
 assert.equal(H.ferryLine(1),'1 of 4 paths graduated. Graduate 3 more to board the Matchday Ferry.');assert.match(H.ferryLine(4),/Matchday Ferry is open/);
 assert.equal(H.nextStep('9v9',5,12),'Next: finish 7 more of its 12 starter lessons on the Paths screen.');assert.match(H.nextStep('9v9',0,12),/start the 9v9 path/);
 assert.doesNotMatch(exp+read(dir+'hallData.ts'),/@gmail|khoa/i);
 void norm;console.log('PASS content: case facts word for word, 6 big ideas on real lessons in all 4 paths, counts cited');}

// 3. Heat: nothing runs on its own.
{const all=exp+prog+print+legendsSrc;
 for(const bad of [/requestAnimationFrame/,/setInterval/,/from 'three'|getContext\(/,/<canvas/,/<video|<audio/,/storage['"]\s*,|addEventListener\('storage'/])assert.doesNotMatch(all,bad,'no loop / no polling: '+bad);
 assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g,''),/infinite/,'no endless CSS animation');
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/@supports \(animation-timeline:view\(\)\)/,'scroll-driven reveal is progressive enhancement');
 assert.doesNotMatch(exp,/matchMedia\(COMPACT\)/,'no JS layout switch: the print layout is pure CSS');
 assert.match(exp,/useEffect\(\(\)=>\{setProgress\(readPathProgress\(\)\)/,'progress is read once on open');
 assert.match(exp,/return\(\)=>document\.removeEventListener\('keydown'/,'the one listener is removed on unmount');
 assert.match(exp,/museumSfx/,'sound goes through the museum’s mute-aware one-shots');
 console.log('PASS heat: no loop, no canvas, no polling, finite CSS entrance, reduced motion respected');}

// 4. The legends: real cards from the game, the right position, one sourced fact each, a playable move.
{const players=require('../lib/town/positionPlayers.json'),roleOf={Goalkeeper:'goalkeeper','Right-back':'fullback','Centre-back':'centerback',Midfielder:'midfielder',Winger:'winger',Striker:'striker'};
 // Oct 9 2026 (fair hall): twelve prints, two per position, one from the women's game and one from the men's.
 assert.equal(L.LEGENDS.length,12);assert.equal(new Set(L.LEGENDS.map(l=>l.position)).size,6,'six positions');assert.equal(new Set(L.LEGENDS.map(l=>l.id)).size,12);
 assert.equal(L.POSITIONS.length,6);for(const p of L.POSITIONS){assert.equal(p.legends.length,2,p.position+' has two legends');assert.deepEqual(p.legends.map(l=>l.game).sort(),['men','women'],p.position+': a woman and a man');
  assert.equal(p.legends[0].move,p.legends[1].move,p.position+': both play the same move');assert.ok(p.legends.every(l=>l.job===p.job));}
 assert.equal(L.LEGENDS.filter(l=>l.game==='women').length,6);assert.ok(L.POSITIONS.some(p=>p.legends[0].game==='women')&&L.POSITIONS.some(p=>p.legends[0].game==='men'),'neither game always comes first');
 assert.ok(L.QUIZ.length>=3);for(const q of L.QUIZ){assert.ok(q.choices.includes(q.position)&&new Set(q.choices).size===q.choices.length&&q.choices.every(c=>L.POSITIONS.some(p=>p.position===c)),'quiz round '+q.position);}
 assert.ok(new Set(L.QUIZ.map(q=>q.choices.indexOf(q.position))).size>1,'the right answer moves around');assert.match(exp,/<JobCheck\/>/,'the quick check is in the room');
 for(const l of L.LEGENDS){const role=roleOf[l.position];assert.ok(role,l.name+' position known');assert.ok([...players[role].allTime,...players[role].current].includes(l.card),l.name+' is a '+role+' card in the game');
  assert.match(l.source.url,/^https:\/\/en\.wikipedia\.org\/wiki\//);assert.ok(l.fact.length<120&&/\d{4}|\d+ goals/.test(l.fact),l.name+' fact is one short dated line');
  for(const k of ['job','try','done'])assert.ok(l[k].length>20&&l[k].length<130,l.name+' '+k+' is short');
  const path=L.handlePath(l);assert.ok(path.length>20);const len=path.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0);assert.ok(len>40,l.name+' move is long enough to drag');
  for(const [x,y] of path)assert.ok(x>8&&x<292&&y>8&&y<412,l.name+' brush line stays on the print');
  for(const k of [l.player,l.ball,...l.others.map(o=>o.keys)]){assert.equal(k[0][0],0);assert.equal(k.at(-1)[0],L.END);}
  const end=path.at(-1);assert.ok(L.progressAt(path,end[0],end[1],0)<=.28+1e-9,'tapping the end cannot skip the move');assert.ok(L.progressAt(path,end[0],end[1],.9)>.99);}
 assert.match(legendsSrc,/Lev Yashin is still the only goalkeeper to win the Ballon d’Or, in 1963/);assert.match(legendsSrc,/1994, 1998 and 2002/);
 assert.ok(L.LEGEND_SOURCES.length>=13);assert.match(exp,/STYLE_NOTES/);assert.doesNotMatch(legendsSrc+print,/hokusai|hiroshige|great wave/i,'no copied prints named or traced');
 console.log('PASS legends: twelve game cards, a woman and a man per position, sourced facts, a quick check, playable moves that can’t be skipped');}

// 5. Motion: direct manipulation under the finger, springs that stop, FLIP, keyboard, reduced motion, heat.
{assert.ok((motion.match(/requestAnimationFrame\(frame\)/g)||[]).length===4&&!/requestAnimationFrame/.test(exp+print+legendsSrc+prog),'rAF lives only in motion.ts');
 assert.match(motion,/if\(Math\.abs\(x-to\)<\.0008&&Math\.abs\(v\)<\.01\)\{set\(to\);raf=0;/,'the spring stops at rest');assert.match(motion,/if\(u<1\)raf=requestAnimationFrame\(frame\);else\{raf=0;/,'the glide stops');
 assert.match(motion,/if\(reduced\(\)\)\{set\(to\);o\.done\?\.\(\);return/,'reduced motion lands at once');assert.match(motion,/cancelAnimationFrame/);
 assert.match(exp,/useEffect\(\(\)=>\(\)=>stop\.current\(\),\[\]\)/,'a running spring is cancelled when the viewer goes');
 assert.match(exp,/setPointerCapture/);assert.match(exp,/progressAt\(path,p\.x,p\.y,t\.current\)/);assert.match(exp,/springTo\(t\.current,0,set,\{v,/,'let go early: it springs back with the release velocity');
 assert.match(exp,/flipFrom\(el,from\.getBoundingClientRect\(\)\)/,'the print flies in from its thumbnail (FLIP)');assert.match(exp,/role="slider" tabIndex=\{0\}/);assert.match(exp,/ev\.key==='Enter'/);
 assert.match(exp,/data-hof-play/);assert.match(exp,/aria-live="polite"/);assert.match(exp,/toggleAttribute\('inert',open!==null\)/,'the room is inert behind the viewer');
 assert.match(exp,/querySelector\('\[data-hof-viewer\]'\)\)\{closeViewer\.current\(\);return;\}/,'Escape closes the viewer before the room');
 assert.match(css,/\.viewerPrint\{[^}]*touch-action:none/);assert.match(print,/setAttribute\('transform'/,'the move writes attributes, no React render per frame');
 assert.ok(!/view-transition/.test(css),'no ::view-transition rules');
 for(const b of ['key','sky','ground','figures','cartouche','seal'])assert.match(print,new RegExp('data-block="'+b+'"'),'the print has its '+b+' block');
 console.log('PASS motion: finger-driven move, self-stopping springs, FLIP, keyboard slider, inert room, reduced motion');}
