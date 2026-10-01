/**
 * Printable one-page documents (grown-ups progress report, coach plan). Built as a self-contained HTML string (no scripts,
 * no external requests, no images from the network) and printed from an iframe on this device, so "Save as PDF" in the
 * browser's print sheet is the export. The only personal detail that can ever appear is a first name the grown-up types
 * for this print; it is never stored.
 */
import {STAGE_LABELS,STAGE_ORDER,type ProgressSummary} from './progress';
import {PRACTICE_SAFETY,type Practice} from './practice';

export const escapeHtml=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** A typed first name: letters, spaces, hyphens and apostrophes only, 24 characters at most. */
export const cleanFirstName=(raw:unknown)=>typeof raw==='string'?raw.normalize('NFC').replace(/[^\p{L}\p{M} '’-]/gu,'').replace(/\s+/g,' ').trim().slice(0,24):'';
const printedOn=(at:number)=>new Date(at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});

const CSS=`*{box-sizing:border-box}body{margin:0;padding:28px;font:14px/1.45 Arial,Helvetica,sans-serif;color:#244d40;background:#fff}
h1{font-size:24px;margin:0}h2{font-size:15px;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.06em}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:3px solid #244d40;padding-bottom:10px}
header p{margin:2px 0 0;color:#48604c}.muted{color:#5c6b58;font-size:12px}
table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:6px 8px;border-bottom:1px solid #d9dcc8;vertical-align:top}th{font-size:12px}
.bar{height:8px;border-radius:4px;background:#e7e7d1;overflow:hidden;min-width:80px}.bar i{display:block;height:100%;background:#244d40}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.card{border:1px solid #d9dcc8;border-radius:10px;padding:10px 12px;break-inside:avoid}
.card b{display:block}ul{margin:4px 0;padding-left:18px}li{margin:2px 0}.tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:#f8d651}
.focus{background:#fff8e3;border:1px solid #e9c16b}footer{margin-top:18px;border-top:1px solid #d9dcc8;padding-top:8px}
@page{size:auto;margin:12mm}@media print{body{padding:0}.card,.focus{break-inside:avoid}}`;

export function printDocument(title:string,body:string){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;
}

export type ReportOptions={firstName?:string;printedAt:number;focus?:{title:string;tryIt:string;parentCue:string;homework:string}|null;practice:Practice[]};
export function progressReportHtml(s:ProgressSummary,o:ReportOptions){
 const name=cleanFirstName(o.firstName);
 const who=name?`${escapeHtml(name)}’s football learning`:'Football learning on Futbol Island';
 const rows=s.formats.map(f=>`<tr><td><b>${escapeHtml(f.title)}</b>${f.pathComplete?' <span class="tag">Path complete</span>':''}</td><td>${f.coreComplete}/${f.coreTotal} path lessons<div class="bar"><i style="width:${f.coreTotal?Math.round(100*f.coreComplete/f.coreTotal):0}%"></i></div></td><td>${f.depthComplete}/${f.depthTotal}</td><td>${f.stages.introduced} introduced · ${f.stages.applied+f.stages.remembered} applied or remembered</td></tr>`).join('');
 const stageList=STAGE_ORDER.map(k=>`<li><b style="display:inline">${STAGE_LABELS[k].label}:</b> ${s.totals[k]} <span class="muted">(${escapeHtml(STAGE_LABELS[k].detail)})</span></li>`).join('');
 const next=s.nextUp.length?s.nextUp.map(l=>`<li>${escapeHtml(l.format==='futsal'?'Futsal':l.format)} · ${escapeHtml(l.name)}</li>`).join(''):'<li>Every path lesson is complete. Try the “Go deeper” lessons.</li>';
 const recent=s.recent.length?s.recent.map(l=>`<li>${escapeHtml(l.name)} <span class="muted">(${escapeHtml(STAGE_LABELS[l.stage].label)})</span></li>`).join(''):'<li>Nothing started yet.</li>';
 const practice=o.practice.map(p=>`<div class="card"><b>${escapeHtml(p.title)}</b><span class="muted">${escapeHtml(p.setup)}</span><p style="margin:4px 0">${escapeHtml(p.howTo)}</p><span>Ask: “${escapeHtml(p.talk)}”</span></div>`).join('');
 const focus=o.focus?`<h2>Current development focus</h2><div class="card focus"><b>${escapeHtml(o.focus.title)}</b><p style="margin:4px 0">Try it at training: ${escapeHtml(o.focus.tryIt)}</p><p style="margin:4px 0">Island homework: ${escapeHtml(o.focus.homework)}</p><span>${escapeHtml(o.focus.parentCue)}</span></div>`:'';
 const badges=s.badges.length?s.badges.map(b=>`<li>${escapeHtml(b)}</li>`).join(''):'<li>None yet. A graduation badge arrives when a whole path is complete.</li>';
 const journeys=s.journeys.length?`<h2>Learning journeys</h2><ul>${s.journeys.map(j=>`<li>${escapeHtml(j.title)}: ${escapeHtml(j.status)}</li>`).join('')}</ul>`:'';
 return printDocument('Futbol Island progress report',`<header><div><h1>${who}</h1><p>Futbol Island progress report</p></div><p class="muted">Printed ${escapeHtml(printedOn(o.printedAt))}</p></header>
<h2>Paths</h2><table><thead><tr><th>Format</th><th>Path</th><th>Go deeper</th><th>Stages</th></tr></thead><tbody>${rows}</tbody></table>
<div class="grid"><div><h2>Lessons by stage</h2><ul>${stageList}</ul></div><div><h2>Collected</h2><ul><li>Hidden balls found: ${s.balls.found} of ${s.balls.total} (each teaches a football idea)</li></ul><h2>Badges</h2><ul>${badges}</ul></div></div>
${journeys}<div class="grid"><div><h2>Learning lately</h2><ul>${recent}</ul></div><div><h2>Up next on the island</h2><ul>${next}</ul></div></div>
${focus}<h2>Try it at home</h2><div class="grid">${practice}</div><p class="muted">${escapeHtml(PRACTICE_SAFETY)}</p>
<footer class="muted">“Quiz passed” means every quiz question for that lesson was answered correctly on this device; “Applied” and “Remembered” come from later spaced reviews. It shows the idea has been understood, not how well someone plays. This report was made on this device; nothing was uploaded.</footer>`);
}
