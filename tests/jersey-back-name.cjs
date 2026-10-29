// Jersey back name (Oct 26 2026, QA: "the back name on the player kit is too faint"). lib/shop/jerseyPaint.ts backNamePrint:
//  1. the name is bigger than before (6.4 cm cap, was 4.2 cm), fits between the number and the neck sign-off;
//  2. a text colour too close to the shirt (contrast < 3) gets an automatic rim in the opposite tone; a readable one keeps the
//     design's own outline choice;
//  3. it stays a texture print (painted by the same printText call, no new meshes or materials).
// usage: node tests/jersey-back-name.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const P=require('../lib/shop/jerseyPaint.ts');

const base={primary:'#1d3a8a',accent:'#f2c14e',textColor:'#ffffff',outline:false};
// 1. Size and place.
{const n=P.backNamePrint(base);
 assert(n.cap>=.06,'cap at least 6 cm (was 4.2 cm)');
 const numberTop=.4+.22/2,neck=.675-.011;
 assert(n.y-n.cap/2>numberTop+.02,'clear of the number');assert(n.y+n.cap/2<neck-.02,'clear of the neck sign-off');
 assert(n.maxW<=.42,'fits across the shoulders');
 assert.equal(n.outline,null,'white on navy reads already: no rim forced');}
// 2. Contrast.
{assert(P.contrastRatio('#ffffff','#000000')>20&&Math.abs(P.contrastRatio('#777777','#777777')-1)<1e-9,'contrast ratio');
 const faint=P.backNamePrint({...base,primary:'#f4f4f4',textColor:'#ffe9a8'});
 assert(P.contrastRatio('#ffe9a8','#f4f4f4')<P.BACK_NAME_MIN_CONTRAST);
 assert.equal(faint.outline,'#15171a','pale on pale: a dark rim');
 const dark=P.backNamePrint({...base,primary:'#101820',textColor:'#1d2b3a'});
 assert.equal(dark.outline,'#f7f3ea','dark on dark: a light rim');
 const own=P.backNamePrint({...base,outline:true});
 assert.equal(own.outline,base.accent,'readable text keeps the design\'s own outline');}
// 3. Wiring: painted through backNamePrint, no extra draws.
{const src=read('lib/shop/jerseyPaint.ts');
 assert(/const n=backNamePrint\(d\);[^\n]*printText\(ctx,d\.name\.trim\(\)\.toUpperCase\(\),x,y,n\.cap\*kpx,d\.font,d\.textColor,n\.outline/.test(src),'back name painted from backNamePrint');
 assert(!/\.042\*kpx/.test(src),'the old 4.2 cm cap is gone');
 assert(!/new T\.|three/.test(src.split('\n').filter(l=>!/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n')),'jerseyPaint stays 2D (no meshes)');}
// 4. In-game kit (owner, Oct 29 2026): the own player's bean shows the worn jersey's back name. One cached coverage texture painted
//    when the name/font changes (never per frame), sampled only under BEAN_NAME on the own rig's body material, placed between the
//    number and the collar band; batched players (other players, NPCs) never get the define.
{const tex=read('lib/graphics/backNameTexture.ts'),skin=read('lib/graphics/beanSkin.ts'),nums=read('lib/graphics/shirtNumbers.ts'),town=read('components/Town.tsx'),paint=read('lib/shop/jerseyPaint.ts');
 assert(/if\(cached\?\.key===key\)return cached\.texture;/.test(tex),'name texture cached by name+font');
 assert(/cached\?\.texture\.dispose\(\)/.test(tex),'the previous name texture is disposed');
 assert(/export function paintBackNameCoverage[\s\S]*?backNamePrint\(/.test(paint),'coverage uses the studio print (same tracking)');
 assert(/#ifdef BEAN_NAME[\s\S]*?textureGrad\(beanName/.test(skin),'body shader samples the name only under BEAN_NAME');
 assert(/setBackName\(texture\)\{[^\n]*beanName\.value===texture\)return;/.test(skin),'setBackName is a no-op when unchanged');
 const m=nums.match(/BEAN_NAME_U=([\d.]+), BEAN_NAME_W=([\d.]+), BEAN_NAME_H=([\d.]+), BEAN_NAME_CAP=([\d.]+)/),[U,,H]=[+m[1],+m[2],+m[3]];
 const span=.86+.13,num=+nums.match(/BEAN_NUMBER_U=([\d.]+)/)[1],digit=+nums.match(/BEAN_DIGIT_HEIGHT=([\d.]+)/)[1];
 assert((U-num)*span-H/2>=digit/2-.005,'name box sits above the number');assert((U*span+H/2)<.585*span,'and below the collar band');
 const at=town.indexOf('setBackName(backNameTexture(appliedGear.jersey?.name,appliedGear.jersey?.font))');assert(at>0,'Town wires the worn jersey name');
 const line=town.slice(town.lastIndexOf('\n',at),town.indexOf('\n',at));assert(/if\(customizationChanged\)\{/.test(line),'only when the kit changes');
 assert(!/setBackName/.test(read('lib/graphics/playerBatch.ts')),'batched players never get a name');}
console.log('jersey-back-name: ok');
