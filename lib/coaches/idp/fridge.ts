/**
 * The fridge card (docs/idp/DESIGN.md §3.2): this week's plan on one printable page for the kitchen. Self-contained HTML (no
 * scripts, no links, no network; the QR is an inline image made on this device), printed from a hidden iframe by
 * lib/grownups/printHtml.ts. It carries no personal data beyond an optional first name typed for this print (never stored).
 * The QR opens /plan#p=… (lib/coaches/idp/share.ts): catalogue ids and this week's counts, inside a #fragment that is never
 * sent to a server.
 */
import {escapeHtml,cleanFirstName,printDocument} from '../../grownups/report';
import {PRACTICES,PRACTICE_SAFETY} from '../../grownups/practice';
import {goalById} from '../idp';
import {AVOID_ALWAYS,SAY_INSTEAD,SKILLS,STICKERS} from './skills';
import {weekMissions,weekStart,weekSummary} from './journey';
import type {IdpState2} from './store';

const date=(at:number)=>new Date(at).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
const CSS=`.fc{border:3px dashed #244d40;border-radius:18px;padding:16px 18px;margin-top:12px}
.ican{font-size:22px;font-weight:800;margin:6px 0 2px}.days{display:flex;gap:6px;margin-top:6px}.days span{width:26px;height:26px;border:2px solid #244d40;border-radius:6px;display:inline-grid;place-items:center;font-size:10px;font-weight:700}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.qr{display:flex;gap:12px;align-items:center}.qr img{width:110px;height:110px}
.avoid li::marker{content:'✕  '}.say li::marker{content:'♥  '}ol{margin:4px 0;padding-left:20px}`;

export function fridgeCardHtml(state:IdpState2,o:{firstName?:string;printedAt:number;qrDataUrl?:string}){
 const plan=state.plan,name=cleanFirstName(o.firstName);
 const goals=(plan?.goals??[]).flatMap(g=>{const goal=goalById(g.goalId);return goal?[goal]:[];});
 if(!plan||!goals.length)return printDocument('Fridge card','<h1>No goal right now</h1><p>Choose the next goal together in Futbol Island, then print this card again.</p>');
 const who=name?escapeHtml(name):'Our player';
 const missions=weekMissions(plan,o.printedAt),sum=weekSummary(state,o.printedAt);
 const day=['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('');
 const goalCards=goals.map(g=>{const s=SKILLS[g.skill];return `<div class="card focus"><span class="tag">${escapeHtml(s.kid)}</span><p class="ican">“${escapeHtml(g.ican)}”</p><p style="margin:2px 0">${escapeHtml(g.why)}</p><p class="muted" style="margin:4px 0 0">For grown-ups: ${escapeHtml(s.grownWhy)}</p></div>`;}).join('');
 const missionRows=missions.map(m=>`<div class="card"><b>${escapeHtml(m.mission.title)} <span class="muted">· ${m.mission.where==='home'?'at home':m.mission.where==='training'?'at training':'on the island'}${m.mission.minutes?` · ${m.mission.minutes} min`:''}</span></b><ol>${m.mission.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol><div class="days" aria-label="Tick a day">${day}</div></div>`).join('');
 const first=SKILLS[goals[0].skill],home=PRACTICES.find(p=>p.id===first.home);
 const ask=goals.length>1?[SKILLS[goals[0].skill].askAbout[0],SKILLS[goals[1].skill].askAbout[0],first.askAbout[1]]:[...first.askAbout];
 const proud=sum.proud.length?`<p>This week’s proud moment: <b style="display:inline">${escapeHtml(STICKERS[sum.proud.at(-1)!].kid)}</b></p>`:'';
 return printDocument('Fridge card',`<style>${CSS}</style><header><div><h1>${who}’s football plan</h1><p>Futbol Island · week of ${escapeHtml(date(weekStart(o.printedAt)))}</p></div>${o.qrDataUrl?`<div class="qr"><img src="${escapeHtml(o.qrDataUrl)}" alt="QR code: this week’s plan for grown-ups"><span class="muted">Scan for this week’s plan<br>on your phone. No sign-in.</span></div>`:''}</header>
<div class="fc"><h2>I’m working on</h2><div class="two">${goalCards}</div>
<h2>This week’s missions</h2><p class="muted" style="margin:0 0 6px">Tick a box each time. Any amount counts. Missions are for fun, never for rewards or chores.</p><div class="two">${missionRows}</div>
${proud}</div>
<div class="two"><div><h2>Ask about…</h2><ul>${ask.map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul>
<h2>Say</h2><ul class="say">${SAY_INSTEAD.map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul></div>
<div>${home?`<h2>10 minutes at home</h2><div class="card"><b>${escapeHtml(home.title)}</b><span class="muted">${escapeHtml(home.setup)}</span><p style="margin:4px 0">${escapeHtml(home.howTo)}</p></div>`:''}
<h2>Try not to</h2><ul class="avoid">${[first.avoid,...AVOID_ALWAYS.slice(0,2)].map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul></div></div>
<p class="muted">Review together with the coach by ${escapeHtml(date(plan.reviewAt))}. ${escapeHtml(PRACTICE_SAFETY)}</p>
<footer class="muted">Made on this device with Futbol Island. Nothing was uploaded. The QR holds only goal and mission ids, never a name.</footer>`);
}
