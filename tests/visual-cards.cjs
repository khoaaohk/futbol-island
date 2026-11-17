// Card and exhibit pages: picture pass (Nov 17 2026, visual audit #2 and #8).
//  1. Source: both pages show their share picture as a hero <img> with width/height, the card page has the stat tiles, chips and
//     the clubs timeline, the exhibit page its stamp and dated-story timeline, related groups as tiles; parts are server-only.
//  2. Built site (when a build exists): /cards/<n> has the hero img (og.png, 1200x630, alt) before the stat strip; an exhibit has
//     its hero and stamp; one picture per page (tiles add no image requests).
// usage: node tests/visual-cards.cjs   (NEXT_DIST_DIR picks the build folder)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const parts=read('components/site/cards/CardParts.tsx'),css=read('components/site/cards/cards.module.css');
const cp=read('app/(site)/cards/[number]/page.tsx'),ep=read('app/(site)/exhibits/[id]/page.tsx');
assert(!/^\s*['"]use client['"]/.test(parts)&&!/useState|useEffect|onClick/.test(parts),'CardParts is server-only');
assert(/<img src=\{src\} alt=\{alt\} width=\{OG\.width\} height=\{OG\.height\}/.test(parts),'hero img has its width and height');
assert(/const OG=\{width:1200,height:630\}/.test(parts),'hero size is the share picture size');
assert(/<Hero src=\{ogPath\(cardPath\(c\.number\)\)\}/.test(cp)&&/<StatStrip stats=\{stats\}\/>/.test(cp)&&/<Chips items=\{c\.strengths\}\/>/.test(cp)&&/<CareerTimeline lines=\{c\.career\}\/>/.test(cp),'card page: hero, stat strip, chips, clubs timeline');
assert(/renderGroup=\{g=><CardTileGroup g=\{g\}\/>\}/.test(cp)&&/renderGroup=\{g=><ExhibitTileGroup g=\{g\}\/>\}/.test(ep),'related groups as tiles');
assert(/<Hero src=\{ogPath\(exhibitPath\(e\.id\)\)\}/.test(ep)&&/<ExhibitStamp year=\{e\.year\}/.test(ep)&&/<StoryTimeline lines=\{e\.story\}\/>/.test(ep),'exhibit page: hero, stamp, story timeline');
assert(/shapeRendering="crispEdges"/.test(parts)&&/#7a4e12/.test(parts)&&/strokeWidth="1\.4"/.test(parts),'icons drawn like the fuel bolt');
assert(!/border-radius:\d+px/.test(css)&&!/box-shadow|gradient/.test(css),'radii from tokens, flat fills, no shadows');
assert(/prefers-reduced-motion:no-preference/.test(css)&&!/transition/.test(css.replace(/@media\(prefers-reduced-motion:no-preference\)\{[\s\S]*\}\s*$/,'')),'motion only without reduced motion');
console.log('visual-cards: source checks OK');

const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
if(!fs.existsSync(path.join(app,'cards/20.html'))){console.log(`  SKIP built-site checks: no build in ${path.relative(root,dist)}`);process.exit(0);}
const main=f=>(fs.readFileSync(path.join(app,f),'utf8').match(/<main[\s\S]*<\/main>/)||[''])[0];
const card=main('cards/20.html');
const hero=card.match(/<img[^>]*src="\/cards\/20\/og\.png"[^>]*>/);
assert(hero&&/width="1200"/.test(hero[0])&&/height="630"/.test(hero[0])&&/alt="[^"]+card #20[^"]*"/.test(hero[0]),'card 20: hero img with size and alt');
assert(!/loading="lazy"/.test(hero[0]),'the hero is not lazy (it is the first picture on screen)');
assert(card.indexOf('og.png')<card.indexOf('id="facts"')&&/Position<span[^>]*>:<\/span><\/b>/.test(card),'hero before the stat strip; the label keeps its colon');
assert.equal((card.match(/<img\b/g)||[]).length,1,'one picture on a card page');
const ex=main('exhibits/laws-1863.html');
assert(/<img[^>]*src="\/exhibits\/laws-1863\/og\.png"[^>]*width="1200"[^>]*height="630"/.test(ex),'exhibit: hero img with size');
assert(/<dd>1863<\/dd>/.test(ex)&&/<ol class="[^"]*timeline/.test(ex),'exhibit: year stamp and story timeline');
console.log('visual-cards: built card and exhibit pages OK');
