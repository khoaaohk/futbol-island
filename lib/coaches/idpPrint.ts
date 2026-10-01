/**
 * Printable coach plan (IDP). Same self-contained print document as the grown-ups report: printed on this device, nothing
 * uploaded, and no identity beyond an optional first name typed for this print (never stored). Player and coach notes are
 * printed under separate headings, never merged.
 */
import {escapeHtml,cleanFirstName,printDocument} from '../grownups/report';
import {CORNERS,REFLECTION_TAGS,cornerLabel,goalById,idpCopy,showsFourCorners,type Corner,type IdpState} from './idp';

const date=(at:number)=>new Date(at).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
export function idpPlanHtml(state:IdpState,o:{firstName?:string;printedAt:number;homework:{name:string;done:boolean;detail:string}[]}){
 const plan=state.plan,goal=plan&&goalById(plan.goalId);
 const name=cleanFirstName(o.firstName);
 if(!plan||!goal)return printDocument('Development plan','<h1>No active development plan</h1>');
 const copy=idpCopy(goal.format),f=goal.format==='futsal'?'Futsal':goal.format;
 const corners=showsFourCorners(goal.format)?`<h2>Four corners</h2><table><tbody>${(Object.keys(CORNERS) as Corner[]).map(c=>`<tr><td><b>${escapeHtml(cornerLabel(goal.format,c))}</b></td><td>${c===goal.corner?'<span class="tag">Focus</span>':''} ${plan.strength?.corner===c?'<span class="tag" style="background:#d5e8c8">Strength</span>':''}</td></tr>`).join('')}</tbody></table>`:'';
 const notes=(kind:'player'|'coach')=>{const n=plan.notes.filter(n=>n.kind===kind);return n.length?`<ul>${n.map(x=>`<li><span class="muted">${escapeHtml(date(x.at))}</span> ${x.tag?`<b style="display:inline">${escapeHtml(REFLECTION_TAGS[x.tag].label)}.</b> `:''}${escapeHtml(x.text)}</li>`).join('')}</ul>`:'<p class="muted">Nothing written yet.</p><p>______________________________________________</p><p>______________________________________________</p>';};
 const hw=o.homework.map(h=>`<li>${h.done?'☑':'☐'} ${escapeHtml(h.name)} <span class="muted">(${escapeHtml(h.detail)})</span></li>`).join('');
 return printDocument('Development plan',`<header><div><h1>${name?`${escapeHtml(name)}’s development plan`:'My development plan'}</h1><p>Futbol Island · ${escapeHtml(f)} · one focus at a time</p></div><p class="muted">Printed ${escapeHtml(date(o.printedAt))}</p></header>
<h2>My next step</h2><div class="card focus"><span class="tag">${escapeHtml(cornerLabel(goal.format,goal.corner))}</span><b style="font-size:18px;margin-top:6px">${escapeHtml(goal.title)}</b><p style="margin:4px 0">${escapeHtml(goal.why)}</p><p style="margin:4px 0"><b style="display:inline">${escapeHtml(copy.tryIt)}:</b> ${escapeHtml(goal.tryIt)}</p></div>
${plan.strength?`<h2>${escapeHtml(copy.strength)}</h2><p>${escapeHtml(cornerLabel(goal.format,plan.strength.corner))}${plan.strength.text?`: ${escapeHtml(plan.strength.text)}`:''}</p>`:''}
${corners}<h2>${escapeHtml(copy.homework)}</h2><ul>${hw}</ul><p class="muted">Ticks come from lessons completed on the island on this device. Exploring shows the idea has been seen; the coach sees whether it happens in games.</p>
<div class="grid"><div><h2>Player reflection</h2>${notes('player')}</div><div><h2>Coach’s observations</h2>${notes('coach')}</div></div>
<h2>How home can help</h2><p>${escapeHtml(goal.parentCue)} Ask about what they noticed; try not to score or coach from the sideline.</p>
<h2>Review together</h2><p>Started ${escapeHtml(date(plan.setAt))} · review by <b style="display:inline">${escapeHtml(date(plan.reviewAt))}</b> (every 6 weeks). Continue ☐ Adapt ☐ New focus ☐</p>
<footer class="muted">Made on this device with Futbol Island. Nothing was uploaded or shared by the app.</footer>`);
}
