'use client';
/**
 * "Talk it through": the six-week review (docs/idp/DESIGN.md §10). One screen for the player and the grown-up or coach together:
 * three questions, then one choice, "Keep going" or "Pick a new goal". (The old third choice, "Change it a little", did the same
 * as "Pick a new goal"; stored reviews with that outcome stay valid.)
 */
import {daysUntil,reviewDue2,reviewPlan2,type IdpState2,type ReviewOutcome} from '@/lib/coaches/idp/store';
import {goalsOf} from '@/lib/coaches/idp/journey';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {Footer,Screen} from './Nav';
import s from './Idp.module.css';

export default function Review({state,commit,now,onDone,onBack}:{state:IdpState2;commit:(s:IdpState2)=>void;now:number;onDone:(o:ReviewOutcome)=>void;onBack:()=>void}){
 const plan=state.plan;
 if(!plan)return null;
 const due=reviewDue2(plan,now),goal=goalsOf(plan)[0]?.goal;
 const pick=(o:ReviewOutcome)=>{commit(reviewPlan2(state,o,Date.now()));countIdp('review');onDone(o);};
 return <Screen id="idp-review" title="Talk it through" kicker={due?'It’s time':`Due in ${daysUntil(plan.reviewAt,now)} days`} data-review>
  <div className={s.card}>
   <p className={s.lead}>Sit down with your coach or a grown-up{goal?<> and talk about <b>“{goal.ican}”</b></>:null}.</p>
   <ol className={s.guide}>
    <li>What can you do now that you couldn’t before?</li>
    <li>Tell about one time you tried it.</li>
    <li><b>Grown-up or coach:</b> say one thing you noticed, and one next step.</li>
   </ol>
  </div>
  <div className={s.card}>
   <h4>What next?</h4>
   <div className={s.choices}>
    <button type="button" className={s.choice} data-main data-review-keep onClick={()=>pick('keep')}>Keep going<small>Same goal for six more weeks</small></button>
    <button type="button" className={s.choice} data-review-new onClick={()=>pick('new')}>Pick a new goal<small>Choose the next thing to get better at</small></button>
   </div>
  </div>
  <Footer back={onBack}/>
 </Screen>;
}
