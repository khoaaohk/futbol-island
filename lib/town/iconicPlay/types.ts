/**
 * Iconic-play contract (player cards → Play button). Shared by the engine (engine.ts), the three
 * template files (attack.ts, creator.ts, defence.ts) and the card UI. Do not change without the lead.
 *
 * WORLD COORDINATES (world units, y grows DOWN the screen like canvas):
 * - The goal being attacked (or, in defensive templates, the goal being defended) is at the TOP: goal line y = 0.
 * - x = 0 is the pitch centre line (left/right). "left" side = negative x.
 * - pitch ('pitch'): half-width 340 (touchlines x = ±340), visible length y ∈ [0, 900]; goal mouth x ∈ ±75,
 *   6-yard box 184×55, penalty box 400×165 (x ∈ ±200, y ≤ 165), penalty spot (0, 110), D arc r 90 about the spot.
 * - court ('court', futsal): half-width 200, length y ∈ [0, 560]; goal mouth x ∈ ±50; penalty area = quarter-circle
 *   arcs r 120 from each post joined across, penalty spot (0, 90), second spot (0, 150).
 * - Ball height h is in world units above the ground (0 = rolling). A shot into the top corner ends near h ≈ 38.
 * - Time t is seconds from 0 to Play.duration (≈ 5.5–8 s). Tracks are keyframes; the engine interpolates smoothly.
 */
export type Field='pitch'|'court';
export type Side='left'|'right'|'center';
export type Trick='roulette'|'elastico'|'stepover'|'cruyff_turn'|'rabona'|'nutmeg'|'flip_flap'|'drag_back'|'la_croqueta';
export type Params={side?:Side;beaten?:number;distance?:'box'|'edge'|'long';foot?:'left'|'right';trick?:Trick;dive?:'left'|'right'};
export type TemplateId='solo_dribble_goal'|'long_range_goal'|'free_kick_goal'|'header_goal'|'volley_goal'|'bicycle_kick'|'chip_goal'|'penalty_goal'
 |'through_ball_assist'|'cross_assist'|'overlap_run'|'skill_move'|'interception_counter'
 |'save'|'penalty_save'|'sweeper_keeper'|'last_ditch_tackle'|'aerial_clearance';

/** [t, x, y] keyframes, t ascending. */
export type Track=[number,number,number][];
export type Pose='run'|'jump'|'head'|'slide'|'dive-left'|'dive-right'|'kick'|'overhead'|'fall'|'celebrate';
export type Role='star'|'mate'|'opp'|'keeper';
/** keeper: an opposing goalkeeper (or, in defensive templates where the star is the keeper, use role 'star'). */
export type Actor={id:string;role:Role;track:Track;poses?:{t:number;pose:Pose;hold?:number}[]};
/** [t, x, y, h] keyframes for the ball. */
export type BallKey=[number,number,number,number];
export type PlayEvent={t:number;kind:'burst'|'net'|'speed'|'trick'|'shockwave'|'whistle';x:number;y:number;dir?:number};
/** camera keys [t, x, y, zoom]; omit to let the engine follow the ball. zoom 1 ≈ 900 world units tall. */
export type CameraKey=[number,number,number,number];
export type Play={duration:number;field:Field;actors:Actor[];ball:BallKey[];events:PlayEvent[];camera?:CameraKey[];
 /** optional window where the ball's path is drawn as a dashed ink lane (e.g. the killer pass). */
 lane?:{from:number;to:number}};
export type Template=(params:Params,seed:number,field:Field)=>Play;

export type PlayEntry={kind:'moment'|'signature';title:string;year?:number;event?:string;template:TemplateId;params?:Params;lesson:string};
/** What the card passes to the engine for colour. */
export type PlayLook={starInk:string;mateInk?:string;oppInk?:string};
