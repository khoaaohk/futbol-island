// Owned boots never say "Buy for 265" (Oct 26 2026, owner): the studios get an `owned` prop (components/shop/studios.tsx), the
// Kit Shop answers it from My kit with the same validated hash buy() charges by, and the Boot studio shows Owned · Equip.
// Run: node tests/boots-owned.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
assert.ok(/export type StudioProps=\{[^}]*owned\?\(design:unknown\):boolean\}/.test(read('components/shop/studios.tsx')),'StudioProps has owned');
const room=read('components/shop/ShopRoom.tsx');
assert.ok(room.includes('owned={d=>ownsOwned(kind,d)}'),'the shop passes owned to the open studio');
assert.ok(/const ownsOwned=[^\n]*validateBoots\(raw\)[^\n]*ownsDesign\(owned,kind,d\)/.test(room),'owned uses the validated design, like buy()');
const boots=read('components/shop/BootStudio.tsx');
assert.ok(/isOwned=useMemo\(\(\)=>\{try\{return !!owned\?\.\(validateBoots\(design\)\)/.test(boots));
const btn=boots.match(/\{isOwned\?<button[^\n]*data-boot-owned[^\n]*\n\s*:<button[^\n]*data-boot-buy-open/);assert.ok(btn,'owned swaps the Buy button for Owned / Equip');
assert.ok(/data-boot-owned[^\n]*<span>Owned<\/span>[^\n]*Equip/.test(boots)&&!/data-boot-owned[^\n]*Buy for/.test(boots),'no price on owned boots');
// The ownership check itself: the purchase id is a hash of the design, so the same design reads owned and a changed one does not.
const src=ts.transpileModule(read('lib/shop/shopPurchases.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const m={exports:{}};vm.runInNewContext(src,{module:m,exports:m.exports,require:()=>({}),localStorage:undefined,console});
const P=m.exports,design={model:'speed',colors:{toe:'#ffffff'}},owned={v:1,items:[{id:P.purchaseId('boots',design),kind:'boots',name:'x',price:265,design,at:1}],wearing:{}};
assert.equal(P.ownsDesign(owned,'boots',{...design}),true);assert.equal(P.ownsDesign(owned,'boots',{...design,colors:{toe:'#000000'}}),false);
console.log('boots-owned ok');
