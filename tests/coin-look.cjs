// One coin look everywhere (Oct 13 2026, user: "make all the coins the same"). Every coin icon in the app's CSS paints with the
// shared --coin-face / --coin-rim tokens (app/globals.css, the Kit Shop CoinPill coin), never its own gold gradient.
const assert=require('node:assert'),fs=require('node:fs'),path=require('node:path');
const css=fs.readFileSync('app/globals.css','utf8');
assert.match(css,/--coin-face:radial-gradient\(/,'globals defines the coin face token');
assert.match(css,/--coin-rim:/,'globals defines the coin rim token');
const files=['components/shop/CoinPill.module.css','components/IslandJobs.module.css','components/VendingFace.module.css','components/MarketStand.module.css','components/KonbiniRoom.module.css','components/MarketCardsSection.module.css'];
for(const f of files)assert(fs.readFileSync(f,'utf8').includes('var(--coin-face)'),`${f} uses the shared coin face`);
// No coin-ish rule anywhere in components/ paints its own gold radial gradient (the bits lab is a local-only sandbox).
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='bits'?[]:walk(path.join(d,e.name))):e.name.endsWith('.css')?[path.join(d,e.name)]:[]);
for(const f of walk('components'))for(const rule of fs.readFileSync(f,'utf8').match(/[^{}]*\{[^}]*\}/g)||[]){
 const [sel,body]=rule.split('{');
 if(/coin|dropCoin|\.burst i|\.coins i/i.test(sel)&&/radial-gradient/.test(body))assert.fail(`${f}: "${sel.trim()}" paints its own coin gradient; use var(--coin-face)`);
}
console.log('PASS coin look: one shared coin face + rim across shop, HUD, vending, market, konbini and card bursts');
