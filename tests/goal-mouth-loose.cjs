// Goal mouth for loose balls (audit Nov 10 2026). matchSim's GHALF (19 field units) is a 9.6 m mouth on 11v11 against a drawn
// 7.32 m goal. Shots are drawn remapped into the real mouth (shotPlacement.shotMouthX), but a rebound, deflection or own goal is
// drawn where it is, so it could score ~1.1 m outside the drawn post. Loose balls now use min(GHALF, drawn half-width).
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../lib/town/match/matchSim.ts'),'utf8');
assert.match(src,/const mouth=this\.ballIsShot\?GHALF:Math\.min\(GHALF,this\.goalVenue\.goalWidth\/2\*250\/this\.goalVenue\.width\);/,'loose balls use the drawn mouth');
assert.equal((src.match(/Math\.abs\(xc - 135\) < mouth&&/g)||[]).length,2,'both goal tests (beach direct ban and the goal) use it');
assert.match(src,/clamp\(xc, 135 - mouth \+ 1\.5, 135 \+ mouth - 1\.5\)/,'the net bulge stays inside that mouth');
// The numbers: drawn half-width in field units = goalWidth/2 * 250 / venue width (fieldRuntime's sim → world mapping).
const W={'7v7':[4.9,37*250/270],'9v9':[6.4,45.7*250/270],'11v11':[7.32,68*250/270]};
const half=k=>W[k][0]/2*250/W[k][1];
assert.ok(half('11v11')<15&&half('11v11')>14,'11v11 loose mouth ≈ 14.5 units (7.32 m), not 19 (9.6 m)');
assert.ok(half('7v7')<19&&half('9v9')<19,'7v7 and 9v9 narrow slightly too');
console.log('PASS goal mouth: loose balls only score inside the drawn goal');
