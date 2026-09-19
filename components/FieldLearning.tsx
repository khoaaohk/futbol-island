'use client';
import {BackButton} from './BackButton';
import {DoneButton,NavigationButton} from './DoneButton';
import type {FormatPathLaunch} from '@/lib/paths/formatPaths';
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import {resetQuizOutcome,loadCatalog,type FieldLesson,type FieldSession} from '@/lib/town/formatLessons';
import {useLessonVoice} from '@/lib/town/useLessonVoice';
import {recordCorrectQuizAnswer} from '@/lib/town/quizProgress';
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
export default function FieldLearning({pathRequest,learningId,onResetQuizView,onResizeSound,onLivePause,readMatch,cameraAngle,format,session,onClose,voiceEnabled,coachVoice,narrationPaused}:{pathRequest?:FormatPathLaunch;learningId?:LearningId;onResetQuizView?:()=>void;onResizeSound?:()=>void;onLivePause?:(paused:boolean)=>void;readMatch?:()=>LiveMatchView|null;cameraAngle:MutableRefObject<LearningAngle>;voiceEnabled:boolean;coachVoice:string;narrationPaused:boolean;format:Format;session:MutableRefObject<FieldSession|null>;onClose:()=>void}){
 const savedJourney=useRef(learningId?readLearning().journeys[learningId]:undefined),stage=savedJourney.current?.cursor.stage??0;
 const preview=useRef(isLearningPreview()),previewToken=useRef(learningPreviewToken()),previewMount=useRef(0);
 useEffect(()=>{const mount=++previewMount.current;return()=>{if(preview.current)queueMicrotask(()=>{if(previewMount.current===mount)endLearningPreview(previewToken.current);});};},[]);
 const restored=useRef(false);
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
 const pickerTrigger=useRef<HTMLButtonElement>(null);
 const [lessons,setLessons]=useState<FieldLesson[]>([]),[error,setError]=useState(''),[chosen,setChosen]=useState<FieldLesson|null>(null),[step,setStep]=useState(0),[playing,setPlaying]=useState(true),[quiz,setQuiz]=useState(false),[question,setQuestion]=useState(0),[answer,setAnswer]=useState<number|null>(null),[category,setCategory]=useState('All');
 const voiceQuestion=chosen?.questions[question];
 const voice=useLessonVoice(session,quiz?(answer===null?voiceQuestion?.voice:(answer!==voiceQuestion?.correct?voiceQuestion?.choiceVoices?.[answer]??voiceQuestion?.explainVoice:voiceQuestion?.explainVoice)):chosen?.steps[step]?.voice,chosen?`${chosen.id}:${quiz?'q'+question+':'+(answer===null?'prompt':'feedback'):'s'+step}`:'',playing,quiz,voiceEnabled,coachVoice,narrationPaused||pickerOpen);
 useEffect(()=>{let current=true;loadCatalog(format).then(list=>{if(current)setLessons(list);}).catch(e=>{if(current)setError(e.message);});return()=>{current=false;session.current=null;};},[format,session]);
 useEffect(()=>{if(!pickerOpen||!session.current)return;const current=session.current,wasPlaying=current.playing;current.playing=false;setPlaying(false);return()=>{if(session.current===current){current.playing=wasPlaying;setPlaying(wasPlaying);}};},[pickerOpen,session]);
 const select=(lesson:FieldLesson)=>{setLivePaused(false);onLivePause?.(false);voice.prime();setChosen(lesson);setStep(0);setPlaying(true);setQuiz(false);setQuestion(0);setAnswer(null);session.current={format,lesson,step:0,progress:0,playing:true,quiz:false,question:0,answer:null,voicePending:voice.enabled,cameraMode:'guided',onPlaying:setPlaying,onStep:setStep};setPickerOpen(false);};
 const seek=(n:number)=>{if(learningId&&!preview.current&&n>0)exposeLearning(learningId,stageVariant(learningId,stage),'solution');const s=session.current;if(!s)return;s.quiz=false;setQuiz(false);s.answer=null;setAnswer(null);s.step=Math.max(0,Math.min(s.lesson.steps.length-1,n));s.progress=0;s.voicePending=voice.enabled;s.playing=false;setPlaying(false);setStep(s.step);};
 const startQuiz=()=>{if(!chosen?.questions.length)return;const q=chosen.questions[0],s=session.current!;resetQuizOutcome(s);s.quiz=true;s.playing=false;s.step=q.step;s.progress=1;s.question=0;s.answer=null;setQuiz(true);setQuestion(0);setAnswer(null);setPlaying(false);setStep(q.step);setPickerOpen(false);};
 const choose=(index:number)=>{if(!chosen||!session.current||session.current.answer!==null)return;resetQuizOutcome(session.current);setAnswer(index);session.current.answer=index;if(learningId&&!preview.current)answerLearning(learningId,stage,chosen.id,question,index,index===chosen.questions[question]?.correct);if(!preview.current&&index===chosen.questions[question]?.correct)recordCorrectQuizAnswer(chosen.fmt,chosen.id,question);};
 useEffect(()=>{if(session.current)session.current.onAnswer=choose;});
 useEffect(()=>{if(!quiz||answer!==null||pickerOpen||chatOpen||!chosen)return;const key=(event:KeyboardEvent)=>{if(event.ctrlKey||event.metaKey||event.altKey||event.target instanceof HTMLElement&&event.target.closest('input,textarea,select,[contenteditable=true]'))return;const index=/^[1-9]$/.test(event.key)?Number(event.key)-1:event.key.toUpperCase().charCodeAt(0)-65;if(event.key.length===1&&index>=0&&index<chosen.questions[question].options.length){event.preventDefault();choose(index);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[quiz,answer,pickerOpen,chatOpen,chosen,question]);
 const retryQuestion=()=>{const s=session.current;if(!s)return;const q=s.lesson.questions[s.question];resetQuizOutcome(s);s.answer=null;s.step=q.step;s.progress=1;s.playing=false;setAnswer(null);setStep(q.step);};
 const nextQuestion=()=>{if(!chosen)return;const n=question+1;if(n>=chosen.questions.length){if(learningId){if(!preview.current)completeLearningStage(learningId,stage);onClose();return;}if(pathRequest){onClose();return;}setQuiz(false);session.current!.quiz=false;return;}const q=chosen.questions[n],s=session.current!;resetQuizOutcome(s);s.question=n;s.answer=null;s.step=q.step;s.progress=1;s.playing=false;setQuestion(n);setAnswer(null);setStep(q.step);};
 const returnToLive=()=>{session.current=null;setChosen(null);setQuiz(false);setAnswer(null);setPlaying(true);setChatOpen(false);setRadarOpen(false);setLivePaused(false);onLivePause?.(false);cameraAngle.current='default';setAngle('default');};
 const togglePlayback=()=>{if(!chosen){const paused=!livePaused;setLivePaused(paused);onLivePause?.(paused);return;}voice.prime();const s=session.current!;if(!s.playing&&s.step===s.lesson.steps.length-1&&s.progress>=1){s.step=0;s.progress=0;s.voicePending=voice.enabled;setStep(0);}s.playing=!s.playing;setPlaying(s.playing);};
 const finished=Boolean(chosen&&!quiz&&!playing&&step===chosen.steps.length-1&&session.current&&session.current.progress>=1);
 // Manual Next navigation pauses at the start of the final step. Offer the
 // same exit choices without requiring playback or awarding lesson progress.
 const endActionsAvailable=Boolean(chosen&&!quiz&&!playing&&step===chosen.steps.length-1);
 const watchAgain=()=>{const s=session.current;if(!s)return;voice.prime();s.quiz=false;s.answer=null;s.step=0;s.progress=0;s.voicePending=voice.enabled;s.playing=true;setQuiz(false);setAnswer(null);setStep(0);setPlaying(true);};
 useEffect(()=>{
  if(!pathRequest||restored.current||!lessons.length)return;
  const lesson=lessons.find(l=>l.id===pathRequest.lessonId);if(!lesson){setError('This lesson could not load. Please return to Paths and try again.');return;}
  restored.current=true;const isQuiz=pathRequest.quiz,n=pathRequest.question,at=isQuiz?lesson.questions[n].step:pathRequest.step;
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
 {learningId&&(!quiz||error)&&<div className={styles.questLabel}><strong>{journeyById(learningId)?.title} · </strong><span>{['See it','Try with help','Your decision','Change the situation','Spot it again','Another situation'][stage]}</span>{error&&<p role="alert">{error} <button onClick={()=>{setError('');loadCatalog(format).then(setLessons).catch(e=>setError(e.message));}}>Retry lesson</button></p>}</div>}
 <nav className={styles.corners} aria-label="Lesson navigation">{quiz&&<BackButton className={styles.camera} title="Back to live game" onBack={returnToLive}/>}{!(quiz)&&<div className={styles.cameraTools}><button className={styles.camera} aria-label={'Change camera angle: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} title={'Camera: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} onClick={changeAngle}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg></button></div>}{!learningId&&!quiz&&<NavigationButton key={String(pickerOpen)} ref={pickerTrigger} className={styles.choose} label="Choose plays" aria-haspopup="dialog" aria-expanded={pickerOpen} onNavigate={()=>setPickerOpen(true)}/>}<DoneButton className={styles.close} title={learningId||pathRequest?'Save and return to Paths':'Return to island'} onDone={()=>{session.current=null;onClose();}}/></nav>
 <PlaysPicker open={pickerOpen} onClose={()=>setPickerOpen(false)} trigger={pickerTrigger} format={format} title={title} lessons={lessons} chosen={chosen?.id} category={category} onCategory={setCategory} onSelect={select} error={error} onRetry={()=>{setError('');loadCatalog(format).then(setLessons).catch(e=>setError(e.message));}}/>

 {!(quiz)&&<FieldTranscript onResizeSound={onResizeSound} open={chatOpen} onClose={()=>setChatOpen(false)} trigger={chatTrigger} session={session} readMatch={readMatch} chosen={chosen} step={step} quiz={quiz} question={question} answer={answer}/>}
 <footer className={styles.bottom} data-quiz={quiz} aria-label="Playback controls">
 {!(quiz)&&<button ref={chatTrigger} className={styles.chat} aria-label={chatOpen?"Minimize transcript":"Open transcript"} aria-controls="field-transcript" aria-expanded={chatOpen} onClick={()=>{setRadarOpen(false);setChatOpen(!chatOpen);}}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{chatOpen?<path d="M5 12h14"/>:<><path d="M4 4h16v12H9l-5 4V4z"/><path d="M8 8h8M8 12h5"/></>}</svg></button>}
 <div className={styles.playback} data-quiz={quiz}>{quiz&&<FieldTranscript docked onResizeSound={onResizeSound} open={chatOpen} onClose={()=>setChatOpen(false)} trigger={chatTrigger} session={session} readMatch={readMatch} chosen={chosen} step={step} quiz={quiz} question={question} answer={answer}/>}{chosen&&quiz&&q&&!pickerOpen&&<section className={styles.quizUnified} aria-label="Pitch quiz">
 {<div className={styles.quizTools}><button ref={chatTrigger} type="button" aria-label={chatOpen?"Collapse transcript":"Open transcript"} aria-controls="field-transcript" aria-expanded={chatOpen} onClick={()=>{setRadarOpen(false);setChatOpen(open=>!open);}}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4z"/><path d="M8 8h8M8 12h5"/></svg>{chatOpen?"Hide transcript":"Read along"}</button><button className={styles.camera} aria-label={'Change camera angle: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} title={'Camera: '+{default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[angle]} onClick={changeAngle}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg></button></div>}
 <small>QUESTION {question+1} / {chosen.questions.length}</small>
 {answer===null?<><p className={styles.quizQuestion}>{q.q}</p><p className={styles.quizHint}>Tap a marked {q.interact?.paths?'route':q.interact?.candidates?'player':'space'} on the pitch.</p>{learningId&&<><button className={styles.questHintButton} onClick={()=>{setShowHelp(true);if(!preview.current)exposeLearning(learningId,chosen.id,'hint');}}>Give me a hint</button>{showHelp&&<p>{journeyHint(learningId)}</p>}</>}</>:<><p role="status" className={styles.quizResult}><strong>{answer===q.correct?'Correct. ':'Look again. '}</strong>{(answer!==q.correct?q.choiceExplanations?.[answer]??q.explain:q.explain).split(/(?<=[.!?])\s/)[0]}</p><QuizReplay key={`${chosen.id}:${question}:${answer}`} session={session} onRetry={retryQuestion} onNext={nextQuestion} nextLabel={question+1<chosen.questions.length?'Next question':learningId||pathRequest?'Back to Paths':'Back to lesson'}/></>}
 </section>}<FieldVisualBeat session={session} hidden={quiz||pickerOpen||chatOpen||finished}/>{endActionsAvailable&&<div className={styles.endActions}>{chosen!.questions.length>0&&<button onClick={startQuiz}>Quiz Yourself</button>}<button onClick={watchAgain}>Watch Again</button></div>}{chosen&&!quiz&&<small>{`${step+1} / ${chosen.steps.length}`}</small>}{!quiz&&<div className={styles.transport}><button aria-label="Previous step" disabled={!chosen||step===0||!!learningId&&stage>0} onClick={()=>seek(step-1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><button aria-label={chosen?(playing?'Pause':'Play'):(livePaused?'Play live game':'Pause live game')} disabled={quiz||!!learningId&&stage>0} onClick={togglePlayback}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{(chosen?playing:!livePaused)?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<path d="M7 4.5a1 1 0 0 1 1.5-.86l12 7.5a1 1 0 0 1 0 1.72l-12 7.5A1 1 0 0 1 7 19.5z"/>}</svg></button><button aria-label="Next step" disabled={!chosen||step===chosen.steps.length-1||!!learningId&&stage>0} onClick={()=>seek(step+1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div>}</div>
 {!(quiz)&&<FieldRadar open={radarOpen} onOpenChange={open=>{setChatOpen(false);setRadarOpen(open);}} session={session} readMatch={readMatch}/>}
 </footer>
 </>;
}
