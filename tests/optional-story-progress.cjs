const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:id=>load(path.resolve(path.dirname(file),id+'.ts'))});return m.exports;}
const {OPTIONAL_STORY_KEY,readOptionalStoryProgress,loadOptionalStoryProgress,completeOptionalStory}=load('lib/paths/optionalStoryProgress.ts');
const all=Object.values(load('lib/paths/upcomingStories.ts').UPCOMING_STORIES).flat().map(story=>story.id);
assert.equal(all.length,12);assert.deepEqual(Array.from(readOptionalStoryProgress([...all,...all,'grit','unknown',null])),all);
for(const malformed of [null,{},42,'chalk-line'])assert.equal(readOptionalStoryProgress(malformed).length,0);
const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
for(const malformed of ['{broken','null','{}','42','"chalk-line"']){values.set(OPTIONAL_STORY_KEY,malformed);assert.equal(loadOptionalStoryProgress(storage).length,0);}
values.set(OPTIONAL_STORY_KEY,JSON.stringify(['chalk-line','grit','chalk-line']));
assert.deepEqual(Array.from(loadOptionalStoryProgress(storage)),['chalk-line']);
const done=completeOptionalStory('different-tides',['harbour-night'],storage);
assert.deepEqual(Array.from(done),['chalk-line','different-tides','harbour-night']);
assert.deepEqual(Array.from(loadOptionalStoryProgress(storage)),Array.from(done),'completion restores after reopening');
assert.deepEqual(Array.from(completeOptionalStory('different-tides',done,storage)),Array.from(done),'replay is idempotent');
assert.deepEqual(Array.from(completeOptionalStory('unknown',done,storage)),Array.from(done),'unknown IDs never persist');
const blocked={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
assert.equal(loadOptionalStoryProgress(blocked).length,0);
assert.deepEqual(Array.from(completeOptionalStory('chalk-line',['different-tides'],blocked)),['chalk-line','different-tides'],'current completion survives denied storage');
assert.equal(values.size,1,'separate optional key cannot change lesson or legacy-story progress');
console.log('PASS all 12 optional stories, malformed/denied storage, deduplication, restoration and idempotent replay');
