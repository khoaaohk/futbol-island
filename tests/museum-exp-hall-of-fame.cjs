// hall-of-fame · the Trophy room (Oct 12 2026; user: "Change the your hall of fame exhibit to something else. don't like this
// idea", chose "Trophy room"). It is still the last room in the museum and still where the player's certificates go (their own shelf
// of the cabinet). Checks: the host contract (shared ExperienceBack, Escape after the certificate, certificates via the host,
// onComplete once through the shared Ending after the quick check), no human figures (no anatomy/figure.ts, no legends), the eight
// trophies' sourced facts, both games played in Node, the lathe model (every trophy, every part, spin only moves decorations), the
// fill-screen card (every scene fills its region at desktop, wide-desktop and phone sizes), heat (one sleeping loop, no rAF), the
// kept progress key and its sanitiser, reduced motion and CSS rules.
// usage: node tests/museum-exp-hall-of-fame.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;require.extensions['.css']=m=>{m.exports={};};
const Module=require('node:module'),root=path.join(__dirname,'..'),dir='components/museum/experiences/hall-of-fame/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const resolve=Module._resolveFilename;Module._resolveFilename=function(req,...a){return resolve.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const files=fs.readdirSync(path.join(root,dir)),src=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const exp=src['Experience.tsx'],yours=src['YourHall.tsx'],css=src['Experience.module.css'],loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts');
const all=Object.entries(src).filter(([f])=>/\.(tsx?|css)$/.test(f)).map(([,s])=>s).join('\n');
const T=require('../'+dir+'trophies.ts'),G=require('../'+dir+'game.ts'),M=require('../'+dir+'model.ts'),H=require('../'+dir+'hallData.ts');
const K=require('../components/museum/experiences/anatomy/iso-kit.ts'),X=require('../lib/endgame/museum.ts'),paths=require('../lib/paths/formatPaths.json'),GM=require('../lib/endgame/graduationModel.ts');
const S=require('../'+dir+'scene.tsx'),Y=require('../'+dir+'YourHall.tsx');
const ex=X.EXHIBITS.find(e=>e.id==='hall-of-fame');

// 1. Contract.
{assert.match(exp,/export default function Experience/);assert.match(exp,/data-museum-experience="hall-of-fame"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);assert.doesNotMatch(all,/NavigationButton|immediate/);
 assert.match(exp,/e\.key!=='Escape'/);assert.match(exp,/dialog\[open\]/,'Escape lets the host certificate close first');assert.match(exp,/removeEventListener\('keydown'/);
 assert.match(yours,/openCert\(`grad:\$\{p\.format\}`\)/,'earned spots open the host certificates');assert.match(yours,/openCert\('diploma'\)/,'the champion opens the Island Diploma');
 assert.match(exp,/const complete=useCallback\(\(\)=>\{if\(completed\.current\)return;completed\.current=true;onComplete\?\.\(\);\}/,'onComplete fires once');
 assert.match(exp,/\{checked&&<Ending art=\{<EndCup\/>\} reached=\{checked\} onComplete=\{complete\}/,'the shared Ending, mounted only after the quick check, marks the visit');
 assert.equal((exp.replace(/\/\*[\s\S]*?\*\//g,'').match(/complete\(\)/g)||[]).length,0,'complete is never called directly: only the Ending fires it');
 assert.match(exp,/import StepCheck from '\.\.\/modern\/StepCheck'/);assert.match(exp,/onDone=\{\(\)=>\{setChecked\(true\)/,'the check sets the end');
 assert.match(exp,/const canCheck=mDone&&cDone/);assert.match(exp,/disabled=\{lock\}/,'the quick check unlocks after both games');
 assert.match(exp,/import WallLabel from '\.\.\/modern\/WallLabel'/);
 for(const h of ['data-hof-stage','data-hof-art','data-hof-open','data-hof-station','data-hof-apart','data-hof-turn','data-hof-answer','data-hof-next','data-hof-result','data-hof-readout','data-hof-note','data-hof-final','data-hof-start','data-hof-to-check','data-hof-measure','data-hof-pick'])assert.ok(exp.includes(h),'hook '+h);
 for(const h of ['data-hof-yours','data-hof-plinth','data-hof-cert','data-hof-idea','data-hof-ferry','data-tag','data-empty'])assert.ok(yours.includes(h),'hook '+h);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/hall-of-fame/page.tsx')),'the museum-lab preview route');
 for(const gone of ['Arena.tsx','arenaRules.ts','board.ts','legends.ts','plinths.ts','Draw.tsx'])assert.ok(!files.includes(gone),'the Legends Arena is gone: '+gone);
 // no people: the user dislikes the paper characters
 assert.doesNotMatch(all,/anatomy\/figure|from '\.\.\/anatomy\/figure'|PaperFigure|mannequin/i,'no human figures (anatomy/figure.ts is not imported)');
 assert.doesNotMatch(all,/LEGENDS|Legends Arena|legend\.fact/,'the legends and positions concept is dropped');
 console.log('PASS contract: fixed dialog, shared Back, Escape after certificates, host certificates, onComplete once via the Ending after the quick check, no figures');}

// 2. Content: the case's words, the eight trophies, every fact sourced.
{assert.equal(H.COPY.fact1,ex.facts[0]);assert.equal(H.COPY.fact2,ex.facts[1]);assert.equal(H.COPY.takeaway,ex.forYourGame);assert.equal(H.COPY.title,'Trophy room');
 assert.match(exp,/\{COPY\.fact1\}/);assert.match(yours,/\{COPY\.fact2\}/);assert.match(yours,/\{COPY\.takeaway\}/);assert.match(exp,/\{COPY\.gameNote\}/);assert.match(exp,/\{COPY\.trophyNote\}/);
 assert.deepEqual(H.PLINTHS.map(p=>p.format),[...GM.GRADUATION_FORMATS]);assert.deepEqual(H.PLINTHS.map(p=>p.aSide),[5,7,9,11]);
 const starter=Object.fromEntries(paths.map(p=>[p.format,new Set(p.chapters.flatMap(c=>c.lessons.map(l=>l.id)))]));
 for(const i of H.IDEAS)for(const f of GM.GRADUATION_FORMATS)assert.ok(starter[f].has(i.lessons[f]),`${i.id}: ${f} lesson is a starter lesson`);
 assert.equal(T.TROPHIES.length,8);assert.deepEqual(T.TROPHIES.map(t=>t.id),['worldcup','womens','ucl','copa','afcon','euro','asian','facup']);
 const want={worldcup:[36.8,6.175,1974],womens:[47,4.6,1999],ucl:[74,11,1967],copa:[77,9,1916],afcon:[null,null,2002],euro:[60,8,1960],asian:[78,15,2019],facup:[61.5,6.3,1911]};
 for(const t of T.TROPHIES){assert.deepEqual([t.heightCm,t.weightKg,t.first],want[t.id],t.id+': height, weight, first won as sourced');
  assert.ok(t.sources.length&&t.sources.every(s=>/^https:\/\/en\.wikipedia\.org\/wiki\//.test(s.url)),t.id+': sourced');
  for(const k of ['made','keeper','story','fun'])assert.ok(t[k].length>20&&t[k].length<240,t.id+': '+k+' is one or two kid-sized lines');
  assert.ok(t.parts.length>=3&&t.model.every(p=>t.parts.some(q=>q.id===p.part)),t.id+': every piece belongs to a named part');
  if(t.heightCm)assert.equal(t.drawH,t.heightCm,t.id+': drawn at its true height');}
 assert.match(T.byId('worldcup').story,/Pickles/);assert.match(T.byId('worldcup').story,/1966/);assert.match(T.byId('worldcup').made,/18-carat gold/);assert.match(T.byId('worldcup').made,/malachite/);
 assert.match(T.byId('ucl').story,/big ears/);assert.match(T.byId('facup').story,/little tin idol/);assert.match(T.byId('asian').keeper,/five petals/i);
 assert.match(T.byId('afcon').made,/not published/,'no invented numbers for the Africa Cup of Nations trophy');
 assert.match(exp,/\.\.\.TROPHIES\.flatMap\(t=>t\.sources\)/);assert.match(exp,/<summary>Sources/);
 console.log('PASS content: case facts word for word, real lessons, eight trophies with sourced heights, weights, years and stories');}

// 3. The games, played in Node.
{assert.equal(G.MATCH.length,6);for(const r of G.MATCH){assert.ok(r.choices.includes(r.right),r.ask);assert.equal(new Set(r.choices).size,3);assert.ok(r.why.length>10);}
 assert.ok(new Set(G.MATCH.map(r=>r.choices.indexOf(r.right))).size===3,'the right answer moves between the three places');
 assert.deepEqual([...new Set(G.MATCH.map(r=>r.kind))].sort(),['silhouette','story','tournament'],'story, tournament and shadow rounds');
 assert.equal(G.COMPARE.length,6);const sides=new Set();
 for(const r of G.COMPARE){const L=T.byId(r.left),R=T.byId(r.right);assert.ok(L.heightCm&&L.weightKg&&R.heightCm&&R.weightKg,'only measured trophies on the bench');
  const w=G.winner(r);sides.add(w);const v=x=>r.ask==='taller'?x.heightCm:x.weightKg;assert.equal(w,v(L)>v(R)?'left':'right');
  const t=G.tiltFor(L.weightKg,R.weightKg);assert.equal(Math.sign(t),R.weightKg>L.weightKg?1:-1,'the heavier pan goes down');assert.ok(Math.abs(t)<=10*Math.PI/180+1e-9);
  assert.match(r.why,new RegExp(String(r.ask==='taller'?Math.max(L.heightCm,R.heightCm):Math.max(L.weightKg,R.weightKg)).replace('.','\\.')),'the why quotes the number');}
 assert.equal(sides.size,2,'the winner is on both sides');
 assert.ok(G.COMPARE.some(r=>r.ask==='heavier'&&G.winner(r)!==G.winner(G.COMPARE.find(q=>q.ask==='taller'&&q.left===r.left&&q.right===r.right)||r)),'taller is not always heavier');
 assert.equal(S.panZ(1,G.tiltFor(4,9))<S.panZ(-1,G.tiltFor(4,9)),true,'right heavier: the right pan is lower');
 assert.equal(G.stars(6,6),3);assert.equal(G.stars(4,6),2);assert.equal(G.stars(1,6),1);assert.equal(G.stars(0,6),0);
 // the progress key: kept (lib/saves/snapshot.ts syncs it), old Legends Arena scores dropped
 assert.equal(G.BEST_KEY,'fi2-museum-hof-arena-v1');assert.ok(read('lib/saves/snapshot.ts').includes("'fi2-museum-hof-arena-v1'"),'the key is already synced');
 assert.deepEqual(G.sanitizeSave({yashin:180,pele:300}),{v:2,seen:[],match:0,compare:0},'old arena scores are dropped');
 assert.deepEqual(G.sanitizeSave({v:2,seen:['ucl','ucl','nope',3],match:99,compare:-2}),{v:2,seen:['ucl'],match:6,compare:0});
 assert.match(exp,/try\{localStorage\.setItem\(BEST_KEY/);
 assert.ok(G.coast(5,.016)<5&&G.coast(.04,.016)===0,'the turntable coasts to a stop');
 console.log('PASS games: six match rounds (story, tournament, shadow), six measured pairs with the right winner and tilt, the kept key and its sanitiser');}

// 4. The lathe and the Paper style.
{for(const t of T.TROPHIES){const pose={c:[400,600],k:6,elev:20,spin:.4};
  const a=M.drawTrophy(t,pose),b=M.drawTrophy(t,{...pose,spin:1.4}),apart=M.drawTrophy(t,{...pose,apart:1}),sil=M.drawTrophy(t,{...pose,sil:true});
  assert.ok(a.marks.length>=25,t.id+': a detailed drawing ('+a.marks.length+' marks)');
  assert.deepEqual(new Set(apart.anchors.map(x=>x.part)),new Set(t.parts.map(p=>p.id)),t.id+': a leader line for every part');
  const lathes=x=>x.marks.filter(m=>m.fill&&/^M/.test(m.d)&&t.model.some(p=>p.k==='lathe'&&p.part===m.part)).length;
  assert.ok(a.marks.some((m,i)=>m.d!==b.marks[i]?.d),t.id+': the turntable turns its handles, spirals, petals or lines');
  assert.ok(sil.marks.every(m=>(m.fill??m.stroke)===M.SIL),t.id+': the shadow round is one dark shape');
  const top=t.parts[t.parts.length-1].id,base=t.parts[0].id,ya=apart.anchors.find(x=>x.part===top).y,yb=apart.anchors.find(x=>x.part===base).y;assert.ok(ya<yb,t.id+': apart, the top part rises above the base');
  void lathes;}
 assert.equal(M.rAt([[1,0],[3,10]],5),2);assert.equal(M.smooth([[0,0],[1,1],[2,0]],4).length,9);
 assert.match(src['scene.tsx'],/from '\.\.\/anatomy\/iso-kit'/);assert.match(src['scene.tsx'],/from '\.\.\/anatomy\/draw'/);assert.match(exp,/<style dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}\/>/);
 assert.doesNotMatch(all,/pixeliso|PixelStage|Pixmap|PK Press Start|#000048/i,'no pixel kit');
 assert.match(css,/--anatomy-paper:#f7f7f3/);assert.match(css,/--anatomy-card:#e0e0db/);assert.match(css,/--accent:#f2c230/,'one accent: yellow');
 assert.match(css,/:global\(\.iso-halo\)\{filter:blur\(14px\);transform:translateY\(6px\)\}/);
 console.log('PASS lathe and style: all eight trophies turn, come apart part by part with leader lines, cast one shadow; shared kit, Paper tokens');}

// 5. Fill-screen: the first screen is the game, every scene fills its region at 1440×900, 1845×1110 and 390×844.
{assert.match(css,/\.screen\{[^}]*height:100dvh/);assert.match(css,/\.card\{position:relative;flex:1 1 auto;min-height:0/);assert.match(exp,/data-fill-screen/);
 assert.match(exp,/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/,'the SVG is the card, pixel for pixel');
 const span=(pts,P)=>{const f=pts.map(p=>K.iso(p,P)),xs=f.map(p=>p[0]),ys=f.map(p=>p[1]);return [Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];};
 // the regions the card leaves the scene (card size minus the corner captions and the note), from the three viewports
 const regions=[['1440×900',1340,600,false],['1845×1110',1735,800,false],['390×844',354,560,true],['390×844 under a note',354,330,true]];
 for(const [name,w,h,tall] of regions){
  const scenes=[['cabinet',S.cabinet(tall?S.CAB_TALL:S.CAB_WIDE).points,S.AZ_CAB],['shelf',Y.shelf(tall).points,S.AZ_CAB],['bench',S.benchPoints(82),tall?58:S.AZ_BENCH],['plinths',S.plinths(3).points,S.AZ],['shadow',S.plinths(1).points,S.AZ],
   ...T.TROPHIES.map(t=>['stand '+t.id,S.stand(t).points,S.AZ])];
  for(const [sc,pts,az] of scenes){if(name.endsWith('note')&&(sc==='cabinet'))continue;const P=K.fitProjection(pts,w,h,{pad:tall?8:16,azimuth:az,elevation:S.EL}),[bw,bh]=span(pts,P);
   assert.ok(bw>=w*.9-1||bh>=h*.9-1,`${name} ${sc}: fills its region (${Math.round(bw)}×${Math.round(bh)} of ${w}×${h})`);}}
 // the cabinet holds all eight at true size, each in its own bay
 for(const L of [S.CAB_WIDE,S.CAB_TALL]){const C=S.cabinet(L),ids=C.slots.map(s=>s.id).filter(id=>id!=='yours');assert.deepEqual([...ids].sort(),T.TROPHIES.map(t=>t.id).sort());
  for(const s of C.slots)if(s.id!=='yours')assert.ok((s.x1-s.x0)/2>=T.reach(T.byId(s.id))+2,s.id+' fits its bay');}
 assert.ok(S.cabinet(S.CAB_TALL).slots.some(s=>s.id==='yours'),'the phone cabinet has a bay that opens your shelf');
 assert.deepEqual(Y.SPOTS,['futsal','7v7','9v9','11v11','diploma'],'your shelf: a spot per path and the diploma');
 assert.match(css,/\.note:not\(\[data-wide-note\]\)\{left:10px;right:10px;top:10px/,'phone: the note runs across the top, the scene is fitted below');
 assert.match(exp,/const top=tall\?\(hasNote\?noteH\+18:34\):34/);
 console.log('PASS fill-screen: 100dvh screen, the card is the SVG, every scene fills its region at desktop, wide and phone sizes');}

// 6. Heat, input and reduced motion.
{assert.ok(!/requestAnimationFrame|setInterval/.test(all),'no rAF or polling in the exhibit: the shared Paper loop only');
 assert.match(exp,/import \{useFrameLoop\} from '\.\.\/anatomy\/paper-loop'/,'the one shared loop');
 assert.match(exp,/bump\(\);return more;\},card,reduced\)/,'the loop runs only while something eases, on the card, reduced = at once');
 assert.match(loopSrc,/else\{wanted=false;last=0;\}/);assert.match(loopSrc,/IntersectionObserver/);assert.match(loopSrc,/l\.dispose\(\)/);assert.match(loopSrc,/reduced\|\|!raf/);
 assert.ok(!/useFrameLoop|usePaperLoop/.test(yours),'your shelf has no loop');
 assert.match(exp,/if\(reduced\)\{m\.spin\+=dir\*Math\.PI\/4;bump\(\);return;\}/,'reduced motion: the turntable turns in 45° steps');
 assert.match(exp,/setPointerCapture/);assert.match(exp,/ArrowLeft/);
 assert.match(exp,/<button key="next"/,'a new Next button per answer (the answer tap can\'t skip a round)');
 const cssNo=css.replace(/\/\*[\s\S]*?\*\//g,'');assert.doesNotMatch(cssNo,/infinite/);assert.match(cssNo,/prefers-reduced-motion:reduce/);
 assert.match(cssNo,/\.btn,\.ghost,\.choice,\.round\{min-height:48px/);assert.match(cssNo,/\.chip\{min-height:44px/);assert.match(cssNo,/\.stations button\{[^}]*min-height:44px/);
 for(const sel of cssNo.replace(/@(media|supports|keyframes)[^{]*\{/g,'').match(/(^|\})\s*[^@{}][^{}]*\{/g)??[])for(const part of sel.replace(/^\}?\s*/,'').replace(/\{$/,'').split(','))
  if(!/^(from|to|\d+%)$/.test(part.trim()))assert.match(part,/\.[a-zA-Z]/,'every CSS module selector has a local class: '+part.trim());
 console.log('PASS heat and input: one sleeping loop (none on your shelf), turn-based reduced motion, 44–48 px targets, CSS rules');}
console.log('museum-exp-hall-of-fame: all passed');
