// Game hotkeys stay off while typing (E2E finding Oct 22 2026): lib/town/typingTarget.ts + the island's keydown / keyup guard.
// usage: node tests/typing-keys.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const src=fs.readFileSync('lib/town/typingTarget.ts','utf8'),mod={exports:{}};
new Function('exports','module',ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(mod.exports,mod);
const {typingTarget}=mod.exports;
assert.equal(typingTarget({tagName:'INPUT',type:'text'}),true,'the first-name box');
assert.equal(typingTarget({tagName:'input'}),true,'an input with no type is text (the code boxes)');
assert.equal(typingTarget({tagName:'INPUT',type:'number'}),true,'the grown-up answer');
assert.equal(typingTarget({tagName:'TEXTAREA'}),true);
assert.equal(typingTarget({tagName:'DIV',isContentEditable:true}),true);
assert.equal(typingTarget({tagName:'INPUT',type:'checkbox'}),false,'a checkbox keeps the hotkeys');
assert.equal(typingTarget({tagName:'BUTTON'}),false,'a focused HUD button keeps the hotkeys');
assert.equal(typingTarget({tagName:'CANVAS'}),false);
assert.equal(typingTarget(null),false);assert.equal(typingTarget(undefined),false);
const town=fs.readFileSync('components/Town.tsx','utf8');
assert.match(town,/const keydown=\(e:KeyboardEvent\)=>\{sound\.unlock\(\);music\.unlock\(\);if\(settingsRef\.current\)return;if\(typingTarget\(e\.target\)\)return;/,'keydown: typing returns before any hotkey (R ride, E talk, M map, J keep-ups, Space)');
assert.match(town,/\(e:KeyboardEvent\)=>\{keys\.delete\(e\.key\.toLowerCase\(\)\);if\(typingTarget\(e\.target\)\)return;/,'keyup: a key released in a text box is only forgotten');
console.log('typing-keys ok');
