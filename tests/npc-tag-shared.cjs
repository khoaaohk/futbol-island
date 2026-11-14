// Memory pass (QA Nov 14 2026, overnight multiplayer round 3): every townsperson (~200) used to make its own 512 x 160 name-tag canvas,
// CanvasTexture and SpriteMaterial although only one tag is ever visible (~63 MB of canvas pixels per tab, ~80 MB of the island's
// textures in the scene tally). lib/graphics/islandNpcs.ts now shares ONE canvas / texture / material; each townsperson keeps its own
// Sprite (position, scale, raycast id; onboardingNpc.ts reads its world position), and the tag is redrawn when it moves to another
// townsperson. usage: node tests/npc-tag-shared.cjs
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../lib/graphics/islandNpcs.ts'), 'utf8');
let n = 0; const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name); throw e; } };
t('one tag canvas, made once outside the per-townsperson map', () => {
  assert.equal((src.match(/document\.createElement\('canvas'\)/g) || []).length, 1);
  assert.match(src, /const tagCanvas=document\.createElement\('canvas'\);tagCanvas\.width=512;tagCanvas\.height=160;/);
  assert.ok(src.indexOf('const tagCanvas=') < src.indexOf('const rig=createPlayer('), 'before the townsfolk are built');
});
t('one CanvasTexture and one SpriteMaterial for the tags', () => {
  assert.equal((src.match(/new T\.CanvasTexture\(/g) || []).length, 1);
  assert.match(src, /const canvas=tagCanvas,texture=tagTexture,material=tagMaterial;/);
  assert.match(src, /const label=new T\.Sprite\(material\);label\.visible=false;/, 'each townsperson keeps its own hidden Sprite');
});
t('the tag is redrawn for the townsperson it moves to', () => {
  assert.match(src, /if\(shownTag&&shownTag!==labelOwner\)\{labelOwner=shownTag;shownTag\.labelStatus='';\}/);
  const i = src.indexOf('if(shownTag&&shownTag!==labelOwner)'), j = src.indexOf("if(status!==entry.labelStatus)");
  assert.ok(i > 0 && j > i, 'the owner check runs before the status redraw');
});
t('the shared texture and material are still disposed with the townsfolk', () => assert.match(src, /textures\.push\(tagTexture\);[\s\S]*materials\.push\(tagMaterial\);/));
console.log(`npc-tag-shared: ${n} checks passed`);
