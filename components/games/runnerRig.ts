// Self-contained low-poly assets for BREAKAWAY RUN — an articulated footballer rig
// (matching the app's blocky NPC proportions + running gait), a white run-dust puff
// system (mirrors BabylonStage's "dropDust"), a Telstar soccer-ball DynamicTexture,
// and a grass-with-painted-lines DynamicTexture that scrolls as one surface.
//
// Everything here creates meshes/textures ONCE. The caller pools + recycles them; a
// single scene.dispose() on unmount frees the lot (no per-frame allocation, no leak).
import * as B from "@babylonjs/core";

/* ── kit material bundle handed to the rig builder ─────────────────────────── */
export interface Kit {
  shirt: B.Material;
  shorts: B.Material;
  socks: B.Material;
  skin: B.Material;
  boot: B.Material;
  hair: B.Material;
}

/* ── an articulated humanoid: joint nodes the gait/pose fns rotate ─────────── */
export interface Rig {
  root: B.TransformNode; // ground node — caller positions this
  torso: B.TransformNode; // pelvis root (twists under the chest)
  chest: B.TransformNode; // upper body, pivots at the waist
  head: B.TransformNode;
  thighL: B.TransformNode;
  thighR: B.TransformNode;
  shinL: B.TransformNode;
  shinR: B.TransformNode;
  armL: B.TransformNode;
  armR: B.TransformNode;
  foreL: B.TransformNode;
  foreR: B.TransformNode;
}

// One blocky footballer, ~1.8 m tall, proportions echoing BabylonStage's buildNpc
// (pelvis root → waist-pivoting chest → neck/head, thigh→shin→foot, arm→forearm).
// `shadowMat` drops the soft contact disc every character in the app wears.
export function buildFootballer(scene: B.Scene, kit: Kit, shadowMat: B.Material): Rig {
  const seg = (w: number, h: number, d: number, m: B.Material, parent: B.TransformNode, y = 0, x = 0, z = 0) => {
    const bx = B.MeshBuilder.CreateSphere("rigpart", { diameter: 1, segments: 12 }, scene);
    const positions = bx.getVerticesData(B.VertexBuffer.PositionKind)!;
    for (let i = 0; i < positions.length; i++) positions[i] = Math.sign(positions[i]) * Math.pow(Math.abs(positions[i]) * 2, 0.48) * 0.5;
    const normals: number[] = [];
    B.VertexData.ComputeNormals(positions, bx.getIndices()!, normals);
    bx.updateVerticesData(B.VertexBuffer.PositionKind, positions);
    bx.updateVerticesData(B.VertexBuffer.NormalKind, normals);
    bx.scaling.set(w, h, d);
    bx.material = m;
    bx.parent = parent;
    bx.position.set(x, y, z);
    bx.isPickable = false;
    return bx;
  };

  const root = new B.TransformNode("footballer", scene);

  // pelvis / torso root
  const torso = new B.TransformNode("f_pelvis", scene);
  torso.parent = root;
  torso.position.set(0, 0.92, 0);
  seg(0.42, 0.26, 0.30, kit.shorts, torso, 0.02); // hips (shorts)

  // chest pivots at the waist so the body can lean/twist as a unit
  const chest = new B.TransformNode("f_chest", scene);
  chest.parent = torso;
  chest.position.set(0, 0.14, 0);
  seg(0.5, 0.5, 0.30, kit.shirt, chest, 0.28); // chest (shirt)
  seg(0.56, 0.20, 0.32, kit.shirt, chest, 0.48); // shoulders

  // neck + head
  const head = new B.TransformNode("f_head", scene);
  head.parent = chest;
  head.position.set(0, 0.62, 0);
  seg(0.14, 0.12, 0.14, kit.skin, head, 0); // neck
  seg(0.34, 0.34, 0.34, kit.skin, head, 0.26); // head
  seg(0.36, 0.18, 0.36, kit.hair, head, 0.38);
  seg(0.035, 0.035, 0.025, kit.hair, head, 0.28, -0.075, 0.174);
  seg(0.035, 0.035, 0.025, kit.hair, head, 0.28, 0.075, 0.174);
  seg(0.065, 0.045, 0.07, kit.skin, head, 0.22, 0, 0.18); // hair cap

  // arms (pivot at the shoulder) → forearm + hand
  const mkArm = (sx: number) => {
    const arm = new B.TransformNode("f_arm", scene);
    arm.parent = chest;
    arm.position.set(sx * 0.32, 0.5, 0);
    seg(0.16, 0.36, 0.18, kit.shirt, arm, -0.17); // upper arm (sleeve)
    const fore = new B.TransformNode("f_fore", scene);
    fore.parent = arm;
    fore.position.set(0, -0.36, 0);
    seg(0.14, 0.34, 0.16, kit.skin, fore, -0.16); // forearm
    seg(0.16, 0.14, 0.18, kit.skin, fore, -0.36); // hand
    return { arm, fore };
  };
  const aL = mkArm(-1), aR = mkArm(1);

  // legs (pivot at the hip) → shin → foot
  const mkLeg = (sx: number) => {
    const thigh = new B.TransformNode("f_thigh", scene);
    thigh.parent = torso;
    thigh.position.set(sx * 0.13, -0.02, 0);
    seg(0.20, 0.44, 0.22, kit.shorts, thigh, -0.13); // upper thigh (shorts)
    seg(0.17, 0.26, 0.19, kit.skin, thigh, -0.36); // lower thigh (skin)
    const shin = new B.TransformNode("f_shin", scene);
    shin.parent = thigh;
    shin.position.set(0, -0.46, 0);
    seg(0.16, 0.44, 0.18, kit.socks, shin, -0.20); // shin (socks)
    const foot = new B.TransformNode("f_foot", scene);
    foot.parent = shin;
    foot.position.set(0, -0.44, 0);
    seg(0.17, 0.11, 0.34, kit.boot, foot, -0.04, 0, 0.09); // boot
    return { thigh, shin };
  };
  const lL = mkLeg(-1), lR = mkLeg(1);

  // soft contact blob under the feet (the app's AO substitute)
  const blob = B.MeshBuilder.CreateDisc("rigblob", { radius: 0.5, tessellation: 16 }, scene);
  blob.rotation.x = Math.PI / 2;
  blob.position.y = 0.02;
  blob.material = shadowMat;
  blob.parent = root;
  blob.isPickable = false;

  return {
    root, torso, chest, head,
    thighL: lL.thigh, thighR: lR.thigh,
    shinL: lL.shin, shinR: lR.shin,
    armL: aL.arm, armR: aR.arm,
    foreL: aL.fore, foreR: aR.fore,
  };
}

// Sprinting gait, scaled by `run` (0 = rest, 1 = full sprint). `phase` is the stride
// clock the caller advances by ground covered so cadence tracks speed. `jump` (0..1)
// tucks the legs mid-air. Pure scalar maths — zero allocations per frame.
export function runGait(rig: Rig, phase: number, run: number, jump = 0): void {
  const r = Math.max(0, Math.min(1, run));
  const p = phase;
  const swL = Math.sin(p), swR = Math.sin(p + Math.PI);
  const amp = 0.95 * r * (1 - jump * 0.5);

  rig.thighL.rotation.x = swL * amp + jump * 0.7;
  rig.thighR.rotation.x = swR * amp + jump * 0.7;
  // knees fold on the recovery (leg swinging forward/up)
  rig.shinL.rotation.x = -(Math.max(0, -swL) * 1.5 * r + 0.12 * r + jump * 0.9);
  rig.shinR.rotation.x = -(Math.max(0, -swR) * 1.5 * r + 0.12 * r + jump * 0.9);
  // arms counter-pump the legs, elbows carried bent
  rig.armL.rotation.x = -swL * 0.8 * r;
  rig.armR.rotation.x = -swR * 0.8 * r;
  rig.foreL.rotation.x = -0.7 * r;
  rig.foreR.rotation.x = -0.7 * r;
  // forward drive lean + counter-rotating pelvis / chest, gentle head stabilise
  rig.chest.rotation.x = 0.17 * r;
  rig.chest.rotation.y = swL * 0.13 * r;
  rig.torso.rotation.y = -swL * 0.1 * r;
  rig.head.rotation.x = -0.06 * r;
}

// A defender braced to block: feet planted, knees soft, arms spread wide, slight crouch.
// Set once at spawn (idle) — no per-frame cost.
export function bracePose(rig: Rig): void {
  rig.thighL.rotation.x = 0.18;
  rig.thighR.rotation.x = -0.18;
  rig.shinL.rotation.x = -0.28;
  rig.shinR.rotation.x = -0.28;
  rig.chest.rotation.x = 0.12;
  rig.chest.rotation.y = 0;
  rig.torso.rotation.y = 0;
  rig.armL.rotation.z = 0.7; // arms out to the sides
  rig.armR.rotation.z = -0.7;
  rig.armL.rotation.x = -0.25;
  rig.armR.rotation.x = -0.25;
  rig.foreL.rotation.x = -0.5;
  rig.foreR.rotation.x = -0.5;
}

// Low-poly orange training cone with a white reflective stripe + square base. One node,
// pooled by the caller. Built from cheap cylinders/boxes so a set of them is mobile-safe.
export function buildCone(scene: B.Scene, coneMat: B.Material, stripeMat: B.Material): B.TransformNode {
  const r = new B.TransformNode("cone", scene);
  const body = B.MeshBuilder.CreateCylinder("cnb", { diameterTop: 0.05, diameterBottom: 0.5, height: 0.62, tessellation: 10 }, scene);
  body.material = coneMat; body.position.y = 0.31; body.parent = r; body.isPickable = false;
  const stripe = B.MeshBuilder.CreateCylinder("cns", { diameterTop: 0.28, diameterBottom: 0.36, height: 0.12, tessellation: 10 }, scene);
  stripe.material = stripeMat; stripe.position.y = 0.34; stripe.parent = r; stripe.isPickable = false;
  const base = B.MeshBuilder.CreateBox("cnbase", { width: 0.6, height: 0.06, depth: 0.6 }, scene);
  base.material = coneMat; base.position.y = 0.03; base.parent = r; base.isPickable = false;
  return r;
}

// Clean, UNIFORM Telstar soccer ball baked onto one shared DynamicTexture (never
// .clone()'d). The 12 black pentagons sit at the true dodecahedral positions — one at each
// POLE plus two RINGS of five (upper + lower, offset a half-step) — and each spot's
// HORIZONTAL radius is divided by sin(latitude) to cancel the equirectangular stretch, so
// every panel reads as an evenly-sized, round-shouldered pentagon on the spinning sphere
// (no polar smearing, no lumpy/random sizes). Built once, shared by hero + coins.
export function buildBallTexture(scene: B.Scene): B.DynamicTexture {
  // Spherical Voronoi cells of the icosahedron's vertices and face centres form
  // twelve pentagons and twenty hexagons, including correctly shaped polar panels.
  const width = 1024, height = 512;
  const tex = new B.DynamicTexture("ballPanels", { width, height }, scene, true);
  const c = tex.getContext() as unknown as CanvasRenderingContext2D;
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices: B.Vector3[] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    vertices.push(new B.Vector3(0, a, b * phi).normalize(), new B.Vector3(a, b * phi, 0).normalize(), new B.Vector3(b * phi, 0, a).normalize());
  }
  const centres = [...vertices];
  // Use the shortest nonzero edge; vertex ordering is intentionally irrelevant.
  const edgeLength = Math.min(...vertices.slice(1).map(v => B.Vector3.DistanceSquared(vertices[0], v)));
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
    if ([B.Vector3.DistanceSquared(vertices[i], vertices[j]), B.Vector3.DistanceSquared(vertices[j], vertices[k]), B.Vector3.DistanceSquared(vertices[k], vertices[i])].every(d => Math.abs(d - edgeLength) < 0.001)) {
      centres.push(vertices[i].add(vertices[j]).add(vertices[k]).normalize());
    }
  }
  const pixels = c.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const latitude = y / height * Math.PI;
    for (let x = 0; x < width; x++) {
      const longitude = x / width * Math.PI * 2;
      const vx = Math.sin(latitude) * Math.cos(longitude), vy = Math.cos(latitude), vz = Math.sin(latitude) * Math.sin(longitude);
      let best = -2, second = -2, cell = 0;
      for (let i = 0; i < centres.length; i++) {
        const dot = vx * centres[i].x + vy * centres[i].y + vz * centres[i].z;
        if (dot > best) { second = best; best = dot; cell = i; } else if (dot > second) second = dot;
      }
      const seam = best - second < 0.004;
      const color = seam ? [91, 111, 111] : cell < 12 ? [20, 35, 47] : [239, 241, 228];
      const index = (y * width + x) * 4;
      const grain = ((x * 17 + y * 31) % 5) - 2;
      pixels.data[index] = color[0] + grain; pixels.data[index + 1] = color[1] + grain; pixels.data[index + 2] = color[2] + grain; pixels.data[index + 3] = 255;
    }
  }
  c.putImageData(pixels, 0, 0); tex.update(); tex.anisotropicFilteringLevel = 4;
  return tex;
}

// Grass with the yard-lines, touch-lines and lane guides PAINTED IN — one canvas that
// tiles down the corridor (vScale) so the markings scroll toward the camera fused to the
// turf. No emissive → chalk, not neon. uScale stays 1 so the two touch-lines land at the
// real corridor edges (±4.1 of a 26-wide ground) instead of repeating across the width.
export function buildPitchTexture(scene: B.Scene): B.DynamicTexture {
  const S = 512;
  const tex = new B.DynamicTexture("pitchTex", { width: S, height: S }, scene, true);
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;

  // mowed lanes: alternating light/dark green bands across the width
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = i % 2 ? "#3c6d34" : "#35622f";
    ctx.fillRect((i * S) / bands, 0, S / bands + 1, S);
  }
  // grass speckle for low-poly texture
  for (let n = 0; n < 3200; n++) {
    const x = Math.random() * S, y = Math.random() * S;
    ctx.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(x, y, 2, 2);
  }

  const chalkH = (y: number) => {
    for (let x = 0; x < S; x += 1) {
      ctx.fillStyle = `rgba(238,242,236,${0.72 + Math.random() * 0.28})`;
      const h = 6 + Math.random() * 1.8;
      ctx.fillRect(x, y - h / 2, 1, h);
    }
  };

  // The ONLY markings: a set of clean, evenly-spaced HORIZONTAL cross-lines that run
  // straight across the running lane (side to side, perpendicular to travel) and scroll
  // toward the ball for the speed read. NOTHING lengthwise — no lane dividers, no
  // side/touch-lines, no stray white lines. Placed at even fractions of the tile so they
  // stay evenly spaced across the seamless wrap as the turf scrolls.
  const CROSS = 3;
  for (let k = 0; k < CROSS; k++) chalkH((S * (k + 0.5)) / CROSS);

  tex.update();
  tex.wrapU = B.Texture.WRAP_ADDRESSMODE;
  tex.wrapV = B.Texture.WRAP_ADDRESSMODE;
  return tex;
}

// White run-dust: cheap pooled puffs kicked up behind the feet. Mirrors BabylonStage's
// "dropDust" — soft radial-gradient sprite, matte alpha (not additive), slight rise.
// emitter is a shared Vector3 the caller repositions to the heels each frame.
export function buildDust(scene: B.Scene, emitter: B.Vector3): B.ParticleSystem {
  const t = new B.DynamicTexture("runDustTex", { width: 16, height: 16 }, scene, false);
  const g = (t.getContext() as unknown as CanvasRenderingContext2D).createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.6, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  const c = t.getContext() as unknown as CanvasRenderingContext2D;
  c.fillStyle = g;
  c.fillRect(0, 0, 16, 16);
  t.update();

  const fx = new B.ParticleSystem("runDust", 90, scene); // cap 90 — Chromebook-safe
  fx.particleTexture = t;
  fx.emitter = emitter;
  fx.minEmitBox = new B.Vector3(-0.22, 0, -0.18);
  fx.maxEmitBox = new B.Vector3(0.22, 0.06, 0.18);
  fx.color1 = new B.Color4(1, 1, 1, 0.55);
  fx.color2 = new B.Color4(0.94, 0.94, 0.92, 0.42);
  fx.colorDead = new B.Color4(0.92, 0.92, 0.9, 0);
  fx.minSize = 0.16;
  fx.maxSize = 0.44;
  fx.minLifeTime = 0.32;
  fx.maxLifeTime = 0.66;
  fx.emitRate = 0; // driven per-frame by speed
  fx.blendMode = B.ParticleSystem.BLENDMODE_STANDARD;
  fx.gravity = new B.Vector3(0, 1, 0); // slight cartoon rise
  fx.direction1 = new B.Vector3(-0.35, 0.25, -1.4); // drift toward the camera (world flows -Z past the runner)
  fx.direction2 = new B.Vector3(0.35, 0.8, -2.4);
  fx.minEmitPower = 0.4;
  fx.maxEmitPower = 1.2;
  fx.updateSpeed = 1 / 60;
  fx.disposeOnStop = false;
  return fx;
}

/** Grounded anticipation, not lateral motion: the visual still matches its collision lane. */
export function defenderPose(rig: Rig, time: number, approach: number, look: number) {
  const breath = Math.sin(time * 3.2);
  const ready = Math.max(0, Math.min(1, approach));
  rig.torso.position.y = 0.92 + breath * 0.018 - ready * 0.035;
  rig.chest.rotation.x = 0.12 + ready * 0.13;
  rig.chest.rotation.y = Math.sin(time * 2) * 0.035;
  rig.head.rotation.y = Math.max(-0.4, Math.min(0.4, look));
  rig.armL.rotation.z = 0.64 + ready * 0.18 + breath * 0.045;
  rig.armR.rotation.z = -0.64 - ready * 0.18 - breath * 0.045;
  rig.foreL.rotation.x = -0.5 - ready * 0.16;
  rig.foreR.rotation.x = -0.5 - ready * 0.16;
  rig.thighL.rotation.x = 0.18 + breath * 0.025;
  rig.thighR.rotation.x = -0.18 - breath * 0.025;
  rig.shinL.rotation.x = -0.28 - ready * 0.12;
  rig.shinR.rotation.x = -0.28 - ready * 0.12;
}

/** A recognisable side-on slide with one straight leg and one tucked knee. */
export function slidePose(rig: Rig, time: number, approach: number) {
  rig.torso.position.y = 0.48 + Math.sin(time * 5) * 0.015;
  rig.torso.rotation.z = -1.12;
  rig.chest.rotation.x = -0.18;
  rig.head.rotation.z = 0.15;
  rig.thighL.rotation.x = -0.2;
  rig.thighR.rotation.x = 0.95;
  rig.shinL.rotation.x = -0.05;
  rig.shinR.rotation.x = -1.2;
  rig.armL.rotation.z = 1.25;
  rig.armR.rotation.z = -0.3;
  rig.foreL.rotation.x = -0.3;
  rig.foreR.rotation.x = -0.8;
  rig.chest.rotation.y = Math.min(1, Math.max(0, approach)) * 0.14;
}

/** Keeper plants, pushes off, then stretches into the covered side. */
export function keeperPose(rig: Rig, time: number, dive: number, side: number) {
  defenderPose(rig, time, dive, 0);
  rig.torso.position.y = 0.92 - Math.sin(dive * Math.PI) * 0.15 + dive * 0.18;
  rig.torso.rotation.z = side * dive * 0.85;
  rig.armL.rotation.z = 0.7 + dive * 1.05;
  rig.armR.rotation.z = -0.7 - dive * 1.05;
  rig.foreL.rotation.x = -0.5 * (1 - dive);
  rig.foreR.rotation.x = -0.5 * (1 - dive);
  rig.thighL.rotation.x = 0.18 + dive * 0.3;
  rig.thighR.rotation.x = -0.18 - dive * 0.2;
}
