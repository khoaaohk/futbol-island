/**
 * Tactics board play schema (Coaches Centre → Coaches Board, Oct 9 2026). A play is a list of steps, like keyframes, but the
 * coach only ever sees "Step 1, Step 2, + Add step".
 *
 * Coordinates are normalised to the pitch so a play survives a format change: u runs along the length from the home goal
 * (0) to the goal the home team attacks (1); v runs across from the attackers' left touchline (0) to their right (1). A
 * little run-off outside the lines is allowed (corner takers, throw-ins), so u and v can be slightly below 0 or above 1.
 *
 * Every chip is on the board in every step (adding or deleting a chip changes all steps). Arrows and marker ink belong to
 * one step: a step's arrows say what happens next (the pass, the run, the dribble) before the following step.
 */
export const PLAY_VERSION=1;
export type Format='futsal'|'7v7'|'9v9'|'11v11';
export const FORMATS:readonly Format[]=['futsal','7v7','9v9','11v11'];
export type Team='home'|'away'|'ball';
/** [u,v], normalised (see above). */
export type Vec=[number,number];
export type Chip={id:string;team:Team;label:string;gk?:boolean};
/** An arrow end is a chip (it follows the chip) or a fixed point. */
export type End={c:string}|{p:Vec};
export type ArrowKind='pass'|'run'|'dribble';
export const ARROW_KINDS:readonly ArrowKind[]=['pass','run','dribble'];
/** `bend` is the control point's sideways offset as a fraction of the arrow's length (0 = straight). `ink` indexes INKS. */
export type Arrow={id:string;kind:ArrowKind;a:End;b:End;bend:number;ink:number};
export type InkKind='line'|'zone';
export type Ink={id:string;kind:InkKind;pts:Vec[];ink:number};
export type Step={pos:Record<string,Vec>;arrows:Arrow[];ink:Ink[]};
export type ZoomView='full'|'half'|'box';
export const ZOOM_VIEWS:readonly ZoomView[]=['full','half','box'];
export type Play={v:typeof PLAY_VERSION;id:string;name:string;format:Format;chips:Chip[];steps:Step[];note?:string;view?:ZoomView;created:number;updated:number};
/** Marker colours: black, red, blue, white (dry-wipe markers). */
export const INKS:readonly string[]=['#17191f','#d22f3c','#1d5fd8','#fbf7ea'];
export const INK_NAMES:readonly string[]=['Black','Red','Blue','White'];
export const MAX_CHIPS=30,MAX_STEPS=12,MAX_ARROWS=24,MAX_INK=24,MAX_INK_POINTS=160,MAX_NAME=32,MAX_LABEL=3,MAX_NOTE=160;
