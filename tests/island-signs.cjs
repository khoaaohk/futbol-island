// Island signs: posts never cover the words (Nov 25 2026, owner shots 78/79: the Island Line board's one post ran up through
// "ISLAND LINE"; the South name board's posts crossed its words and arrows. "Audit all the signs on the island and make sure
// the poles don't run up into the sign and cover the text."). Run: node tests/island-signs.cjs
//  1. the whole island as built (scripts/sign-posts-scan.cjs): every board with words (place, district, shop, school, station
//     name and line boards, teaching boards, jetty and zipline signs...) has no post or part over its text box unless it stands
//     at least SIGN_POST_GAP behind the face; the station boards are among those checked
//  2. the scanner itself: a post planted through a test board's words is caught; the same post moved behind it, or out past
//     the board's end, passes
//  3. the rule (lib/town/signPosts.ts) and the boards built outside the island pass (job boards, departure boards)
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const base=path.join(__dirname,'..'),{scanSigns,scanScene,POST_GAP,TEXT_MARGIN}=require('../scripts/sign-posts-scan.cjs');
const src=f=>fs.readFileSync(path.join(base,f),'utf8');
(async()=>{
 const {covered,checked,T,L}=await scanSigns(base);
 // 1. the island
 assert(checked.length>=150,`only ${checked.length} boards checked`);
 for(const t of ['NORTH BEACH','BEACH VOLLEYBALL','FERRY DOCK','SUMMIT 5s','LILY POND','ZIPLINE TO CORAL CAY','JETTY SHOOTING CHALLENGE','ISLAND HIGH SCHOOL','NOW OPEN','STARFISH SANDBAR'])
  assert(checked.some(c=>c.text.startsWith(t)),`${t} checked`);
 const trainBoards=checked.filter(c=>c.train);
 assert(trainBoards.length>=20&&trainBoards.some(c=>/ISLAND LINE/.test(c.text)),'all five stations\' name and line boards (both faces) checked');
 assert.equal(covered.length,0,`a post or part over a sign's words: ${covered.slice(0,5).map(s=>`"${s.text.slice(0,40)}" @ ${s.at.join(',')} (${s.hits.map(h=>`${h.geo} u ${h.u} n ${h.n}`).slice(0,2).join('; ')})`).join(' | ')}`);
 // 2. the scanner catches a planted post
 {const make=(dx,dz)=>{const sc=new T.Scene(),cv={width:512,height:58,texts:['TEST BOARD']},tex=new T.Texture(cv);
   const face=new T.Mesh(new T.PlaneGeometry(4,.6),new T.MeshBasicMaterial({map:tex}));face.position.set(0,2,0);sc.add(face);
   const post=new T.Mesh(new T.CylinderGeometry(.06,.06,2.2,8),new T.MeshBasicMaterial());post.position.set(dx,1.1,dz);sc.add(post);return scanScene(sc,T).covered.length;};
  assert.equal(make(.8,0),1,'a post through the words is caught');
  assert.equal(make(.8,.08),1,'a post in front is caught');
  assert.equal(make(.8,-.1),0,'behind the face: passes');
  assert.equal(make(2.1,0),0,'past the board\'s end: passes');}
 // 3. the rule and the boards built outside the island
 const S=L('lib/town/signPosts.ts');
 assert.equal(S.SIGN_POST_GAP,POST_GAP);assert.equal(S.SIGN_TEXT_MARGIN,TEXT_MARGIN);
 assert(S.postClearsText(4,.8,-S.SIGN_POST_SET,.06)&&!S.postClearsText(4,.8,0,.06)&&S.postClearsText(4,2.1,0,.06),'postClearsText');
 {const b=S.behindSign(0,0,Math.PI/2,.1);assert(Math.abs(b.x+.1)<1e-9&&Math.abs(b.z)<1e-9,'behind a face turned to +x is -x');}
 {const job=src('lib/town/jobs/jobScene.ts'),m=/x\+c\*side\*([\d.]+),y\+1\.1,z-s\*side\*\1,yaw,\.12,2\.2,\.12/.exec(job);
  assert(m&&+m[1]-.06>=2.7/2-1e-9,'job board posts stand past the board and its label quads (±1.3 m)');}
 {const run=src('lib/town/trainRunning.ts');assert(/face\(U-\.05,U\+\.05,Vv\+\(tw\?-\.03:\.03\),top,yc-h\/2,/.test(run),'the departure board\'s post stops at the board\'s bottom edge');}
 console.log(`island signs: ${checked.length} boards (${trainBoards.length} station board faces), none covered; scanner and rule checks pass`);
})().catch(e=>{console.error(e);process.exit(1);});
