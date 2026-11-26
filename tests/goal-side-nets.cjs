// Goal side nets (owner Nov 25 2026: "side of the net is missing" on the beach court): every goal with depth has netting on BOTH
// side panels, not just the back/roof. The island pitches + stadium (fields.ts goalGeometry, LineSegments: no face culling) already
// had them; the box/rod-built goals (beach court, pocket futsal, Summit 5s, the sandbar practice goal, the kids' mini goal) did not.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
t('fields.ts goalGeometry: side-panel cords from the goal line to the back (both posts)',()=>{
 const s=read('lib/town/fields.ts');assert(/for\(const x of \[-gw,gw\]\)line\(\[x,y,z\],\[x,Math\.min\(y,h-\.12\),back\]\)/.test(s));
 assert(/for\(const x of \[-gw,gw\]\)for\(let i=1;i<6;i\+\+\)/.test(s),'side uprights');
});
t('beach court: side cords (horizontal + uprights) on both sides, net colour, no shadows',()=>{
 const s=read('lib/town/coralCayWorld.ts');
 assert(s.includes("for(const side of [-1,1]){const sz=K.z+side*gw;for(let y=.2;y<h;y+=.3)box(1.5,.022,.022,'#c3d1b9',(gx+back)/2,y,sz).castShadow=false;"));
 assert(s.includes("for(let f=.3;f<1.5;f+=.3)box(.022,h,.022,'#c3d1b9',gx+end*f,h/2,sz).castShadow=false;"));
});
t('sandbar practice goal + kids mini goal: side panels joining the posts to the back net',()=>{
 const s=read('lib/town/coralCayWorld.ts');
 assert(s.includes("for(const dx of [-1.2,1.2]){for(let y=.3;y<1.2;y+=.3)box(.02,.02,.6,"));
 assert(s.includes("for(const dx of [-1.1,1.1]){for(let y=.25;y<1;y+=.25)box(.02,.02,.5,"));
});
t('pocket futsal court: side cords on both sides',()=>{
 const s=read('lib/town/world.ts');assert(s.includes("for(const z of [cz-1.6,cz+1.6]){for(let y=.15;y<2.05;y+=.25)box(1.3,.022,.022,'#c3d1b9'"));
});
t('Summit 5s: side triangles netted (post to sloping frame, uprights to the slope)',()=>{
 const s=read('lib/town/summitIsleWorld.ts');assert(s.includes('slopeX=(y:number)=>gx+(back-gx)*Math.min(1,(gh-y)/(gh-.2))'));
 assert(s.includes('bakeRod(SP,V(gx,g0+y,z),V(slopeX(y),g0+y,z),.012'));
});
console.log(`goal-side-nets: ${n} passed`);
