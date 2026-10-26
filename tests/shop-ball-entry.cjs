// The Ball Studio has a visible entry inside the Kit Shop (Oct 26 2026, owner): on a phone the ball wall starts off-screen.
// Femi's "Show me" route to the ball wall stays. Run: node tests/shop-ball-entry.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const room=read('components/shop/ShopRoom.tsx'),css=read('components/shop/ShopRoom.module.css');
assert.ok(/className=\{styles\.ballEntry\} data-shop-ball-entry onClick=\{\(\)=>open\('ball'\)\}/.test(room),'the shortcut opens the Ball studio');
assert.ok(/\{ready&&!covered&&!leaving&&<button[^>]*data-shop-ball-entry/.test(room),'shown in the room, hidden under a studio, chat or My kit');
assert.ok(room.includes("STATIONS.map(s=>({label:SHOW_ME[s.id],onClick:()=>{setTalking(null);room.current?.walkTo(s.id);}}))"),"Femi's Show me routes stay");
const rule=css.match(/\.ballEntry\{([^}]*)\}/);assert.ok(rule,'styled');
assert.ok(/position:absolute/.test(rule[1])&&/right:/.test(rule[1])&&/bottom:/.test(rule[1]),'pinned bottom right (the joystick is bottom left)');
assert.ok(/min-height:(4[4-9]|[5-9]\d)px/.test(rule[1]),'a 44 px+ tap target');
assert.ok(!/display:none/.test(rule[1]),'visible on phones');
console.log('shop-ball-entry ok');
