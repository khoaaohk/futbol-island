import './register-local-ts.mjs';
import assert from 'node:assert/strict';
const {appendStroke}=await import('../lib/passPuzzle/drawing.ts');
const points=[{x:0,z:0,t:0}];
for(let i=1;i<2000;i++){appendStroke(points,{x:i/10,z:Math.sin(i/20),t:i/60});assert(points.length<=128);assert.equal(points.at(-1).x,i/10);assert.equal(points[0].x,0);}
for(let i=1;i<points.length;i++)assert(points[i].t>points[i-1].t);
console.log('PASS bounded drawing retains origin, latest endpoint and ordered sample times across 2,000 events');
