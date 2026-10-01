'use client';
import {BackButton} from './BackButton';
import {DoneButton,NavigationButton} from './DoneButton';
import type {FormatPathLaunch} from '@/lib/paths/formatPaths';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import {resetQuizOutcome,loadCatalog,type FieldLesson,type FieldSession} from '@/lib/town/formatLessons';
import {useLessonVoice} from '@/lib/town/useLessonVoice';
import {recordCorrectQuizAnswer,newQuizRun,recordRunAnswer,quizRunCardAnswers,MIN_CARD_QUIZ_QUESTIONS,type QuizRun} from '@/lib/town/quizProgress';
import {isVisual,visualHint} from '@/lib/town/visualQuiz';
import {loadQuizRun,saveQuizRun,clearQuizRun,quizDoneLine} from '@/lib/town/quizRunStore';
import {quizFeedbackText} from '@/lib/town/quizFeedback';
import {lessonGoal} from '@/lib/paths/lessonGoals';
import VisualQuestion from './VisualQuestion';
import {earnForQuiz} from '@/lib/town/cardRewardTriggers';
import {cardRewardsActive} from '@/lib/town/cardRewardStore';
import type {LearningAngle} from '@/lib/town/learningView';
import type {LiveMatchView} from '@/lib/town/fieldRuntime';
import QuizReplay from './QuizReplay';
import FieldVisualBeat from './FieldVisualBeat';
import FieldTranscript from './FieldTranscript';
import FieldRadar from './FieldRadar';
import PlaysPicker from './PlaysPicker';
import styles from './FieldLearning.module.css';
import {journeyById,stageVariant,type LearningId} from '@/lib/town/learningJourneys';
import {isLearningPreview,learningPreviewToken,endLearningPreview,readLearning,saveLearningCursor,exposeLearning,answerLearning,completeLearningStage} from '@/lib/town/learningProgress';
import {journeyLesson,journeyHint} from '@/lib/town/learningJourneyLessons';
import {venueById,type Format} from '@/lib/town/venues';
export default function FieldLearning({pathRequest,learningId,onResetQuizView,onResizeSound,onWake,onLivePause,onPickerChange,readMatch,cameraAngle,format,session,onClose,voiceEnabled,coachVoice,narrationPaused}:{pathRequest?:FormatPathLaunch;learningId?:LearningId;onResetQuizView?:()=>void;onResizeSound?:()=>void;onWake?:()=>void;onLivePause?:(paused:boolean)=>void;onPickerChange?:(open:boolean)=>void;readMatch?:()=>LiveMatchView|null;cameraAngle:MutableRefObject<LearningAngle>;voiceEnabled:boolean;coachVoice:string;narrationPaused:boolean;format:Format;session:MutableRefObject<FieldSession|null>;onClose:()=>void}){
 const savedJourney=useRef(learningId?readLearning().journeys[learningId]:undefined),stage=savedJourney.current?.cursor.stage??0;
 const preview=useRef(isLearningPreview()),previewToken=useRef(learningPreviewToken()),previewMount=useRef(0);
 useEffect(()=>{const mount=++previewMount.current;return()=>{if(preview.current)queueMicrotask(()=>{if(previewMount.current===mount)endLearningPreview(previewToken.current);});};},[]);
 const restored=useRef(false);
 // Town's 3D loop sleeps while a quiz question waits for its answer; any change here (answer, Try again, Next, camera) wakes it.
 useEffect(()=>{onWake?.();});
 const [showHelp,setShowHelp]=useState(stage===1);
 const [chatOpen,setChatOpen]=useState(false),[radarOpen,setRadarOpen]=useState(false);
 const chatTrigger=useRef<HTMLButtonElement>(null);
 const [livePaused,setLivePaused]=useState(false);
 const livePauseCallback=useRef(onLivePause);livePauseCallback.current=onLivePause;
 useEffect(()=>()=>{livePauseCallback.current?.(false);},[]);
 const [angle,setAngle]=useState<LearningAngle>('default');
 useEffect(()=>{cameraAngle.current='default';},[cameraAngle]);
 const changeAngle=()=>{const angles:LearningAngle[]=['default','broadcast','top','side','goalkeeper'],next=angles[(angles.indexOf(angle)+1)%angles.length];cameraAngle.current=next;setAngle(next);};
 const [pickerOpen,setPickerOpen]=useState(false);
 // Heat (overnight audit F1, Sep 30 2026): the Choose plays sheet is full-screen and opaque, so Town puts the island (and the
 // watched live match) to sleep behind it like any other full-screen menu; closing it or picking a play wakes the loop.
 const pickerCallback=useRef(onPickerChange);pickerCallback.current=onPickerChange;
 useEffect(()=>{pickerCallback.current?.(pickerOpen);},[pickerOpen]);
 useEffect(()=>()=>{pickerCallback.current?.(false);},[]);
 // Lesson opener (G-18): the title and a one-line goal show when a lesson opens, until the child starts the play or moves on.
 const [intro,setIntro]=useState<string|null>(null);
 const pickerTrigger=useRef<HTMLButtonElement>(null);
 const [lessons,setLessons]=useState<FieldLesson[]>([]),[error,setError]=useState(''),[chosen,setChosen]=useState<FieldLesson|null>(null),[step,setStep]=useState(0),[playing,setPlaying]=useState(true),[quiz,setQuiz]=useState(false),[question,setQuestion]=useState(0),[answer,setAnswer]=useState<number|null>(null),[category,setCategory]=useState('All');
 const voiceQuestion=chosen?.questions[question];
 const voice=useLessonVoice(session,quiz?(answer===null?voiceQuestion?.voice:(answer!==voiceQuestion?.correct?voiceQuestion?.choiceVoices?.[answer]??voiceQuestion?.explainVoice:voiceQuestion?.explainVoice)):chosen?.steps[step]?.voice,chosen?`${chosen.id}:${quiz?'q'+question+':'+(answer===null?'prompt':'feedback'):'s'+step}`:'',playing,quiz,voiceEnabled,coachVoice,narrationPaused||pickerOpen);
 useEffect(()=>{let current=true;loadCatalog(format).then(list=>{if(current)setLessons(list);}).catch(e=>{if(current)setError(e.message);});return()=>{current=false;session.current=null;};},[format,session]);
 useEffect(()=>{if(!pickerOpen||!session.current)return;const current=session.current,wasPlaying=current.playing;current.playing=false;setPlaying(false);return()=>{if(session.current===current){current.playing=wasPlaying;setPlaying(wasPlaying);}};},[pickerOpen,session]);
 // QA11: like the Paths launch, a lesson picked from the list starts PAUSED behind the "You'll learn" card; "Let's go" plays it.
 const select=(lesson:FieldLesson)=>{setLivePaused(false);onLivePause?.(false);voice.prime();setChosen(lesson);setIntro(lesson.id);setStep(0);setPlaying(false);setQuiz(false);setQuestion(0);setAnswer(null);session.current={format,lesson,step:0,progress:0,playing:false,quiz:false,question:0,answer:null,voicePending:voice.enabled,cameraMode:'guided',onPlaying:setPlaying,onStep:setStep};setPickerOpen(false);};
 const seek=(n:number)=>{setIntro(null);if(learningId&&!preview.current&&n>0)exposeLearning(learningId,stageVariant(learningId,stage),'solution');const s=session.current;if(!s)return;s.quiz=false;setQuiz(false);s.answer=null;setAnswer(null);s.step=Math.max(0,Math.min(s.lesson.steps.length-1,n));s.progress=0;s.voicePending=voice.enabled;s.playing=false;setPlaying(false);setStep(s.step);};
 // Card rewards (docs/quiz-design.md): this quiz run's answers. A quiz of MIN_CARD_QUIZ_QUESTIONS+ questions, all correct under
 // quizRunAllCorrect (retries count unless CARD_QUIZ_FIRST_TRY), offers one card pick; quizCardEligible is the single rule.
 const correctRun=useRef<QuizRun>(newQuizRun(''));
 const startQuiz=()=>{setIntro(null);correctRun.current=newQuizRun(chosen?.id??'');if(chosen)clearQuizRun(chosen.fmt,chosen.id);if(!chosen?.questions.length)return;const q=chosen.questions[0],s=session.current!;resetQuizOutcome(s);s.quiz=true;s.playing=false;s.step=q.step;s.progress=1;s.question=0;s.answer=null;setQuiz(true);setQuestion(0);setAnswer(null);setPlaying(false);setStep(q.step);setPickerOpen(false);};
 const choose=(index:number)=>{if(!chosen||!session.current||session.current.answer!==null)return;resetQuizOutcome(session.current);setAnswer(index);session.current.answer=index;if(learningId&&!preview.current)answerLearning(learningId,stage,chosen.id,question,index,index===chosen.questions[question]?.correct);if(!preview.current){if(correctRun.current.lessonId!==chosen.id)correctRun.current=learningId?newQuizRun(chosen.id):loadQuizRun(chosen.fmt,chosen.id);const right=index===chosen.questions[question]?.correct;recordRunAnswer(correctRun.current,question,right);if(!learningId)saveQuizRun(chosen.fmt,correctRun.current);if(right)recordCorrectQuizAnswer(chosen.fmt,chosen.id,question);}};
 useEffect(()=>{if(session.current)session.current.onAnswer=choose;});
 useEffect(()=>{if(!quiz||answer!==null||pickerOpen||chatOpen||!chosen||isVisual(chosen.questions[question]))return;const key=(event:KeyboardEvent)=>{if(event.ctrlKey||event.metaKey||event.altKey||event.target instanceof HTMLElement&&event.target.closest('input,textarea,select,[contenteditable=true]'))return;const index=/^[1-9]$/.test(event.key)?Number(event.key)-1:event.key.toUpperCase().charCodeAt(0)-65;if(event.key.length===1&&index>=0&&index<chosen.questions[question].options.length){event.preventDefault();choose(index);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[quiz,answer,pickerOpen,chatOpen,chosen,question]);
 const retryQuestion=()=>{const s=session.current;if(!s)return;const q=s.lesson.questions[s.question];resetQuizOutcome(s);s.answer=null;s.step=q.step;s.progress=1;s.playing=false;setAnswer(null);setStep(q.step);};
 const nextQuestion=()=>{if(!chosen)return;const n=question+1;if(n>=chosen.questions.length){if(!preview.current&&!learningId){earnForQuiz(chosen,quizRunCardAnswers(chosen.id,chosen.questions.length,correctRun.current));clearQuizRun(chosen.fmt,chosen.id);}if(learningId){if(!preview.current)completeLearningStage(learningId,stage);onClose();return;}if(pathRequest){onClose();return;}setQuiz(false);session.current!.quiz=false;return;}const q=chosen.questions[n],s=session.current!;resetQuizOutcome(s);s.question=n;s.answer=null;s.step=q.step;s.progress=1;s.playing=false;setQuestion(n);setAnswer(null);setStep(q.step);};
 // A tall visual question on a phone can push the result and its Try again / Next button below the panel's fold: bring them into view once.
 useEffect(()=>{if(!quiz||answer===null)return;const id=requestAnimationFrame(()=>{const s=document.querySelector<HTMLElement>('section[aria-label="Pitch quiz"]');if(s&&s.scrollHeight>s.clientHeight+2)s.scrollTo({top:s.scrollHeight,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});return()=>cancelAnimationFrame(id);},[quiz,answer,question]);
 const returnToLive=()=>{session.current=null;setChosen(null);setQuiz(false);setAnswer(null);setPlaying(true);setChatOpen(false);setRadarOpen(false);setLivePaused(false);onLivePause?.(false);cameraAngle.current='default';setAngle('default');};
 const togglePlayback=()=>{setIntro(null);if(!chosen){const paused=!livePaused;setLivePaused(paused);onLivePause?.(paused);return;}voice.prime();const s=session.current!;if(!s.playing&&s.step===s.lesson.steps.length-1&&s.progress>=1){s.step=0;s.progress=0;s.voicePending=voice.enabled;setStep(0);}s.playing=!s.playing;setPlaying(s.playing);};
 const finished=Boolean(chosen&&!quiz&&!playing&&step===chosen.steps.length-1&&session.current&&session.current.progress>=1);
 // Manual Next navigation pauses at the start of the final step. Offer the
 // same exit choices without requiring playback or awarding lesson progress.
 const endActionsAvailable=Boolean(chosen&&!quiz&&!playing&&step===chosen.steps.length-1);
 const watchAgain=()=>{setIntro(null);const s=session.current;if(!s)return;voice.prime();s.quiz=false;s.answer=null;s.step=0;s.progress=0;s.voicePending=voice.enabled;s.playing=true;setQuiz(false);setAnswer(null);setStep(0);setPlaying(true);};
 useEffect(()=>{
  if(!pathRequest||restored.current||!lessons.length)return;
  const lesson=lessons.find(l=>l.id===pathRequest.lessonId);if(!lesson){setError('This lesson could not load. Please return to Paths and try again.');return;}
  restored.current=true;const isQuiz=pathRequest.quiz,n=pathRequest.question,at=isQuiz?lesson.questions[n].step:pathRequest.step;
  // A resumed quiz keeps the first-try answers saved before the pause (lib/town/quizRunStore.ts), so a clean run still earns its card.
  correctRun.current=isQuiz?loadQuizRun(lesson.fmt,lesson.id):newQuizRun(lesson.id);if(!isQuiz)setIntro(lesson.id);
  setChosen(lesson);setStep(at);setQuiz(isQuiz);setQuestion(n);setAnswer(null);setPlaying(false);
  session.current={format,lesson,step:at,progress:isQuiz?1:0,playing:false,quiz:isQuiz,question:n,answer:null,voicePending:false,cameraMode:'guided',onPlaying:setPlaying,onStep:setStep};
 },[pathRequest,lessons,format,session]);
 useEffect(()=>{
  if(!learningId||restored.current||!lessons.length)return;
  const j=journeyById(learningId)!,lesson=stage===0?lessons.find(l=>l.id===j.lesson):journeyLesson(learningId,stage);
  if(!lesson){setError('This path lesson could not load. Close and try again.');return;}
  const saved=savedJourney.current?.cursor;
  const n=Math.min(saved?.question??0,lesson.questions.length-1),q=lesson.questions[n],isQuiz=stage>0||saved?.quiz===true;
  const at=isQuiz?q.step:Math.min(saved?.step??0,lesson.steps.length-1),response=isQuiz&&saved?.answer!==null&&saved?.answer!==undefined&&saved.answer<q.options.length?saved.answer:null;
  restored.current=true;setChosen(lesson);setStep(at);setQuiz(isQuiz);setQuestion(n);setAnswer(response);setPlaying(false);
  session.current={format,lesson,step:at,progress:isQuiz?1:0,playing:false,quiz:isQuiz,question:n,answer:response,voicePending:false,cameraMode:'guided',onPlaying:setPlaying,onStep:setStep};
  if(!preview.current)exposeLearning(learningId,lesson.id,'scene');
 },[learningId,lessons,format,session,stage]);
 useEffect(()=>{if(!learningId||!restored.current||!chosen||preview.current)return;
  saveLearningCursor(learningId,{stage,step,quiz,question,answer});
  if(stage===0&&step>0||answer!==null)exposeLearning(learningId,chosen.id,'solution');
 },[learningId,stage,chosen,step,quiz,question,answer]);
 const title=venueById(format).name,q=chosen?.questions[question];
 return <>
 {pathRequest&&error&&<p role="alert">{error}</p>}
 {learningId&&(!quiz||error)&&<div className={styles.questLabel}><strong>{journeyById(learningId)?.title} · </strong><span>{['See it','Try with help','Your decision','Change the situation','Spot it again','Another situation'][stage]}</span>{error&&<p role="alert">{error} <button onClick={()=>{setError('');loadCatalog(format).then(setLessons).catch(e=>setError(e.message));}}>Try again</button></p>}</div>}
 <nav className={styles.corners} aria-label="Lesson navigation">{quiz&&<BackButton className={styles.camera} title={learningId||pathRequest?'Save and return to Paths':'Back to live game'} onBack={()=>{if(learningId||pathRequest){session.current=null;onClose();}else returnToLive();}}/>}{!(quiz)&&<div className={styles.cameraTools}><button className={styles.camera} aria-label={'Change camera angle: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} title={'Camera: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} onClick={changeAngle}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg></button></div>}{!learningId&&!quiz&&<NavigationButton key={String(pickerOpen)} ref={pickerTrigger} className={styles.choose} label="Choose plays" aria-haspopup="dialog" aria-expanded={pickerOpen} onNavigate={()=>setPickerOpen(true)}/>}{!quiz&&<DoneButton className={styles.close} title={learningId||pathRequest?'Save and return to Paths':'Return to island'} onDone={()=>{session.current=null;onClose();}}/>}</nav>
 <PlaysPicker open={pickerOpen} onClose={()=>setPickerOpen(false)} trigger={pickerTrigger} format={format} title={title} lessons={lessons} chosen={chosen?.id} category={category} onCategory={setCategory} onSelect={select} error={error} onRetry={()=>{setError('');loadCatalog(format).then(setLessons).catch(e=>setError(e.message));}}/>

 {!(quiz)&&<FieldTranscript onResizeSound={onResizeSound} open={chatOpen} onClose={()=>setChatOpen(false)} trigger={chatTrigger} session={session} readMatch={readMatch} chosen={chosen} step={step} quiz={quiz} question={question} answer={answer}/>}
 <footer className={styles.bottom} data-quiz={quiz} aria-label="Playback controls">
 {!(quiz)&&<button ref={chatTrigger} className={styles.chat} aria-label={chatOpen?"Minimize transcript":"Open transcript"} aria-controls="field-transcript" aria-expanded={chatOpen} onClick={()=>{setRadarOpen(false);setChatOpen(!chatOpen);}}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{chatOpen?<path d="M5 12h14"/>:<><path d="M4 4h16v12H9l-5 4V4z"/><path d="M8 8h8M8 12h5"/></>}</svg></button>}
 <div className={styles.playback} data-quiz={quiz}>{quiz&&<FieldTranscript docked onResizeSound={onResizeSound} open={chatOpen} onClose={()=>setChatOpen(false)} trigger={chatTrigger} session={session} readMatch={readMatch} chosen={chosen} step={step} quiz={quiz} question={question} answer={answer}/>}{chosen&&quiz&&q&&!pickerOpen&&<section className={styles.quizUnified} data-visual={isVisual(q)||undefined} data-pitch-pick={!isVisual(q)&&answer===null||undefined} aria-label="Pitch quiz">
 {<div className={styles.quizTools}><button ref={chatTrigger} type="button" aria-label={chatOpen?"Collapse transcript":"Open transcript"} aria-controls="field-transcript" aria-expanded={chatOpen} onClick={()=>{setRadarOpen(false);setChatOpen(open=>!open);}}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4z"/><path d="M8 8h8M8 12h5"/></svg>{chatOpen?"Hide transcript":"Read along"}</button><button className={styles.camera} aria-label={'Change camera angle: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} title={'Camera: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} onClick={changeAngle}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg></button></div>}
 <small>QUESTION {question+1} / {chosen.questions.length}</small>
 {isVisual(q)&&<><p className={styles.quizQuestion}>{q.q}</p>{answer===null&&<p className={styles.quizHint}>{visualHint(q)}</p>}<VisualQuestion key={`${chosen.id}:${question}`} lesson={chosen} q={q} answer={answer} onAnswer={choose}/></>}
 {answer===null?<>{!isVisual(q)&&<><p className={styles.quizQuestion}>{q.q}</p><p className={styles.quizHint}>Tap a marked {q.interact?.paths?'route':q.interact?.candidates?'player':'space'} on the pitch.</p></>}{learningId&&<><button className={styles.questHintButton} onClick={()=>{setShowHelp(true);if(!preview.current)exposeLearning(learningId,chosen.id,'hint');}}>Give me a hint</button>{showHelp&&<p>{journeyHint(learningId)}</p>}</>}</>:<><p role="status" className={styles.quizResult}><strong>{answer===q.correct?'Correct. ':'Look again. '}</strong>{quizFeedbackText(answer!==q.correct?q.choiceExplanations?.[answer]??q.explain:q.explain)}</p>{answer===q.correct&&question+1===chosen.questions.length&&chosen.questions.length>=MIN_CARD_QUIZ_QUESTIONS&&!preview.current&&<p className={styles.quizHint}>{quizDoneLine(chosen.questions.length,correctRun.current.firstTry.size,cardRewardsActive())}</p>}<QuizReplay key={`${chosen.id}:${question}:${answer}`} session={session} onRetry={retryQuestion} onNext={nextQuestion} onWake={onWake} nextLabel={question+1<chosen.questions.length?'Next question':learningId||pathRequest?'Back to Paths':'Back to lesson'}/></>}
 </section>}{chosen&&!quiz&&!pickerOpen&&intro===chosen.id&&(()=>{const g=lessonGoal(chosen.fmt,{id:chosen.id,concept:chosen.catalog?.what});return <section className={styles.quizUnified} data-lesson-opener aria-label="Lesson goal"><small>{`LESSON · ${chosen.fmt.toUpperCase()}`}</small><p className={styles.quizQuestion}>{chosen.name}</p>{g&&<p className={styles.quizResult}><strong>You’ll learn: </strong>{g.goal}</p>}<div className={styles.endActions}><button type="button" data-lesson-opener-go onClick={()=>{setIntro(null);const s=session.current;if(s&&!s.playing)togglePlayback();}}>Let’s go</button></div>{g?.words&&<><p className={styles.quizHint}><strong>Words to know</strong></p><dl className={styles.lessonWords}>{g.words.map(w=><div key={w.term}><dt>{w.term}</dt><dd>{w.meaning}</dd></div>)}</dl></>}</section>;})()}<FieldVisualBeat session={session} hidden={!chosen||quiz||pickerOpen||chatOpen||finished||intro===chosen?.id}/>{endActionsAvailable&&<div className={styles.endActions}>{chosen!.questions.length>0&&<button onClick={startQuiz}>Quiz yourself</button>}<button onClick={watchAgain}>Watch again</button></div>}{chosen&&!quiz&&<small>{`${step+1} / ${chosen.steps.length}`}</small>}{!quiz&&<div className={styles.transport}><button aria-label="Previous step" disabled={!chosen||step===0||!!learningId&&stage>0} onClick={()=>seek(step-1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><button aria-label={chosen?(playing?'Pause':'Play'):(livePaused?'Play live game':'Pause live game')} disabled={quiz||!!learningId&&stage>0} onClick={togglePlayback}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{(chosen?playing:!livePaused)?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<path d="M7 4.5a1 1 0 0 1 1.5-.86l12 7.5a1 1 0 0 1 0 1.72l-12 7.5A1 1 0 0 1 7 19.5z"/>}</svg></button><button aria-label="Next step" disabled={!chosen||step===chosen.steps.length-1||!!learningId&&stage>0} onClick={()=>seek(step+1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div>}</div>
 {!(quiz)&&<FieldRadar open={radarOpen} onOpenChange={open=>{setChatOpen(false);setRadarOpen(open);}} session={session} readMatch={readMatch}/>}
 </footer>
 </>;
}
