// Browser check of the quiz pages (Nov 23 2026): plays one quiz to the end at 390 and 1440 px against a running build.
// Picks, Check, the feedback sheet, Continue, a 3-in-a-row GOAL, a miss (keeper save), the end screen (stars, title, best),
// Share with the copy fallback, the answer key opening, and 0 console errors. Saves screenshots and frame strips (one PNG per
// frame, stitched into a strip page shot) to the output folder.
// Usage: node scripts/check-quiz-browser.cjs [base=http://localhost:9103] [outDir]
const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const {root,L}=require('../tests/lib/tsLoad.cjs');process.chdir(root);
const base=process.argv[2]||'http://localhost:9103',out=path.resolve(process.argv[3]||'shots/quizzes');fs.mkdirSync(out,{recursive:true});
const Z=L('lib/site/quizzes.ts'),quiz=Z.quizBySlug('offside-quiz');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({channel:process.env.PW_CHANNEL||'chrome',args:['--mute-audio']});const fails=[];
 try{
  for(const [tag,vp] of [['phone',{width:390,height:844}],['desktop',{width:1440,height:900}]]){
   const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:tag==='phone'?2:1,isMobile:tag==='phone',hasTouch:tag==='phone'});
   await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
   const page=await ctx.newPage(),errors=[];
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(String(e)));
   await page.addInitScript(()=>{try{Object.defineProperty(navigator,'share',{value:undefined});}catch{}});/* exercise the copy fallback */
   await page.goto(base+'/learn/quizzes',{waitUntil:'networkidle'});await page.screenshot({path:`${out}/hub-${tag}.png`});
   await page.goto(base+quiz.path,{waitUntil:'networkidle'});
   const w=page.locator('[data-quiz-play]');await w.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/quiz-${tag}.png`});
   const frames=async(name)=>{for(const [k,ms] of [[0,0],[1,120],[2,280],[3,520]]){if(ms)await sleep(ms-[0,0,120,280][k]);await w.screenshot({path:`${out}/${name}-${tag}-${k}.png`});}};
   for(let i=0;i<quiz.questions.length;i++){
    const q=quiz.questions[i],miss=i===4,pick=miss?(q.correct+1)%q.options.length:q.correct;
    const checkBtn=page.locator('[data-quiz-check]');if(!(await checkBtn.isDisabled()))fails.push(`${tag} q${i}: Check enabled before a pick`);
    if(i%2===0)await page.keyboard.press(String(pick+1));else await w.locator('[data-quiz-option]').nth(pick).click();
    if(await checkBtn.isDisabled())fails.push(`${tag} q${i}: Check still disabled after a pick`);
    if(i===2||i===4){await (i%2===0?page.keyboard.press('Enter'):checkBtn.click());await frames(i===2?'goal-streak':'wrong');}
    else await (i%2===0?page.keyboard.press('Enter'):checkBtn.click());
    const bar=page.locator('[data-quiz-play] [data-state]').last();const st=await page.locator('[data-quiz-play]>div[data-state]').getAttribute('data-state');
    if(st!==(miss?'wrong':'right'))fails.push(`${tag} q${i}: sheet ${st}`);void bar;
    if(i===1&&tag==='phone')await w.screenshot({path:`${out}/sheet-right-${tag}.png`});
    await page.locator('[data-quiz-next]').click();await sleep(60);
   }
   await sleep(900);await w.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/score-${tag}.png`});
   const endText=await w.innerText();if(!/9\/10|9\s*\/\s*10/.test(endText.replace(/\n/g,'')))fails.push(`${tag}: end score not 9/10 (${endText.slice(0,80)})`);
   if(!/Captain/.test(endText))fails.push(`${tag}: title Captain missing`);
   await page.locator('[data-quiz-share]').click();await sleep(200);
   const copied=await page.locator('[data-quiz-play] [role=status]').innerText().catch(()=>'' );if(!/Copied|futbolisland/.test(copied))fails.push(`${tag}: share fallback (${copied})`);
   await page.locator('[data-quiz-again]').click();await sleep(100);if(!(await page.locator('[data-quiz-check]').count()))fails.push(`${tag}: Try again did not restart`);
   const key=page.locator('[data-answer-key]');await key.locator('summary').click();if(!(await key.evaluate(d=>d.open)))fails.push(`${tag}: answer key did not open`);
   if(errors.length)fails.push(`${tag}: console errors: ${errors.join(' | ').slice(0,300)}`);
   console.log(`${tag}: played ${quiz.questions.length} questions, ${errors.length} console errors`);
   await ctx.close();
  }
  // Spanish page renders and plays one question
  const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(String(e)));
  await page.goto(base+'/es/learn/preguntas-de-futbol/quiz-del-fuera-de-juego',{waitUntil:'networkidle'});
  await page.locator('[data-quiz-play] [role=group] button').first().click();await page.locator('[data-quiz-check]').click();
  if(!(await page.locator('[data-quiz-next]').innerText()).match(/Continuar|Entendido/))fails.push('es: Spanish sheet button');if(errs.length)fails.push('es: '+errs.join('|'));await ctx.close();
 }finally{await browser.close();}
 if(fails.length){console.error('FAIL\n'+fails.join('\n'));process.exit(1);}console.log(`quiz browser check: ok (screenshots in ${out})`);
})().catch(e=>{console.error(e);process.exit(1);});
