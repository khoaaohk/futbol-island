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
};
export type PinballState = {
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
    keeperDive: number;
    keeperTarget: number;
    keeperThink: number;
    flash: number;
    hitX: number;
    hitY: number;
    hitId: number;
    bumperCooldown: number[];
    flipperCooldown: number[];
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
const GRAVITY = 380, AIR_DRAG = .018, MAGNUS = .0008, SPIN_DECAY = .6, MAX_SPEED = 1500, DEAD_BOUNCE = 30;
function freshBall(): PinballBall { return { x: LANE_X, y: PLUNGER_TIP - 7, vx: 0, vy: 0, r: 7, spin: 0, omega: 0 }; }
export function createPinballState(): PinballState { return { ball: freshBall(), phase: 'ready', score: 0, goals: 0, balls: 3, time: 0, timer: 0, left: 0, right: 0, keeper: 180, keeperDive: 0, keeperTarget: 180, keeperThink: 0, flash: 0, hitX: 0, hitY: 0, hitId: 0, bumperCooldown: [0, 0, 0], flipperCooldown: [0, 0], accumulator: 0, plunger: 0, plungerSnap: 0, launchPower: 0, defs: 1, defJoin: 0, sfx: { wall: 0, wallV: 0, bumper: 0, bumperI: 0, flipper: 0, flipperV: 0, keeper: 0, keeperV: 0, gate: 0, join: 0 } }; }
/** Fires the ball up the launch lane. With no explicit power the current
 * plunger pull is mapped through plungerPull(): tap = the standard launch,
 * short hold = the soft band, long hold ramps monotonically to full power. */
export function launchPinball(s: PinballState, power?: number) {
    if (s.phase !== 'ready')
        return false;
    const pull = power !== undefined ? power : plungerPull(s.plunger);
    const p = Math.max(.12, Math.min(1, pull));
    s.ball = { x: LANE_X, y: PLUNGER_TIP - 7, vx: 0, vy: -(430 + 810 * p), r: 7, spin: 0, omega: 0 };
    s.launchPower = p;
    s.plungerSnap = 1;
    s.plunger = 0;
    s.phase = 'playing';
    return true;
}
/** Active defender patrols. The squad grows with goals: slot 0 is the mid-
 * table patroller (the most central threat, on from kickoff), slot 1 adds the
 * left-high lane, slot 2 the right-high lane. While `join` > 0 the newest slot
 * jogs in from its sideline (eased, with a little bounce) — and because the
 * physics reads these same positions, his body is exactly where you see him
 * even mid-entrance. */
export function pinballDefenders(t: number, count = 3, join = 0, joinI = -1) {
    const list = [
        { x: 177 + Math.sin(t * .95 + 3) * 37, y: 305 + Math.sin(t * .71 + 1) * 22, r: 18 },
        { x: 94 + Math.sin(t * .82) * 23, y: 175 + Math.sin(t * .63) * 15, r: 17 },
        { x: 258 + Math.sin(t * .7 + 1.9) * 22, y: 193 + Math.sin(t * .92) * 21, r: 17 },
    ].slice(0, Math.max(1, Math.min(3, count)));
    if (join > 0 && joinI > 0 && joinI < list.length) {
        const d = list[joinI], k = 1 - join, e = 1 - (1 - k) * (1 - k) * (1 - k);
        const fromX = joinI === 1 ? -40 : 400;
        d.x = fromX + (d.x - fromX) * e;
        d.y += Math.sin(e * Math.PI * 3) * 5 * join;
    }
    return list;
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
function resolve(b: PinballBall, nx: number, ny: number, svx: number, svy: number, e: number, mu: number) {
    const rvx = b.vx - svx, rvy = b.vy - svy, vn = rvx * nx + rvy * ny;
    if (vn >= 0)
        return 0;
    const jn = -(1 + (vn > -DEAD_BOUNCE ? 0 : e)) * vn;
    b.vx += jn * nx;
    b.vy += jn * ny;
    const tx = -ny, ty = nx, slip = rvx * tx + rvy * ty - b.omega * b.r;
    const jt = clamp(-slip * .28, -jn * mu, jn * mu);
    b.vx += jt * tx;
    b.vy += jt * ty;
    b.omega = clamp(b.omega + slip * .4 / b.r, -55, 55);
    return -vn;
}
/** Closest-point capsule test; on overlap, pushes the ball out and reports the
 * contact normal + point (so callers can compute the surface velocity there).
 * With 1/480 substeps every moving part travels < the capsule radius per step,
 * so contacts are never skipped even at flick speeds. */
function capsuleContact(b: PinballBall, ax: number, ay: number, bx: number, by: number, rad: number) {
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
    }
    return true;
}
function tick(s: PinballState, input: PinballInput, dt: number) {
    s.time += dt;
    s.flash = Math.max(0, s.flash - dt * 3);
    s.keeperDive *= Math.exp(-dt * 5);
    const oldLeft = s.left, oldRight = s.right;
    s.left += clamp((input.left ? 1 : 0) - s.left, -dt * 10, dt * 22);
    s.right += clamp((input.right ? 1 : 0) - s.right, -dt * 10, dt * 22);
    // Plunger: pulls back over ~1.1s while charging, springs home otherwise;
    // the post-release snap value only feeds the launch animation.
    s.plungerSnap = Math.max(0, s.plungerSnap - dt * 6);
    s.plunger = s.phase === 'ready' && input.charge ? Math.min(1, s.plunger + dt * .9) : Math.max(0, s.plunger - dt * 8);
    s.defJoin = Math.max(0, s.defJoin - dt * .8);
    if (s.phase !== 'playing') {
        if (s.phase === 'goal' || s.phase === 'lost') {
            s.timer -= dt;
            if (s.timer <= 0) {
                s.phase = s.balls > 0 ? 'ready' : 'over';
                s.ball = freshBall();
                // Difficulty ramp: each goal calls another defender onto the
                // pitch (1 at kickoff, up to the full back three); he jogs in
                // from the sideline while the next ball waits on the plunger.
                const want = Math.min(3, 1 + s.goals);
                if (s.phase === 'ready' && want > s.defs) {
                    s.defs = want;
                    s.defJoin = 1;
                    s.sfx.join++;
                }
            }
        }
        return;
    }
    const b = s.ball;
    for (let i = 0; i < 3; i++)
        s.bumperCooldown[i] = Math.max(0, s.bumperCooldown[i] - dt);
    for (let i = 0; i < 2; i++)
        s.flipperCooldown[i] = Math.max(0, s.flipperCooldown[i] - dt);
    // Keeper: thinks on a human-ish interval, only PARTIALLY leads the shot
    // (.45 of true intercept). The mouth is now 160 wide but his patrol range
    // grew far less (140-220): each post hides a real ~18px scoring pocket
    // his body can never reach, so corner placement pays off hard while a
    // straight center floater is still always savable. His pace scales with
    // the squad — a lone-defender kickoff faces a slower keeper (~107 px/s)
    // than the full back three (~125 px/s).
    const keeperPace = 98 + 9 * s.defs;
    s.keeperThink -= dt;
    if (s.keeperThink <= 0) {
        s.keeperThink = .2;
        if (b.vy < -120 && b.y < 240) {
            const eta = clamp((83 - b.y) / b.vy, 0, .55);
            s.keeperTarget = clamp(b.x + b.vx * eta * .45, 140, 220);
        }
        else
            s.keeperTarget = 180 + Math.sin(s.time * .8) * 20;
    }
    const keeperStep = clamp(s.keeperTarget - s.keeper, -dt * keeperPace, dt * keeperPace);
    s.keeper += keeperStep;
    if (Math.abs(keeperStep) > .5)
        s.keeperDive = clamp(keeperStep / (dt * keeperPace), -1, 1);
    // Flight: gravity, light drag, spin decay, and a subtle Magnus curve.
    b.vy += GRAVITY * dt;
    const drag = Math.exp(-dt * AIR_DRAG);
    b.vx *= drag;
    b.vy *= drag;
    b.omega *= Math.exp(-dt * SPIN_DECAY);
    b.vx += -MAGNUS * b.omega * b.vy * dt;
    b.vy += MAGNUS * b.omega * b.vx * dt;
    let speed = Math.hypot(b.vx, b.vy);
    if (speed > MAX_SPEED) {
        b.vx *= MAX_SPEED / speed;
        b.vy *= MAX_SPEED / speed;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += b.omega * dt;
    let touched = false;
    if (b.x < 20 + b.r) {
        b.x = 20 + b.r;
        const a = resolve(b, 1, 0, 0, 0, .62, .12);
        if (a > 70) {
            s.sfx.wall++;
            s.sfx.wallV = a;
        }
        touched = true;
    }
    if (b.x > LANE_OUT - b.r) {
        b.x = LANE_OUT - b.r;
        const a = resolve(b, -1, 0, 0, 0, .62, .12);
        if (a > 70) {
            s.sfx.wall++;
            s.sfx.wallV = a;
        }
        touched = true;
    }
    if (b.y < 42 && b.x > GOAL_LEFT + b.r && b.x < GOAL_RIGHT - b.r) {
        s.goals++;
        hit(s, b.x, 45, 500);
        s.phase = 'goal';
        s.timer = 1.5;
        b.vx = b.vy = b.omega = 0;
        return;
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
            s.phase = 'ready';
            s.ball = freshBall();
            return;
        }
    }
    // Outlane slopes: lossy and grippy so the ball rolls down to the flippers.
    // Each guide ends exactly at its flipper pivot — no seam to slip through.
    touched = wall(s, 20, 455, 99, 535, 7, .45, .18) || touched;
    touched = wall(s, 338, 458, 261, 535, 7, .45, .18) || touched;
    // Defenders are moving bodies: their drift velocity carries into the bounce,
    // and a fresh hit adds a firm "shove" kick along the contact normal.
    const defenders = pinballDefenders(s.time, s.defs, s.defJoin, s.defs - 1), before = pinballDefenders(s.time - dt, s.defs, Math.min(1, s.defJoin + dt * .8), s.defs - 1);
    for (let i = 0; i < defenders.length; i++) {
        const d = defenders[i], dvx = (d.x - before[i].x) / dt, dvy = (d.y - before[i].y) / dt;
        const c = capsuleContact(b, d.x, d.y, d.x, d.y, d.r);
        if (c) {
            touched = true;
            const approach = resolve(b, c.nx, c.ny, dvx, dvy, 1.05, .15);
            if (s.bumperCooldown[i] === 0 && approach > 15) {
                s.bumperCooldown[i] = .16;
                b.vx += c.nx * 180;
                b.vy += c.ny * 180;
                hit(s, d.x, d.y, 10);
                s.sfx.bumper++;
                s.sfx.bumperI = i;
            }
        }
    }
    // The keeper is a body too: soft restitution (he absorbs the shot) plus his
    // own lateral velocity, so a diving save slaps the ball away with him.
    {
        const c = capsuleContact(b, s.keeper - 8, 83, s.keeper + 8, 83, 7);
        if (c) {
            touched = true;
            const approach = resolve(b, c.nx, c.ny, keeperStep / dt, 0, .42, .35);
            if (approach > 60) {
                hit(s, s.keeper, 83);
                s.sfx.keeper++;
                s.sfx.keeperV = approach;
            }
        }
    }
    // Flippers: true rotating capsules. Surface velocity at the actual contact
    // point (omega x r from the pivot) drives the response — a resting flipper
    // is just a dead-rubber wall, a mid-flick tip launches at full pace, and
    // contacts nearer the pivot flick proportionally softer.
    const oldAngles = [.46 - oldLeft * .97, Math.PI - .46 + oldRight * .97], flippers = pinballFlippers(s);
    flippers.forEach((f, i) => {
        const omega = (f.angle - oldAngles[i]) / dt;
        const c = capsuleContact(b, f.x, f.y, f.x + Math.cos(f.angle) * f.length, f.y + Math.sin(f.angle) * f.length, 7);
        if (c) {
            touched = true;
            const relX = c.cx - f.x, relY = c.cy - f.y;
            const approach = resolve(b, c.nx, c.ny, -omega * relY, omega * relX, .45, .5);
            if (Math.abs(omega) > 5 && approach > 40 && s.flipperCooldown[i] === 0) {
                s.flipperCooldown[i] = .1;
                hit(s, b.x, b.y);
                s.sfx.flipper++;
                s.sfx.flipperV = approach;
            }
        }
    });
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
        s.balls--;
        s.phase = 'lost';
        s.timer = 1.0;
        b.vx = b.vy = b.omega = 0;
    }
}
export function stepPinball(s: PinballState, input: PinballInput, elapsed: number) { s.accumulator += clamp(elapsed, 0, .075); let n = 0; while (s.accumulator >= PINBALL_STEP && n++ < 40) {
    tick(s, input, PINBALL_STEP);
    s.accumulator -= PINBALL_STEP;
} }
