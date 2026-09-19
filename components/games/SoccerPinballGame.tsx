"use client";
import {BackButton} from '../BackButton';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import { useEffect, useRef, useState } from 'react';
import {Icon} from '../Icon';
import type { GameProps } from './types';
import { createPinballState, launchPinball, stepPinball, pinballDefenders, pinballFlippers, plungerPull, GOAL_LEFT, GOAL_RIGHT, LANE_WALL, LANE_OUT, LANE_TOP, LANE_X, PLUNGER_TIP, LANE_OPEN_TOP, LANE_OPEN_BOT, SOFT_PULL_MAX, type PinballState } from '@/lib/games/soccerPinball';
import { playClick, isSoundEnabled, getSoundVolume } from '@/lib/games/sound';
import styles from './SoccerPinballGame.module.css';
const project = (x: number, y: number) => ({ x: 192 + (x - 180) * (.80 + y / 620 * .17), y: 96 + y * .878 });
function stroke(c: CanvasRenderingContext2D, points: number[][], color: string, width: number) { c.beginPath(); points.forEach(([x, y], i) => { const p = project(x, y); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }); c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, Math.PI * 2); c.fill(); }
function line(c: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, color: string, width: number) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.stroke(); }
function poly(c: CanvasRenderingContext2D, points: number[][], fill: string) { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = fill; c.fill(); }
function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = color; c.fill(); }
/* ---- page-wide seaside backdrop (painted ONCE per resize) ------------------
 * The same evening as Soccer Tennis — sunset sky, sea on the horizon, the
 * club buildings and string lights — sized to the whole viewport so the table
 * sits inside the scene. Rendered as a small DIORAMA: the low sun on the right
 * is the single light source, buildings are oblique volumes with sunlit right
 * side faces and terracotta roof planes, and everything drops a long soft
 * shadow toward the lower left. Zero per-frame cost. */
function scene(c: CanvasRenderingContext2D, w: number, h: number) {
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#efb48e');
    sky.addColorStop(.12, '#f4d7ad');
    // ground: light haze at the horizon, warmer and deeper toward the viewer
    sky.addColorStop(.13, '#d8b58c');
    sky.addColorStop(.5, '#d0a87c');
    sky.addColorStop(1, '#c08d60');
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    // Low sun over the water — the scene's light source (upper right).
    const sr = Math.min(w, h) * .09;
    const sun = c.createRadialGradient(w * .78, h * .1, 0, w * .78, h * .1, sr);
    sun.addColorStop(0, '#fce7bbcc');
    sun.addColorStop(1, '#fce7bb00');
    c.fillStyle = sun;
    c.fillRect(w * .78 - sr, h * .1 - sr, sr * 2, sr * 2);
    // Sea strip on the horizon with a few still glints.
    c.fillStyle = '#82aba7';
    c.fillRect(0, h * .13, w, h * .055);
    c.fillStyle = '#b9d0bd';
    c.fillRect(0, h * .13, w, 3);
    c.fillStyle = '#a6c4ba';
    for (let i = 0; i < 12; i++) {
        const gx = ((Math.imul(i + 11, 2654435761) >>> 0) % 1000) / 1000;
        c.fillRect(w * gx * .95, h * (.148 + (i % 4) * .008), Math.max(10, w * .025), 1.6);
    }
    // Grandstand: a full-width stepped bleacher volume behind the table —
    // shaded risers and treads, gangway aisles, a shallow terracotta canopy on
    // slender rear posts, pennants, ad boards, and a packed sunset crowd. All
    // placement is deterministic (integer hashes) and painted ONCE per resize:
    // zero per-frame cost. Same diorama light as the table — sun upper right,
    // long soft shadows toward the lower left.
    const sh = Math.max(56, Math.min(h * .13, w * .08)), unit = sh / 4, standTop = h * .2, baseY = standTop + sh;
    const wallTop = standTop - unit * 1.1, roofY = standTop - unit * 1.65, fasciaH = unit * .3, standBot = baseY + unit * .7;
    // Long two-layer cast shadow from the whole stand across the sand.
    for (const [sx, sy, a] of [[-sh * 1.05, sh * .5, .05], [-sh * .6, sh * .3, .07]] as const) {
        c.globalAlpha = a;
        poly(c, [[0, standBot], [w, standBot], [w + sx, standBot + sy], [sx, standBot + sy]], '#5c3a26');
    }
    c.globalAlpha = 1;
    // Back wall behind the top row, warmer toward the sunlit right.
    const wallG = c.createLinearGradient(0, 0, w, 0);
    wallG.addColorStop(0, '#6d4a34');
    wallG.addColorStop(.7, '#7a533a');
    wallG.addColorStop(1, '#8d6446');
    c.fillStyle = wallG;
    c.fillRect(0, wallTop, w, standTop - wallTop + unit);
    // Club banner on the back wall (behind the top-row heads).
    rounded(c, w * .5 - unit * 2.7, wallTop + unit * .1, unit * 5.4, unit * .68, 2, '#efe4c4');
    c.fillStyle = '#284e43';
    c.font = `700 ${Math.max(6, unit * .42)}px system-ui,sans-serif`;
    c.textAlign = 'center';
    c.fillText('ISLAND CUP', w * .5, wallTop + unit * .6);
    // Four stepped rows: sunlit tread strip + shaded riser, each with a bright
    // step lip and an overhang shadow — brighter toward the near front rows.
    const treadCols = ['#c39b6f', '#caa276', '#d1aa7d', '#d8b284'], riserCols = ['#8d684b', '#946e4f', '#9b7454', '#a27a58'];
    for (let r = 0; r < 4; r++) {
        const ty = standTop + r * unit;
        c.fillStyle = treadCols[r];
        c.fillRect(0, ty, w, unit * .38);
        c.fillStyle = riserCols[r];
        c.fillRect(0, ty + unit * .38, w, unit * .62);
        c.fillStyle = '#e8c493';
        c.fillRect(0, ty, w, 1.5);
        c.fillStyle = '#00000014';
        c.fillRect(0, ty + unit * .38, w, 2);
    }
    // Gangway aisles cut through the rows (kept clear of spectators below).
    const aisles = [w * .18, w * .5, w * .82];
    for (const ax of aisles) {
        const aw = unit * .95;
        c.fillStyle = '#c8a37b';
        c.fillRect(ax - aw / 2, standTop, aw, sh);
        c.fillStyle = '#00000018';
        for (let r = 0; r < 8; r++)
            c.fillRect(ax - aw / 2, standTop + r * unit * .5 + unit * .3, aw, 1.5);
        c.fillStyle = '#00000022';
        c.fillRect(ax - aw / 2, standTop, 2, sh);
        c.fillRect(ax + aw / 2 - 2, standTop, 2, sh);
    }
    // Front fascia with alternating advertising boards.
    c.fillStyle = '#8a5a3e';
    c.fillRect(0, baseY, w, unit * .7);
    c.fillStyle = '#a5714a';
    c.fillRect(0, baseY, w, 2);
    for (let i = 0, x = unit * .6; x < w - unit * 3.2; i++, x += unit * 3.75) {
        const dark = i % 3 === 2;
        rounded(c, x, baseY + unit * .12, unit * 3.2, unit * .48, 2, dark ? '#284e43' : '#efe4c4');
        c.fillStyle = dark ? '#f4cc7c' : '#284e43';
        c.fillRect(x + unit * .5, baseY + unit * .3, unit * 2.2, unit * .1);
    }
    // Slender canopy posts (drawn before the crowd, so they read as rear posts).
    for (const px of [.055, .275, .5, .725, .945]) {
        const x = w * px;
        c.fillStyle = '#5c3a26';
        c.fillRect(x - unit * .09, roofY + fasciaH, unit * .18, standTop + unit * .6 - roofY - fasciaH);
        c.fillStyle = '#8a6244';
        c.fillRect(x + unit * .03, roofY + fasciaH, unit * .05, standTop + unit * .6 - roofY - fasciaH);
    }
    // The crowd: one deterministic pass, back row to front, warm shirts with a
    // few team-color accents, jittered spacing/size, hair, cheering arms.
    const skins = ['#d09a70', '#b9764e', '#e2b189', '#8f5b3a'];
    const shirtsW = ['#efdcb5', '#d9a876', '#bc654f', '#e7bd55', '#e8c9a0', '#f6edd2', '#d8956a'];
    const accents = ['#c9564a', '#7fb1a8', '#355f5b'];
    const u = unit * 1.02, step = u * .78;
    for (let r = 0; r < 4; r++) {
        const yb = standTop + r * unit + unit * .42;
        for (let i = 0, x = step * .6; x < w - step * .3; i++, x += step) {
            const hsh = Math.imul(i * 4 + r + 101, 2654435761) >>> 0;
            if (aisles.some(ax => Math.abs(x - ax) < unit * .75))
                continue;
            const jx = x + ((hsh % 9) - 4) * u * .05, jy = yb + (((hsh >> 4) % 5) - 2) * u * .04;
            const sc = u * (.86 + ((hsh >> 8) % 30) / 100);
            const shirt = (hsh >> 12) % 10 >= 8 ? accents[(hsh >> 14) % 3] : shirtsW[(hsh >> 12) % 7];
            if ((hsh >> 20) % 7 === 0) {
                c.strokeStyle = shirt;
                c.lineWidth = sc * .13;
                c.lineCap = 'round';
                c.beginPath();
                c.moveTo(jx - sc * .26, jy - sc * .62);
                c.lineTo(jx - sc * .44, jy - sc * 1.05);
                c.stroke();
                c.beginPath();
                c.moveTo(jx + sc * .26, jy - sc * .62);
                c.lineTo(jx + sc * .44, jy - sc * 1.05);
                c.stroke();
            }
            ellipse(c, jx, jy - sc * .34, sc * .3, sc * .4, shirt);
            ellipse(c, jx, jy - sc * .82, sc * .2, sc * .22, skins[(hsh >> 17) % 4]);
            if ((hsh >> 22) % 5 < 3)
                ellipse(c, jx, jy - sc * .93, sc * .19, sc * .1, ((hsh >> 24) % 2) ? '#4a3524' : '#6e4a2e');
        }
    }
    // Canopy shade falling on the top row, then the canopy itself: shallow
    // terracotta top plane receding up-right, sunlit toward the right end.
    c.fillStyle = '#3a2417';
    c.globalAlpha = .12;
    c.fillRect(0, roofY + fasciaH, w, unit * .75);
    c.globalAlpha = 1;
    const rdx = unit * .8, rdy = unit * .5;
    poly(c, [[0, roofY], [w, roofY], [w + rdx, roofY - rdy], [rdx, roofY - rdy]], '#b06a4e');
    poly(c, [[w * .55, roofY], [w, roofY], [w + rdx, roofY - rdy], [w * .55 + rdx, roofY - rdy]], '#c97f5c');
    line(c, rdx, roofY - rdy, w + rdx, roofY - rdy, '#d98f66', 1.5);
    c.fillStyle = '#8a5a3e';
    c.fillRect(0, roofY, w, fasciaH);
    c.fillStyle = '#00000022';
    c.fillRect(0, roofY + fasciaH - 2, w, 2);
    // Pennant flags along the canopy ridge.
    const pen = ['#c9564a', '#f4cc7c', '#7fb1a8', '#e7bd55', '#c9564a'];
    for (let i = 0; i < 5; i++) {
        const x = w * (.06 + i * .22) + rdx, top = roofY - rdy - unit * (1 + (i % 2) * .3);
        line(c, x, roofY - rdy + 1, x, top, '#5c3a26', 2);
        poly(c, [[x + 1, top], [x + unit * .9, top + unit * .18], [x + 1, top + unit * .38]], pen[i]);
    }
    // String lights sag from the canopy fascia across the full width.
    const p0y = roofY + fasciaH + 3, p1y = p0y + unit * 1.5, p2y = roofY + fasciaH + 1;
    c.strokeStyle = '#536558';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(w * .01, p0y);
    c.quadraticCurveTo(w * .5, p1y, w * .99, p2y);
    c.stroke();
    for (let i = 0; i < 17; i++) {
        const t = i / 16, omt = 1 - t;
        ellipse(c, w * (.01 + .98 * t), omt * omt * p0y + 2 * omt * t * p1y + t * t * p2y + 2, 2.3, 3.1, '#fff2b6');
    }
    // Warm sandy ground grain below the club, hashed once.
    for (let i = 0; i < 800; i++) {
        const hx = ((Math.imul(i + 23, 7919) >>> 0) % 1000) / 1000, hy = ((Math.imul(i + 57, 3571) >>> 0) % 1000) / 1000;
        ellipse(c, hx * w, h * .21 + hy * h * .79, .7, .5, i % 2 ? '#ffffff0c' : '#7a4a2c0a');
    }
}
/* ---- table cache (painted ONCE, reused every frame) ---------------------- */
function background(c: CanvasRenderingContext2D) {
    c.clearRect(0, 0, 400, 660);
    // The sky, sea and clubhouse live on the page-wide backdrop (scene()); the
    // table cache keeps only what belongs to the table — the raised clay court,
    // its timber frame, goal, rails and launch lane — over a transparent
    // margin, so the slab sits straight on the page's ground. The slab is a
    // real volume: dark left side face, sunlit right side face, warm front
    // edge; its long cast shadow is painted onto the page backdrop in resize()
    // where there is room for it to stretch across the sand.
    const rim = [[4, 8], [372, 8], [372, 607], [356, 629], [20, 629], [4, 607]].map(([x, y]) => project(x, y));
    const L = [project(4, 8), project(4, 607), project(20, 629)];
    poly(c, [[L[0].x, L[0].y], [L[1].x, L[1].y], [L[2].x, L[2].y], [L[2].x - 6, L[2].y + 4], [L[1].x - 7, L[1].y + 4], [L[0].x - 7, L[0].y + 4]], '#6f452c');
    const R = [project(372, 8), project(372, 607), project(356, 629)];
    poly(c, [[R[0].x, R[0].y], [R[1].x, R[1].y], [R[2].x, R[2].y], [R[2].x + 6, R[2].y + 4], [R[1].x + 7, R[1].y + 4], [R[0].x + 7, R[0].y + 4]], '#c99a6b');
    const foot = rim.slice(1, 5);
    poly(c, [[foot[0].x, foot[0].y], [foot[1].x, foot[1].y], [foot[2].x, foot[2].y], [foot[3].x, foot[3].y], [foot[3].x, foot[3].y + 9], [foot[2].x, foot[2].y + 9], [foot[1].x, foot[1].y + 9], [foot[0].x, foot[0].y + 9]], '#96613f');
    line(c, foot[3].x, foot[3].y + 1, foot[2].x, foot[2].y + 1, '#b5794e', 2);
    poly(c, rim.map(q => [q.x, q.y]), '#d3a173');
    c.save();
    c.beginPath();
    rim.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y));
    c.closePath();
    c.clip();
    for (let n = 0; n < 12; n++) {
        const top = project(0, n * 55), bottom = project(0, (n + 1) * 55);
        c.fillStyle = n % 2 ? '#d2a06e' : '#d9a876';
        c.fillRect(0, top.y, 400, bottom.y - top.y + 1);
    }
    // Fixed grain, hashed once into the cached table like the tennis slab.
    for (let i = 0; i < 520; i++) {
        const x = ((Math.imul(i + 17, 7919) >>> 0) % 1000) / 1000 * 400, y = 96 + ((Math.imul(i + 41, 3571) >>> 0) % 1000) / 1000 * 552;
        ellipse(c, x, y, .6, .45, i % 2 ? '#ffffff0d' : '#7a4a2c0b');
    }
    stroke(c, [[25, 52], [335, 52], [335, 578], [25, 578], [25, 52]], '#f5edcd', 1.7);
    stroke(c, [[25, 322], [335, 322]], '#f5edcd', 1.6);
    stroke(c, [[91, 52], [91, 161], [269, 161], [269, 52]], '#f5edcd', 1.6);
    stroke(c, [[123, 52], [123, 100], [237, 100], [237, 52]], '#f5edcd', 1.6);
    const middle = project(180, 322);
    c.strokeStyle = '#f5edcd';
    c.lineWidth = 1.6;
    c.beginPath();
    c.ellipse(middle.x, middle.y, 47, 44, 0, 0, Math.PI * 2);
    c.stroke();
    ellipse(c, middle.x, middle.y, 2, 2, '#fdf5dd');
    c.font = '600 12px system-ui';
    c.fillStyle = '#8a5f3d';
    c.globalAlpha = .4;
    c.textAlign = 'center';
    c.fillText('F U T B O L   I S L A N D', middle.x, middle.y + 68);
    c.globalAlpha = 1;
    // Launch lane bed: a slightly deeper clay channel with guide chevrons.
    poly(c, [[project(LANE_WALL, 48).x, project(LANE_WALL, 48).y], [project(LANE_OUT, 48).x, project(LANE_OUT, 48).y], [project(LANE_OUT, 600).x, project(LANE_OUT, 600).y], [project(LANE_WALL, 600).x, project(LANE_WALL, 600).y]], '#c08f5c');
    stroke(c, [[LANE_WALL + 2, 54], [LANE_WALL + 2, 596]], '#00000012', 4);
    c.strokeStyle = '#f5edcd66';
    c.lineWidth = 2.2;
    c.lineJoin = 'round';
    for (const yy of [500, 432, 364]) {
        const a = project(LANE_X - 6, yy + 8), b = project(LANE_X, yy), d = project(LANE_X + 6, yy + 8);
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.lineTo(d.x, d.y);
        c.stroke();
    }
    // Vertical light falloff over the clay: brighter toward the horizon,
    // warmer and deeper toward the viewer — sells the tilt of the slab.
    const shade = c.createLinearGradient(0, 96, 0, 660);
    shade.addColorStop(0, '#fff1d414');
    shade.addColorStop(.55, '#00000000');
    shade.addColorStop(1, '#7a4a2c17');
    c.fillStyle = shade;
    c.fillRect(0, 90, 400, 570);
    c.restore();
    // Recessed goal rendered as a real box: converging floor falling away,
    // interior side walls (left one catches the sunset), and a raised back
    // wall carrying the net — all behind the raised timber frame.
    const mouthL = project(GOAL_LEFT, 48), mouthR = project(GOAL_RIGHT, 48), backL = project(GOAL_LEFT + 5, 13), backR = project(GOAL_RIGHT - 5, 13);
    const wallH = 11;
    const floor = c.createLinearGradient(0, backL.y, 0, mouthL.y);
    floor.addColorStop(0, '#48301f');
    floor.addColorStop(1, '#6b4630');
    poly(c, [[backL.x, backL.y], [backR.x, backR.y], [mouthR.x, mouthR.y], [mouthL.x, mouthL.y]], '#000');
    c.fillStyle = floor;
    c.fill();
    poly(c, [[mouthL.x, mouthL.y], [backL.x, backL.y], [backL.x, backL.y - wallH], [mouthL.x, mouthL.y - wallH * 1.4]], '#7a5136');
    poly(c, [[mouthR.x, mouthR.y], [backR.x, backR.y], [backR.x, backR.y - wallH], [mouthR.x, mouthR.y - wallH * 1.4]], '#3d2918');
    c.fillStyle = '#452e1d';
    c.fillRect(backL.x, backL.y - wallH, backR.x - backL.x, wallH);
    c.strokeStyle = '#f3e7c6';
    c.lineWidth = .55;
    for (let n = 0; n < 11; n++) {
        const t = n / 10, xb = backL.x + t * (backR.x - backL.x), xm = mouthL.x + t * (mouthR.x - mouthL.x);
        c.beginPath();
        c.moveTo(xb, backL.y - wallH);
        c.lineTo(xb, backL.y);
        c.lineTo(xm, mouthL.y);
        c.stroke();
    }
    for (let n = 0; n < 3; n++) {
        const y = backL.y - wallH + n * wallH / 2;
        c.beginPath();
        c.moveTo(backL.x, y);
        c.lineTo(backR.x, y);
        c.stroke();
    }
    for (let n = 1; n < 4; n++) {
        const t = n / 4;
        c.beginPath();
        c.moveTo(backL.x + (mouthL.x - backL.x) * t, backL.y + (mouthL.y - backL.y) * t);
        c.lineTo(backR.x + (mouthR.x - backR.x) * t, backR.y + (mouthR.y - backR.y) * t);
        c.stroke();
    }
    stroke(c, [[GOAL_LEFT, 48], [GOAL_LEFT, 11], [GOAL_RIGHT, 11], [GOAL_RIGHT, 48]], '#5c3a26', 9);
    stroke(c, [[GOAL_LEFT, 45], [GOAL_LEFT, 9], [GOAL_RIGHT, 9], [GOAL_RIGHT, 45]], '#f6edd2', 5);
    // Timber guide rails: playfield edges, outlanes, lane divider + outer wall,
    // and the top-right arch that curves a launched ball into play. Drawn where
    // the physics walls are, so what you see is what the ball touches.
    const rails = [
        [[20, 45], [20, 455], [99, 535]],
        [[LANE_WALL, LANE_TOP], [LANE_WALL, LANE_OPEN_TOP]],
        [[LANE_WALL, LANE_OPEN_BOT], [LANE_WALL, 596]],
        [[338, 458], [261, 535]],
        [[LANE_OUT, 108], [LANE_OUT, 600]],
        [[318, 45], [352, 60], [LANE_OUT, 108]],
        [[20, 45], [GOAL_LEFT, 45]],
        [[GOAL_RIGHT, 45], [318, 45]],
    ];
    // Each rail is an extruded wall: a soft cast shadow falling down-left, a
    // dark base, a shaded inner face, then the sunlit top face + highlight.
    for (const rail of rails) {
        stroke(c, rail.map(([x, y]) => [x - 5, y + 8]), '#5c3a2622', 13);
        stroke(c, rail.map(([x, y]) => [x, y + 5]), '#5c3a26', 13);
        stroke(c, rail.map(([x, y]) => [x, y + 2.5]), '#8a6647', 12);
        stroke(c, rail, '#b29a68', 12);
        stroke(c, rail, '#efe5bc', 8);
        stroke(c, rail.map(([x, y]) => [x - 1, y - 1]), '#fff7db', 2);
    }
    // One-way gate wire at the lane mouth (the ball sails out over it).
    stroke(c, [[LANE_WALL, 62], [LANE_WALL + 2.5, 146]], '#ecdcae', 2.5);
    const hinge = project(LANE_WALL, 62);
    ellipse(c, hinge.x, hinge.y, 2.6, 2.6, '#8a6a45');
    // Soft-entry opening in the divider (matches LANE_OPEN_TOP/BOT exactly):
    // shadowed break in the rail, finished end caps, an angled one-way flap
    // slat pointing lane -> playfield, and a chalk arrow on the worn clay
    // hinting the exit route down to the right flipper.
    stroke(c, [[LANE_WALL - 1, LANE_OPEN_TOP + 5], [LANE_WALL - 1, LANE_OPEN_BOT - 5]], '#00000028', 7);
    for (const capY of [LANE_OPEN_TOP, LANE_OPEN_BOT]) {
        const cap = project(LANE_WALL, capY);
        ellipse(c, cap.x, cap.y + 2, 4.6, 4.2, '#54331f');
        ellipse(c, cap.x, cap.y, 4.2, 3.8, '#b29a68');
        ellipse(c, cap.x - 1, cap.y - 1, 2.2, 2, '#fff7db');
    }
    stroke(c, [[LANE_OUT - 2, LANE_OPEN_TOP + 2], [LANE_WALL - 6, LANE_OPEN_BOT - 4]], '#5c3a2626', 7);
    stroke(c, [[LANE_OUT - 2, LANE_OPEN_TOP + 2], [LANE_WALL - 6, LANE_OPEN_BOT - 4]], '#54331f', 5.5);
    stroke(c, [[LANE_OUT - 2, LANE_OPEN_TOP + 2], [LANE_WALL - 6, LANE_OPEN_BOT - 4]], '#b29150', 3.5);
    stroke(c, [[LANE_OUT - 3, LANE_OPEN_TOP + 3], [LANE_WALL - 5, LANE_OPEN_BOT - 5]], '#e8d4a0', 1.2);
    const flapHinge = project(LANE_OUT - 2, LANE_OPEN_TOP + 2);
    ellipse(c, flapHinge.x, flapHinge.y, 2.4, 2.4, '#8a6a45');
    // worn exit path + chalk chevrons curving toward the right flipper
    stroke(c, [[LANE_WALL - 8, LANE_OPEN_BOT - 12], [318, 480], [292, 512]], '#ffffff12', 9);
    c.strokeStyle = '#f5edcd7d';
    c.lineWidth = 2;
    c.lineJoin = 'round';
    for (const [ax, ay, r2] of [[326, 468, .9], [306, 494, 1], [287, 516, 1.1]] as const) {
        const tip = project(ax, ay), a1 = project(ax + 9 * r2, ay - 7 * r2), a2 = project(ax + 10 * r2, ay + 4 * r2);
        c.beginPath();
        c.moveTo(a1.x, a1.y);
        c.lineTo(tip.x, tip.y);
        c.lineTo(a2.x, a2.y);
        c.stroke();
    }
    // Plunger housing at the bottom of the lane (the rod is drawn per-frame):
    // a small timber block with a lit top face and shaded body.
    const ha = project(343, 598), hb = project(365, 626);
    poly(c, [[ha.x - 5, hb.y + 6], [hb.x, hb.y + 6], [hb.x, hb.y + 1], [ha.x - 5, hb.y + 1]], '#5c3a2622');
    rounded(c, ha.x, ha.y, hb.x - ha.x, hb.y - ha.y, 3, '#5c3a26');
    rounded(c, ha.x + 2, ha.y + 2, hb.x - ha.x - 4, hb.y - ha.y - 4, 2, '#8a5a3e');
    rounded(c, ha.x + 2, ha.y + 2, hb.x - ha.x - 4, 4, 2, '#a5714a');
    const drain = project(180, 590);
    c.fillStyle = '#6b452e';
    c.fillRect(drain.x - 54, drain.y - 5, 108, 21);
    c.fillStyle = '#54371f';
    c.fillRect(drain.x - 54, drain.y - 5, 108, 3);
    c.fillStyle = '#f0d7a8';
    c.font = '9px system-ui';
    c.textAlign = 'center';
    c.fillText('KEEP IT IN PLAY', drain.x, drain.y + 9);
}
function player(c: CanvasRenderingContext2D, x: number, y: number, kit: 'df' | 'gk', time: number, dive = 0, num = '4') {
    // Same craft level as Soccer Tennis's person(): articulated stride legs with
    // socks/laced shoes, notched shorts, quadratic-shoulder jersey with collar
    // trim + number, elbow/hand arm segments, detailed head. The keeper wears a
    // gold kit with gloves and a cap, and leans into his dive.
    // Depth: near players read larger than far ones (steeper scale ramp than
    // the court itself), and every figure drops a long soft sunset shadow to
    // the lower left — same light as the page diorama.
    const p = project(x, y), u = 26 * (.76 + y / 620 * .28), gk = kit === 'gk';
    const skin = gk ? '#b9764e' : '#d09a70', jersey = gk ? '#e7bd55' : '#bc654f', trim = gk ? '#4a3524' : '#f7e7c5', shorts = gk ? '#4a3524' : '#efe1bb';
    const swing = Math.sin(time * 5.2) * (gk ? .55 : 1), bob = Math.abs(swing) * u * .025, lean = gk ? Math.max(-.14, Math.min(.14, dive * .12)) * u : Math.max(-.1, Math.min(.1, Math.cos(time * 5.2) * .05)) * u;
    ellipse(c, p.x - u * .34, p.y + u * .05, u * .62, u * .125, '#5c3a2626');
    ellipse(c, p.x - u * .1, p.y + u * .04, u * .3, u * .1, '#5c3a2622');
    c.save();
    c.translate(p.x, p.y);
    if (gk)
        c.rotate(dive * .45);
    c.lineCap = 'round';
    for (const side of [-1, 1]) {
        const hip = side * .14 * u, ankle = side * .16 * u + swing * side * .11 * u, footY = -Math.max(0, swing * side) * u * .045;
        line(c, hip, -.61 * u - bob, ankle, -.23 * u + footY, skin, .14 * u);
        line(c, ankle, -.23 * u + footY, ankle, -.07 * u + footY, gk ? '#e7bd55' : '#f7e7c5', .135 * u);
        ellipse(c, ankle + .025 * u, footY, .15 * u, .065 * u, '#3a332c');
        line(c, ankle - .1 * u, footY + .035 * u, ankle + .1 * u, footY + .035 * u, '#e7e1cc', .028 * u);
    }
    poly(c, [[-.24 * u + lean, -.77 * u - bob], [.24 * u + lean, -.77 * u - bob], [.23 * u, -.49 * u - bob], [.035 * u, -.49 * u - bob], [0, -.62 * u - bob], [-.035 * u, -.49 * u - bob], [-.23 * u, -.49 * u - bob]], shorts);
    for (const side of [-1, 1]) {
        const reach = gk && Math.abs(dive) > .3 && side === Math.sign(dive);
        const elbow = reach ? { x: side * .5 * u, y: -1.02 * u - bob } : { x: side * .36 * u + lean, y: (-.91 + swing * side * .1) * u - bob };
        const hand = reach ? { x: side * .74 * u, y: -1.14 * u - bob } : { x: side * .32 * u + lean, y: (-.69 + swing * side * .07) * u - bob };
        line(c, side * .23 * u + lean, -1.14 * u - bob, elbow.x, elbow.y, jersey, .16 * u);
        line(c, elbow.x, elbow.y, hand.x, hand.y, skin, .105 * u);
        ellipse(c, hand.x, hand.y, (gk ? .09 : .064) * u, (gk ? .105 : .08) * u, gk ? '#fbf3df' : skin);
    }
    c.beginPath();
    c.moveTo(-.25 * u + lean, -1.2 * u - bob);
    c.quadraticCurveTo(lean, -1.27 * u - bob, .25 * u + lean, -1.2 * u - bob);
    c.lineTo(.22 * u + lean, -.73 * u - bob);
    c.quadraticCurveTo(lean, -.69 * u - bob, -.22 * u + lean, -.73 * u - bob);
    c.closePath();
    c.fillStyle = jersey;
    c.fill();
    line(c, -.1 * u + lean, -1.2 * u - bob, .1 * u + lean, -1.2 * u - bob, trim, .055 * u);
    c.fillStyle = trim;
    c.font = `800 ${u * .29}px system-ui,sans-serif`;
    c.textAlign = 'center';
    c.fillText(num, lean, -.85 * u - bob);
    ellipse(c, lean, -1.44 * u - bob, .235 * u, .285 * u, skin);
    if (gk) {
        ellipse(c, lean, -1.62 * u - bob, .245 * u, .15 * u, '#4a3524');
        ellipse(c, lean, -1.56 * u - bob, .26 * u, .07 * u, '#61452b');
        ellipse(c, lean - .075 * u, -1.45 * u - bob, .025 * u, .03 * u, '#43301f');
        ellipse(c, lean + .075 * u, -1.45 * u - bob, .025 * u, .03 * u, '#43301f');
    }
    else {
        ellipse(c, lean, -1.62 * u - bob, .235 * u, .14 * u, '#735238');
        ellipse(c, lean - .075 * u, -1.45 * u - bob, .025 * u, .03 * u, '#493c31');
        ellipse(c, lean + .075 * u, -1.45 * u - bob, .025 * u, .03 * u, '#493c31');
        line(c, lean - .05 * u, -1.32 * u - bob, lean + .045 * u, -1.32 * u - bob, '#93634b', .023 * u);
    }
    c.restore();
}
/* ---- juice bookkeeping (all counters/timers live in one mutable ref) ----- */
type Fx = {
    shake: number;
    def: [number, number, number];
    keeper: number;
    drop: number;
    prevL: number;
    prevR: number;
    prevPhase: PinballState['phase'];
    /** launch blast: pad muzzle-flash timer, arch-exit pop timer + position,
     * lane state latch, and a small preallocated ball trail ring */
    blast: number;
    pop: number;
    popX: number;
    popY: number;
    wasInLane: boolean;
    tx: Float32Array;
    ty: Float32Array;
    tn: number;
    /** last plunger-pull ratchet level that creaked (0 when not charging) */
    creakLv: number;
    c: { wall: number; bumper: number; flipper: number; keeper: number; gate: number; join: number };
};
const createFx = (): Fx => ({ shake: 0, def: [0, 0, 0], keeper: 0, drop: .6, prevL: 0, prevR: 0, prevPhase: 'ready', blast: 0, pop: 0, popX: 0, popY: 0, wasInLane: false, tx: new Float32Array(10), ty: new Float32Array(10), tn: 0, creakLv: 0, c: { wall: 0, bumper: 0, flipper: 0, keeper: 0, gate: 0, join: 0 } });
const CONFETTI = ['#f4cc7c', '#e77e55', '#f6edd2', '#7fb1a8', '#c9564a'];
const buzz = (pattern: number | number[]) => {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    try {
        if (matchMedia('(pointer: coarse)').matches) navigator.vibrate(pattern);
    } catch { /* haptics are a nicety */ }
};
/* ---- tiny synthesized SFX (same WebAudio approach as runnerAudio.ts, kept
 * local to this game per file-ownership rules). Gesture-unlocked; respects the
 * app-wide sound toggle + volume from lib/sound. -------------------------- */
function createPinballAudio() {
    let context: AudioContext | null = null, muted = false, lastWall = 0, lastFlip = 0;
    const unlock = () => {
        if (muted || !isSoundEnabled()) return;
        try { context ??= new AudioContext(); void context.resume().catch(() => { }); } catch { /* audio optional */ }
    };
    const live = () => (context && !muted && isSoundEnabled() && getSoundVolume() > 0 && context.state === 'running') ? context : null;
    const tone = (from: number, to: number, dur: number, type: OscillatorType, peak: number, at = 0) => {
        const c = live();
        if (!c) return;
        try {
            const t = c.currentTime + at, osc = c.createOscillator(), gain = c.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(Math.max(20, from), t);
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
            gain.gain.setValueAtTime(.0001, t);
            gain.gain.exponentialRampToValueAtTime(Math.max(.001, peak * getSoundVolume()), t + .008);
            gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
            osc.start(t);
            osc.stop(t + dur + .02);
        } catch { /* ignore */ }
    };
    const noise = (dur: number, f0: number, f1: number, q: number, peak: number, at = 0) => {
        const c = live();
        if (!c) return;
        try {
            const t = c.currentTime + at, buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
            const src = c.createBufferSource();
            src.buffer = buf;
            const bp = c.createBiquadFilter();
            bp.type = 'bandpass';
            bp.Q.value = q;
            bp.frequency.setValueAtTime(f0, t);
            bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
            const gain = c.createGain();
            gain.gain.setValueAtTime(Math.max(.001, peak * getSoundVolume()), t);
            gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
            src.connect(bp);
            bp.connect(gain);
            gain.connect(c.destination);
            src.onended = () => { src.disconnect(); bp.disconnect(); gain.disconnect(); };
            src.start(t);
            src.stop(t + dur);
        } catch { /* ignore */ }
    };
    return {
        unlock,
        launch(power: number) { noise(.28, 260, 1900, .9, .05 + .07 * power); tone(110, 65, .12, 'square', .085); tone(700, 1500, .08, 'sine', .028, .01); },
        flipper() { const n = performance.now(); if (n - lastFlip < 50) return; lastFlip = n; tone(200, 85, .05, 'square', .07); noise(.035, 1800, 2600, 1.4, .03); },
        wall(v: number) { const n = performance.now(); if (n - lastWall < 70) return; lastWall = n; const k = Math.min(1, v / 750); tone(140 + 110 * k, 85, .06, 'triangle', .018 + .055 * k); },
        bumper() { tone(320, 150, .075, 'square', .065); tone(640, 430, .06, 'sine', .033, .01); },
        keeper() { tone(120, 58, .13, 'triangle', .08); noise(.07, 600, 280, 1, .035); },
        gate() { tone(520, 720, .05, 'triangle', .028); },
        join() { tone(1180, 1560, .11, 'sine', .045); tone(1180, 1560, .13, 'sine', .05, .17); },
        creak(level: number) { if (level >= 4) { tone(70, 52, .2, 'sine', .05); return; } tone(110 + level * 45, 85 + level * 32, .06, 'triangle', .026); },
        goal() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, f, .12, 'triangle', .06, i * .085)); noise(.6, 700, 1500, .6, .04, .05); },
        drain() { tone(210, 52, .5, 'sawtooth', .05); tone(105, 40, .5, 'triangle', .04, .04); },
        over() { [392, 311.1, 261.6].forEach((f, i) => tone(f, f * .97, .16, 'triangle', .05, i * .16)); },
        dispose() { if (context) void context.close().catch(() => { }); context = null; },
    };
}
function drawPlunger(c: CanvasRenderingContext2D, s: PinballState, shud: number) {
    const tipY = PLUNGER_TIP + s.plunger * 26 - s.plungerSnap * s.plungerSnap * 7;
    const tip = project(LANE_X, tipY), base = project(LANE_X, 622);
    const tx = tip.x + shud;
    c.strokeStyle = '#b79150';
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i <= 10; i++) {
        const t = i / 10, y = tip.y + 5 + (base.y - tip.y - 5) * t, x = tx + (i % 2 ? -5 : 5);
        i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    line(c, tx, base.y, tx, tip.y + 2, '#8a5a3e', 6);
    rounded(c, tx - 9, tip.y - 3, 18, 6, 2, '#e7b749');
    rounded(c, tx - 9, tip.y - 3, 18, 2.5, 1, '#f6d98c');
    if (s.plunger > .14) {
        // Engaged hold: the pad glow reads the power band — AMBER inside the
        // soft band (sneak-in-low launch through the divider opening), GOLD
        // once the pull ramps past it toward the full blast.
        const pull = plungerPull(s.plunger);
        const soft = pull <= SOFT_PULL_MAX + .001;
        const g = soft ? .72 : .35 + .45 * Math.min(1, (pull - SOFT_PULL_MAX) / (1 - SOFT_PULL_MAX));
        const rgb = soft ? '250,150,58' : '255,220,140';
        const rad = soft ? 23 : 19;
        const glow = c.createRadialGradient(tx, tip.y, 0, tx, tip.y, rad);
        glow.addColorStop(0, `rgba(${rgb},${g.toFixed(3)})`);
        glow.addColorStop(1, `rgba(${rgb},0)`);
        c.fillStyle = glow;
        c.fillRect(tx - rad, tip.y - rad, rad * 2, rad * 2);
    }
}
function draw(c: CanvasRenderingContext2D, s: PinballState, cache: HTMLCanvasElement, f: Fx, scale: number, now: number) {
    c.setTransform(scale, 0, 0, scale, 0, 0);
    c.clearRect(0, 0, 400, 660);
    // Table shake on hard hits; the transparent margin lets the page scene
    // peek through at the edges, which sells the "physical cabinet" wobble.
    const mag = f.shake * f.shake * 12;
    if (mag > .05)
        c.translate(Math.sin(now * .12) * mag, Math.cos(now * .095) * mag * .7);
    c.drawImage(cache, 0, 0, 400, 660);
    // Launch-tunnel state: ball rocketing up the lane (render-only effects).
    const lane = s.phase === 'playing' && s.ball.x > LANE_WALL && s.ball.vy < -60;
    const pw = s.launchPower;
    // Speed streak: any time the ball is genuinely fast — flipper flicks,
    // big bounces, launches — the afterimage trail kicks in, its length and
    // heat proportional to speed. Same pooled ring buffer as the lane trail.
    const spd = Math.hypot(s.ball.vx, s.ball.vy);
    const streak = s.phase === 'playing' && (lane || spd > 780);
    const heat = Math.min(1, spd / 1150);
    // Rod shudder on the launch snap; a slighter tremble while held pulled.
    drawPlunger(c, s, f.blast > 0 ? Math.sin(now * .5) * 2.4 * (f.blast / .3) * (.4 + pw) : (s.phase === 'ready' && s.plunger > .5 ? Math.sin(now * .32) * (s.plunger - .5) * 2.6 : 0));
    // Speed trail: afterimage ghosts + stretched streaks while fast.
    if (streak) {
        for (let i = Math.min(f.tn, 9); i > 0; i--) {
            f.tx[i] = f.tx[i - 1];
            f.ty[i] = f.ty[i - 1];
        }
        f.tx[0] = s.ball.x;
        f.ty[0] = s.ball.y;
        f.tn = Math.min(f.tn + 1, 10);
    }
    else
        f.tn = 0;
    if (f.tn > 1) {
        const hot = lane ? Math.max(heat, .3 + pw * .55) : heat;
        for (let i = f.tn - 1; i > 0; i--) {
            const k = 1 - i / f.tn, gp = project(f.tx[i], f.ty[i]), gq = project(f.tx[i - 1], f.ty[i - 1]);
            c.globalAlpha = k * .36 * (.3 + hot * .7);
            c.strokeStyle = i % 2 ? '#ffdf9e' : '#fff3cd';
            c.lineWidth = 2 + k * (4 + hot * 5);
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(gp.x, gp.y);
            c.lineTo(gq.x, gq.y);
            c.stroke();
            ellipse(c, gp.x, gp.y, (2 + k * 4.5) * (.35 + hot * .85), (3 + k * 6) * (.35 + hot * .85), i % 2 ? '#ffd98e' : '#fff0c4');
        }
        c.globalAlpha = 1;
    }
    // Sparks kicked off the lane walls as the ball rockets past.
    if (lane) {
        for (let k = 0; k < 6; k++) {
            const sy = s.ball.y + 24 + k * 21;
            if (sy > 585)
                continue;
            const h = Math.imul((sy / 9 | 0) + k * 31, 2654435761) >>> 0;
            const sp = project(h % 2 ? LANE_WALL + 4.5 : LANE_OUT - 4.5, sy);
            c.globalAlpha = (1 - k / 6) * .55 * (.25 + pw);
            ellipse(c, sp.x + ((h >> 4) % 5) - 2, sp.y - ((h >> 7) % 7), 1.3, 2.4, k % 2 ? '#ffd98e' : '#f0b26a');
        }
        c.globalAlpha = 1;
    }
    // Muzzle flash + sparks at the plunger pad on the snap.
    if (f.blast > 0) {
        const t = f.blast / .3, pad = project(LANE_X, PLUNGER_TIP - 4);
        const flash = c.createRadialGradient(pad.x, pad.y, 0, pad.x, pad.y, 15 + (1 - t) * 14 * (.5 + pw));
        flash.addColorStop(0, `rgba(255,240,190,${(.85 * t * (.4 + pw)).toFixed(3)})`);
        flash.addColorStop(1, 'rgba(255,240,190,0)');
        c.fillStyle = flash;
        c.fillRect(pad.x - 32, pad.y - 34, 64, 44);
        for (let i = 0; i < 9; i++) {
            const h = Math.imul(i + 13, 2654435761) >>> 0;
            const a = -Math.PI / 2 + (((h % 100) - 50) / 50) * .7, d = (1 - t) * (16 + (h >> 6) % 22) * (.4 + pw);
            c.globalAlpha = t * .9;
            ellipse(c, pad.x + Math.cos(a) * d, pad.y + Math.sin(a) * d, 1.4, 2.6, i % 2 ? '#ffe9a2' : '#ffd06b');
        }
        c.globalAlpha = 1;
    }
    // Little pop as the ball clears the gate into the playfield.
    if (f.pop > 0) {
        const t = f.pop / .3, pp = project(f.popX, f.popY);
        c.globalAlpha = t * .7;
        c.strokeStyle = '#fff2b6';
        c.lineWidth = 2.5;
        c.beginPath();
        c.ellipse(pp.x, pp.y, (1 - t) * 22 + 5, ((1 - t) * 22 + 5) * .8, 0, 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;
    }
    pinballDefenders(s.time, s.defs, s.defJoin, s.defs - 1).forEach((d, i) => {
        const w = f.def[i], jx = w > 0 ? Math.sin(w * 52 + i * 2.1) * w * 8 : 0, jy = w > 0 ? Math.cos(w * 47) * w * 4 : 0;
        player(c, d.x + jx, d.y + jy, 'df', s.time + i * 2.1, 0, ['2', '5', '8'][i]);
        // Entry dust while a newly joined defender jogs in.
        if (s.defJoin > 0 && i === s.defs - 1 && i > 0) {
            const p = project(d.x, d.y);
            for (let k = 0; k < 5; k++) {
                const h = Math.imul(k + 9, 48271) >>> 0;
                ellipse(c, p.x - 8 - k * 7 * (i === 1 ? -1 : 1), p.y + 2 - (h % 5), 3 + k, 2 + k * .6, `rgba(122,74,44,${(s.defJoin * .18).toFixed(3)})`);
            }
        }
    });
    const kx = f.keeper > 0 ? Math.sin(f.keeper * 46) * f.keeper * 7 : 0;
    player(c, s.keeper + kx, 83, 'gk', s.time, s.keeperDive, '1');
    pinballFlippers(s).forEach((fl, i) => {
        const cur = i ? s.right : s.left, prev = i ? f.prevR : f.prevL;
        const p = project(fl.x, fl.y), end = project(fl.x + Math.cos(fl.angle) * fl.length, fl.y + Math.sin(fl.angle) * fl.length);
        c.lineCap = 'round';
        if (Math.abs(cur - prev) > .07) {
            // Mid-flick: paint a golden motion ghost at the previous angle.
            const ga = i ? Math.PI - .46 + prev * .97 : .46 - prev * .97;
            const ge = project(fl.x + Math.cos(ga) * fl.length, fl.y + Math.sin(ga) * fl.length);
            c.strokeStyle = '#ffe9a24d';
            c.lineWidth = 19;
            c.beginPath();
            c.moveTo(p.x, p.y);
            c.lineTo(ge.x, ge.y);
            c.stroke();
        }
        c.beginPath();
        c.moveTo(p.x - 4, p.y + 7);
        c.lineTo(end.x - 4, end.y + 7);
        c.lineWidth = 17;
        c.strokeStyle = '#5c3a2633';
        c.stroke();
        c.beginPath();
        c.moveTo(p.x, p.y + 5);
        c.lineTo(end.x, end.y + 5);
        c.lineWidth = 17;
        c.strokeStyle = '#54331f';
        c.stroke();
        c.beginPath();
        c.moveTo(p.x, p.y + 2.5);
        c.lineTo(end.x, end.y + 2.5);
        c.lineWidth = 16;
        c.strokeStyle = '#8a6647';
        c.stroke();
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(end.x, end.y);
        c.strokeStyle = '#b79150';
        c.lineWidth = 16;
        c.stroke();
        c.strokeStyle = '#fff0ba';
        c.lineWidth = 12;
        c.stroke();
        c.strokeStyle = (i ? s.right : s.left) > .4 ? '#e7b749' : '#d9c487';
        c.lineWidth = 4;
        c.stroke();
        ellipse(c, p.x, p.y, 5, 5, '#8a6a45');
        ellipse(c, p.x - 1, p.y - 1, 2, 2, '#fff0b9');
    });
    f.prevL = s.left;
    f.prevR = s.right;
    if (s.phase !== 'lost' && s.phase !== 'over') {
        let bx = s.ball.x, by = s.ball.y;
        if (s.phase === 'ready') {
            // Waiting ball rides the plunger pad; a fresh serve drops down the lane.
            bx = LANE_X;
            by = PLUNGER_TIP - 7 + s.plunger * 26 - (f.drop > 0 ? Math.pow(f.drop / .6, 1.6) * 430 : 0);
        }
        const p = project(bx, by), r = 7 * (.80 + by / 620 * .17);
        if (s.phase === 'ready' && s.plunger > .5)
            // The waiting ball trembles with the loaded plunger beneath it.
            p.x += Math.sin(now * .32) * (s.plunger - .5) * 2.6;
        if (lane)
            // Blasting through the tunnel: fast perpendicular vibration
            // (render-only — the physics trajectory is untouched).
            p.x += Math.sin(now * .45) * (1.1 + 2 * pw);
        ellipse(c, p.x - 4, p.y + 5, r + 3.5, r * .6, '#5c3a2650');
        ellipse(c, p.x - 1.5, p.y + 4.5, r + 1, r * .55, '#5c3a2640');
        const grad = c.createRadialGradient(p.x - r * .35, p.y - r * .4, 0, p.x, p.y, r);
        grad.addColorStop(0, '#fffef2');
        grad.addColorStop(.65, '#efe9d9');
        grad.addColorStop(1, '#b8a98c');
        c.fillStyle = grad;
        c.beginPath();
        c.arc(p.x, p.y, r, 0, Math.PI * 2);
        c.fill();
        c.save();
        c.translate(p.x, p.y);
        c.rotate(s.ball.spin);
        c.fillStyle = '#463b30';
        c.beginPath();
        for (let n = 0; n < 5; n++) {
            const a = n * Math.PI * 2 / 5 - 1.5;
            n ? c.lineTo(Math.cos(a) * r * .42, Math.sin(a) * r * .42) : c.moveTo(Math.cos(a) * r * .42, Math.sin(a) * r * .42);
        }
        c.closePath();
        c.fill();
        for (let n = 0; n < 3; n++) {
            const a = n * 2.094;
            c.beginPath();
            c.arc(Math.cos(a) * r * .88, Math.sin(a) * r * .88, r * .2, 0, Math.PI * 2);
            c.fill();
        }
        c.restore();
    }
    if (s.flash > 0) {
        // Impact burst: a deterministic scatter keyed off hitId (no allocation).
        const p = project(s.hitX, s.hitY);
        c.globalAlpha = Math.min(1, s.flash * 1.2);
        for (let i = 0; i < 12; i++) {
            const h = Math.imul(s.hitId * 37 + i, 2654435761) >>> 0;
            const a = (h % 628) / 100, sp = 16 + (h >> 8) % 26, r = (1 - s.flash) * (sp + 12);
            ellipse(c, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * .8, 1.1 + s.flash * 1.7, 1.1 + s.flash * 1.7, i % 3 ? '#ffe9a2' : '#fff7d9');
        }
        c.globalAlpha = s.flash * .45;
        c.strokeStyle = '#fff2b6';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(p.x, p.y, (1 - s.flash) * 34 + 6, ((1 - s.flash) * 34 + 6) * .8, 0, 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;
    }
    if (s.phase === 'goal') {
        // Confetti fountain from the goal mouth + a rising +500.
        const t = Math.min(1.5, Math.max(0, 1.5 - s.timer));
        const gp = project((GOAL_LEFT + GOAL_RIGHT) / 2, 46);
        for (let i = 0; i < 26; i++) {
            const h = Math.imul(i + 1, 2654435761) >>> 0;
            const a = -Math.PI / 2 + (((h % 200) - 100) / 100) * 1.15, sp = 80 + (h >> 8) % 150;
            c.globalAlpha = Math.max(0, 1.1 - t * .75);
            c.save();
            c.translate(gp.x + Math.cos(a) * sp * t, gp.y + Math.sin(a) * sp * t + 150 * t * t);
            c.rotate(t * (2 + (h % 5)));
            c.fillStyle = CONFETTI[i % CONFETTI.length];
            c.fillRect(-2.6, -1.6, 5.2, 3.2);
            c.restore();
        }
        c.globalAlpha = Math.max(0, 1 - t * .7);
        c.font = '700 26px system-ui,sans-serif';
        c.textAlign = 'center';
        c.lineWidth = 5;
        c.strokeStyle = '#5c3a26';
        c.fillStyle = '#fff3d1';
        const ty = gp.y - 30 - Math.min(1, t * 1.3) * 26;
        c.strokeText('+500', gp.x, ty);
        c.fillText('+500', gp.x, ty);
        c.globalAlpha = 1;
    }
    if (s.phase === 'lost') {
        // A puff of clay dust where the ball slipped through.
        const t = Math.max(0, 1 - s.timer);
        const dp = project(180, 598);
        for (let i = 0; i < 9; i++) {
            const h = Math.imul(i + 5, 48271) >>> 0;
            ellipse(c, dp.x - 46 + (h % 92), dp.y - t * (10 + (h >> 6) % 26), 2.5 + t * 4, 1.8 + t * 3, `rgba(122,74,44,${Math.max(0, .28 * (1 - t)).toFixed(3)})`);
        }
    }
}
export default function SoccerPinballGame({ onExit }: GameProps) {
    const canvas = useRef<HTMLCanvasElement>(null), backdrop = useRef<HTMLCanvasElement>(null), wrap = useRef<HTMLDivElement>(null), sim = useRef(createPinballState()), input = useRef({ left: false, right: false, charge: false }), pointers = useRef(new Map<number, 'left' | 'right'>()), keys = useRef(new Set<string>()), wake = useRef(() => { }), pausedRef = useRef(false), chargeRef = useRef(false), fx = useRef(createFx()), audio = useRef<ReturnType<typeof createPinballAudio> | null>(null), score = useRef<HTMLSpanElement>(null), goals = useRef<HTMLSpanElement>(null), balls = useRef<HTMLSpanElement>(null);
    const [phase, setPhase] = useState<PinballState['phase']>('ready'), [paused, setPaused] = useState(false), [played, setPlayed] = useState(false), [charging, setCharging] = useState(false);
    // Two-stage serve: an end-of-point (or intro/game-over) card is DISMISSED
    // first — "armed" — leaving the ball waiting on the plunger; only the NEXT
    // tap/hold of LAUNCH or Space actually fires. Armed drops whenever a point
    // ends so the card always returns between balls.
    const armedRef = useRef(false), [armed, setArmed] = useState(false);
    const syncInput = () => { const active = [...pointers.current.values()]; input.current.left = active.includes('left') || keys.current.has('ArrowLeft') || keys.current.has('KeyA'); input.current.right = active.includes('right') || keys.current.has('ArrowRight') || keys.current.has('KeyD'); };
    const pause = (value: boolean) => { pausedRef.current = value; setPaused(value); pointers.current.clear(); keys.current.clear(); chargeRef.current = false; input.current.charge = false; setCharging(false); syncInput(); wake.current(); };
    // Dismiss the current card without firing: game-over resets to a fresh
    // table, then the ball just waits on the plunger for a real launch input.
    const arm = () => {
        if (pausedRef.current)
            return;
        audio.current?.unlock();
        if (sim.current.phase === 'over') {
            sim.current = createPinballState();
            fx.current.prevPhase = 'ready';
            fx.current.drop = .6;
        }
        if (sim.current.phase !== 'ready')
            return;
        armedRef.current = true;
        setArmed(true);
        setPhase('ready');
        wake.current();
    };
    const launch = () => {
        if (pausedRef.current)
            return;
        if (launchPinball(sim.current)) {recordExploreActivity('arcade');
            audio.current?.launch(sim.current.launchPower);
            buzz(sim.current.launchPower > .5 ? [12, 24, 12, 24, 14] : 10);
            setPlayed(true);
            setPhase('playing');
            wake.current();
        }
    };
    const beginCharge = () => {
        if (pausedRef.current)
            return;
        audio.current?.unlock();
        if (sim.current.phase !== 'ready')
            return;
        chargeRef.current = true;
        input.current.charge = true;
        setCharging(true);
        wake.current();
    };
    const endCharge = () => {
        if (!chargeRef.current)
            return;
        chargeRef.current = false;
        input.current.charge = false;
        setCharging(false);
        launch();
    };
    // Interrupted holds (pointercancel, capture loss) reset the plunger to
    // rest WITHOUT firing — no surprise launch, no ball lost.
    const cancelCharge = () => {
        chargeRef.current = false;
        input.current.charge = false;
        setCharging(false);
        wake.current();
    };
    useEffect(() => {
        const el = canvas.current, host = wrap.current;
        if (!el || !host)
            return;
        const c = el.getContext('2d');
        if (!c)
            return;
        audio.current = createPinballAudio();
        const cache = document.createElement('canvas');
        cache.width = 600;
        cache.height = 990;
        const bg = cache.getContext('2d')!;
        bg.scale(1.5, 1.5);
        background(bg);
        let raf = 0, last = 0, lastDraw = 0, scale = 1, disposed = false, shown = sim.current.phase;
        const mobile = matchMedia('(pointer: coarse)').matches, interval = mobile ? 1000 / 30 : 1000 / 60;
        const update = () => {
            const state = sim.current;
            const values: [HTMLSpanElement | null, string][] = [
                [score.current, String(state.score).padStart(4, '0')],
                [goals.current, String(state.goals)],
                [balls.current, String(state.balls)],
            ];
            for (const [element, value] of values) {
                if (element && element.textContent !== value) element.textContent = value;
            }
            if (shown !== state.phase) {
                shown = state.phase;
                setPhase(state.phase);
                // A finished point (or game) always brings the card back; the
                // next serve must be re-armed with an explicit dismiss first.
                if (state.phase === 'goal' || state.phase === 'lost' || state.phase === 'over') {
                    armedRef.current = false;
                    setArmed(false);
                }
            }
        };
        // Diffs the sim's sfx counters + phase once per frame into sound, shake,
        // wobble timers and haptics. Pure ref mutation — no allocation, no state.
        const events = (dt: number) => {
            const s = sim.current, f = fx.current, e = s.sfx, a = audio.current;
            f.shake = Math.max(0, f.shake - dt * 2.4);
            f.keeper = Math.max(0, f.keeper - dt);
            f.drop = Math.max(0, f.drop - dt);
            f.blast = Math.max(0, f.blast - dt);
            f.pop = Math.max(0, f.pop - dt);
            for (let i = 0; i < 3; i++)
                f.def[i] = Math.max(0, f.def[i] - dt);
            // Launch tunnel: a sustained low rumble while the ball climbs the
            // lane, and a little pop the instant it clears the one-way gate.
            if (s.phase === 'playing' && s.ball.x > LANE_WALL && s.ball.vy < -60)
                f.shake = Math.max(f.shake, .12 + .2 * s.launchPower);
            if (f.wasInLane && (s.phase !== 'playing' || s.ball.x <= LANE_WALL)) {
                if (s.phase === 'playing' && s.ball.x <= LANE_WALL) {
                    f.pop = .3;
                    f.popX = s.ball.x;
                    f.popY = s.ball.y;
                }
                f.wasInLane = false;
            }
            if (e.bumper !== f.c.bumper) {
                f.c.bumper = e.bumper;
                f.def[e.bumperI] = .5;
                f.shake = Math.min(1, f.shake + .28);
                a?.bumper();
                buzz(12);
            }
            if (e.flipper !== f.c.flipper) {
                f.c.flipper = e.flipper;
                f.shake = Math.min(1, f.shake + .16);
                a?.flipper();
                buzz(8);
            }
            if (e.wall !== f.c.wall) {
                f.c.wall = e.wall;
                a?.wall(e.wallV);
                if (e.wallV > 480)
                    f.shake = Math.min(1, f.shake + .2);
            }
            if (e.gate !== f.c.gate) {
                f.c.gate = e.gate;
                a?.gate();
            }
            if (e.keeper !== f.c.keeper) {
                f.c.keeper = e.keeper;
                f.keeper = .55;
                f.shake = Math.min(1, f.shake + .24);
                a?.keeper();
                buzz(10);
            }
            if (e.join !== f.c.join) {
                f.c.join = e.join;
                a?.join();
            }
            // Spring-ratchet creaks as the plunger is pulled, and one deep
            // "loaded" thump when the hold reaches full compression.
            if (s.phase === 'ready' && input.current.charge) {
                const lv = Math.min(4, Math.floor(s.plunger * 4.5));
                if (lv > f.creakLv) {
                    f.creakLv = lv;
                    a?.creak(lv);
                    if (lv >= 4)
                        buzz(6);
                }
            }
            else
                f.creakLv = 0;
            if (s.phase !== f.prevPhase) {
                if (s.phase === 'playing' && f.prevPhase === 'ready') {
                    f.blast = .3;
                    f.wasInLane = true;
                }
                if (s.phase === 'goal') {
                    a?.goal();
                    f.shake = Math.min(1, f.shake + .5);
                    buzz([30, 40, 60]);
                }
                else if (s.phase === 'lost') {
                    a?.drain();
                    f.shake = Math.min(1, f.shake + .32);
                    buzz(25);
                }
                else if (s.phase === 'over')
                    a?.over();
                else if (s.phase === 'ready' && (f.prevPhase === 'lost' || f.prevPhase === 'goal'))
                    f.drop = .6;
                f.prevPhase = s.phase;
            }
        };
        const active = () => {
            const s = sim.current, f = fx.current;
            return s.phase === 'playing' || s.phase === 'goal' || s.phase === 'lost'
                || input.current.charge || s.plunger > .002 || s.plungerSnap > .002 || s.defJoin > 0
                || f.shake > 0 || f.drop > 0 || f.keeper > 0 || f.blast > 0 || f.pop > 0
                || f.def[0] > 0 || f.def[1] > 0 || f.def[2] > 0
                || input.current.left || input.current.right || s.left > .004 || s.right > .004;
        };
        const frame = (now: number) => {
            raf = 0;
            if (disposed || document.hidden)
                return;
            const dt = last ? Math.min(.1, (now - last) / 1000) : 0;
            last = now;
            if (!pausedRef.current) {
                stepPinball(sim.current, input.current, dt);
                events(dt);
            }
            if (now - lastDraw >= interval - 1 || pausedRef.current || shown !== sim.current.phase) {
                draw(c, sim.current, cache, fx.current, scale, now);
                update();
                lastDraw = now;
            }
            if (!pausedRef.current && active())
                raf = requestAnimationFrame(frame);
        };
        const start = () => { if (disposed || document.hidden || raf)
            return; last = 0; lastDraw = 0; raf = requestAnimationFrame(frame); };
        wake.current = start;
        // Dev-only probe hook (stripped from production builds): lets headless
        // tests inspect the sim and seed states like the defender ramp.
        if (process.env.NODE_ENV !== 'production')
            (window as unknown as { __pinballSim?: { current: PinballState } | null }).__pinballSim = sim;
        const resize = () => {
            const rect = host.getBoundingClientRect(), width = Math.max(1, Math.min(rect.width, rect.height * 400 / 660));
            const dpr = Math.min(devicePixelRatio || 1, 1.5);
            el.style.width = `${width}px`;
            el.style.height = `${width * 660 / 400}px`;
            el.width = Math.round(width * dpr);
            el.height = Math.round(width * 660 / 400 * dpr);
            scale = el.width / 400;
            // The page-wide scene repaints only here — never per frame.
            const bel = backdrop.current;
            if (bel) {
                const br = bel.getBoundingClientRect();
                if (br.width >= 1 && br.height >= 1) {
                    bel.width = Math.round(br.width * dpr);
                    bel.height = Math.round(br.height * dpr);
                    const bc = bel.getContext('2d');
                    if (bc) {
                        bc.setTransform(dpr, 0, 0, dpr, 0, 0);
                        scene(bc, br.width, br.height);
                        // The table's long sunset shadow lives on the page,
                        // where it can stretch across the sand beyond the
                        // play canvas edge: three offset silhouettes fake a
                        // soft penumbra toward the lower left.
                        const cr = el.getBoundingClientRect();
                        const ox = cr.left - br.left, oy = cr.top - br.top, ts = cr.width / 400;
                        const rimPts = [[4, 8], [372, 8], [372, 607], [356, 629], [20, 629], [4, 607]].map(([x, y]) => { const q = project(x, y); return [ox + q.x * ts, oy + q.y * ts]; });
                        bc.fillStyle = '#5c3a26';
                        for (const [sx, sy, alpha] of [[-34, 16, .05], [-22, 10, .06], [-11, 5, .07]]) {
                            bc.globalAlpha = alpha;
                            bc.beginPath();
                            rimPts.forEach(([x, y], i) => i ? bc.lineTo(x + sx * ts, y + sy * ts) : bc.moveTo(x + sx * ts, y + sy * ts));
                            bc.closePath();
                            bc.fill();
                        }
                        bc.globalAlpha = 1;
                    }
                }
            }
            draw(c, sim.current, cache, fx.current, scale, performance.now());
            start();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();
        // Capture phase: the island app behind the modal focuses/handles keys
        // and stops their propagation, so bubble listeners starve. Capture at
        // window always fires first; we also stop game keys from leaking down.
        const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space', 'Enter', 'KeyP'];
        const down = (e: KeyboardEvent) => {
            audio.current?.unlock();
            if ((e.code === 'Space' || e.code === 'Enter') && e.target instanceof HTMLElement && e.target.closest('button')) return;
            if (GAME_KEYS.includes(e.code)) {
                e.preventDefault();
                e.stopPropagation();
            } if (e.code === 'KeyP' && !e.repeat) {
            pause(!pausedRef.current);
            return;
        } if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
            // First press with a card up only dismisses it (arm); the press
            // consumes itself — its keyup finds no charge to release, so the
            // SAME key can never both dismiss and fire.
            if (armedRef.current)
                beginCharge();
            else
                arm();
            return;
        } keys.current.add(e.code); syncInput(); start(); };
        const up = (e: KeyboardEvent) => { if (GAME_KEYS.includes(e.code) && !(e.target instanceof HTMLElement && e.target.closest('button')))
            e.stopPropagation(); if (e.code === 'Space' || e.code === 'Enter')
            endCharge(); keys.current.delete(e.code); syncInput(); };
        const hidden = () => { if (document.hidden) {
            cancelAnimationFrame(raf);
            raf = 0;
            last = 0;
            pause(true);
        }
        else
            start(); };
        const blur = () => pause(true);
        window.addEventListener('keydown', down, true);
        window.addEventListener('keyup', up, true);
        window.addEventListener('blur', blur);
        document.addEventListener('visibilitychange', hidden);
        return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); window.removeEventListener('keydown', down, true); window.removeEventListener('keyup', up, true); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden); pointers.current.clear(); keys.current.clear(); wake.current = () => { }; cache.width = cache.height = 0; audio.current?.dispose(); audio.current = null; if (process.env.NODE_ENV !== 'production')
            (window as unknown as { __pinballSim?: { current: PinballState } | null }).__pinballSim = null; };
        // Simulation and input live in refs: React only changes at game-state boundaries.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const flipper = (side: 'left' | 'right') => ({ onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => { e.preventDefault(); audio.current?.unlock(); e.currentTarget.setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, side); syncInput(); wake.current(); }, onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => { pointers.current.delete(e.pointerId); syncInput(); }, onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => { pointers.current.delete(e.pointerId); syncInput(); }, onLostPointerCapture: (e: React.PointerEvent<HTMLButtonElement>) => { pointers.current.delete(e.pointerId); syncInput(); } });
    return <section className={styles.game} aria-label="Futbol Pinball">
  <canvas ref={backdrop} className={styles.backdrop} aria-hidden="true"/>
  <header className={styles.header}><BackButton className={`pixel-btn ${styles.icon}`} onBack={() => { playClick(); onExit(); }}/><div><h1>Futbol Pinball</h1></div><button className={`pixel-btn ${styles.icon}`} onClick={() => { playClick(); pause(!pausedRef.current); }} aria-label={paused ? 'Resume game' : 'Pause game'}>{paused ? '▶' : 'Ⅱ'}</button></header>
  <div className={styles.hud}><div><small>SCORE</small><span ref={score}>0000</span></div><div><small>GOALS</small><span ref={goals}>0</span></div><div><small>BALLS LEFT</small><span ref={balls}>3</span></div></div>
  <div className={styles.table} ref={wrap}><canvas ref={canvas} aria-label="Pinball pitch with two flippers, three defenders, a goalkeeper, and a launch lane on the right"/></div>
  <footer className={styles.controls}><button className="pixel-btn" {...flipper('left')} aria-label="Left flipper" disabled={paused}><span>↗</span> LEFT</button>{armed && phase === 'ready' && !paused
        ? <button className={`pixel-btn ${styles.primary}`} onPointerDown={e => { e.preventDefault(); audio.current?.unlock(); e.currentTarget.setPointerCapture(e.pointerId); beginCharge(); }} onPointerUp={endCharge} onPointerCancel={cancelCharge} onClick={e => { if (e.detail === 0) { playClick(); launch(); } }} aria-label="Launch ball — hold to pull the plunger back">LAUNCH <span>↗</span></button>
        : <div className={styles.keyHint}>TIME YOUR TAPS<br /><small>← → / A D · SPACE LAUNCHES</small></div>}<button className="pixel-btn" {...flipper('right')} aria-label="Right flipper" disabled={paused}>RIGHT <span>↖</span></button></footer>
  {(paused || (phase !== 'playing' && !armed)) && <div className={`${styles.overlay}${charging ? ` ${styles.dimmed}` : ''}`} aria-hidden={charging}><div className={styles.card} role="status">
   <small>{paused ? 'TAKE A BREATHER' : phase === 'goal' ? 'THROUGH THE KEEPER' : phase === 'over' ? 'FULL TIME' : 'ISLAND CUP'}</small>
   <h2>{paused ? 'Game paused' : phase === 'goal' ? 'GOAL!' : phase === 'lost' ? 'One more chance' : phase === 'over' ? `${sim.current.goals} ${sim.current.goals === 1 ? 'goal' : 'goals'}.` : played ? 'Ready for the next ball?' : 'A little football. A little pinball.'}</h2>
   <p>{paused ? 'Your ball will be right where you left it.' : phase === 'goal' ? `+500 points${Math.min(3, 1 + sim.current.goals) > sim.current.defs ? ' — another defender is coming on!' : ''}` : phase === 'lost' ? (sim.current.balls ? 'Get ready to launch again.' : 'That was your last ball.') : phase === 'over' ? `You scored ${sim.current.score} points. Can you beat it?` : played ? 'Step up — tap LAUNCH to fire over the top, short-hold to sneak in low, long-hold for the monster blast.' : 'Slip one past the keeper — every goal calls another defender on. Step up, then tap LAUNCH (or Space): tap fires over the top, a short hold sneaks the ball in low through the side gate, a long hold charges a monster blast. Three balls.'}</p>
   {paused ? <button className={`pixel-btn ${styles.primary}`} onClick={() => { playClick(); pause(false); }}>Back to the pitch</button> : (phase === 'ready' || phase === 'over') ? <button className={`pixel-btn ${styles.primary}`} onClick={() => { playClick(); arm(); }}>{phase === 'over' ? 'Play again' : 'Step up'} <span>↗</span></button> : null}
  </div></div>}
 </section>;
}
