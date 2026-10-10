import {createPinballTable,tableLaunch,tableStrike,tableGoal,tableLevelUp,tableChallenge,tableDrain,tableProtects,tableTimers,tableHold,tableContacts,tableCounterMode,tableDivisionCleared,type PinballTable,type TableHelpers} from './soccerPinballTable';
export const PINBALL_WIDTH = 360, PINBALL_HEIGHT = 620, PINBALL_STEP = 1 / 480;
/* Goal mouth, widened to DOMINATE the top of the table (108 -> 160 wide; the
 * arch entry at 318 and the left rail at 20 still get clean top-wall runs).
 * The keeper's patrol range grows only a little with it (see tick), which is
 * exactly what opens up the posts: ~18px pockets inside each post his body
 * can never reach. The renderer imports these so the drawn frame always
 * matches the physics. */
export const GOAL_LEFT = 100, GOAL_RIGHT = 260;
/* Launch lane along the right edge: a divider wall splits the lane from the
 * playfield, an arch at the top curves the launched ball left into play, and a
 * one-way gate at the lane mouth keeps it from falling back in. The ball rests
 * on the plunger pad at (LANE_X, PLUNGER_TIP - r). */
export const LANE_WALL = 341, LANE_OUT = 366, LANE_TOP = 150, LANE_X = 354, PLUNGER_TIP = 592;
/* Soft-entry opening in the lane divider. The divider is split over this band
 * and a one-way flap seals it from the playfield side. Inside the lane the
 * flap only deploys against a FALLING ball: a fast riser sails past it to the
 * top arch, while a soft launch that crested short is caught and shunted left
 * through the opening, dropping onto the right inlane guide — a deliberate,
 * low-risk entry near the right flipper. Sits just above the inlane guide's
 * top (338,458) so the exiting ball always lands ON the guide, never past it. */
export const LANE_OPEN_TOP = 402, LANE_OPEN_BOT = 455;
/* Plunger pull mapping. A quick tap (released before the hold engages) fires
 * the standard .68 launch over the top arch — unchanged feel. An engaged hold
 * ramps CONTINUOUSLY from the soft band (a low lob that fails the arch on
 * purpose and enters through the divider opening) up through tap power to a
 * full 1.0 blast, so a held release is always intentional power selection:
 * tap = normal, short hold = sneak in low, long hold = monster blast. */
export const TAP_PULL = .68, SOFT_PULL_MIN = .13, SOFT_PULL_MAX = .19;
const TAP_WINDOW = .14, SOFT_K = .3;
export function plungerPull(plunger: number) {
    if (plunger < TAP_WINDOW)
        return TAP_PULL;
    const k = (plunger - TAP_WINDOW) / (1 - TAP_WINDOW);
    return k <= SOFT_K
        ? SOFT_PULL_MIN + (k / SOFT_K) * (SOFT_PULL_MAX - SOFT_PULL_MIN)
        : SOFT_PULL_MAX + ((k - SOFT_K) / (1 - SOFT_K)) * (1 - SOFT_PULL_MAX);
}
export type PinballInput = {
    left: boolean;
    right: boolean;
    /** hold to pull the plunger back while phase === 'ready' */
    charge?: boolean;
};
export type PinballBall = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    /** visual rotation angle (rad), integrated from omega */
    spin: number;
    /** angular velocity (rad/s), picked up from grazing contacts */
    omega: number;
    contact: number;
    contactX: number;
    contactY: number;
};
export type PinballDefender = { x: number; y: number; r: number };
export type PinballCue = 'scan' | 'strike' | 'save' | 'corner' | 'goal' | 'dazed' | 'block' | 'nudge' | 'rescue' | 'control' | 'pass' | 'attack' | 'concede'
    | 'sling' | 'drop' | 'wallDown' | 'flag' | 'goalWord' | 'lane' | 'crest' | 'skill' | 'cone' | 'spin' | 'dugout' | 'mode' | 'modeDone' | 'modeEnd' | 'onetwo' | 'greatBlock' | 'clear' | 'final' | 'finalEnd' | 'goalWordPts'
    | 'wallPass' | 'multiball' | 'mbGoal' | 'mbSave' | 'mbEnd' | 'halfTime' | 'stoppage' | 'fullTime';
/** Strike timing coach ("time your block"). The flipper's swing position at
 * the moment it meets the ball says how well the press was timed: met mid-
 * swing is a full-power PERFECT strike; met at the very top of the swing (the
 * press came too soon) is a weak EARLY one; pressing just after the ball
 * slipped past the bats is LATE. Measured on the sim: mid-swing contacts leave
 * at ~1,100-1,600 px/s, top-of-swing ones at ~300-550. */
export type PinballGrade = 'none' | 'perfect' | 'good' | 'early' | 'late';
export const PERFECT_SWING = .8, EARLY_SWING = .92, PERFECT_POINTS = 50, READ_POINTS = 100, PINBALL_READ_DOTS = 8;
export type PinballTiming = { grade: PinballGrade; at: number; streak: number; best: number; read: boolean; held: [number, number]; passedAt: number; cool: number };
/** Rebound read ("read the rebound"): where the ball's current free flight
 * will reach the flipper line, which bat that is (-1 = the centre gap), when,
 * and up to PINBALL_READ_DOTS points along the way. Recomputed once each time
 * the ball leaves a contact; `fromRebound` marks flights that came off
 * something other than your own strike (kickboard, keeper, defender, rail). */
export type PinballRead = { live: boolean; x: number; side: -1 | 0 | 1; eta: number; at: number; dirty: boolean; fromRebound: boolean; lastSide: -1 | 0 | 1; lastAt: number; n: number; dots: Float32Array };
export const PINBALL_DIVISIONS = [
    { name: 'Build Up', objective: 'Use both flippers, then finish', bonus: 0 },
    { name: 'Find the Corner', objective: 'Finish beside a post', bonus: 250 },
    { name: 'Play the Angles', objective: 'Bank off a side rail, then score', bonus: 400 },
    { name: 'Complete Forward', objective: 'Combine both feet and finish in a corner', bonus: 600 },
] as const;
export function pinballDivision(s: Pick<PinballState, 'level'>) { return PINBALL_DIVISIONS[s.level - 1]; }
export type PinballState = {
    /** Two goals advance a division. Final division remains a mastery challenge. */
    level: number;
    challengeComplete: boolean;
    lastChallengeBonus: number;
    challengeBall: boolean;
    /** Meaningful side-rail contact since the last attacking flipper strike. */
    banked: boolean;
    /** Ball save for the current ball (life): each new ball after a real
     * drain or a goal gets one; a rescued relaunch never gets another. */
    openingRescue:boolean;
    launchGrace:number;
    nudges:number;
    nudgeCooldown:number;
    ball: PinballBall;
    phase: 'ready' | 'playing' | 'goal' | 'lost' | 'over';
    score: number;
    goals: number;
    balls: number;
    time: number;
    timer: number;
    left: number;
    right: number;
    keeper: number;
    keeperVelocity: number;
    cue: PinballCue;
    cueTime: number;
    lastGoalPoints: number;
    /** Complete a two-foot build-up, then finish while the goal is lit. */
    moveTime: number;
    moves: number;
    lastGoalBonus: number;
    combination: number;
    lastFoot: number;
    lastStrikeAt: number;
    /** Per-table collision scratch; reused at 480 Hz. */
    defenders: PinballDefender[];
    previousDefenders: PinballDefender[];
    keeperDive: number;
    keeperCommit: number;
    keeperDirection: number;
    defenderAI: { offset: number; velocity: number; target: number; think: number; block: number; cooldown: number; aim: number; dazed: number; hitX: number; hitY: number; fallYaw: number }[];
    keeperTarget: number;
    /** Defender possession is bounded; released passes always use ordinary ball physics. */
    possession: number;
    possessionTime: number;
    attackReceiver: number;
    counterAttack: boolean;
    attackPasses: number;
    passTarget: number;
    passTime: number;
    keeperThink: number;
    flash: number;
    hitX: number;
    hitY: number;
    hitId: number;
    bumperCooldown: number[];
    flipperCooldown: number[];
    flipperPulse: [number,number];
    accumulator: number;
    /** plunger pull-back 0..1 while charging in 'ready' */
    plunger: number;
    /** 1 -> 0 decay right after release; drives the snap visual */
    plungerSnap: number;
    /** power of the most recent launch (for launch SFX intensity) */
    launchPower: number;
    /** active defenders (1 at kickoff, +1 per goal up to 3) */
    defs: number;
    /** 1 -> 0 while the newest defender jogs in from the sideline */
    defJoin: number;
    /** monotonically increasing event counters + magnitudes; the renderer diffs
     * these once per frame to drive sound/shake without any allocation */
    /** Playfield features: kickboards, wall, flags, lanes, cones, spinner, dugout, modes. */
    table: PinballTable;
    /** Match clock: seconds of live play (it stops while the ball waits on the
     * plunger or a goal is celebrated). PINBALL_MATCH_TIME is 90'. */
    clock: number;
    /** -1 before 90'; then seconds of stoppage time played. */
    stoppage: number;
    halfTime: boolean;
    /** Points paid at full time for the balls still in hand. */
    fullTimeBonus: number;
    /** Seconds left to score a REBOUND goal after the keeper parries. */
    rebound: number;
    lastRebound: boolean;
    /** Short lockout so one save cannot parry twice. */
    keeperParry: number;
    /** Time of the latest kickboard/flag/side-rail rebound (for the wall pass). */
    reboundAt: number;
    /** 2v1 BREAKAWAY multiball: one extra ball, live while extraLive. */
    extra: PinballBall;
    extraLive: boolean;
    /** Multiball ball save: drained balls are played back in while > 0. */
    mbSave: number;
    /** Run totals for the full-time takeaway. */
    stats: { parries: number; rebounds: number; wallPasses: number; corners: number; mbStarts: number; mbGoals: number; perfect: number; early: number; late: number; reads: number };
    timing: PinballTiming;
    read: PinballRead;
    sfx: {
        wall: number;
        wallV: number;
        bumper: number;
        bumperI: number;
        flipper: number;
        flipperV: number;
        keeper: number;
        keeperV: number;
        gate: number;
        join: number;
        parry: number;
        /** bumps on every strike-timing grade (see s.timing.grade) */
        grade: number;
    };
};
/* ---- physical tuning (modeled on real-table numbers) -----------------------
 * A pinball table is an inclined plane (~6.5 deg), so playfield gravity is
 * g*sin(6.5) ~ 1.1 m/s^2, NOT full g. At our scale (620px table ~ 1m) that is
 * GRAVITY ~ 380 px/s^2. Launch and flick speeds in real pinball are HUGE next
 * to that pull (~6 m/s, an energy ratio of ~8x table height) - that headroom,
 * not weak gravity, is what makes the ball fly table-length. The playfield is
 * glossy and nearly frictionless (Visual Pinball uses ~0.0025), so AIR_DRAG
 * is tiny; grip lives in the flipper rubber (high mu there only).
 * MAGNUS        gentle curve: accel = MAGNUS * omega * v-perp.
 * MAX_SPEED     ~6 m/s scaled; with 1/480 substeps that is ~3px per step,
 *               always < the ball radius, so no tunneling ever.
 * DEAD_BOUNCE   below this approach speed a bounce is fully damped, which is
 *               what lets the ball settle and cradle on a flipper w/o jitter. */
/** 90 match minutes = five minutes of live play (see the session-length note
 * in docs/performance-guide.md). After 90' the ball in play gets up to
 * STOPPAGE seconds of stoppage time, then the whistle goes. */
export const PINBALL_MATCH_TIME = 300, PINBALL_STOPPAGE = 20, PINBALL_MULTIBALL_SAVE = 10, PINBALL_FULLTIME_BALL = 500;
/** The match minute shown on the scoreboard (0'..90', then 90+n'). */
export function pinballMinute(s: Pick<PinballState, 'clock' | 'stoppage'>) { return s.stoppage >= 0 ? `90+${Math.max(1, Math.ceil(s.stoppage / (PINBALL_MATCH_TIME / 90)))}'` : `${Math.min(90, Math.floor(s.clock / (PINBALL_MATCH_TIME / 90)))}'`; }
/* Keeper parry: a shot arriving faster than PARRY_MIN is punched out wide and
 * opens a REBOUND_WINDOW for a follow-up goal worth REBOUND_BONUS extra. A
 * wall pass is a strike met first time with the other foot within
 * WALL_PASS_WINDOW of a kickboard/flag/rail rebound. */
export const PARRY_MIN = 330, REBOUND_WINDOW = 3, REBOUND_BONUS = 300, WALL_PASS_WINDOW = 2.5, WALL_PASS_POINTS = 200;
const GRAVITY = 380, AIR_DRAG = .018, MAGNUS = .0008, SPIN_DECAY = .6, MAX_SPEED = 1500, DEAD_BOUNCE = 30;
/** Advisory timing light, never an automatic strike. Project only the short,
 * unobstructed drop above the bats; rising balls and the launch lane stay dark. */
export function pinballReadyFoot(s:PinballState): -1|0|1 {
 if(s.phase!=='playing')return -1;
 const main=readyFootFor(s.ball);return main>=0||!s.extraLive?main:readyFootFor(s.extra);
}
function readyFootFor(b:PinballBall): -1|0|1 {
 if(b.vy<=20||b.y<420||b.y>545||b.x>=LANE_WALL)return -1;
 const eta=Math.max(0,(-b.vy+Math.sqrt(Math.max(0,b.vy*b.vy+2*GRAVITY*(535-b.y))))/GRAVITY);
 if(eta>.28)return -1;
 const x=b.x+b.vx*eta;
 return x>=88&&x<=166?0:x>=194&&x<=272?1:-1;
}
function freshBall(): PinballBall { return { x: LANE_X, y: PLUNGER_TIP - 7, vx: 0, vy: 0, r: 7, spin: 0, omega: 0, contact: 0, contactX: 0, contactY: 1 }; }
export function createPinballState(): PinballState { return { level:1,challengeComplete:false,lastChallengeBonus:0,challengeBall:false,banked:false,openingRescue:true,launchGrace:0,nudges:1,nudgeCooldown:0,ball: freshBall(), phase: 'ready', score: 0, goals: 0, balls: 3, time: 0, timer: 0, left: 0, right: 0, keeper: 180, keeperVelocity: 0, cue: 'scan', cueTime: 0, lastGoalPoints: 500, moveTime: 0, moves: 0, lastGoalBonus: 0, combination: 0, lastFoot: -1, lastStrikeAt: -10, defenders: pinballDefenders(0), previousDefenders: pinballDefenders(0), keeperCommit: 0, keeperDirection: 1, defenderAI: Array.from({length:3},()=>({offset:0,velocity:0,target:0,think:0,block:0,cooldown:0,aim:0,dazed:0,hitX:0,hitY:0,fallYaw:0})), keeperDive: 0, keeperTarget: 180, possession:-1,possessionTime:0,attackReceiver:-1,counterAttack:false,attackPasses:0,passTarget:-1,passTime:0,keeperThink: 0, flash: 0, hitX: 0, hitY: 0, hitId: 0, bumperCooldown: [0, 0, 0], flipperCooldown: [0, 0], flipperPulse:[0,0], accumulator: 0, plunger: 0, plungerSnap: 0, launchPower: 0, defs: 1, defJoin: 0, table: createPinballTable(), clock: 0, stoppage: -1, halfTime: false, fullTimeBonus: 0, rebound: 0, lastRebound: false, keeperParry: 0, reboundAt: -10, extra: freshBall(), extraLive: false, mbSave: 0, stats: { parries: 0, rebounds: 0, wallPasses: 0, corners: 0, mbStarts: 0, mbGoals: 0, perfect: 0, early: 0, late: 0, reads: 0 }, timing: { grade: 'none', at: -10, streak: 0, best: 0, read: false, held: [0, 0], passedAt: -10, cool: 0 }, read: { live: false, x: 0, side: -1, eta: 0, at: -10, dirty: true, fromRebound: false, lastSide: -1, lastAt: -10, n: 0, dots: new Float32Array(PINBALL_READ_DOTS * 2) }, sfx: { wall: 0, wallV: 0, bumper: 0, bumperI: 0, flipper: 0, flipperV: 0, keeper: 0, keeperV: 0, gate: 0, join: 0, parry: 0, grade: 0 } }; }
function gradeStrike(s: PinballState, grade: PinballGrade, read = false) {
    const t = s.timing;
    t.grade = grade; t.at = s.time; t.read = read; t.cool = .7;
    if (grade === 'perfect') { t.streak = Math.min(5, t.streak + 1); t.best = Math.max(t.best, t.streak); s.stats.perfect++; s.score += PERFECT_POINTS * t.streak; }
    else if (grade === 'early' || grade === 'late') { t.streak = 0; if (grade === 'early') s.stats.early++; else s.stats.late++; }
    if (read) { s.stats.reads++; s.score += READ_POINTS; }
    s.sfx.grade++;
}
/** The flipper line the read projects onto, and its look-ahead step/limit (2s). */
const READ_Y = 505, READ_STEP = 1 / 120, READ_MAX = 240;
/** Ballistic look-ahead for the rebound read: gravity, the side rails and the
 * inlane guides only. A path that runs into a kickboard or a defender, or
 * climbs to the goal, is not a readable drop and is left dark. */
function predictRead(s: PinballState) {
    const r = s.read, b = s.ball;
    r.dirty = false; r.live = false; r.n = 0;
    if (s.phase !== 'playing' || b.x >= LANE_WALL || s.possession >= 0 || s.table.hold > 0 || b.y > READ_Y - 4) return;
    let x = b.x, y = b.y, vx = b.vx, vy = b.vy, k = 0;
    const lo = 20 + b.r, hi = LANE_WALL - 2.5 - b.r;
    for (; k < READ_MAX; k++) {
        vy += GRAVITY * READ_STEP; x += vx * READ_STEP; y += vy * READ_STEP;
        if (x < lo) { x = 2 * lo - x; vx = -vx * .62; }
        if (x > hi) { x = 2 * hi - x; vx = -vx * .62; }
        if (y < 60) return;
        // Kickboards would kick it somewhere else entirely.
        if (y > 386 && y < 474 && (x < 80 || x > 278)) return;
        for (let i = 0; i < s.defenders.length; i++) { const d = s.defenders[i]; if (s.defenderAI[i].dazed <= 0 && Math.abs(x - d.x) < 26 && Math.abs(y - d.y) < 26) return; }
        // Inlane guides funnel the ball onto their flipper.
        if (y > 455 && x < 20 + (y - 455) * 79 / 80 + 9) { x = 108; y = READ_Y; break; }
        if (y > 458 && x > 338 - (y - 458) - 9) { x = 252; y = READ_Y; break; }
        if (k % 12 === 11 && r.n < PINBALL_READ_DOTS) { r.dots[r.n * 2] = x; r.dots[r.n * 2 + 1] = y; r.n++; }
        if (y >= READ_Y) break;
    }
    if (k >= READ_MAX || vy <= 0) return;
    r.live = true; r.x = x; r.eta = (k + 1) * READ_STEP; r.at = s.time;
    r.side = x < 157 ? 0 : x > 203 ? 1 : -1;
    r.fromRebound = s.time - s.lastStrikeAt > .12;
    r.lastSide = r.side; r.lastAt = s.time;
}
/** 0..1 how strongly to show the rebound read. The guidance fades with the
 * divisions so kids learn to read the drop themselves: Build Up and Find the
 * Corner show the whole path, Play the Angles only the landing ring, and the
 * Complete Forward division only a late, short ring. */
export function pinballReadShow(s: Pick<PinballState, 'phase' | 'read' | 'level' | 'time' | 'ball'>): { ring: number; path: number } {
    const r = s.read;
    if (s.phase !== 'playing' || !r.live) return READ_HIDDEN;
    const left = r.eta - (s.time - r.at);
    if (left <= 0 || s.ball.y > READ_Y + 6) return READ_HIDDEN;
    // Fade in quickly; a long rise to the drop stays faint until it turns.
    if (!r.fromRebound && s.ball.vy < 0) return READ_HIDDEN;
    const fall = s.ball.vy > 0 ? 1 : .45;
    READ_OUT.ring = s.level >= 4 ? (left < .55 ? fall : 0) : fall;
    READ_OUT.path = s.level <= 2 ? fall * .85 : 0;
    return READ_OUT;
}
const READ_HIDDEN = { ring: 0, path: 0 }, READ_OUT = { ring: 0, path: 0 };
/** Preserve a tap even when down/up both arrive between rendered frames. */
export function tapPinballFlipper(s:PinballState,side:0|1){if(s.phase==='playing'||s.phase==='ready')s.flipperPulse[side]=.065;}
/** Fires the ball up the launch lane. With no explicit power the current
 * plunger pull is mapped through plungerPull(): tap = the standard launch,
 * short hold = the soft band, long hold ramps monotonically to full power. */
export function launchPinball(s: PinballState, power?: number) {
    if (s.phase !== 'ready')
        return false;
    const pull = power !== undefined ? power : plungerPull(s.plunger);
    const p = Math.max(.12, Math.min(1, pull));
    s.ball = { x: LANE_X, y: PLUNGER_TIP - 7, vx: 0, vy: -(430 + 810 * p), r: 7, spin: 0, omega: 0, contact: 0, contactX: 0, contactY: 1 };
    s.possession=-1;s.possessionTime=0;s.counterAttack=false;s.attackPasses=0;s.passTarget=-1;s.passTime=0;
    s.nudges=1;s.nudgeCooldown=0;s.banked=false;s.lastChallengeBonus=0;s.challengeBall=false;
    s.launchGrace = s.openingRescue ? pinballBallSaveTime(s.level) : 0;
    s.read.live = false; s.read.dirty = true; s.read.lastSide = -1; s.timing.passedAt = -10;
    tableLaunch(s, p);
    s.launchPower = p;
    s.plungerSnap = 1;
    s.plunger = 0;
    s.combination = 0;
    s.moveTime = 0;
    s.lastFoot = -1;
    s.phase = 'playing';
    return true;
}
/** Seconds of on-table ball save per new ball. Generous while learning, then
 * tighter as the divisions ramp up (it never disappears for kids). */
export function pinballBallSaveTime(level:number){return level<=2?3:level===3?2.5:2;}
/** Rescue a falling ball; earn another nudge by switching flippers. */
export function nudgePinball(s:PinballState){if(s.phase!=='playing'||s.nudges<=0||s.nudgeCooldown>0||s.ball.x>=LANE_WALL)return false;s.nudges--;s.nudgeCooldown=1.2;if(s.possession>=0)s.bumperCooldown[s.possession]=.4;s.possession=-1;s.passTarget=-1;s.attackPasses=0;s.counterAttack=false;s.ball.vy=Math.min(s.ball.vy,-240);s.ball.vx+=(180-s.ball.x)*1.1;s.cue='nudge';s.cueTime=1.2;s.hitX=s.ball.x;s.hitY=s.ball.y;s.hitId++;return true;}
/** Active defender patrols. The squad grows with goals: slot 0 is the mid-
 * table patroller (the most central threat, on from kickoff), slot 1 adds the
 * left-high lane, slot 2 the right-high lane. While `join` > 0 the newest slot
 * jogs in from its sideline (eased, with a little bounce) — and because the
 * physics reads these same positions, his body is exactly where you see him
 * even mid-entrance. */
export function pinballDefenders(t: number, count = 3, join = 0, joinI = -1, output?: PinballDefender[]) {
    const list = output ?? [{ x: 0, y: 0, r: 18 }, { x: 0, y: 0, r: 17 }, { x: 0, y: 0, r: 17 }];
    list.length = Math.max(1, Math.min(3, count));
    for (let i = 0; i < list.length; i++) {
        const d = list[i] ?? (list[i] = { x: 0, y: 0, r: i ? 17 : 18 });
        d.x = i === 0 ? 177 + Math.sin(t * .95 + 3) * 37 : i === 1 ? 94 + Math.sin(t * .82) * 23 : 258 + Math.sin(t * .7 + 1.9) * 22;
        d.y = i === 0 ? 305 + Math.sin(t * .71 + 1) * 22 : i === 1 ? 175 + Math.sin(t * .63) * 15 : 193 + Math.sin(t * .92) * 21;
    }
    if (join > 0 && joinI > 0 && joinI < list.length) {
        const d = list[joinI], k = 1 - join, e = 1 - (1 - k) * (1 - k) * (1 - k);
        const fromX = joinI === 1 ? -40 : 400;
        d.x = fromX + (d.x - fromX) * e;
        d.y += Math.sin(e * Math.PI * 3) * 5 * join;
    }
    return list;
}
/** The flipper lane a defender in possession will shoot at (when he has no
 * pass on): the lane with the most clearance from his team-mates. Shared by
 * the release and the renderer's aim-line telegraph, so the arrow never lies. */
/** True when the defender in possession will pass rather than shoot. */
export function pinballWillPass(s:PinballState){return !tableCounterMode(s)&&s.attackReceiver>=0&&s.defenderAI[s.attackReceiver].dazed===0?s.attackReceiver:-1;}
export function pinballCounterLane(s:PinballState,owner:number){
    const defenders=s.defenders,d=defenders[owner];if(!d)return 180;
    let targetX=d.x<180?135:225,clearance=-Infinity;
    for(const lane of [135,225]){let nearest=Infinity;
        for(let j=0;j<defenders.length;j++)if(j!==owner&&s.defenderAI[j].dazed<=0){
            const q=defenders[j],dx=lane-d.x,dy=525-d.y,t=clamp(((q.x-d.x)*dx+(q.y-d.y)*dy)/(dx*dx+dy*dy),0,1);
            nearest=Math.min(nearest,Math.hypot(q.x-d.x-dx*t,q.y-d.y-dy*t));
        }
        if(nearest>clearance){clearance=nearest;targetX=lane;}
    }
    return targetX;
}
function attackReceiver(s:PinballState,owner:number){
    const defenders=s.defenders,d=defenders[owner],b=s.ball;let receiver=-1,best=-Infinity;
    if(s.attackPasses<2)for(let j=0;j<defenders.length;j++){
            if(j===owner||s.defenderAI[j].dazed>0||s.defJoin>0&&j===s.defs-1)continue;
            const q=defenders[j];let clear=true;
            for(let k=0;k<defenders.length;k++)if(k!==owner&&k!==j&&s.defenderAI[k].dazed<=0){
                const r=defenders[k],dx=q.x-b.x,dy=q.y-b.y,t=clamp(((r.x-b.x)*dx+(r.y-b.y)*dy)/(dx*dx+dy*dy),0,1);
                if(Math.hypot(r.x-b.x-dx*t,r.y-b.y-dy*t)<34)clear=false;
            }
            const value=q.y-d.y-Math.abs(q.x-d.x)*.15;
            if(clear&&value>best){best=value;receiver=j;}
        }
    return receiver;
}
/* Flippers sit wider apart and reach a touch shorter than the classic layout
 * (pivots 99/261, length 63 vs the old 105/255 x 66): the uncovered center
 * gap between resting tips is ~49px — a centered dribble usually drains
 * unless actively flipped — while a flipped side is still fully covered. */
export function pinballFlippers(s: Pick<PinballState, 'left' | 'right'>) { return [{ x: 99, y: 535, angle: .46 - s.left * .97, length: 63 }, { x: 261, y: 535, angle: Math.PI - .46 + s.right * .97, length: 63 }]; }
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function hit(s: PinballState, x: number, y: number, points = 0) { s.flash = 1; s.hitX = x; s.hitY = y; s.hitId++; s.score += points; }
/** Impulse-based contact response against a surface moving at (svx, svy).
 * Normal: restitution `e`, fully damped under DEAD_BOUNCE so the ball can rest.
 * Tangent: Coulomb-limited friction kills contact slip AND exchanges it with
 * ball spin — a grazing hit visibly spins the ball, and spin scrubs off into
 * a small kick on the next surface it touches. Returns the approach speed. */
export function resolve(b: PinballBall, nx: number, ny: number, svx: number, svy: number, e: number, mu: number) {
    const rvx = b.vx - svx, rvy = b.vy - svy, vn = rvx * nx + rvy * ny;
    if (vn >= 0)
        return 0;
    if (-vn > 70) { b.contact = Math.min(1, -vn / 700); b.contactX = nx; b.contactY = ny; }
    const jn = -(1 + (vn > -DEAD_BOUNCE ? 0 : e)) * vn;
    b.vx += jn * nx;
    b.vy += jn * ny;
    const tx = -ny, ty = nx, slip = rvx * tx + rvy * ty - b.omega * b.r;
    const jt = clamp(-slip * .28, -jn * mu, jn * mu);
    b.vx += jt * tx;
    b.vy += jt * ty;
    // Ball spin receives the same friction impulse as translation;
    // grazing contacts cannot invent spin beyond the rubber's grip limit.
    b.omega = clamp(b.omega - 2 * jt / b.r, -55, 55);
    return -vn;
}
/** Closest-point capsule test; on overlap, pushes the ball out and reports the
 * contact normal + point (so callers can compute the surface velocity there).
 * With 1/480 substeps every moving part travels < the capsule radius per step,
 * so contacts are never skipped even at flick speeds. */
export function capsuleContact(b: PinballBall, ax: number, ay: number, bx: number, by: number, rad: number) {
    const dx = bx - ax, dy = by - ay, t = clamp(((b.x - ax) * dx + (b.y - ay) * dy) / Math.max(1, dx * dx + dy * dy), 0, 1), px = ax + t * dx, py = ay + t * dy;
    const ex = b.x - px, ey = b.y - py, d = Math.hypot(ex, ey), limit = b.r + rad;
    if (d >= limit)
        return null;
    const nx = d > .0001 ? ex / d : 0, ny = d > .0001 ? ey / d : -1;
    b.x = px + nx * (limit + .02);
    b.y = py + ny * (limit + .02);
    return { nx, ny, cx: b.x - nx * b.r, cy: b.y - ny * b.r };
}
function wall(s: PinballState, ax: number, ay: number, bx: number, by: number, rad: number, e = .82, mu = .25) {
    const c = capsuleContact(s.ball, ax, ay, bx, by, rad);
    if (!c)
        return false;
    const approach = resolve(s.ball, c.nx, c.ny, 0, 0, e, mu);
    if (approach > 70) {
        s.sfx.wall++;
        s.sfx.wallV = approach;
        if(approach>180 && ax===LANE_WALL && bx===LANE_WALL && c.nx<0 && s.ball.y>100 && s.ball.y<455)s.banked=true;
    }
    return true;
}
const TABLE_HELPERS: TableHelpers = { contact: capsuleContact, resolve };
function tick(s: PinballState, input: PinballInput, dt: number) {
    s.time += dt;
    s.ball.contact = Math.max(0, s.ball.contact - dt * 9);
    if (s.phase === 'playing') {
        s.moveTime = Math.max(0, s.moveTime - dt);
        // The save clock runs at half speed up among the cones and lanes, so a long
        // first rally up top never burns the whole save before the flippers.
        if(s.ball.x < LANE_WALL)s.launchGrace=Math.max(0,s.launchGrace-dt*(s.ball.y > 200 ? 1 : .75));
        if(s.launchGrace===0)s.openingRescue=false;
        tableTimers(s, dt, input.left||s.flipperPulse[0]>0, input.right||s.flipperPulse[1]>0);
        s.rebound = Math.max(0, s.rebound - dt);
        s.mbSave = s.extraLive ? Math.max(0, s.mbSave - dt) : 0;
        // Match clock. Half time is just a whistle; at 90' the ball in play
        // gets stoppage time, then full time (the Cup Final always finishes).
        s.clock += dt;
        if (!s.halfTime && s.clock >= PINBALL_MATCH_TIME / 2) { s.halfTime = true; s.cue = 'halfTime'; s.cueTime = 2.4; hit(s, 180, 310); }
        if (s.clock >= PINBALL_MATCH_TIME) {
            if (s.stoppage < 0) { s.stoppage = 0; s.cue = 'stoppage'; s.cueTime = 2.4; hit(s, 180, 310); }
            s.stoppage += dt;
            if (s.stoppage >= PINBALL_STOPPAGE && !tableProtects(s)) fullTime(s);
        }
    }
    s.keeperParry = Math.max(0, s.keeperParry - dt);
    s.flash = Math.max(0, s.flash - dt * 3);
    s.cueTime = Math.max(0, s.cueTime - dt);
    if (!s.cueTime) s.cue = 'scan';
    for(const ai of s.defenderAI){ai.dazed=Math.max(0,ai.dazed-dt);ai.block=Math.max(0,ai.block-dt);ai.cooldown=Math.max(0,ai.cooldown-dt);}
    s.nudgeCooldown=Math.max(0,s.nudgeCooldown-dt);
    s.keeperCommit = Math.max(0, s.keeperCommit - dt);
    const oldLeft = s.left, oldRight = s.right;
    s.left += clamp((input.left||s.flipperPulse[0]>0 ? 1 : 0) - s.left, -dt * 10, dt * 22);
    s.right += clamp((input.right||s.flipperPulse[1]>0 ? 1 : 0) - s.right, -dt * 10, dt * 22);
    s.flipperPulse[0]=Math.max(0,s.flipperPulse[0]-dt);s.flipperPulse[1]=Math.max(0,s.flipperPulse[1]-dt);
    // Timing coach: how long each flipper has been held, and a LATE grade for
    // a fresh press just after the ball slipped past the bats.
    {const t=s.timing;t.cool=Math.max(0,t.cool-dt);
     for(let i=0;i<2;i++){const on=i?s.right>oldRight||input.right:s.left>oldLeft||input.left;
      if(on){if(t.held[i]===0&&s.phase==='playing'&&s.time-t.passedAt<.3&&t.cool===0){t.passedAt=-10;gradeStrike(s,'late');}t.held[i]+=dt;}else t.held[i]=0;}}
    // Plunger: pulls back over ~1.1s while charging, springs home otherwise;
    // the post-release snap value only feeds the launch animation.
    s.plungerSnap = Math.max(0, s.plungerSnap - dt * 6);
    s.plunger = s.phase === 'ready' && input.charge ? Math.min(1, s.plunger + dt * .9) : Math.max(0, s.plunger - dt * 8);
    s.defJoin = Math.max(0, s.defJoin - dt * .8);
    for (let i = 0; i < 3; i++)
        s.bumperCooldown[i] = Math.max(0, s.bumperCooldown[i] - dt);
    for (let i = 0; i < 2; i++)
        s.flipperCooldown[i] = Math.max(0, s.flipperCooldown[i] - dt);
    if (s.phase !== 'playing') {
        if (s.phase === 'goal' || s.phase === 'lost') {
            s.timer -= dt;
            if (s.timer <= 0) {
                s.phase = s.balls > 0 ? 'ready' : 'over';
                s.ball = freshBall();
                // Difficulty ramp: each goal calls another defender onto the
                // pitch (1 at kickoff, up to the full back three); he jogs in
                // from the sideline while the next ball waits on the plunger.
                const nextLevel = Math.min(4, 1 + Math.floor(s.goals / 2));
                if(nextLevel !== s.level){tableLevelUp(s,s.level);s.level=nextLevel;s.challengeComplete=false;}
                const want = Math.min(3, 1 + s.goals);
                if (s.phase === 'ready' && want > s.defs) {
                    s.defs = want;
                    s.defJoin = 1;
                    s.sfx.join++;
                }
                // Past 90': the whistle goes once this ball is over.
                if (s.phase === 'ready' && s.stoppage >= 0 && !tableProtects(s)) fullTime(s);
            }
        }
        return;
    }
    const b = s.ball;
    s.passTime=Math.max(0,s.passTime-dt);if(s.passTime===0)s.passTarget=-1;
    // Keeper: thinks on a human-ish interval, only PARTIALLY leads the shot
    // (.45 of true intercept). The mouth is now 160 wide but his patrol range
    // grew far less (140-220): each post hides a real ~18px scoring pocket
    // his body can never reach, so corner placement pays off hard while a
    // straight center floater is still always savable. His pace scales with
    // the squad — a lone-defender kickoff faces a slower keeper (~107 px/s)
    // than the full back three (~125 px/s). In a 2v1 he watches the ball that
    // will arrive first.
    const tb = threatBall(s);
    const keeperPace = 98 + 9 * s.defs + (s.level - 1) * 10;
    s.keeperThink -= dt;
    if (s.keeperThink <= 0) {
        s.keeperThink = .15 - s.level * .01;
        if (tb.vy < -120 && tb.y < 240) {
            const eta = clamp((83 - tb.y) / tb.vy, 0, .55);
            s.keeperTarget = clamp(tb.x + tb.vx * eta * (.45 + (s.level - 1) * .06), 140, 220);
        }
        else
            s.keeperTarget = 180 + Math.sin(s.time * .8) * 20;
    }
    // Accelerate into a save and brake toward the target, rather than snapping
    // instantly between full-speed directions at each decision. Pose follows
    // velocity (a per-substep distance threshold never fired at 480 Hz).
    const shotEta = tb.vy < -120 ? (83-tb.y)/tb.vy : 10;
    if(s.keeperCommit===0 && shotEta>0 && shotEta<.22 && Math.abs(s.keeperTarget-s.keeper)>7){
        s.keeperCommit=.65;s.keeperDirection=Math.sign(s.keeperTarget-s.keeper);
    }
    const diving=s.keeperCommit>.28;
    const desiredVelocity = diving ? s.keeperDirection*keeperPace*1.35 : s.keeperCommit>0 ? 0 : clamp((s.keeperTarget - s.keeper) * 12, -keeperPace, keeperPace);
    s.keeperVelocity += clamp(desiredVelocity - s.keeperVelocity, -720 * dt, 720 * dt);
    const previousKeeper = s.keeper;
    s.keeper = clamp(s.keeper + s.keeperVelocity * dt, 140, 220);
    const keeperStep = s.keeper - previousKeeper;
    if ((s.keeper === 140 && s.keeperVelocity < 0) || (s.keeper === 220 && s.keeperVelocity > 0)) s.keeperVelocity = 0;
    s.keeperDive = s.keeperCommit>0 ? s.keeperDirection*Math.sin(Math.PI*Math.min(1,(.65-s.keeperCommit)/.65)) : 0;
    // Defenders move and think once per substep (on the main ball); every
    // live ball then collides with them.
    const defenders = pinballDefenders(s.time, s.defs, s.defJoin, s.defs - 1, s.defenders), before = pinballDefenders(s.time - dt, s.defs, Math.min(1, s.defJoin + dt * .8), s.defs - 1, s.previousDefenders);
    for (let i = 0; i < defenders.length; i++) {
        const d = defenders[i], ai=s.defenderAI[i];
        if(ai.dazed>0){const t=clamp(1-ai.dazed/.4,0,1),stand=t*t*(3-2*t);d.x=ai.hitX+(d.x+ai.offset-ai.hitX)*stand;d.y=ai.hitY+(d.y-ai.hitY)*stand;ai.velocity=0;DEF_VX[i]=DEF_VY[i]=0;continue;}
        ai.think-=dt;
        if(ai.think<=0){
            // The central player screens; wide players anticipate the passing
            // lane. Decisions remain committed during an extended foot block.
            ai.think=.16-(s.level-1)*.02+i*.012;
            if(ai.block===0){const lead=.10+(s.level-1)*.012+i*.014;ai.target=Math.hypot(b.x-d.x,b.y-d.y)<150 ? clamp(b.x+b.vx*lead-d.x,-22,22) : 0;}
        }
        const oldOffset=ai.offset;
        ai.velocity+=clamp((ai.target-ai.offset)*9-ai.velocity,-420*dt,420*dt);
        ai.velocity=clamp(ai.velocity,-55,55);ai.offset=clamp(ai.offset+ai.velocity*dt,-24,24);
        DEF_VX[i]=(d.x-before[i].x+ai.offset-oldOffset)/dt;DEF_VY[i]=(d.y-before[i].y)/dt;
        d.x+=ai.offset;
    }
    if (stepBall(s, dt, false, oldLeft, oldRight, keeperStep, before)) return;
    if (s.extraLive) {
        s.extra.contact = Math.max(0, s.extra.contact - dt * 9);
        s.ball = s.extra;
        const ended = stepBall(s, dt, true, oldLeft, oldRight, keeperStep, before);
        s.ball = b;
        if (ended) return;
        if (s.extraLive && s.possession < 0 && s.table.hold <= 0) collideBalls(s, b, s.extra);
    }
    if (s.table.mbPending) { s.table.mbPending = false; startMultiball(s); }
}
/* Per-substep defender surface velocity, shared by every live ball. */
const DEF_VX = new Float64Array(3), DEF_VY = new Float64Array(3);
/** The ball the keeper should watch: in a 2v1, the one arriving first. */
function threatBall(s: PinballState) {
    if (!s.extraLive) return s.ball;
    const eta = (q: PinballBall) => q.vy < -120 && q.y > 60 ? (83 - q.y) / q.vy : 99;
    return eta(s.extra) < eta(s.ball) ? s.extra : s.ball;
}
/** Two footballs on the pitch knock into each other (equal mass, a little lossy). */
function collideBalls(s: PinballState, a: PinballBall, c: PinballBall) {
    const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = a.r + c.r;
    if (d >= min || d < 1e-4) return;
    const nx = dx / d, ny = dy / d, push = (min - d) / 2;
    a.x -= nx * push; a.y -= ny * push; c.x += nx * push; c.y += ny * push;
    const vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
    if (vn >= 0) return;
    const j = -(1 + .9) * vn / 2;
    a.vx -= j * nx; a.vy -= j * ny; c.vx += j * nx; c.vy += j * ny;
    if (-vn > 120) { s.sfx.wall++; s.sfx.wallV = -vn; }
}
/** Send a ball back up the launch lane at tap power (multiball kick-offs and saves). */
function serveFromLane(b: PinballBall) {
    b.x = LANE_X; b.y = PLUNGER_TIP - 7; b.vx = 0; b.vy = -(430 + 810 * TAP_PULL); b.spin = 0; b.omega = 0; b.contact = 0;
}
/** 2v1 BREAKAWAY: a second ball is played in from the launch lane. Goals count
 * double, and drains are free while the multiball save is lit. Started by
 * completing a mode (the table sets mbPending). */
export function startMultiball(s: PinballState) {
    if (s.phase !== 'playing' || s.extraLive) return false;
    serveFromLane(s.extra); s.extra.r = 7; s.extra.contactX = 0; s.extra.contactY = 1;
    s.extraLive = true; s.mbSave = PINBALL_MULTIBALL_SAVE; s.stats.mbStarts++;
    s.cue = 'multiball'; s.cueTime = 2.6; hit(s, 300, 330);
    return true;
}
/** End of the 90 minutes (plus stoppage): pay the end-of-ball bonus and a
 * reward for every ball still in hand, then blow the whistle. */
function fullTime(s: PinballState) {
    tableDrain(s);
    s.fullTimeBonus = s.balls * PINBALL_FULLTIME_BALL; s.score += s.fullTimeBonus;
    s.extraLive = false; s.mbSave = 0; s.moveTime = 0; s.counterAttack = false; s.possession = -1;
    s.ball.vx = s.ball.vy = s.ball.omega = 0;
    s.phase = 'over'; s.cue = 'fullTime'; s.cueTime = 4; hit(s, 180, 310);
}
/** One ball's flight and contacts for a substep. `extra` is the multiball's
 * second ball (it is swapped into s.ball by the caller, so every helper that
 * reads s.ball works on it). Returns true when the substep must stop (a phase
 * change such as a goal, a drain or the ball settling back on the plunger). */
function stepBall(s: PinballState, dt: number, extra: boolean, oldLeft: number, oldRight: number, keeperStep: number, before: PinballDefender[]): boolean {
    const b = s.ball, multi = s.extraLive;
    // Dugout hold: the ball rests in the scoop while everything else plays on.
    const prevY = b.y, held = !extra && tableHold(s, dt);
    let speed = 0;
    if (!held) {
    // Flight: gravity, light drag, spin decay, and a subtle Magnus curve.
    b.vy += GRAVITY * dt;
    const drag = Math.exp(-dt * AIR_DRAG);
    b.vx *= drag;
    b.vy *= drag;
    b.omega *= Math.exp(-dt * SPIN_DECAY);
    b.vx += -MAGNUS * b.omega * b.vy * dt;
    b.vy += MAGNUS * b.omega * b.vx * dt;
    speed = Math.hypot(b.vx, b.vy);
    if (speed > MAX_SPEED) {
        b.vx *= MAX_SPEED / speed;
        b.vy *= MAX_SPEED / speed;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += b.omega * dt;
    }
    let touched = false;
    if (!extra && prevY < 556 && b.y >= 556 && b.vy > 0 && b.x > 40 && b.x < 320) s.timing.passedAt = s.time;
    if (b.x < 20 + b.r) {
        b.x = 20 + b.r;
        const a = resolve(b, 1, 0, 0, 0, .62, .12);
        if (a > 70) {
            s.sfx.wall++;
            s.sfx.wallV = a;
            if(a>180 && b.x<LANE_WALL && b.y>100 && b.y<455){s.banked=true;s.reboundAt=s.time;}
        }
        touched = true;
    }
    if (b.x > LANE_OUT - b.r) {
        b.x = LANE_OUT - b.r;
        const a = resolve(b, -1, 0, 0, 0, .62, .12);
        if (a > 70) {
            s.sfx.wall++;
            s.sfx.wallV = a;
            if(a>180 && b.x<LANE_WALL && b.y>100 && b.y<455){s.banked=true;s.reboundAt=s.time;}
        }
        touched = true;
    }
    if (b.y < 42 && b.x > GOAL_LEFT + b.r && b.x < GOAL_RIGHT - b.r) {
        s.goals++;
        const lit = s.moveTime > 0;
        const corner = b.x < GOAL_LEFT + 32 || b.x > GOAL_RIGHT - 32;
        // A follow-up after the keeper's parry is a REBOUND goal.
        s.lastRebound = s.rebound > 0; s.rebound = 0;
        if (s.lastRebound) s.stats.rebounds++;
        if (corner) s.stats.corners++;
        if (multi) {
            // 2v1: the goal counts double, the ball is played straight back in
            // from the lane and the attack carries on (no stoppage, no ball spent).
            s.lastGoalBonus = lit ? 750 : 0; s.lastChallengeBonus = 0; s.challengeBall = false;
            s.lastGoalPoints = 2 * ((corner ? 650 : 500) + s.lastGoalBonus + (s.lastRebound ? REBOUND_BONUS : 0));
            s.lastGoalPoints += tableGoal(s, lit);
            if (s.goals === 8) tableDivisionCleared(s);
            s.stats.mbGoals++; s.moveTime = 0;
            s.cue = 'mbGoal'; s.cueTime = 2.2;
            hit(s, b.x, 45, s.lastGoalPoints);
            serveFromLane(b);
            return false;
        }
        s.lastGoalBonus = s.moveTime > 0 ? 750 + Math.min(3, s.moves) * 250 : 0;
        if (s.lastGoalBonus) s.moves++;
        // These optional challenges reward a football technique, never prevent
        // an ordinary goal or narrow the goal mouth. Each pays once per division.
        const challenge = !s.challengeComplete && (s.level===2 ? corner : s.level===3 ? s.banked : s.level===4 ? corner && s.lastGoalBonus>0 : false);
        s.lastChallengeBonus=challenge?pinballDivision(s).bonus:0;
        s.challengeBall=challenge && s.balls<3;
        if(challenge){s.challengeComplete=true;s.balls=Math.min(3,s.balls+1);tableChallenge(s);}
        s.lastGoalPoints = (corner ? 650 : 500) + s.lastGoalBonus + s.lastChallengeBonus + (s.lastRebound ? REBOUND_BONUS : 0);
        s.lastGoalPoints += tableGoal(s, lit);
        if (s.goals === 8) tableDivisionCleared(s);
        s.moveTime = 0;
        s.cue = corner ? 'corner' : 'goal';
        s.cueTime = 2.5;
        hit(s, b.x, 45, s.lastGoalPoints);
        // The next ball off the plunger gets a fresh ball save.
        s.openingRescue=true;s.launchGrace=0;
        s.phase = 'goal';
        s.timer = 1.5;
        b.vx = b.vy = b.omega = 0;
        return true;
    }
    touched = wall(s, 20, 45, GOAL_LEFT, 45, 5, .5, .12) || touched;
    touched = wall(s, GOAL_RIGHT, 45, 318, 45, 5, .5, .12) || touched;
    touched = wall(s, GOAL_LEFT, 30, GOAL_LEFT, 53, 5, .6, .12) || touched;
    touched = wall(s, GOAL_RIGHT, 30, GOAL_RIGHT, 53, 5, .6, .12) || touched;
    // Top-right arch: curves a launched ball out of the lane and into play.
    touched = wall(s, 318, 45, 352, 60, 5, .72, .12) || touched;
    touched = wall(s, 352, 60, LANE_OUT, 108, 5, .72, .12) || touched;
    if (b.y < 20) {
        b.y = 25;
        b.vy = Math.abs(b.vy);
    }
    // One-way gate at the lane mouth: solid only from the playfield side, so
    // the launched ball sails past it but can never fall back into the lane.
    if (b.vx > 0 && b.y > 51 && b.y < 155 && b.x > LANE_WALL - b.r - 2.5 && b.x < LANE_WALL + 6) {
        b.x = LANE_WALL - b.r - 2.52;
        const a = resolve(b, -1, 0, 0, 0, .5, .12);
        touched = true;
        if (a > 40)
            s.sfx.gate++;
    }
    // Soft-entry opening: sealed one-way from the playfield side (same trick
    // as the top gate — a ball can never sneak INTO the lane through it).
    if (b.vx > 0 && b.y > LANE_OPEN_TOP - 2 && b.y < LANE_OPEN_BOT + 2 && b.x > LANE_WALL - b.r - 2.5 && b.x < LANE_WALL + 6) {
        b.x = LANE_WALL - b.r - 2.52;
        const a = resolve(b, -1, 0, 0, 0, .5, .12);
        touched = true;
        if (a > 40)
            s.sfx.gate++;
    }
    // Lane divider below the gate, split around the soft-entry opening.
    touched = wall(s, LANE_WALL, LANE_TOP, LANE_WALL, LANE_OPEN_TOP, 2.5, .62, .15) || touched;
    touched = wall(s, LANE_WALL, LANE_OPEN_BOT, LANE_WALL, 594, 2.5, .62, .15) || touched;
    // The flap: deployed only against a falling (or stalled) ball in the lane.
    // A soft launch crests above the band, dribbles back down, and is caught
    // here — absorbed and shunted left through the opening onto the inlane
    // guide. A fast riser (vy well below 0) never sees it.
    if (b.x > LANE_WALL - b.r - 2 && b.vy > -20)
        touched = wall(s, LANE_OUT - 2, LANE_OPEN_TOP + 2, LANE_WALL - 6, LANE_OPEN_BOT - 4, 3, .3, .3) || touched;
    // Lane floor = the plunger pad; a weak launch settles back onto it.
    if (b.x > LANE_WALL) {
        touched = wall(s, 344, 599, 364, 599, 7, .3, .35) || touched;
        if (b.y > 555 && Math.hypot(b.vx, b.vy) < 28) {
            // In a 2v1 nobody waits on the plunger: the ball is fired straight back in.
            if (multi) { serveFromLane(b); return false; }
            s.phase = 'ready';
            s.ball = freshBall();
            return true;
        }
    }
    // Outlane slopes: lossy and grippy so the ball rolls down to the flippers.
    // Each guide ends exactly at its flipper pivot — no seam to slip through.
    touched = wall(s, 20, 455, 99, 535, 7, .45, .18) || touched;
    touched = wall(s, 338, 458, 261, 535, 7, .45, .18) || touched;
    if (!held) touched = tableContacts(s, TABLE_HELPERS, prevY, extra) || touched;
    // Soft arrivals can be cushioned; fast contacts remain moving-body collisions.
    // Foot blocks use drift velocity and a firm impulse along the contact normal.
    const defenders = s.defenders;
    for (let i = 0; i < defenders.length; i++) {
        const d = defenders[i], ai=s.defenderAI[i];
        if(ai.dazed>0)continue;
        const dvx=DEF_VX[i],dvy=DEF_VY[i];
        const dx=b.x-d.x,dy=b.y-d.y,distance=Math.hypot(dx,dy);
        // The second ball still bumps into everyone except the player on the ball.
        if(s.possession>=0&&(!extra||i===s.possession))continue;
        // A soft ball can be cushioned at the feet. Fast body hits retain knockdowns.
        const receiving=s.passTarget===i&&s.passTime>0,counterMode=tableCounterMode(s);
        if(!extra&&s.possession<0&&s.bumperCooldown[i]===0&&distance<(receiving?38:30)&&Math.hypot(b.vx-dvx,b.vy-dvy)<(receiving?520:counterMode?380:230+(s.level-1)*35)&&dx*(b.vx-dvx)+dy*(b.vy-dvy)<10){
            s.possession=i;s.counterAttack=false;s.possessionTime=.72-(s.level-1)*.05;s.passTarget=-1;s.passTime=0;
            if(!receiving)s.attackPasses=0;
            s.attackReceiver=attackReceiver(s,i);
            ai.block=0;ai.aim=Math.atan2(dx,dy);s.cue='control';s.cueTime=1.2;hit(s,b.x,b.y);
            b.vx=b.vy=b.omega=0;continue;
        }
        if(ai.cooldown===0&&distance<85&&dx*b.vx+dy*b.vy<0){ai.block=.38;ai.cooldown=1.04-(s.level-1)*.065+i*.04;ai.aim=Math.atan2(dx,dy);}
        const reach=ai.block>0?Math.sin(Math.PI*(1-ai.block/.38))*14:0;
        // Only the extended boot can earn a block; the torso is a separate target.
        const boot=reach>3 ? capsuleContact(b,d.x+Math.sin(ai.aim)*10,d.y+Math.cos(ai.aim)*10,d.x+Math.sin(ai.aim)*(10+reach),d.y+Math.cos(ai.aim)*(10+reach),5) : null;
        const c = boot ?? capsuleContact(b,d.x,d.y,d.x,d.y,12);
        if (c) {
            touched = true;
            const approach = resolve(b, c.nx, c.ny, dvx, dvy, boot?1.05:.68, .15);
            if (s.bumperCooldown[i] === 0 && approach > 15) {
                s.bumperCooldown[i] = .16;
                if(boot){b.vx+=c.nx*180;b.vy+=c.ny*180+Math.max(0,s.level-2)*70;s.cue='block';}
                else{ai.dazed=2;ai.hitX=d.x;ai.hitY=d.y;ai.fallYaw=Math.atan2(c.nx,c.ny);ai.block=0;ai.cooldown=.8;ai.velocity=0;s.cue='dazed';}
                s.cueTime=1.5;
                hit(s, d.x, d.y, 10);
                s.sfx.bumper++;
                s.sfx.bumperI = i;
            }
        }
    }
    if(!extra&&s.possession>=0){
        s.read.dirty=true;s.read.live=false;
        const owner=s.possession,d=defenders[owner],ai=s.defenderAI[owner];
        s.possessionTime=Math.max(0,s.possessionTime-dt);
        // Face down-table during the wind-up; keep the ball visibly at the boot.
        const partner=s.attackReceiver>=0?defenders[s.attackReceiver]:null;
        const facing=partner?Math.atan2(partner.x-d.x,partner.y-d.y):0;
        const turn=Math.atan2(Math.sin(facing-ai.aim),Math.cos(facing-ai.aim));ai.aim+=turn*(1-Math.exp(-dt*9));
        b.x=d.x+Math.sin(ai.aim)*24;b.y=d.y+Math.cos(ai.aim)*24;
        b.vx=b.vy=0;
        if(s.possessionTime>0)return false;
        const receiver=pinballWillPass(s);
        let targetX:number,targetY:number,flight:number;
        if(receiver>=0){
            const q=defenders[receiver],prev=before[receiver];flight=clamp(Math.hypot(q.x-b.x,q.y-b.y)/380,.35,.65);
            targetX=clamp(q.x+clamp((q.x-prev.x-s.defenderAI[receiver].offset)/dt+s.defenderAI[receiver].velocity,-65,65)*flight,40,320);
            targetY=q.y+clamp((q.y-prev.y)/dt,-25,25)*flight;
            s.passTarget=receiver;s.passTime=flight+.3;s.attackPasses++;s.cue='pass';
        }else{
            // Alternate threats toward reachable flipper lanes, not an unavoidable centre drain.
            targetY=525;targetX=pinballCounterLane(s,owner);
            flight=.78-(s.level-1)*.04;s.passTarget=-1;s.attackPasses=0;s.counterAttack=true;s.cue='attack';
        }
        // Release on the target-facing boot, never through the kicker's own torso.
        const aim=Math.atan2(targetX-d.x,targetY-d.y);b.x=d.x+Math.sin(aim)*27;b.y=d.y+Math.cos(aim)*27;
        b.vx=(targetX-b.x)/flight;b.vy=(targetY-b.y)/flight-.5*GRAVITY*flight;b.omega=0;
        ai.aim=Math.atan2(b.vx,b.vy);ai.block=.38;ai.cooldown=.8;s.bumperCooldown[owner]=.22;
        s.possession=-1;s.cueTime=1.6;s.sfx.bumper++;s.sfx.bumperI=owner;
        hit(s,b.x,b.y);
        return false;
    }
    // The keeper is a body too: soft restitution (he absorbs the shot) plus his
    // own lateral velocity, so a diving save slaps the ball away with him.
    // A firm shot is PARRIED: he punches it out wide, like a bumper, and the
    // rebound window opens for a follow-up.
    {
        const c = capsuleContact(b, s.keeper - 8 + Math.min(0,s.keeperDive)*8, 83, s.keeper + 8 + Math.max(0,s.keeperDive)*8, 83, 7);
        if (c) {
            touched = true;
            const approach = resolve(b, c.nx, c.ny, keeperStep / dt, 0, .42, .35);
            if (approach > 60) {
                hit(s, s.keeper, 83);
                s.cue = 'save';
                s.cueTime = 2;
                s.sfx.keeper++;
                s.sfx.keeperV = approach;
                if (approach > PARRY_MIN && s.keeperParry === 0) {
                    const side = Math.abs(b.x - s.keeper) > 2 ? Math.sign(b.x - s.keeper) : (b.x < 180 ? -1 : 1);
                    b.vx = b.vx * .4 + side * (150 + approach * .14);
                    b.vy = Math.max(b.vy, 0) + 70;
                    // Still a 'save' cue; the parry is told apart by sfx.parry.
                    s.keeperParry = .25; s.rebound = REBOUND_WINDOW; s.stats.parries++; s.sfx.parry++;
                }
            }
        }
    }
    // Flippers: true rotating capsules. Surface velocity at the actual contact
    // point (omega x r from the pivot) drives the response — a resting flipper
    // is just a dead-rubber wall, a mid-flick tip launches at full pace, and
    // contacts nearer the pivot flick proportionally softer.
    for (let i = 0; i < 2; i++) {
        const x = i ? 261 : 99, y = 535;
        const angle = i ? Math.PI - .46 + s.right * .97 : .46 - s.left * .97;
        const oldAngle = i ? Math.PI - .46 + oldRight * .97 : .46 - oldLeft * .97;
        const omega = (angle - oldAngle) / dt;
        const c = capsuleContact(b, x, y, x + Math.cos(angle) * 63, y + Math.sin(angle) * 63, 7);
        if (c) {
            touched = true;
            const relX = c.cx - x, relY = c.cy - y;
            const approach = resolve(b, c.nx, c.ny, -omega * relY, omega * relX, .45, .5);
            if ((i ? omega > 5 : omega < -5) && approach > 40 && s.flipperCooldown[i] === 0) {
                s.flipperCooldown[i] = .1;
                const wasCounter = s.counterAttack;
                s.counterAttack=false;s.banked=false;s.attackPasses=0;s.passTarget=-1;s.passTime=0;
                hit(s, b.x, b.y);
                // Wall pass: your strike came back off a kickboard, flag or side
                // rail and you met it first time with the OTHER foot.
                const wallPass = s.lastFoot >= 0 && s.lastFoot !== i && s.reboundAt > s.lastStrikeAt && s.time - s.reboundAt < WALL_PASS_WINDOW;
                // Alternating feet on successive returns rewards adapting to
                // the rebound instead of holding both flippers permanently.
                s.combination = s.lastFoot !== i && s.time - s.lastStrikeAt < 6 ? Math.min(4, s.combination + 1) : 1;
                if (s.combination > 1) {
                    s.moveTime = 14;
                    s.nudges=1;
                }
                // Timing coach: where in its swing did the bat meet the ball?
                // A strike on a flight you READ off a rebound earns a read.
                const swing = i ? s.right : s.left, grade: PinballGrade = swing <= PERFECT_SWING ? 'perfect' : swing >= EARLY_SWING ? 'early' : 'good';
                const read = !extra && grade !== 'early' && s.read.lastSide === i && s.read.fromRebound && s.time - s.read.lastAt < 2.5;
                if (read) s.read.lastSide = -1;
                if (!extra || grade === 'perfect') gradeStrike(s, grade, read);
                s.lastFoot = i;
                s.lastStrikeAt = s.time;
                if (s.combination > 1) s.score += 25 * s.combination;
                s.cue = 'strike';
                s.cueTime = 1.5;
                if (wallPass) { s.score += WALL_PASS_POINTS; s.table.ballBonus += 50; s.stats.wallPasses++; s.moveTime = Math.max(s.moveTime, 14); s.cue = 'wallPass'; s.cueTime = 2; }
                tableStrike(s, wasCounter);
                s.sfx.flipper++;
                s.sfx.flipperV = approach;
            }
            // A firm drop onto a bat that was raised and held long before it
            // arrived bounces away uncontrolled: the press came too soon.
            else if (!extra && (i ? s.right : s.left) >= .97 && s.timing.held[i] > .15 && approach > 160 && s.timing.cool === 0) gradeStrike(s, 'early');
        }
    }
    // Rebound read: any contact invalidates the forecast; the first free
    // substep after it computes the new one (a handful per second at most).
    if (!extra) { if (touched || held) { s.read.dirty = true; s.read.live = false; } else if (s.read.dirty) predictRead(s); }
    // Rolling friction once the ball is slow and on something.
    speed = Math.hypot(b.vx, b.vy);
    if (touched && speed < 130) {
        const roll = Math.exp(-dt * 1.6);
        b.vx *= roll;
        b.vy *= roll;
    }
    if (speed > MAX_SPEED) {
        b.vx *= MAX_SPEED / speed;
        b.vy *= MAX_SPEED / speed;
    }
    if (b.y > PINBALL_HEIGHT + b.r && b.x < LANE_WALL) {
        if (multi) {
            // 2v1 drain: free while the multiball save is lit (the ball is
            // played back in); otherwise that ball leaves and the attack
            // carries on with the other one. Never costs a ball.
            if (s.mbSave > 0 || tableProtects(s)) { serveFromLane(b); s.cue = 'mbSave'; s.cueTime = 1.6; hit(s, 180, 590); return false; }
            if (extra) s.extraLive = false;
            else { Object.assign(b, s.extra); s.extraLive = false; }
            s.mbSave = 0; s.cue = 'mbEnd'; s.cueTime = 2; s.hitId++;
            return false;
        }
        s.moveTime = 0;
        if(tableProtects(s)||s.openingRescue&&s.launchGrace>0){
            s.openingRescue=false;s.launchGrace=0;s.cue='rescue';s.cueTime=2.5;
            hit(s,180,590);
        }else{s.balls--;s.openingRescue=true;s.timing.streak=0;tableDrain(s);if(s.counterAttack){s.cue='concede';s.cueTime=2;hit(s,180,590);}}
        s.counterAttack=false;
        s.phase = 'lost';
        s.timer = 1.0;
        b.vx = b.vy = b.omega = 0;
        return true;
    }
    return false;
}
export function stepPinball(s: PinballState, input: PinballInput, elapsed: number) { s.accumulator += clamp(elapsed, 0, .075); let n = 0; while (s.accumulator >= PINBALL_STEP && n++ < 40) {
    tick(s, input, PINBALL_STEP);
    s.accumulator -= PINBALL_STEP;
} }
