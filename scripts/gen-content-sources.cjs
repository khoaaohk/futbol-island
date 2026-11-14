// Source lists for the card and fish page notes (SEO, Nov 14 2026): docs/card-content-sources.md (whole file) and the
// "Fishbook page notes" section of docs/fishing-content-sources.md, from lib/site/cardNotes.json and lib/site/fishNotes.json.
// usage: node scripts/gen-content-sources.cjs [--check]   (--check: exit 1 when a doc is out of date; tests/cards-seo.cjs runs it)
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8'),json=rel=>JSON.parse(read(rel));
const cards=json('lib/site/cardNotes.json'),fish=json('lib/site/fishNotes.json');
const roster=json('lib/town/cardRoster.json').players,groups=json('lib/town/positionPlayers.json');
const listed=[...new Set(Object.values(groups).flatMap(g=>[...g.current,...g.allTime]))];
const all=[...roster.filter(n=>listed.includes(n)),...listed.filter(n=>!roster.includes(n)).sort((a,b)=>a.localeCompare(b))];
const num=n=>all.indexOf(n)+1,cell=s=>String(s).replace(/\|/g,'\\|').replace(/\n/g,' ');
const FISH_SRC=fs.readdirSync(path.join(root,'lib/town/fishing')).filter(f=>f.endsWith('.ts')).map(f=>read('lib/town/fishing/'+f)).join('\n');
const fishName=id=>FISH_SRC.match(new RegExp(`id:'${id}',\\s*name:'((?:[^'\\\\]|\\\\.)+)'`))?.[1].replace(/\\'/g,"'")??id;

const done=Object.keys(cards).sort((a,b)=>num(a)-num(b)),left=all.filter(n=>!cards[n]);
const cardDoc=`# Card page notes: sources

Every player and coach card page (/cards/<number>) with notes shows "Why they matter", "Learn from them" (one habit and a drill
link) and "Did you know?" (1-2 career facts). The notes live in \`lib/site/cardNotes.json\` (lib/site/cardNotes.ts); this file is
generated from it by \`node scripts/gen-content-sources.cjs\` (tests/cards-seo.cjs checks it is up to date).

Rules (owner, 14 Nov 2026): real people, so every fact was checked against the pages listed beside it (English Wikipedia plus an
official, club, federation or tournament page where one confirmed it); a fact that could not be verified was left out. Nothing
that goes stale (no "current club", no "best in the world"), no controversies, personal life, money or injuries, and no heading
advice for kids. Kids see a plain-text "Checked against: Wikipedia, UEFA" credit and no links. "Why they matter" and "Learn from
them" describe a well-documented playing or coaching style in our own words.

Done: ${done.length} of ${all.length} cards. Remaining: ${left.length} (listed at the end).

| # | Card | Checked | Fact | Sources |
| --- | --- | --- | --- | --- |
${done.flatMap(n=>cards[n].facts.map((f,i)=>`| ${i?'':num(n)} | ${i?'':cell(n)} | ${i?'':cards[n].checked} | ${cell(f.text)} | ${f.src.join(', ')} |`)).join('\n')}

## Remaining cards (no notes yet)

${left.length?left.map(n=>`#${num(n)} ${n}`).join(' · '):'None.'}
`;
const fishIds=Object.keys(fish).sort();
const START='<!-- fish-notes:start -->',END='<!-- fish-notes:end -->';
const fishSection=`${START}
## Fishbook page notes (14 Nov 2026): where it lives and a fun fish fact

Every /fish/<id> page with notes shows "The <animal> in the wild": where the real animal lives and a fun fish fact, from
\`lib/site/fishNotes.json\` (lib/site/fishNotes.ts), generated into this section by \`node scripts/gen-content-sources.cjs\`.
These are plain biology about the real animal (not football, not island fiction), checked on the date shown against the pages
listed (English Wikipedia plus a museum, aquarium, NOAA, FishBase or university page where one confirmed it). Kids see a
plain-text credit and no links. "How to catch it in Futbol Island" is built from the game data and is island fiction.

${fishIds.length} species.

| Species (id) | Checked | Where it lives | Fun fish fact | Sources |
| --- | --- | --- | --- | --- |
${fishIds.map(id=>`| ${cell(fishName(id))} (\`${id}\`) | ${fish[id].checked} | ${cell(fish[id].lives)} | ${cell(fish[id].fact)} | ${fish[id].src.join(', ')} |`).join('\n')}
${END}
`;
const fishPath='docs/fishing-content-sources.md',old=read(fishPath);
const fishDoc=old.includes(START)?old.replace(new RegExp(`${START}[\\s\\S]*?${END}\\n?`),fishSection):old.replace(/\n*$/,'\n\n')+fishSection;
const out=[['docs/card-content-sources.md',cardDoc],[fishPath,fishDoc]];
if(process.argv.includes('--check')){
 const stale=out.filter(([p,t])=>!fs.existsSync(path.join(root,p))||read(p)!==t).map(([p])=>p);
 if(stale.length){console.error(`out of date: ${stale.join(', ')} (run node scripts/gen-content-sources.cjs)`);process.exit(1);}
 console.log('content sources: up to date');
}else{for(const [p,t] of out)fs.writeFileSync(path.join(root,p),t);console.log(`wrote ${out.map(o=>o[0]).join(', ')}: ${done.length} cards, ${fishIds.length} fish`);}
