'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import s from './quizPlay.module.css';
import type {PlayQuestion} from '@/lib/site/quizzes';
/**
 * The quiz, played in place on its page (Nov 23 2026; owner: "make the quizzes easy to use and dynamic, interactive, have motion,
 * sounds" + "make it a fun experience"). One question at a time: tap a big answer card (or press 1-4), then Check (or Enter); a
 * sheet slides up with the reason, a coach line and a "Learn more" link on a miss; Continue. The progress bar fills with a spring
 * and a ball flies into its little net on a right answer (the keeper saves it on a miss); "GOAL!" pops at 3, 5 and 10 in a row.
 * The end: stars, a title by score, a count-up, the personal best (this device only), Try again and Share (text and link only).
 * HEAT AND PRIVACY: no idle loops, no timers left running, no autoplay. Sounds are short synthesized tones made after a tap (the
 * AudioContext is opened on the first Check and closed on unmount) plus the stadium applause clip on a good finish, fetched only
 * then. Motion is transform/opacity only (CSS and one-shot WAAPI); prefers-reduced-motion keeps fades only. Sound and the best
 * score live in localStorage (try/catch); nothing is sent anywhere.
 */
type Lang='en'|'es';
const W={
 en:{check:'Check',cont:'Continue',got:'Got it',of:(a:number,b:number)=>`Question ${a} of ${b}`,quit:'Quit quiz',quitAsk:'Stop this quiz? Your answers so far will be cleared.',keep:'Keep playing',quitYes:'Start over',
  soundOn:'Sound on',soundOff:'Sound off',row:(n:number)=>`${n} in a row`,goal:'GOAL!',saved:'Saved by the keeper!',fact:'Did you know?',more:'Learn more',answer:'The answer:',
  right:[['Nice!','Correct!','Good one!','Yes!'],['Great pass!','Two in a row!','Smart!','You got it!'],['On fire!','What a run!','Unstoppable!','Top corner!']],
  miss:['So close! Here’s the trick:','Good try! Here’s how it works:','Not this time. Remember:','Almost! Coach says:'],
  tf:'True or false?',ref:'Ref’s call',pic:'Look at the picture',score:'Your score',best:(a:number,b:number)=>`Your best: ${a}/${b}`,newBest:'New personal best!',beat:'Beat your best',again:'Try again',
  share:'Share my score',copied:'Copied! Paste it to share.',shareText:(n:string,a:number,b:number)=>`I scored ${a}/${b} on the ${n} at Futbol Island. Can you beat it?`,
  titles:['Rookie','Team player','Captain','Legend'],lines:['Every great player starts here. Have another go!','Good game! Read the ones you missed and try again.','Captain material! Just a few to go.','Perfect! Every answer right.'],
  missed:'Learn the ones you missed',stars:(n:number)=>`${n} of 3 stars`,done:'Quiz done!'},
 es:{check:'Comprobar',cont:'Continuar',got:'Entendido',of:(a:number,b:number)=>`Pregunta ${a} de ${b}`,quit:'Salir del quiz',quitAsk:'¿Parar este quiz? Se borrarán tus respuestas.',keep:'Seguir jugando',quitYes:'Empezar de nuevo',
  soundOn:'Sonido activado',soundOff:'Sonido apagado',row:(n:number)=>`${n} seguidas`,goal:'¡GOL!',saved:'¡Atajó el portero!',fact:'¿Sabías que…?',more:'Aprende más',answer:'La respuesta:',
  right:[['¡Bien!','¡Correcto!','¡Muy bien!','¡Sí!'],['¡Gran pase!','¡Dos seguidas!','¡Qué listo!','¡Lo tienes!'],['¡Estás que ardes!','¡Qué racha!','¡Imparable!','¡Al ángulo!']],
  miss:['¡Casi! Este es el truco:','¡Buen intento! Así funciona:','Esta vez no. Recuerda:','¡Por poco! El entrenador dice:'],
  tf:'¿Verdadero o falso?',ref:'Decide el árbitro',pic:'Mira el dibujo',score:'Tu puntuación',best:(a:number,b:number)=>`Tu mejor: ${a}/${b}`,newBest:'¡Nuevo récord personal!',beat:'Supera tu récord',again:'Intentar de nuevo',
  share:'Compartir mi puntuación',copied:'¡Copiado! Pégalo para compartir.',shareText:(n:string,a:number,b:number)=>`Saqué ${a}/${b} en el ${n.toLowerCase()} de Futbol Island. ¿Puedes superarlo?`,
  titles:['Novato','Buen compañero','Capitán','Leyenda'],lines:['Todos los grandes empezaron aquí. ¡Otra vez!','¡Buen partido! Lee las que fallaste y vuelve a intentarlo.','¡Madera de capitán! Te faltan muy pocas.','¡Perfecto! Todas bien.'],
  missed:'Aprende las que fallaste',stars:(n:number)=>`${n} de 3 estrellas`,done:'¡Quiz terminado!'}};
const SOUND_KEY='fi-quiz-sound',bestKey=(slug:string)=>`fi-quiz-best:${slug}`;
const read=(k:string)=>{try{return window.localStorage.getItem(k);}catch{return null;}};
const write=(k:string,v:string)=>{try{window.localStorage.setItem(k,v);}catch{/* storage is optional */}};
const calm=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};
const buzz=(p:number|number[])=>{try{navigator.vibrate?.(p);}catch{/* no vibration */}};
const rank=(score:number,total:number)=>{const r=score/total;return r===1?3:r>=.7?2:r>=.4?1:0;};

/* ---- sound: tiny tones on the audio clock, only after a tap ---- */
type Ctx=AudioContext;
function makeCtx():Ctx|null{try{const A=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!A)return null;const c=new A();void c.resume();return c;}catch{return null;}}
function note(c:Ctx,at:number,f:number,d:number,g=.18,type:OscillatorType='triangle'){
 const o=c.createOscillator(),v=c.createGain(),t=c.currentTime+at;o.type=type;o.frequency.setValueAtTime(f,t);
 v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(v).connect(c.destination);o.start(t);o.stop(t+d+.03);
}
const SFX={right:(c:Ctx)=>{note(c,0,659,.16);note(c,.09,988,.28);},
 wrong:(c:Ctx)=>{note(c,0,330,.18,.14,'sine');note(c,.12,247,.3,.14,'sine');},
 goal:(c:Ctx)=>{[523,659,784,1047].forEach((f,i)=>note(c,i*.07,f,.22,.15));},
 finish:(c:Ctx)=>{[392,523,659,784].forEach((f,i)=>note(c,i*.1,f,.3,.14));}};

/* ---- icons (inline, decorative) ---- */
const Ball=({size=22}:{size?:number})=><svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#14221d" strokeWidth="1.6"/><path d="M12 7.2l3.3 2.4-1.3 3.9h-4l-1.3-3.9z" fill="#14221d"/><path d="M12 7.2V3.6M15.3 9.6l3.6-1.2M14 13.5l2.2 3.2M10 13.5l-2.2 3.2M8.7 9.6L5.1 8.4" stroke="#14221d" strokeWidth="1.3"/></svg>;
const Net=()=><svg viewBox="0 0 30 24" width="30" height="24" aria-hidden="true"><path d="M3 22V3h24v19" fill="none" stroke="#14221d" strokeWidth="2.4" strokeLinecap="round"/><path d="M7 3v19M11 3v19M15 3v19M19 3v19M23 3v19M3 8h24M3 13h24M3 18h24" stroke="#14221d" strokeOpacity=".28" strokeWidth="1"/></svg>;
const Glove=()=><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 21v-6L4 9.5a1.4 1.4 0 012.5-1.2L8 11V4.5a1.4 1.4 0 012.8 0V10V3.4a1.4 1.4 0 012.8 0V10V4.2a1.4 1.4 0 012.8 0V11V6.6a1.4 1.4 0 012.8 0V15a6 6 0 01-6 6z" fill="#ed9dce" stroke="#14221d" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
const Tick=()=><svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#2f7d5b"/><path d="M6.5 12.5l3.6 3.5 7.4-8" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Cross=()=><svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#b4513d"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"/></svg>;
const Close=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
const Speaker=({on}:{on:boolean})=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/>{on?<path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a7.8 7.8 0 010 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>:<path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>}</svg>;
const Star=({on}:{on:boolean})=><svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill={on?'#f9d665':'#e3e2d4'} stroke={on?'#aa8b3e':'#c9c8b8'} strokeWidth="1.6" strokeLinejoin="round"/></svg>;

export default function QuizPlay({slug,name,lang='en',questions,url}:{slug:string;name:string;lang?:Lang;questions:readonly PlayQuestion[];url:string}){
 const w=W[lang],total=questions.length;
 const [i,setI]=useState(0),[pick,setPick]=useState<number|null>(null),[checked,setChecked]=useState(false);
 const [results,setResults]=useState<boolean[]>([]),[streak,setStreak]=useState(0),[asking,setAsking]=useState(false);
 const [sound,setSound]=useState(true),[best,setBest]=useState<number|null>(null),[shown,setShown]=useState(0),[copied,setCopied]=useState<string|null>(null);
 const root=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null),ball=useRef<HTMLSpanElement>(null),glove=useRef<HTMLSpanElement>(null),
  goal=useRef<HTMLParagraphElement>(null),streakEl=useRef<HTMLSpanElement>(null),qHead=useRef<HTMLHeadingElement>(null),nextBtn=useRef<HTMLButtonElement>(null),
  endHead=useRef<HTMLHeadingElement>(null),burst=useRef<HTMLDivElement>(null),fillEl=useRef<HTMLSpanElement>(null),ctx=useRef<Ctx|null>(null),moved=useRef(false),prevBest=useRef<number|null>(null);
 const done=results.length===total,score=results.filter(Boolean).length,q=questions[Math.min(i,total-1)],right=checked&&pick===q.correct;

 useEffect(()=>{setSound(read(SOUND_KEY)!=='0');const b=Number(read(bestKey(slug)));if(Number.isFinite(b)&&b>0)setBest(b);},[slug]);
 useEffect(()=>()=>{try{void ctx.current?.close();}catch{/* closed */}},[]);
 const play=useCallback((k:keyof typeof SFX)=>{if(!sound)return;if(!ctx.current)ctx.current=makeCtx();if(ctx.current)SFX[k](ctx.current);},[sound]);

 /* focus: the sheet's button after Check, the new question after Continue (keyboard and screen readers follow the quiz) */
 useEffect(()=>{if(checked)nextBtn.current?.focus({preventScroll:true});},[checked]);
 useEffect(()=>{if(moved.current&&!done)qHead.current?.focus({preventScroll:true});},[i,done]);

 /* one-shot animations */
 const fly=(ok:boolean)=>{
  const t=track.current,b=ball.current;if(!t||!b||typeof b.animate!=='function')return;
  if(calm()){b.animate([{opacity:.3},{opacity:1}],{duration:200});return;}
  const from=results.length/total,dx=Math.max(24,t.clientWidth*(1-from)-8);
  if(ok)b.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${dx*.55}px,-14px) rotate(220deg)`,offset:.5},{transform:`translate(${dx}px,0) rotate(400deg)`,opacity:1,offset:.85},{transform:`translate(${dx}px,0) rotate(400deg)`,opacity:0}],{duration:620,easing:'cubic-bezier(.3,.7,.4,1)'});
  else{b.animate([{transform:'translate(0,0)'},{transform:`translate(${dx-18}px,-10px) rotate(200deg)`,offset:.55},{transform:'translate(0,0) rotate(0)'}],{duration:640,easing:'ease-out'});
   glove.current?.animate([{transform:'scale(.2) rotate(-30deg)',opacity:0},{transform:'scale(1.15) rotate(8deg)',opacity:1,offset:.45},{transform:'scale(1) rotate(0)',opacity:1,offset:.8},{transform:'scale(.6)',opacity:0}],{duration:680,easing:'ease-out'});}
 };
 const pop=(el:HTMLElement|null,ms=360)=>{if(!el||typeof el.animate!=='function')return;el.animate(calm()?[{opacity:.4},{opacity:1}]:[{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:ms,easing:'cubic-bezier(.34,1.56,.64,1)'});};
 const goalPop=()=>{const g=goal.current;if(!g||typeof g.animate!=='function')return;
  g.animate(calm()?[{opacity:0},{opacity:1,offset:.3},{opacity:0}]:[{opacity:0,transform:'translate(-50%,0) scale(.5) rotate(-6deg)'},{opacity:1,transform:'translate(-50%,0) scale(1.15) rotate(2deg)',offset:.35},{opacity:1,transform:'translate(-50%,0) scale(1)',offset:.75},{opacity:0,transform:'translate(-50%,-12px) scale(1)'}],{duration:680,easing:'ease-out'});};
 const confetti=()=>{const host=burst.current;if(!host||calm()||typeof host.animate!=='function')return;
  const colors=['#f9d665','#beded1','#ed9dce','#ffffff','#e9c16b'];
  for(let k=0;k<18;k++){const d=document.createElement('span');d.className=k%3===0?s.bitBall:s.bit;d.style.background=k%3===0?'':colors[k%colors.length];host.appendChild(d);
   const a=(k/18)*Math.PI*2,r=90+(k%4)*28;const an=d.animate([{transform:'translate(0,0) scale(.4)',opacity:1},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r-40}px) rotate(${k*40}deg) scale(1)`,opacity:1,offset:.7},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r+30}px) rotate(${k*60}deg)`,opacity:0}],{duration:900+k*12,easing:'cubic-bezier(.2,.7,.3,1)'});
   an.onfinish=()=>d.remove();}};

 const check=()=>{
  if(pick===null||checked)return;
  const ok=pick===q.correct,n=ok?streak+1:0;setChecked(true);setStreak(n);
  buzz(ok?15:[30,40,30]);play(ok?'right':'wrong');fly(ok);
  if(ok){pop(streakEl.current);if(n===3||n===5||n===10){goalPop();setTimeout(()=>play('goal'),160);}}
 };
 const next=()=>{
  if(!checked)return;moved.current=true;
  const r=[...results,pick===q.correct];setResults(r);setChecked(false);setPick(null);
  if(r.length<total){setI(i+1);return;}
  const sc=r.filter(Boolean).length;prevBest.current=best;
  if(best===null||sc>best){setBest(sc);write(bestKey(slug),String(sc));}
  if(sound){if(sc/total>=.7){try{const a=new Audio('/audio/stadium/applause.m4a');a.volume=.45;void a.play().catch(()=>{});}catch{/* no audio */}}play('finish');}
  if(sc===total)setTimeout(confetti,120);
 };
 const restart=()=>{setI(0);setPick(null);setChecked(false);setResults([]);setStreak(0);setAsking(false);setShown(0);setCopied(null);moved.current=true;};

 /* the end screen's count-up (a few frames, then it stops) */
 useEffect(()=>{if(!done)return;endHead.current?.focus({preventScroll:true});
  if(calm()){setShown(score);return;}let raf=0;const t0=performance.now(),dur=600+score*40;
  const step=(t:number)=>{const k=Math.min(1,(t-t0)/dur);setShown(Math.round(score*(1-Math.pow(1-k,3))));if(k<1)raf=requestAnimationFrame(step);};
  raf=requestAnimationFrame(step);return ()=>cancelAnimationFrame(raf);},[done,score]);

 /* keyboard: 1-4 pick, Enter checks or continues (only while the quiz is on screen and no other field has focus) */
 useEffect(()=>{
  const on=(e:KeyboardEvent)=>{
   if(e.metaKey||e.ctrlKey||e.altKey||done||asking)return;const tg=e.target as HTMLElement|null;
   if(tg&&/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))return;const el=root.current;if(!el)return;
   const r=el.getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)return;
   const n=Number(e.key);if(n>=1&&n<=q.options.length&&!checked){setPick(n-1);e.preventDefault();return;}
   if(e.key==='Enter'&&!(tg&&tg.tagName==='BUTTON'&&el.contains(tg))&&!(tg&&tg.tagName==='A')){if(checked)next();else check();e.preventDefault();}
  };
  window.addEventListener('keydown',on);return ()=>window.removeEventListener('keydown',on);
 });

 const share=async()=>{
  const text=w.shareText(name,score,total);
  try{if(navigator.share){await navigator.share({title:name,text,url});return;}}catch(err){if((err as Error)?.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(`${text} ${url}`);setCopied(w.copied);}catch{setCopied(`${text} ${url}`);}
 };
 const toggleSound=()=>{const v=!sound;setSound(v);write(SOUND_KEY,v?'1':'0');};
 const short=q.options.every(o=>o.length<=24),grid=q.kind==='truefalse'||q.kind==='ref'||(short&&(q.options.length===4||q.options.length===2));
 const level=streak>=3?2:streak===2?1:0,cheer=w.right[level][i%4],miss=w.miss[i%4];
 const fill=(results.length+(checked?1:0))/total;
 /* the bar's fill and the ball's place, set on the elements (the reading templates keep no inline styles, tests/seo-design.cjs) */
 useEffect(()=>{fillEl.current?.style.setProperty('transform',`scaleX(${Math.max(.03,fill)})`);ball.current?.style.setProperty('left',`calc(${results.length/total*100}% - 11px)`);});

 if(done){const st=rank(score,total),stars=st===3?3:st===2?2:1,isNew=prevBest.current===null||score>(prevBest.current??0);
  const missed=questions.filter((_,k)=>!results[k]);
  return <div className={s.quiz} ref={root} data-quiz-play="" data-playbar-hide="" data-done="">
   <div className={s.burst} ref={burst} aria-hidden="true"/>
   <div className={s.end}>
    <h3 className={s.endTitle} ref={endHead} tabIndex={-1}>{w.done} <span>{w.titles[st]}</span></h3>
    <p className={s.stars} role="img" aria-label={w.stars(stars)}>{[0,1,2].map(k=><span key={k} className={s.star}><Star on={k<stars}/></span>)}</p>
    <p className={s.bigScore} aria-live="polite"><span className={s.visuallyHidden}>{w.score}: {score}/{total}</span><span aria-hidden="true">{shown}<small>/{total}</small></span></p>
    <p className={s.endLine}>{w.lines[st]}</p>
    <p className={s.bestLine}>{isNew&&score>0?<b>{w.newBest}</b>:best!==null?w.best(best,total):null}</p>
    <div className={s.endActions}>
     <button type="button" className={s.primary} onClick={restart} data-quiz-again="">{best!==null&&score<total?w.beat:w.again}</button>
     <button type="button" className={s.secondary} onClick={()=>void share()} data-quiz-share="">{w.share}</button>
    </div>
    {copied&&<p className={s.copied} role="status">{copied}</p>}
    {missed.length>0&&<div className={s.missed}><h4 className={s.missedTitle}>{w.missed}</h4><ul>{missed.map(m=><li key={m.q}><span>{m.q}</span> <a href={m.more.href}>{w.more}: {m.more.name}</a></li>)}</ul></div>}
   </div>
  </div>;}

 return <div className={s.quiz} ref={root} data-quiz-play="" data-playbar-hide="">
  <div className={s.top}>
   <button type="button" className={s.iconBtn} aria-label={w.quit} onClick={()=>setAsking(true)} disabled={results.length===0&&!checked}><Close/></button>
   <div className={s.track} ref={track} role="progressbar" aria-label={w.of(i+1,total)} aria-valuemin={0} aria-valuemax={total} aria-valuenow={results.length+(checked?1:0)}>
    <span className={s.fill} ref={fillEl}/>
    <span className={s.ball} ref={ball}><Ball/></span>
    <span className={s.net}><Net/><span className={s.glove} ref={glove}><Glove/></span></span>
   </div>
   <span className={s.streak} ref={streakEl} data-on={streak>0?'':undefined} aria-live="polite" aria-label={w.row(streak)}><Ball size={18}/><b>{streak}</b></span>
   <button type="button" className={s.iconBtn} aria-pressed={sound} aria-label={sound?w.soundOn:w.soundOff} onClick={toggleSound}><Speaker on={sound}/></button>
  </div>
  <p className={s.goal} ref={goal} aria-hidden="true">{w.goal}</p>
  {asking?<div className={s.ask} role="alertdialog" aria-labelledby={`${slug}-ask`}>
   <p id={`${slug}-ask`} className={s.askText}>{w.quitAsk}</p>
   <div className={s.endActions}><button type="button" className={s.primary} onClick={()=>setAsking(false)} autoFocus>{w.keep}</button><button type="button" className={s.secondary} onClick={restart}>{w.quitYes}</button></div>
  </div>:<div className={s.stage} key={i}>
   <p className={s.count}>{w.of(i+1,total)}{q.kind==='truefalse'?` · ${w.tf}`:q.kind==='ref'?` · ${w.ref}`:q.kind==='picture'?` · ${w.pic}`:''}</p>
   <h3 className={s.q} ref={qHead} tabIndex={-1} id={`${slug}-q`}>{q.q}</h3>
   {q.pic&&<img className={s.pic} src={q.pic.src} alt={q.pic.alt} width={1200} height={630} loading="lazy" decoding="async"/>}
   <div className={grid?s.grid:s.list} role="group" aria-labelledby={`${slug}-q`}>
    {q.options.map((o,j)=>{const state=!checked?(pick===j?'picked':undefined):j===q.correct?'right':pick===j?'wrong':'off';
     return <button key={o} type="button" className={s.card} data-state={state} aria-pressed={pick===j} disabled={checked&&state==='off'}
      onClick={()=>{if(!checked){setPick(j);}}}><kbd className={s.key} aria-hidden="true">{j+1}</kbd><span>{o}</span></button>;})}
   </div>
  </div>}
  {!asking&&<div className={s.bar} data-state={!checked?undefined:right?'right':'wrong'}>
   {checked?<div className={s.sheet} aria-live="polite">
    <span className={s.sheetIcon}>{right?<Tick/>:<Cross/>}</span>
    <div className={s.sheetText}>
     <p className={s.cheer}>{right?cheer:<>{w.saved} {miss}</>}</p>
     {!right&&<p className={s.answer}>{w.answer} <b>{q.options[q.correct]}</b></p>}
     <p>{q.explain}</p>
     {q.fact&&<p className={s.fact}><b>{w.fact}</b> {q.fact}</p>}
     {!right&&<p><a className={s.moreLink} href={q.more.href}>{w.more}: {q.more.name}</a></p>}
    </div>
    <button type="button" ref={nextBtn} className={right?s.primary:s.wrongBtn} onClick={next} data-quiz-next="">{right?w.cont:w.got}</button>
   </div>:<button type="button" className={s.primary} disabled={pick===null} onClick={check} data-quiz-check="">{w.check}</button>}
  </div>}
 </div>;
}
