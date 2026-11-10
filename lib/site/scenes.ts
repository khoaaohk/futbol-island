import type {Arrow,GuideFormat,Placed} from './pitch';
/**
 * Scenes for the rules and glossary pages (SEO cluster 2, Nov 10 2026): one moment on a pitch, drawn by the same
 * lib/site/PitchDiagram.tsx as the formation diagrams. A scene is plain data: who stands where, where the ball is, an optional
 * dashed line (the offside line, the build-out line in use), an optional shaded zone, dashed arrows for runs and solid arrows
 * for the ball. x is 0-100 from the left touchline, y is 0-100 from the gold team's own goal line: gold attacks UP the picture,
 * the other team (green dots) defends the goal at the top. Every scene carries its own hand-written caption, which is the
 * diagram's <desc>, the text under it and the alt text of its PNG.
 *
 * `who` is a space-separated list of dots: `9@58,73` is a gold player marked 9; `!4@40,72` is an opponent marked 4.
 * `runs` and `passes` are `x,y>x,y`.
 */
export type Scene={format:GuideFormat;title:string;caption:string;spots:Placed[];ball?:[number,number];lineY?:number;lineWord?:string;zone?:[number,number,number,number];runs:Arrow[];passes:Arrow[]};
export type RawScene={format?:GuideFormat;title:string;caption:string;who:string;ball?:[number,number];lineY?:number;lineWord?:string;zone?:[number,number,number,number];runs?:string[];passes?:string[]};
const arrow=(s:string):Arrow=>{const m=/^(-?[\d.]+),(-?[\d.]+)>(-?[\d.]+),(-?[\d.]+)$/.exec(s);if(!m)throw new Error(`scene arrow "${s}"`);return {from:[+m[1],+m[2]],to:[+m[3],+m[4]]};};
export function scene(r:RawScene):Scene{
 const spots=r.who.split(' ').filter(Boolean).map(t=>{const m=/^(!?)([^@]{1,3})@(-?[\d.]+),(-?[\d.]+)$/.exec(t);if(!m)throw new Error(`scene dot "${t}" in "${r.title}"`);
  return {n:m[2],label:m[2],x:+m[3],y:+m[4],line:m[1]?'Other team':'Gold team',...(m[1]?{team:'opp' as const}:{})};});
 if(!/[.!?]$/.test(r.caption))throw new Error(`scene caption must be a sentence: ${r.title}`);
 return {format:r.format??'11v11',title:r.title,caption:r.caption,spots,ball:r.ball,lineY:r.lineY,lineWord:r.lineWord,zone:r.zone,runs:(r.runs??[]).map(arrow),passes:(r.passes??[]).map(arrow)};
}
/** The fixed first words of every scene caption (so the picture can be understood without seeing it). */
export const sceneDesc=(s:Scene)=>`Diagram on a ${s.format==='futsal'?'futsal court':`${s.format} soccer field`}, seen from above. The gold team attacks up the picture and the other team is in dark green. ${s.caption}`;
