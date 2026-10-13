/**
 * var-2018 · the goal-line practice moment (Oct 10 2026 modern gallery pass; made up, not a real match). Pure maths, no DOM, so
 * tests/museum-exp-var-2018.cjs can run it in Node. Seen from above: z = metres from the goal line into the pitch (the 12 cm
 * goal line lies between z = −0.12 and z = 0, because lines belong to the area they bound), x = across.
 *
 * #9 shoots, the keeper claws the ball back off the line. At its deepest (frame DEEP) the ball's centre is 17 cm behind the
 * line's pitch edge, so its near edge (−6 cm) is still ON the 12 cm line: the whole ball has NOT crossed the whole line (Law 10),
 * so it is no goal, by 6 cm.
 */
export const FRAMES=37,LAST=FRAMES-1,DEEP=20,BALL_R=.11,LINE_W=.12,BALL_X=.3,START_Z=1.62,DEEPEST_Z=-.17,END_Z=.86;
const ease=(u:number)=>1-Math.pow(1-u,2.2);
/** The ball's distance from the goal line (centre, metres) on frame f: in fast, deepest on DEEP, then clawed back out. */
export function ballZ(f:number){const n=Math.max(0,Math.min(LAST,f));
 if(n<=DEEP)return START_Z+(DEEPEST_Z-START_Z)*ease(n/DEEP);
 const u=(n-DEEP)/(LAST-DEEP);return DEEPEST_Z+(END_Z-DEEPEST_Z)*(1-Math.pow(1-u,1.6));}
export function deepestFrame(){let best=0,bz=Infinity;for(let f=0;f<=LAST;f++){const z=ballZ(f);if(z<bz){bz=z;best=f;}}return best;}
/** True only when every part of the ball is past every part of the line. */
export const wholeBallOver=(f:number)=>ballZ(f)+BALL_R< -LINE_W;
export const TRUTH=(()=>{const edge=DEEPEST_Z+BALL_R;return {
 /** cm of the ball still over (on) the goal line at its deepest: positive = no goal. */
 ballOnLineCm:Math.round((edge+LINE_W)*100),wholeBallOver:edge< -LINE_W};})();
export const timecode=(f:number)=>`00:00:${String(Math.floor(f/24)).padStart(2,'0')}:${String(f%24).padStart(2,'0')}`;

/**
 * The VAR shift (Oct 10 2026 play pass): five more made-up goal-line replays, each with its own deepest frame and depth, so
 * some are goals and some are not, by a few centimetres or by a lot. Same 37-frame, 24 fps clip shape as the first replay.
 * `deepZ` is the ball centre's distance from the line's pitch edge at its deepest (negative = into the goal).
 */
export type Clip={id:string;deep:number;deepZ:number};
export const CLIPS:readonly Clip[]=[
 {id:'a',deep:18,deepZ:-.30},
 {id:'b',deep:22,deepZ:-.21},
 {id:'c',deep:15,deepZ:-.26},
 {id:'d',deep:24,deepZ:-.12},
 {id:'e',deep:19,deepZ:-.45},
];
/** A clip's ball distance from the line on frame f (the same in-fast, clawed-back-out shape as ballZ). */
export function clipZ(c:Clip,f:number){const n=Math.max(0,Math.min(LAST,f));
 if(n<=c.deep)return START_Z+(c.deepZ-START_Z)*ease(n/c.deep);
 const u=(n-c.deep)/(LAST-c.deep);return c.deepZ+(END_Z-c.deepZ)*(1-Math.pow(1-u,1.6));}
/** The truth of a clip: goal only when the WHOLE ball is past the WHOLE line at its deepest; `cm` is by how much (over, or still
 *  on the line). */
export function clipTruth(c:Clip){const edge=c.deepZ+BALL_R,goal=edge< -LINE_W;
 return {goal,cm:Math.round(Math.abs(edge+LINE_W)*100)};}
