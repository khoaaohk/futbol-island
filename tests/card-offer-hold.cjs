// Card offers wait for the end of a lesson, quiz or story (Oct 10 2026, user): lib/town/cardOfferHold.ts and its wiring.
// usage: node tests/card-offer-hold.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(read('lib/town/cardOfferHold.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {module:mod,exports:mod.exports,require:id=>id==='react'?{useSyncExternalStore:(sub,get)=>get()}:require(id)});
const H=mod.exports;

// 1. The hold registry: any holder holds; each holder releases only itself.
assert.equal(H.cardOffersHeld(),false,'nothing held at start (and after a reload)');
const a=H.cardHoldId('lesson'),b=H.cardHoldId('lesson'),story=H.cardHoldId('story');
assert.notEqual(a,b,'every mounted holder has its own id');
H.holdCardOffers(a,true);assert.equal(H.cardOffersHeld(),true,'a lesson holds offers');
// Paths "Next lesson": React runs the old lesson's cleanup, then the new lesson's mount effect, in one commit.
H.holdCardOffers(a,false);H.holdCardOffers(b,true);assert.equal(H.cardOffersHeld(),true,'next lesson keeps holding');
H.holdCardOffers(story,true);H.holdCardOffers(b,false);assert.equal(H.cardOffersHeld(),true,'a story still holds after the lesson closes');
H.holdCardOffers(story,false);assert.equal(H.cardOffersHeld(),false,'released once nothing holds');
H.holdCardOffers(story,false);assert.equal(H.cardOffersHeld(),false,'double release is harmless');

// 2. FieldLearning's rule.
const rule=o=>H.lessonHoldsCards({launching:false,chosen:true,quiz:false,quizEnded:false,playing:false,rewatch:false,...o});
assert.equal(rule({chosen:false}),false,'live match view (no lesson): offers may open');
assert.equal(rule({chosen:false,launching:true}),true,'a Paths launch holds while its lesson loads');
assert.equal(rule({playing:true}),true,'lesson playing: held');
assert.equal(rule({}),true,'lesson paused or on its end screen before the quiz: held');
assert.equal(rule({quiz:true}),true,'mid-quiz: held');
assert.equal(rule({quiz:true,quizEnded:true}),true,'quiz result screen still up: held');
assert.equal(rule({rewatch:true,quizEnded:true}),true,'"Watch that part" replay: held');
assert.equal(rule({quizEnded:true}),false,'quiz ended, back on the lesson end screen: the offer opens');
assert.equal(rule({quizEnded:true,playing:true}),true,'"Watch again" after the quiz: held again');

// 3. Wiring.
const host=read('components/CardOfferHost.tsx'),fl=read('components/FieldLearning.tsx'),qlp=read('components/QuestLearningPath.tsx'),town=read('components/Town.tsx'),store=read('lib/town/cardRewardStore.ts');
assert.match(host,/held=useCardOffersHeld\(\)/,'CardOfferHost reads the hold');
assert.match(host,/if\(!openId&&!complete&&!blocked&&!held&&fresh\)setOpenId\(fresh\.id\)/,'a fresh offer opens only when nothing holds it');
assert.match(host,/complete&&!blocked&&!held/,'the all-collected note waits too');
assert.match(fl,/holdsCards=lessonHoldsCards\(\{launching:!!\(pathRequest\|\|learningId\),chosen:!!chosen,quiz,quizEnded,playing,rewatch:rewatch!==null\}\)/,'FieldLearning computes its hold');
assert.match(fl,/useEffect\(\(\)=>\{holdCardOffers\(holdId\.current,holdsCards\);\},\[holdsCards\]\)/,'FieldLearning holds while busy');
assert.match(fl,/return\(\)=>holdCardOffers\(id,false\)/,'FieldLearning releases on close');
assert.equal((fl.match(/setQuizEnded\(true\)/g)||[]).length,1,'only the end of a quiz releases a lesson');
assert.match(fl,/setQuiz\(false\);session\.current!\.quiz=false;setQuizEnded\(true\);return;/,'the free-play quiz end releases on the lesson end screen');
for(const fn of ['select','seek','startQuiz','watchAgain'])assert.match(fl,new RegExp(`const ${fn}=\\([^)]*\\)=>\\{[^\\n]*?setQuizEnded\\(false\\)`),`${fn} holds again`);
// The quiz's card is earned (and saved) before the lesson swaps or closes, so nothing waits in memory only.
const end=fl.slice(fl.indexOf('const nextQuestion='));assert(end.indexOf('earnForQuiz(')<end.indexOf('launchPathLesson(')&&end.indexOf('earnForQuiz(')<end.indexOf('onClose()'),'quiz card is earned before Next lesson / Back to Paths');
assert.match(store,/localStorage\.setItem\(OFFERS_STORAGE_KEY/,'offers persist across reloads (cardRewardStore)');
assert.match(qlp,/holdCardOffers\(storyHold\.current,!!\(story\|\|upcoming\)\)/,'a playing story holds offers');
assert.match(qlp,/return\(\)=>holdCardOffers\(id,false\)/,'Paths releases its story hold on close');
assert.match(town,/<CardOfferHost blocked=\{[^}]*!!lesson\|\|/,'the pass-practice lesson blocks offers too');
console.log('CARD_OFFER_HOLD_PASS: holders, lesson/quiz/story rule, host and wiring');
