"use client";
import {BackButton} from '../BackButton';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import { useEffect, useRef, useState } from "react";
import * as B from "@babylonjs/core";
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {Icon} from '../Icon';
import { GameProps } from "./types";
import styles from "./BreakawayRun.module.css";
import { buildFootballer, bracePose, defenderPose, slidePose, keeperPose, buildBallTexture, buildDust, buildCone, type Rig, type Kit } from "./runnerRig";
import { JUMP_V, stepJump, smoothLane, crossesPickup, goalPoints } from "./runnerPhysics";
import { districtAt, DISTRICT_LENGTH } from "./runnerRoute";
import { createRunnerAudio } from "./runnerAudio";
import {isSoundEnabled} from "@/lib/games/sound";
import { buildRunnerScenery } from "./runnerScenery";

// Three-lane soccer arcade: survive tackles, build goal streaks, and boost through the net.
const BEST_KEY = "fi.game.runner.best";

const LANE_X = [-2.4, 0, 2.4];
const SPAWN_Z = 68;
const DESPAWN_Z = -12;
const PLAYER_PLANE = 0;
const OBSTACLE_POOL = 7;
const COIN_POOL = 10;

const BASE_SPEED = 15;
const MAX_SPEED = 32;
const RAMP = 0.28;

const CLEAR_H = 1.0; // ball bottom must be above this to hurdle a low tackle / cone

const HERO_R = 0.48; // BIG hero ball radius (diameter 1.4)
const SQUASH_DUR = 0.32; // squash-and-stretch duration on a ground contact
const GW = 7.6, GH = 2.55; // BIG goal: full-corridor width / height
const COIN_BOOST = 0.34; // boost charge per coin
const DODGE_BOOST = 0.12; // boost charge per obstacle survived
const BOOST_TIME = 1.4; // seconds of active boost per fire
const GREEN = new B.Color3(0.224, 1.0, 0.431); // #39FF6E live-match green

type ObType = "defender" | "tackle" | "cone";

interface Obstacle {
  root: B.TransformNode;
  type: ObType;
  lane: number;
  z: number;
  active: boolean;
  checked: boolean;
  smash: number;
}
interface Coin {
  mesh: B.Mesh;
  lane: number;
  z: number;
  active: boolean;
  spin: number;
}

interface World {
  engine: B.Engine;
  scene: B.Scene;
  camera: B.TargetCamera;
  ground: B.Mesh;
  groundTex: B.Texture | null;
  hero: {
    node: B.TransformNode; // world-vertical squash + position (no spin)
    mesh: B.Mesh; // the spinning Telstar sphere
    mat: B.StandardMaterial;
    shadow: B.Mesh;
    x: number;
    lane: number;
    y: number; // jump offset above rest
    vy: number;
    jumping: boolean; // airborne (mid-hop or mid-bounce)
    roll: number;
    rollZ: number;
    boost: number;
    boosting: number;
    squash: number;
    squashMag: number; // impact-scaled squash amount (0..1)
  };
  goal: {
    root: B.TransformNode;
    net: B.Mesh;
    keeper: Rig;
    hint: B.Mesh; // green glow marking the OPEN lane
    hintMat: B.StandardMaterial;
    openLane: number; // 0 or 2 — the scoring lane
    keeperX: number;
    keeperTargetX: number;
    z: number;
    active: boolean;
    busted: boolean;
    checked: boolean;
    cooldown: number;
    netPulse: number;
  };
  smashFx: B.ParticleSystem | null;
  smashEmit: B.Vector3;
  obstacles: Obstacle[];
  coins: Coin[];
  dust: B.ParticleSystem | null;
  dustEmit: B.Vector3;
  landPuff: number;
  speed: number;
  dist: number;
  bonus: number;
  lives: number;
  invulnerable: number;
  streak: number;
  collected: number;
  paused: boolean;
  spawnTimer: number;
  running: boolean;
  elapsed: number;
}

interface Hooks {
  onHud: (score: number, best: number, goals: number, canBoost: boolean, boostPct: number) => void;
  onGoal: (points: number, busted: boolean) => void;
  onSave: () => void;
  onCrash: (score: number, goals: number) => void;
}

export default function BreakawayRun({ onExit }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  const ctrl = useRef<{
    lane: (dir: -1 | 1) => void;
    jump: () => void;
    boost: () => void;
    restart: () => void;
    pause: () => void;
    mute: (value: boolean) => void;
  } | null>(null);

  const [renderError, setRenderError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [phase, setPhase] = useState<"ready" | "playing" | "paused" | "over">("ready");
  const [run, setRun] = useState({ lives: 3, distance: 0, streak: 0, collected: 0, goalLane: -1, goalDistance: 0 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [goals, setGoals] = useState(0);
  const [canBoost, setCanBoost] = useState(false);
  const [boostPct, setBoostPct] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<{ text: string; kind: "goal" | "crash" } | null>(null);
  const [hintOn, setHintOn] = useState(true);
  const [newBest, setNewBest] = useState(false);

  const flashTimer = useRef<number | null>(null);
  const doFlash = (text: string, kind: "goal" | "crash") => {
    setFlash({ text, kind });
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 1100);
  };

  useEffect(() => {
    const sound = createRunnerAudio();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── engine + scene ──────────────────────────────────────────────────────
    // Mobile (coarse pointer) trims the fragment/AA budget hard; desktop stays crisp.
    const coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    // Cap the effective pixel ratio. A retina phone reports DPR 2-3 → rendering at full DPR is
    // 4-9× the fragments = heat. On touch/mobile cap the effective ratio at 1.5 device px (still
    // above CSS 1.0, so it stays crisp); desktop stays sharper at 2.
    const dprCap = coarse ? 1.5 : 2;
    const applyScaling = () => engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, dprCap));
    let engine: B.Engine;
    try {
      // NB: 4th arg adaptToDeviceRatio is FALSE. When true, every engine.resize() RESETS the
      // hardware-scaling level back to the raw devicePixelRatio (documented Babylon behaviour),
      // silently discarding the cap below — on a DPR-3 phone that means ~4× the intended
      // fragments every time the ResizeObserver fires. With it false our cap sticks. We also
      // drop the engine's own MSAA on mobile (2nd arg + options.antialias) — FXAA in the
      // pipeline already covers edges, so stacking MSAA on top is pure mobile heat.
      engine = new B.Engine(canvas, !coarse, { antialias: !coarse, alpha: false, preserveDrawingBuffer: false }, false);
    } catch {
      setRenderError(true);
      return;
    }
    applyScaling();
    const scene = new B.Scene(engine);
    const SKY = new B.Color3(0.66, 0.83, 0.83);
    scene.clearColor = new B.Color4(SKY.r, SKY.g, SKY.b, 1);
    scene.fogMode = B.Scene.FOGMODE_EXP2;
    scene.fogColor = SKY;
    scene.fogDensity = 0.008;
    scene.imageProcessingConfiguration.toneMappingEnabled = false;
    scene.imageProcessingConfiguration.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.0;
    scene.imageProcessingConfiguration.contrast = 1.0;
    const scenery = buildRunnerScenery(scene);

    // chase cam framed so the hero sits LOWER-CENTRE — a treadmill read where the world
    // flows UP the frame toward the fixed ball. Higher + steeper than a flat chase so
    // more incoming field shows above the ball.
    const camera = new B.TargetCamera("chase", new B.Vector3(0, 4.85, -9.3), scene);
    camera.setTarget(new B.Vector3(0, 0.3, 13));
    camera.fov = 0.88;
    camera.minZ = 0.1;
    camera.maxZ = 160;

    const hemi = new B.HemisphericLight("h", new B.Vector3(0.2, 1, 0.1), scene);
    hemi.intensity = 0.6;
    hemi.diffuse = new B.Color3(0.93, 0.96, 0.94);
    hemi.groundColor = new B.Color3(0.34, 0.4, 0.26);
    const key = new B.DirectionalLight("k", new B.Vector3(0.45, -1, 0.45), scene);
    key.intensity = 0.7;
    key.diffuse = new B.Color3(1, 0.91, 0.75);
    key.position.set(-18, 28, -8);
    key.autoUpdateExtends = false;
    key.orthoLeft = -26; key.orthoRight = 26;
    key.orthoTop = 42; key.orthoBottom = -20;
    key.shadowMinZ = 1; key.shadowMaxZ = 100;
    // Shadow-map bandwidth is quadratic in size: mobile drops to 512² (soft PCF hides the
    // lower res at this camera framing), narrow desktop 1024², wide desktop 2048².
    const shadows = new B.ShadowGenerator(coarse ? 512 : canvas.clientWidth < 600 ? 1024 : 2048, key);
    shadows.usePercentageCloserFiltering = true;
    shadows.filteringQuality = B.ShadowGenerator.QUALITY_LOW;
    shadows.bias = 0.0007;
    shadows.normalBias = 0.025;
    shadows.setDarkness(0.45);
    for (const mesh of scenery.shadowCasters) shadows.addShadowCaster(mesh);

    // ── shared material set (kept tiny for mobile) ─────────────────────────────
    const mat = (name: string, c: B.Color3, spec = 0.04) => {
      const m = new B.StandardMaterial(name, scene);
      m.diffuseColor = c;
      m.specularColor = new B.Color3(spec, spec, spec);
      return m;
    };
    const matLine = mat("line", new B.Color3(0.95, 0.97, 0.95));
    matLine.emissiveColor = new B.Color3(0.16, 0.18, 0.16);
    // red kit (defenders)
    const matRed = mat("kitRed", B.Color3.FromHexString("#bc6557"));
    const matRedDk = mat("kitRedDk", B.Color3.FromHexString("#455f57"));
    const matSockRed = mat("sockRed", new B.Color3(0.95, 0.92, 0.9));
    // keeper kit (yellow — pops against the green pitch/trail)
    const matKeeper = mat("kitKeeper", new B.Color3(0.96, 0.82, 0.13));
    const matKeeperDk = mat("kitKeeperDk", new B.Color3(0.24, 0.2, 0.05));
    const matSkin = mat("skin", new B.Color3(0.9, 0.68, 0.5), 0.02);
    const matHairR = mat("hairR", new B.Color3(0.16, 0.12, 0.1));
    const matHairK = mat("hairK", new B.Color3(0.2, 0.14, 0.08));
    const matBoot = mat("boot", new B.Color3(0.09, 0.09, 0.11));
    // ONE shared Telstar texture (never .clone()'d) → hero + coins read as real balls
    const ballTex = buildBallTexture(scene);
    const heroMat = new B.StandardMaterial("hero", scene);
    heroMat.diffuseTexture = ballTex;
    heroMat.diffuseColor = new B.Color3(1, 1, 1);
    heroMat.specularColor = new B.Color3(0.2, 0.2, 0.2); // leather/plastic sheen
    heroMat.specularPower = 96;
    heroMat.emissiveColor = new B.Color3(0.05, 0.05, 0.05);
    const coinMat = new B.StandardMaterial("coinBall", scene);
    coinMat.diffuseTexture = ballTex;
    coinMat.specularColor = new B.Color3(0.35, 0.35, 0.35);
    const matShadow = mat("shadow", new B.Color3(0, 0, 0));
    matShadow.alpha = 0.24;
    matShadow.specularColor = new B.Color3(0, 0, 0);
    // SOFT ball shadow — a feathered radial-gradient alpha blob (dark core smoothly
    // fading to fully transparent; MOST of the texture is the fade so there's no hard
    // rim). Built ONCE (never .clone()'d). Its own dark, unlit, alpha-blended material
    // whose scale + alpha are driven from the ball's height each frame → the shadow
    // grows larger + fainter as the ball rises, tighter + darker near the ground.
    const HERO_SHADOW_ALPHA = 0.2; // darkest (grounded) alpha
    const shTex = new B.DynamicTexture("heroShadowTex", { width: 128, height: 128 }, scene, false);
    shTex.hasAlpha = true;
    {
      const sc = shTex.getContext() as unknown as CanvasRenderingContext2D;
      sc.clearRect(0, 0, 128, 128);
      const g = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0.0, "rgba(6,10,8,0.95)");
      g.addColorStop(0.28, "rgba(6,10,8,0.72)");
      g.addColorStop(0.55, "rgba(6,10,8,0.34)");
      g.addColorStop(0.8, "rgba(6,10,8,0.1)");
      g.addColorStop(1.0, "rgba(6,10,8,0)");
      sc.fillStyle = g;
      sc.fillRect(0, 0, 128, 128);
      shTex.update(false);
    }
    const heroShadowMat = new B.StandardMaterial("heroShadowMat", scene);
    heroShadowMat.diffuseTexture = shTex;
    heroShadowMat.useAlphaFromDiffuseTexture = true;
    heroShadowMat.diffuseColor = new B.Color3(0, 0, 0);
    heroShadowMat.emissiveColor = new B.Color3(0, 0, 0);
    heroShadowMat.specularColor = new B.Color3(0, 0, 0);
    heroShadowMat.disableLighting = true; // unlit dark blob
    heroShadowMat.backFaceCulling = false;
    heroShadowMat.transparencyMode = B.Material.MATERIAL_ALPHABLEND;
    heroShadowMat.alpha = HERO_SHADOW_ALPHA;
    const netTexture = new B.DynamicTexture("runnerNetGrid", { width: 256, height: 128 }, scene, false);
    netTexture.hasAlpha = true;
    const netContext = netTexture.getContext();
    netContext.clearRect(0, 0, 256, 128);
    netContext.strokeStyle = "rgba(235,250,235,0.8)";
    netContext.lineWidth = 1.5;
    for (let x = 0; x <= 256; x += 12) { netContext.beginPath(); netContext.moveTo(x, 0); netContext.lineTo(x, 128); netContext.stroke(); }
    for (let y = 0; y <= 128; y += 12) { netContext.beginPath(); netContext.moveTo(0, y); netContext.lineTo(256, y); netContext.stroke(); }
    netTexture.update();
    const matNet = mat("net", new B.Color3(0.92, 0.95, 0.98));
    matNet.diffuseTexture = netTexture;
    matNet.useAlphaFromDiffuseTexture = true;
    matNet.alpha = 0.75;
    matNet.backFaceCulling = false;
    const matCone = mat("cone", new B.Color3(0.95, 0.42, 0.09), 0.12);
    matCone.emissiveColor = new B.Color3(0.16, 0.06, 0.0);

    const redKit: Kit = { shirt: matRed, shorts: matRedDk, socks: matSockRed, skin: matSkin, hair: matHairR, boot: matBoot };
    const keeperKit: Kit = { shirt: matKeeper, shorts: matKeeperDk, socks: matKeeper, skin: matSkin, hair: matHairK, boot: matBoot };

    // ── ground: one grass plane whose PAINTED chalk texture scrolls forward ─────
    // buildPitchTexture bakes grass + mowing stripes + scrolling yard-lines into ONE
    // DynamicTexture (no side touch-lines). vScale repeats a yard-line every ~10 units
    // and vOffset scrolls the whole painted surface toward the camera fused to the turf.
    const ground = B.MeshBuilder.CreateGround("ground", { width: 8.2, height: 240, subdivisions: 1 }, scene);
    ground.position.z = 98;
    // Quiet, saturated turf supports the illustrated scenery instead of fighting it.
    const turf = new B.StandardMaterial("arcadeTurf", scene);
    turf.diffuseColor = B.Color3.FromHexString("#6c8558");
    turf.specularColor.setAll(0.015);
    const turfAlbedo = new B.DynamicTexture("mownTurf", { width: 256, height: 512 }, scene, true);
    const turfContext = turfAlbedo.getContext();
    turfContext.fillStyle = "#e2efdd"; turfContext.fillRect(0, 0, 256, 512);
    turfContext.fillStyle = "#caddc8"; turfContext.fillRect(0, 256, 256, 256);
    // Fine deterministic grain avoids photo-texture shimmer at a shallow camera angle.
    for (let i = 0; i < 1400; i++) {
      turfContext.fillStyle = i % 2 ? "rgba(255,255,255,0.04)" : "rgba(0,35,20,0.035)";
      turfContext.fillRect((i * 73) % 256, (i * 131) % 512, 1, 2);
    }
    turfAlbedo.update(); turfAlbedo.vScale = 12;
    turf.diffuseTexture = turfAlbedo;
    const turfMaps = [turfAlbedo];
    ground.material = turf;
    ground.receiveShadows = true;
    ground.freezeWorldMatrix(); // the plane never moves (only its texture vOffset scrolls) → skip per-frame matrix recompute
    const groundTex: B.Texture | null = turfAlbedo;

    // ── HERO: big rolling soccer ball. A non-spinning NODE carries position + world-
    // vertical squash; the smooth 32-seg sphere child carries the roll spin. Splitting
    // them keeps the squash-and-stretch aligned to gravity no matter how the ball rolls.
    const heroNode = new B.TransformNode("heroNode", scene);
    const hero = B.MeshBuilder.CreateSphere("hero", { diameter: HERO_R * 2, segments: 56 }, scene);
    hero.material = heroMat;
    shadows.addShadowCaster(hero);
    hero.parent = heroNode;
    heroNode.position.set(0, HERO_R, PLAYER_PLANE);
    const heroShadow = B.MeshBuilder.CreateDisc("heroShadow", { radius: HERO_R * 1.25, tessellation: 28 }, scene);
    heroShadow.rotation.x = Math.PI / 2;
    heroShadow.material = heroShadowMat; // soft feathered blob (scale + alpha driven by ball height)
    heroShadow.position.set(0, 0.02, PLAYER_PLANE);
    // GREEN speed trail is a smooth RIBBON (matches the live-game shot TrailMesh) rebuilt
    // each frame from a rolling position history that recedes with the treadmill — see the
    // trail block below. It curves with the ball's lane-changes + jumps and fades to a soft
    // dissipating tail.

    // ── obstacle pools (defender rig / low tackle / cone) ──────────────────────
    const obstacles: Obstacle[] = [];
    const defRigs: Rig[] = [];
    const tackleRigs: Rig[] = [];
    const tacklePool: B.TransformNode[] = [];
    const conePool: B.TransformNode[] = [];
    for (let i = 0; i < OBSTACLE_POOL; i++) {
      const dr = buildFootballer(scene, redKit, matShadow);
      bracePose(dr);
      for (const mesh of dr.root.getChildMeshes()) if (mesh.name !== "rigblob") shadows.addShadowCaster(mesh, false); // planted defensive stance (set once — cheap)
      dr.root.setEnabled(false);
      defRigs.push(dr);
      const sliding = buildFootballer(scene, redKit, matShadow);
      slidePose(sliding, 0, 0); sliding.root.setEnabled(false);
      tackleRigs.push(sliding); tacklePool.push(sliding.root);
      for (const mesh of sliding.root.getChildMeshes()) if (mesh.name !== "rigblob") shadows.addShadowCaster(mesh, false);
      const c = buildCone(scene, matCone, matLine); c.setEnabled(false); conePool.push(c);
      obstacles.push({ root: defRigs[i].root, type: "defender", lane: 1, z: SPAWN_Z, active: false, checked: false, smash: 0 });
    }
    const rootForType = (i: number, type: ObType) =>
      type === "defender" ? defRigs[i].root : type === "tackle" ? tacklePool[i] : conePool[i];

    // ── coin (football) pool — small soccer balls sharing the ball texture ─────
    const pickupGold = mat("pickupGold", B.Color3.FromHexString("#ffcd55"), 0.25);
    pickupGold.emissiveColor = B.Color3.FromHexString("#b57c16");
    const coins: Coin[] = [];
    for (let i = 0; i < COIN_POOL; i++) {
      const c = B.MeshBuilder.CreateSphere("coin", { diameter: 0.4, segments: 20 }, scene);
      c.material = coinMat;
      const ring = B.MeshBuilder.CreateTorus("pickupRing", { diameter: 0.66, thickness: 0.055, tessellation: 20 }, scene);
      ring.parent = c; ring.rotation.x = Math.PI / 2; ring.material = pickupGold; ring.isPickable = false;
      c.isPickable = false;
      c.setEnabled(false);
      coins.push({ mesh: c, lane: 1, z: SPAWN_Z, active: false, spin: 0 });
    }

    // ── BIG keeper-guarded goal — burst through the LIT open side to break the net ─
    const goalRoot = new B.TransformNode("goal", scene);
    for (const s of [-1, 1]) {
      const post = B.MeshBuilder.CreateBox("gpost", { width: 0.16, height: GH, depth: 0.16 }, scene);
      post.material = matLine; post.position.set(s * GW / 2, GH / 2, 0); post.parent = goalRoot; post.isPickable = false;
    }
    const gbar = B.MeshBuilder.CreateBox("gbar", { width: GW + 0.16, height: 0.16, depth: 0.16 }, scene);
    gbar.material = matLine; gbar.position.set(0, GH, 0); gbar.parent = goalRoot; gbar.isPickable = false;
    // back net across the full mouth — tears open on a successful burst
    const net = B.MeshBuilder.CreatePlane("gnet", { width: GW, height: GH }, scene);
    net.material = matNet; net.position.set(0, GH / 2, 0.6); net.parent = goalRoot; net.isPickable = false;
    // green glow bar marking the OPEN lane (repositioned per goal)
    const hintMat = new B.StandardMaterial("goalHint", scene);
    hintMat.emissiveColor = GREEN.clone();
    hintMat.diffuseColor = new B.Color3(0, 0, 0);
    hintMat.disableLighting = true;
    hintMat.alpha = 0.5;
    const hint = B.MeshBuilder.CreateBox("goalHintBar", { width: 1.9, height: GH, depth: 0.06 }, scene);
    hint.material = hintMat; hint.position.set(LANE_X[0], GH / 2, 0.55); hint.parent = goalRoot; hint.isPickable = false;
    // the KEEPER — articulated footballer rig in a yellow keeper kit, braced, covering
    const keeper = buildFootballer(scene, keeperKit, matShadow);
    bracePose(keeper);
    for (const mesh of keeper.root.getChildMeshes()) if (mesh.name !== "rigblob") shadows.addShadowCaster(mesh, false);
    keeper.root.parent = goalRoot;
    keeper.root.rotation.y = Math.PI; // face the incoming ball
    keeper.root.position.set(0, 0, 0.3);
    goalRoot.setEnabled(false);

    // ── run-dust ParticleSystem (pooled, like the app's dropDust) ──────────────
    const dustEmit = new B.Vector3(0, 0, 0);
    let dust: B.ParticleSystem | null = null;
    const ensureDust = () => {
      if (dust) return dust;
      dust = buildDust(scene, dustEmit);
      return dust;
    };

    // ── GREEN ball-trail RIBBON (#39FF6E) — matches the live-game shot TrailMesh look ──
    // A vanilla TrailMesh can't work here: the ball is FIXED in world Z (treadmill), so a
    // trail tracing its absolutePosition collapses to a stub. Instead we keep a rolling
    // HISTORY of the ball's position and, each frame, slide every older point BACKWARD
    // (−Z) with the world (exactly like the obstacles recede) then plant a fresh head at
    // the ball. A smooth updatable RIBBON is rewritten in place from that history each
    // frame: full width at the ball, tapering to a point at the tail, and it naturally
    // CURVES with the recorded lane-changes + jumps. State-coloured emissive (WHITE while
    // dribbling → PURPLE airborne → GREEN on boost) + an opacity gradient fades it HARD
    // toward the tail (soft dissipating end); it sits LOW so a jump can't curtain the view.
    // Fixed-length history → we update vertices in place, never alloc.
    const TRAIL_N = 24; // history stations along the ribbon
    const TRAIL_W = 0.34; // ribbon full width at the head (~ball diameter)
    const trailRestY = HERO_R * 0.3;
    const trailHist: B.Vector3[] = [];
    const trailLeft: B.Vector3[] = [];
    const trailRight: B.Vector3[] = [];
    for (let i = 0; i < TRAIL_N; i++) {
      trailHist.push(new B.Vector3(0, trailRestY, PLAYER_PLANE - 0.15));
      trailLeft.push(new B.Vector3());
      trailRight.push(new B.Vector3());
    }
    // head→tail opacity gradient (4×256): bright + defined at the head, STEEP fade so the
    // back half is faint haze and the very tail barely registers (never .clone()'d).
    const trailFadeTex = new B.DynamicTexture("runnerTrailFade", { width: 4, height: 256 }, scene, false);
    trailFadeTex.hasAlpha = true;
    {
      const c = trailFadeTex.getContext() as unknown as CanvasRenderingContext2D;
      c.clearRect(0, 0, 4, 256);
      const g = c.createLinearGradient(0, 0, 0, 256); // v=0 (top) = head at the ball
      g.addColorStop(0.0, "rgba(255,255,255,0.92)");
      g.addColorStop(0.12, "rgba(255,255,255,0.85)");
      g.addColorStop(0.4, "rgba(255,255,255,0.3)");
      g.addColorStop(0.7, "rgba(255,255,255,0.08)");
      g.addColorStop(1.0, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 4, 256);
      trailFadeTex.update(false);
    }
    const trailMat = new B.StandardMaterial("runnerTrailMat", scene);
    trailMat.emissiveColor = new B.Color3(1, 1, 1); // starts white (dribbling); recoloured per state
    trailMat.diffuseColor = new B.Color3(0, 0, 0);
    trailMat.specularColor = new B.Color3(0, 0, 0);
    trailMat.disableLighting = true;
    trailMat.opacityTexture = trailFadeTex;
    trailMat.alpha = 0.85; // overall cap (bumped a touch on boost) — never obscures the view
    trailMat.backFaceCulling = false;
    trailMat.transparencyMode = B.Material.MATERIAL_ALPHABLEND;
    let trailRibbon: B.Mesh | null = null;
    // recompute the two rails from the centre history (quadratic width taper to a point at
    // the tail) then write them into the ribbon — create once, update in place thereafter.
    const rebuildTrail = () => {
      for (let i = 0; i < TRAIL_N; i++) {
        const t = i / (TRAIL_N - 1);
        const w = TRAIL_W * (1 - t) * (1 - t) * 0.5; // half-width, tapers to ~0 at the tail
        const p = trailHist[i];
        trailLeft[i].set(p.x - w, p.y, p.z);
        trailRight[i].set(p.x + w, p.y, p.z);
      }
      if (!trailRibbon) {
        trailRibbon = B.MeshBuilder.CreateRibbon("runnerTrail", { pathArray: [trailLeft, trailRight], updatable: true, sideOrientation: B.Mesh.DOUBLESIDE }, scene);
        trailRibbon.material = trailMat;
        trailRibbon.isPickable = false;
        trailRibbon.applyFog = false;
        trailRibbon.alphaIndex = 5;
      } else {
        trailRibbon = B.MeshBuilder.CreateRibbon("runnerTrail", { pathArray: [trailLeft, trailRight], instance: trailRibbon });
      }
    };
    const resetTrail = () => {
      for (let i = 0; i < TRAIL_N; i++) trailHist[i].set(0, trailRestY, PLAYER_PLANE - 0.15);
      rebuildTrail();
    };

    // ── net-smash burst ParticleSystem (green + white sparks) ──────────────────
    const smashEmit = new B.Vector3(0, 0, 0);
    let smashFx: B.ParticleSystem | null = null;
    const ensureSmash = () => {
      if (smashFx) return smashFx;
      const t = new B.DynamicTexture("smashTex", { width: 16, height: 16 }, scene, false);
      t.hasAlpha = true;
      const c = t.getContext() as unknown as CanvasRenderingContext2D;
      const grd = c.createRadialGradient(8, 8, 0, 8, 8, 8);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.5, "rgba(120,255,150,0.9)");
      grd.addColorStop(1, "rgba(57,255,110,0)");
      c.fillStyle = grd; c.fillRect(0, 0, 16, 16);
      t.update(false);
      const ps = new B.ParticleSystem("smashFx", 240, scene);
      ps.particleTexture = t;
      ps.emitter = smashEmit;
      ps.minEmitBox = new B.Vector3(-0.5, 0, -0.3);
      ps.maxEmitBox = new B.Vector3(0.5, 0.3, 0.3);
      ps.color1 = new B.Color4(0.6, 1, 0.72, 1);
      ps.color2 = new B.Color4(1, 1, 1, 1);
      ps.colorDead = new B.Color4(0.22, 1, 0.43, 0);
      ps.minSize = 0.12; ps.maxSize = 0.46;
      ps.minLifeTime = 0.3; ps.maxLifeTime = 0.75;
      ps.emitRate = 0;
      ps.blendMode = B.ParticleSystem.BLENDMODE_ONEONE; // additive spark burst
      ps.gravity = new B.Vector3(0, -6, 0);
      ps.direction1 = new B.Vector3(-4, 3, -2);
      ps.direction2 = new B.Vector3(4, 7, 3);
      ps.minEmitPower = 2; ps.maxEmitPower = 7;
      ps.updateSpeed = 1 / 60;
      ps.disposeOnStop = false;
      ps.start();
      smashFx = ps;
      return ps;
    };

    // ── antialiasing; keep distant obstacles crisp for reaction time ──────────────
    let pipe: B.DefaultRenderingPipeline | null = null;
    try {
      pipe = new B.DefaultRenderingPipeline("runnerPipe", false, scene, [camera]);
      pipe.fxaaEnabled = true; // FXAA alone smooths edges cheaply
      // MSAA is expensive on mobile and redundant with FXAA + the engine's own AA. Mobile =
      // FXAA-only (samples 1); desktop keeps 4× MSAA for extra crispness.
      pipe.samples = coarse ? 1 : engine.webGLVersion > 1 ? 4 : 1;
    } catch { pipe = null; }

    // ── world state ────────────────────────────────────────────────────────────
    const world: World = {
      engine, scene, camera, ground, groundTex,
      hero: { node: heroNode, mesh: hero, mat: heroMat, shadow: heroShadow, x: 0, lane: 1, y: 0, vy: 0, jumping: false, roll: 0, rollZ: 0, boost: 0, boosting: 0, squash: 0, squashMag: 0 },
      goal: { root: goalRoot, net, keeper, hint, hintMat, openLane: 0, keeperX: 0, keeperTargetX: 0, z: SPAWN_Z, active: false, busted: false, checked: false, cooldown: 5, netPulse: 0 },
      smashFx: null, smashEmit,
      obstacles, coins,
      dust: null, dustEmit, landPuff: 0,
      speed: BASE_SPEED, dist: 0, bonus: 0, lives: 3, invulnerable: 0, streak: 0, collected: 0, paused: false, spawnTimer: 1.2, running: false, elapsed: 0,
    };
    worldRef.current = world;

    const setObstacleType = (o: Obstacle, i: number, type: ObType) => {
      defRigs[i].root.setEnabled(false);
      tacklePool[i].setEnabled(false);
      conePool[i].setEnabled(false);
      o.type = type;
      o.root = rootForType(i, type);
    };

    let jumpBuffer = 0;
    let goalsScored = 0;
    let bestVal = 0;
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (!Number.isNaN(v)) bestVal = v;
    } catch {}

    const spawnObstacle = () => {
      // Reserve a clear approach and exit around each keeper challenge.
      if (world.goal.active && Math.abs(world.goal.z - SPAWN_Z) < 26) return;
      const slot = obstacles.findIndex((o) => !o.active);
      if (slot < 0) return;
      const o = obstacles[slot];
      const roll = Math.random();
      const type: ObType = roll < 0.45 ? "defender" : roll < 0.72 ? "cone" : "tackle";
      setObstacleType(o, slot, type);
      o.lane = Math.floor(Math.random() * 3);
      o.z = SPAWN_Z;
      o.active = true;
      o.checked = false;
      o.smash = 0;
      o.root.position.set(LANE_X[o.lane], 0, o.z);
      o.root.rotation.set(0, type === "defender" ? Math.PI : 0, 0); // defenders face the hero
      o.root.setEnabled(true);

      const blockedLanes = [o.lane];
      // Later waves combine two obstacles, always leaving a full lane open.
      if (world.dist > 350 && Math.random() < Math.min(0.55, world.dist / 2200)) {
        const secondSlot = obstacles.findIndex((candidate) => !candidate.active);
        if (secondSlot >= 0) {
          const second = obstacles[secondSlot];
          setObstacleType(second, secondSlot, Math.random() < 0.5 ? "cone" : "defender");
          second.lane = (o.lane + 1 + Math.floor(Math.random() * 2)) % 3;
          second.z = SPAWN_Z;
          second.active = true;
          second.checked = false;
          second.smash = 0;
          second.root.position.set(LANE_X[second.lane], 0, second.z);
          second.root.rotation.set(0, second.type === "defender" ? Math.PI : 0, 0);
          second.root.setEnabled(true);
          blockedLanes.push(second.lane);
        }
      }
      if (Math.random() < 0.85) {
        const freeLanes = [0, 1, 2].filter((l) => !blockedLanes.includes(l));
        const cl = freeLanes[Math.floor(Math.random() * freeLanes.length)];
        let placed = 0;
        for (let k = 0; k < coins.length && placed < 3; k++) {
          if (coins[k].active) continue;
          const c = coins[k];
          c.lane = cl;
          c.z = SPAWN_Z + placed * 2.4;
          c.active = true;
          c.mesh.position.set(LANE_X[cl], 0.55, c.z);
          c.mesh.setEnabled(true);
          placed++;
        }
      }
    };

    const spawnGoal = () => {
      const g = world.goal;
      for (const o of obstacles) {
        if (o.active && Math.abs(o.z - (SPAWN_Z + 6)) < 26) {
          o.active = false;
          o.root.setEnabled(false);
        }
      }
      g.z = SPAWN_Z + 6;
      g.active = true;
      g.busted = false;
      g.checked = false;
      g.netPulse = 0;
      g.openLane = Math.random() < 0.5 ? 0 : 2; // burst-through side
      g.hint.position.x = LANE_X[g.openLane];
      // keeper starts centred, then commits toward the BLOCKED outer lane as it nears →
      // read the commit + the green hint and burst the OTHER (open) side.
      g.keeperX = 0;
      g.keeperTargetX = LANE_X[g.openLane === 0 ? 2 : 0] * 0.55;
      g.keeper.root.position.x = 0;
      g.keeper.root.rotation.z = 0;
      g.net.scaling.set(1, 1, 1);
      g.net.visibility = 1;
      g.root.position.set(0, 0, g.z);
      g.root.setEnabled(true);
    };

    // ── controls ────────────────────────────────────────────────────────────────
    ctrl.current = {
      mute: (value) => sound.mute(value),
      lane: (dir) => {
        if (!world.running || world.paused) return;
        world.hero.lane = Math.max(0, Math.min(2, world.hero.lane + dir));
        setHintOn(false);
      },
      jump: () => {
        const h = world.hero;
        // allow a fresh hop from rest OR to interrupt a low bounce (responsive re-jump)
        if (!world.running || world.paused) return;
        if (h.y > 0.4) { jumpBuffer = 0.16; return; }
        sound.jump();
        h.jumping = true;
        h.vy = JUMP_V;
        setHintOn(false);
      },
      boost: () => {
        const h = world.hero;
        if (!world.running || world.paused || h.boosting > 0 || h.boost < 1) return;
        sound.boost();
        h.boosting = BOOST_TIME;
        h.boost = 0;
        setHintOn(false);
      },
      pause: () => {
        if (!world.running) return;
        world.paused = !world.paused;
        setPhase(world.paused ? "paused" : "playing");
        if (!world.paused) canvas.focus();
      },
      restart: () => {
        sound.unlock();
        const h = world.hero;
        h.x = 0; h.lane = 1; h.y = 0; h.vy = 0; h.jumping = false; h.roll = 0; h.rollZ = 0; h.boost = 0; h.boosting = 0; h.squash = 0; h.squashMag = 0;
        h.node.scaling.set(1, 1, 1);
        jumpBuffer = 0;
        scenery.reset();
        hero.visibility = 1;
        world.camera.position.x = 0;
        world.speed = BASE_SPEED;
        world.dist = 0;
        world.bonus = 0;
        world.lives = 3;
        world.invulnerable = 0;
        world.streak = 0;
        world.collected = 0;
        world.paused = false;
        recordExploreActivity('arcade');setPhase("playing");
        setRun({ lives: 3, distance: 0, streak: 0, collected: 0, goalLane: -1, goalDistance: 0 });
        world.spawnTimer = 1.2;
        world.elapsed = 0;
        world.running = true;
        goalsScored = 0;
        for (let i = 0; i < obstacles.length; i++) {
          obstacles[i].active = false;
          obstacles[i].checked = false;
          defRigs[i].root.setEnabled(false);
          tacklePool[i].setEnabled(false);
          conePool[i].setEnabled(false);
        }
        for (const c of coins) { c.active = false; c.mesh.setEnabled(false); }
        world.goal.active = false;
        world.goal.busted = false;
        world.goal.cooldown = 5;
        world.goal.root.setEnabled(false);
        resetTrail(); // collapse the ribbon history back onto the ball for a clean restart
      },
    };

    let lastHud = 0;
    let lastCanBoost = false;

    // ── main render loop ───────────────────────────────────────────────────────
    const simulate = (dt: number) => {
      const h = world.hero;

      if (world.paused) return;
      if (world.running) {
        world.invulnerable = Math.max(0, world.invulnerable - dt);
        hero.visibility = world.invulnerable > 0 ? (Math.sin(world.elapsed * 28) > 0 ? 0.35 : 1) : 1;
        jumpBuffer = Math.max(0, jumpBuffer - dt);
        if (jumpBuffer > 0 && h.y <= 0.4 && h.vy <= 0) { h.vy = JUMP_V; h.jumping = true; jumpBuffer = 0; }
        world.elapsed += dt;
        world.speed = Math.min(MAX_SPEED, BASE_SPEED + world.elapsed * RAMP);
        if (h.boosting > 0) h.boosting = Math.max(0, h.boosting - dt);
        const boostK = h.boosting > 0 ? 1.55 : 1;
        const move = world.speed * boostK * dt;
        const oldDistrict = Math.floor(world.dist / DISTRICT_LENGTH);
        const oldMilestone = Math.floor(world.dist / 500);
        world.dist += move;
        if (Math.floor(world.dist / 500) > oldMilestone) {
          world.bonus += 250;
          doFlash(`${Math.floor(world.dist / 500) * 500} METRES · +250`, "goal");
        }
        if (Math.floor(world.dist / DISTRICT_LENGTH) !== oldDistrict) doFlash(districtAt(world.dist).name, "goal");
        scenery.update(move);
        const targetFov = h.boosting > 0 ? 0.96 : 0.88;
        camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-5 * dt));
        const speedFrac = (world.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);

        // scroll the whole PBR turf (all maps synced) toward the camera → treadmill speed read
        const vo = (turfAlbedo.vOffset - move / 20) % 1;
        for (const t of turfMaps) t.vOffset = vo;

        // ── lane / jump ──────────────────────────────────────────────────────
        const targetX = LANE_X[h.lane];
        const oldX = h.x;
        h.x = smoothLane(h.x, targetX, dt);
        const dx = h.x - oldX;
        const impact = stepJump(h, dt);
        if (impact > 0) {
          const mag = Math.min(1, Math.max(0.12, impact / JUMP_V));
          h.squash = SQUASH_DUR; h.squashMag = mag;
          world.landPuff = 0.04 + 0.14 * mag;
        }

        // ── squash-and-stretch on ground contact (world-vertical, on the NODE) ─
        let sy = 1, sxz = 1;
        if (h.squash > 0) {
          h.squash = Math.max(0, h.squash - dt);
          const s = h.squash / SQUASH_DUR; // 1 → 0
          const m = h.squashMag; // impact-scaled magnitude
          const wob = Math.sin(s * Math.PI * 2.2) * s; // decaying overshoot
          sy = 1 - 0.075 * s * m + 0.025 * wob * m; // pronounced pancake then spring
          sxz = 1 + 0.04 * s * m - 0.012 * wob * m;
        } else {
          sy = 1 + Math.sin(world.elapsed * 11) * 0.02; // subtle roll bob when settled
        }
        h.node.scaling.set(sxz, sy, sxz);
        h.node.position.set(h.x, HERO_R * sy + h.y, PLAYER_PLANE); // keep the ball's bottom planted

        // ── hero ball spin: rolls forward, tilts/rolls into lane changes ──────
        h.roll += move / HERO_R; // forward roll ∝ ground covered
        h.rollZ -= dx / HERO_R; // lateral roll on a lane shift
        h.mesh.rotation.x = h.roll;
        h.mesh.rotation.z = h.rollZ + (targetX - h.x) * 0.25; // + a lean into the turn
        // SOFT height-following shadow: stays on the ground under the ball's lane; as the
        // ball rises it grows LARGER + FAINTER (softer), near the ground it's TIGHTER +
        // DARKER. Cheap per-frame scalar writes — no allocations.
        const shH = Math.max(0, h.y);
        h.shadow.position.set(h.x, 0.02, PLAYER_PLANE);
        h.shadow.scaling.setAll(0.78 * (1 + shH * 0.34));
        heroShadowMat.alpha = Math.max(0.07, HERO_SHADOW_ALPHA * (1 - shH * 0.2));
        // boost glow pulse on the hero material (coins keep their own matte material)
        const glow = h.boosting > 0 ? 0.35 + 0.25 * Math.sin(world.elapsed * 30) : 0.05;
        h.mat.emissiveColor.set(glow, glow * 0.78, glow * 0.25);
        // ── GREEN trail RIBBON: roll the position history back with the treadmill, plant a
        // fresh head at the ball, rewrite the smooth ribbon. It curves with the recorded
        // lane-changes + jumps and stays LOW so it never curtains the view ahead. ──
        const boostingNow = h.boosting > 0;
        for (let i = TRAIL_N - 1; i >= 1; i--) {
          trailHist[i].copyFrom(trailHist[i - 1]);
          trailHist[i].z -= move; // recede with the world, exactly like the obstacles
        }
        // head sits just behind the ball, LOW (only half-following the jump height) so a
        // hop lifts the trail gently instead of fountaining a green sheet over the pitch
        trailHist[0].set(h.x, trailRestY + h.y * 0.15, PLAYER_PLANE - 0.15);
        rebuildTrail();
        // STATE colours (matching the live games): GREEN #39FF6E on BOOST, PURPLE while
        // airborne (JUMP), WHITE for normal dribbling. Smoothly blended, never allocating.
        let tcr = 1, tcg = 1, tcb = 1, tca = 0.16; // white default
        if (boostingNow) { tcr = 0.35; tcg = 1; tcb = 0.5; tca = 0.98; } // green boost
        else if (h.y > 0.12) { tcr = 0.62; tcg = 0.3; tcb = 1.0; tca = 0.22; } // purple jump
        const ec = trailMat.emissiveColor;
        const kc = Math.min(1, 14 * dt);
        ec.set(ec.r + (tcr - ec.r) * kc, ec.g + (tcg - ec.g) * kc, ec.b + (tcb - ec.b) * kc);
        trailMat.alpha += (tca - trailMat.alpha) * kc;

        world.camera.position.x += (h.x * 0.42 - world.camera.position.x) * Math.min(1, 6 * dt);

        // ── run dust: rate ∝ speed while grounded; burst on land + boost ──────
        const df = ensureDust();
        world.dust = df;
        dustEmit.set(h.x, 0.06, PLAYER_PLANE - 0.35); // just behind the ball
        if (world.landPuff > 0) world.landPuff = Math.max(0, world.landPuff - dt);
        if (h.y < 0.25) { // grounded or in a low bounce → kick up dust
          let rate = 18 + speedFrac * 42 + (h.boosting > 0 ? 45 : 0);
          if (world.landPuff > 0) rate = 120;
          df.emitRate = Math.min(140, rate);
          if (!df.isStarted()) df.start();
        } else if (df.isStarted()) df.stop();

        // ── obstacles ────────────────────────────────────────────────────────
        for (const [index, o] of world.obstacles.entries()) {
          if (!o.active) continue;
          o.z -= move;
          o.root.position.z = o.z;
          if (o.smash > 0) {
            o.smash = Math.max(0, o.smash - dt);
            const progress = 1 - o.smash;
            const side = o.lane === 0 ? -1 : 1;
            o.root.position.x = LANE_X[o.lane] + side * progress * 8;
            o.root.position.y = Math.sin(progress * Math.PI) * 1.7;
            o.root.rotation.z = side * progress * 5;
          } else {
            const approach = Math.max(0, 1 - o.z / 18);
            if (o.type === "defender") defenderPose(defRigs[index], world.elapsed + index, approach, (h.x - LANE_X[o.lane]) * -0.1);
            if (o.type === "tackle") slidePose(tackleRigs[index], world.elapsed + index, approach);
          }
          if (!o.checked && o.z <= 0.6) {
            o.checked = true;
            const sameLane = Math.abs(h.x - LANE_X[o.lane]) < HERO_R + (o.type === "tackle" ? 0.65 : 0.34);
            let hit = false;
            if (sameLane) {
              if (o.type === "defender") hit = h.boosting <= 0; // a boost smashes through, else dodge
              else hit = h.boosting <= 0 && !(h.jumping && h.y > CLEAR_H); // tackle / cone → hop it
            }
            if (hit && world.invulnerable <= 0) {
              sound.hit();
              world.lives -= 1;
              world.streak = 0;
              world.invulnerable = 2;
              o.active = false;
              o.root.setEnabled(false);
              if (world.lives === 0) {
                world.running = false;
                if (world.dust?.isStarted()) world.dust.stop();
                hooks.onCrash(Math.floor(world.dist * 0.6 + world.bonus), goalsScored);
                break;
              }
              doFlash(`${world.lives} lives left — keep going!`, "crash");
            } else if (!hit) {
              if (sameLane && h.boosting > 0) {
                o.smash = 1;
                world.bonus += 50;
                const particles = ensureSmash();
                smashEmit.set(h.x, 0.6, PLAYER_PLANE);
                particles.manualEmitCount = 35;
              }
              h.boost = Math.min(1, h.boost + DODGE_BOOST);
            }
          }
          if (o.z < DESPAWN_Z) { o.active = false; o.root.setEnabled(false); }
        }

        if (!world.running) return;

        // ── coins ────────────────────────────────────────────────────────────
        for (const c of world.coins) {
          if (!c.active) continue;
          const previousZ = c.z;
          c.z -= move;
          c.spin += dt * 6;
          c.mesh.position.z = c.z;
          c.mesh.position.y = 0.55 + Math.sin(c.spin) * 0.05;
          c.mesh.rotation.y = c.spin;
          c.mesh.rotation.x = c.spin * 0.7;
          const near = crossesPickup(previousZ, c.z) && Math.abs(h.x - LANE_X[c.lane]) < 1.1 && h.y < 1.6;
          if (near) {
            c.active = false;
            c.mesh.setEnabled(false);
            world.bonus += 80;
            world.collected += 1;
            sound.collect();
            h.boost = Math.min(1, h.boost + COIN_BOOST); // coins charge the boost
          } else if (c.z < DESPAWN_Z) {
            c.active = false;
            c.mesh.setEnabled(false);
          }
        }

        // ── BIG goal: keeper commit + burst-through-a-side ───────────────────
        const g = world.goal;
        if (g.active) {
          g.z -= move;
          g.root.position.z = g.z;
          // keeper shuffles centre → commits toward the blocked side as the goal nears
          const commit = g.z < 34 ? 1 : 0;
          const kt = commit ? g.keeperTargetX : Math.sin(world.elapsed * 3) * 0.35;
          g.keeperX += (kt - g.keeperX) * Math.min(1, 5 * dt);
          g.keeper.root.position.x = g.keeperX;
          keeperPose(g.keeper, world.elapsed, Math.min(1, Math.max(0, (20 - g.z) / 18)), g.openLane === 0 ? 1 : -1);
          g.keeper.root.rotation.z = (g.keeperX - kt) * 0.15 - g.keeperX * 0.08; // lean into the dive
          // pulse the green OPEN-side hint
          g.hintMat.alpha = 0.32 + 0.24 * (0.5 + 0.5 * Math.sin(world.elapsed * 6));
          // net-tear ripple after a burst
          if (g.netPulse > 0) {
            g.netPulse = Math.max(0, g.netPulse - dt);
            const k = g.netPulse / 0.5;
            g.net.scaling.y = 1;
            g.net.scaling.z = 1 + Math.sin((0.5 - g.netPulse) * 20) * 0.7 * k;
            if (g.netPulse <= 0) { g.net.scaling.set(1, 1, 1); }
          }
          // crossing the hero plane — TWO TIERS on the LIT open side:
          //  • just being in the open lane (no boost) = a NORMAL goal → modest points + a
          //    light net ripple.
          //  • BOOSTING through the open lane = the premium play → far more points + the
          //    full net-burst (tear + spark shower).
          // Boosting into the keeper-covered middle / blocked side is a SAVE (no points,
          // non-fatal). Drifting into the covered side without boost simply misses.
          if (!g.checked && g.z <= HERO_R + 0.3) {
            g.checked = true;
            const inOpen = Math.abs(h.x - LANE_X[g.openLane]) < 1.3;
            if (inOpen && h.y + HERO_R * 2 < GH + 0.15 && !g.busted) {
              g.busted = true;
              sound.goal();
              goalsScored += 1;
              world.streak += 1;
              const reward = goalPoints(h.boosting > 0, world.streak);
              if (h.boosting > 0) {
                g.netPulse = 0.5; // full net-burst
                world.bonus += reward; // premium score reward
                const sfx = ensureSmash();
                world.smashFx = sfx;
                world.smashEmit.set(LANE_X[g.openLane], GH * 0.45, PLAYER_PLANE);
                sfx.manualEmitCount = 190; // one-shot spark burst on the open side
                hooks.onGoal(reward, true);
              } else {
                g.netPulse = 0.28; // modest ripple (no big tear)
                world.bonus += reward; // normal score reward
                hooks.onGoal(reward, false);
              }
            } else {
              world.streak = 0;
              hooks.onSave(); // boosted into the keeper / blocked side → denied
            }
          }
          if (g.z < DESPAWN_Z) { g.active = false; g.root.setEnabled(false); g.cooldown = 3.5 + Math.random() * 2.5; }
        } else {
          g.cooldown -= dt;
          if (g.cooldown <= 0) spawnGoal();
        }

        // ── spawn cadence ────────────────────────────────────────────────────
        world.spawnTimer -= dt;
        if (world.spawnTimer <= 0) {
          spawnObstacle();
          world.spawnTimer = Math.max(0.8, 26 / world.speed) + Math.random() * 0.5;
        }
      }

      const now = performance.now();
      const displayScore = Math.floor(world.dist * 0.6 + world.bonus);
      const canBoostNow = h.boost >= 1 && h.boosting <= 0 && world.running && !world.paused;
      if (now - lastHud > 80 || canBoostNow !== lastCanBoost) {
        lastHud = now;
        setRun({ lives: world.lives, distance: Math.floor(world.dist), streak: world.streak, collected: world.collected,
          goalLane: world.goal.active && !world.goal.checked ? world.goal.openLane : -1,
          goalDistance: Math.max(0, Math.round(world.goal.z)) });
        lastCanBoost = canBoostNow;
        hooks.onHud(displayScore, Math.max(bestVal, displayScore), goalsScored, canBoostNow, Math.round(h.boost * 100));
      }

    };
    // Fixed 120 Hz simulation keeps jumps and collision timing identical across displays.
    // RENDERING is capped to ~60 fps independently: on a 120 Hz ProMotion phone Babylon's rAF
    // fires 120×/s, so an uncapped scene.render() draws the whole pitch twice as often as the
    // eye needs — pure heat for no visible gain. We keep simulating at 120 Hz (smooth physics)
    // but only draw when ~1/60 s has elapsed. Page Visibility: while the tab/app is hidden we
    // skip the frame entirely so a backgrounded game stops cooking the battery.
    let accumulator = 0;
    let lastRender = 0;
    const MIN_FRAME_MS = 1000 / 62; // ~60 fps render cap (62 leaves headroom on 60 Hz panels)
    const tick = () => {
      if (document.hidden) { accumulator = 0; return; }
      if (world.paused) { accumulator = 0; return; }
      accumulator += Math.min(engine.getDeltaTime() / 1000, 0.1);
      while (accumulator >= 1 / 120) { simulate(1 / 120); accumulator -= 1 / 120; }
      const now = performance.now();
      if (now - lastRender >= MIN_FRAME_MS) { lastRender = now; scene.render(); }
    };

    const hooks: Hooks = {
      onHud: (s, bst, gl, cb, bp) => {
        setScore(s);
        setBest(bst);
        setGoals(gl);
        setCanBoost(cb);
        setBoostPct(bp);
      },
      onGoal: (points, busted) => doFlash(busted ? `GOAL! NET BUSTED  +${points}` : `GOAL!  +${points}`, "goal"),
      onSave: () => doFlash("KEEPER SAVE!", "crash"),
      onCrash: (finalScore, gl) => {
        let isNew = false;
        if (finalScore > bestVal) {
          bestVal = finalScore;
          isNew = true;
          try { localStorage.setItem(BEST_KEY, String(finalScore)); } catch {}
        }
        setBest(bestVal);
        setNewBest(isNew);
        setGoals(gl);
        setScore(finalScore);
        setRun({ lives: 0, distance: Math.floor(world.dist), streak: world.streak, collected: world.collected, goalLane: -1, goalDistance: 0 });
        setPhase("over");
        setGameOver(true);
        doFlash("TACKLED!", "crash");
      },
    };

    // ── invisible per-frame CPU trims (safe: no material DEFINE changes happen after this
    // point — the hero/trail/hint/shadow materials only mutate colour/alpha UNIFORMS, which
    // don't need the dirty mechanism — and we drive all input through DOM handlers, not scene
    // picking, so pointer-move picking can be skipped entirely).
    scene.skipPointerMovePicking = true;
    scene.blockMaterialDirtyMechanism = true;

    engine.runRenderLoop(tick);
    const onResize = () => {
      engine.resize();
      applyScaling(); // re-assert the DPR cap AFTER resize (defensive even with adaptToDeviceRatio off)
      const portrait = canvas.clientWidth / Math.max(1, canvas.clientHeight) < 0.8;
      camera.position.y = portrait ? 7.5 : 5.8;
      camera.position.z = portrait ? -16 : -10.5;
      camera.setTarget(new B.Vector3(camera.position.x, 0.5, 9));
    };
    onResize();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", onResize);

    const autoPause = () => {
      if (world.running && !world.paused) ctrl.current?.pause();
    };
    // Page Visibility: fully STOP the render loop when hidden (backgrounded tab / locked phone)
    // so the GPU does zero work, then restart it on return. Also auto-pause the run so the
    // player comes back to a paused pitch rather than a mid-air surprise.
    const visibility = () => {
      if (document.hidden) { autoPause(); engine.stopRenderLoop(); }
      else { engine.stopRenderLoop(); engine.runRenderLoop(tick); }
    };
    window.addEventListener("blur", autoPause);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", autoPause);
      document.removeEventListener("visibilitychange", visibility);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      sound.dispose();
      engine.stopRenderLoop();
      if (dust) dust.dispose();
      if (trailRibbon) trailRibbon.dispose();
      if (smashFx) smashFx.dispose();
      shadows.dispose();
      if (pipe) pipe.dispose();
      scene.dispose();
      engine.dispose();
      worldRef.current = null;
      ctrl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keyboard controls -----------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = ctrl.current;
      if (!c) return;
      const keys = ["Escape", "p", "P", "ArrowLeft", "a", "A", "ArrowRight", "d", "D", "ArrowUp", "w", "W", " ", "Spacebar", "b", "B", "ArrowDown", "s", "S"];
      if (!keys.includes(e.key)) return;
      const editable = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable=true]");
      if (editable) return;
      e.stopImmediatePropagation();
      if (e.key !== "Escape" && e.target instanceof HTMLElement && e.target.closest("button")) return;
      e.preventDefault();
      if (e.repeat) return;
      switch (e.key) {
        case "Escape": case "p": case "P": e.preventDefault(); e.stopImmediatePropagation(); c.pause(); break;
        case "ArrowLeft": case "a": case "A": e.preventDefault(); c.lane(-1); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); c.lane(1); break;
        case "ArrowUp": case "w": case "W": e.preventDefault(); c.jump(); break;
        case " ": case "Spacebar": case "b": case "B": case "ArrowDown": case "s": case "S": e.preventDefault(); c.boost(); break;
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // The same fixed thumb control and rim feedback as the island, mapped to lanes.
  const joyRef=useRef<{pid:number|null;latchX:number;jumped:boolean}>({pid:null,latchX:0,jumped:false});
  const joyPadRef=useRef<HTMLDivElement|null>(null);
  const joyBounds=useJoystickBounds(joyPadRef,phase==='playing');
  const resetJoy=()=>{const j=joyRef.current,id=j.pid;j.pid=null;joyBounds.current=null;j.latchX=0;j.jumped=false;if(id!==null&&joyPadRef.current?.hasPointerCapture(id))joyPadRef.current.releasePointerCapture(id);paintJoystick(joyPadRef.current,0,0);};
  const joyMove=(e:React.PointerEvent)=>{const j=joyRef.current,pad=joyPadRef.current;if(e.pointerId!==j.pid||!pad)return;e.preventDefault();const rect=joyBounds.current??(joyBounds.current=pad.getBoundingClientRect()),x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2,scale=Math.min(1,36/Math.max(1,Math.hypot(x,y))),dx=x*scale,dy=y*scale;paintJoystick(pad,dx,dy);const c=ctrl.current;if(!c||gameOver)return;const sign=dx>18?1:dx< -18?-1:0;if(sign&&sign!==j.latchX){c.lane(sign as -1|1);j.latchX=sign;}else if(Math.abs(dx)<9)j.latchX=0;if(dy< -22&&!j.jumped){c.jump();j.jumped=true;}else if(dy> -10)j.jumped=false;};
  const joyDown=(e:React.PointerEvent)=>{const j=joyRef.current;if(j.pid!==null){if(e.currentTarget.hasPointerCapture(j.pid))return;resetJoy();}e.preventDefault();joyBounds.current=null;j.pid=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);joyMove(e);};
  const joyUp=(e:{pointerId:number})=>{if(e.pointerId===joyRef.current.pid)resetJoy();};
  useEffect(()=>{const pad=joyPadRef.current;if(!pad)return;
   const prevent=(e:Event)=>{if(e.cancelable)e.preventDefault();},up=(e:PointerEvent)=>joyUp(e),touchEnd=(e:TouchEvent)=>{if(!e.touches.length)resetJoy();},hidden=()=>{if(document.hidden)resetJoy();};
   const gestures=['touchstart','touchmove','touchend','dblclick','selectstart','contextmenu','gesturestart','gesturechange','gestureend'];for(const name of gestures)pad.addEventListener(name,prevent,{passive:false});window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);window.addEventListener('touchend',touchEnd,{passive:true});window.addEventListener('touchcancel',touchEnd,{passive:true});window.addEventListener('blur',resetJoy);window.addEventListener('pagehide',resetJoy);document.addEventListener('visibilitychange',hidden);
   return()=>{resetJoy();for(const name of gestures)pad.removeEventListener(name,prevent);window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);window.removeEventListener('touchend',touchEnd);window.removeEventListener('touchcancel',touchEnd);window.removeEventListener('blur',resetJoy);window.removeEventListener('pagehide',resetJoy);document.removeEventListener('visibilitychange',hidden);};
  },[phase]);

  // swipe / tap controls --------------------------------------------------------
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    touch.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const c = ctrl.current;
    const start = touch.current;
    touch.current = null;
    if (!c || !start || gameOver) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const TH = 26;
    if (adx < TH && ady < TH) { c.jump(); return; }
    if (adx > ady) c.lane(dx > 0 ? 1 : -1);
    else if (dy < 0) c.jump();
    else c.boost();
  };

  const restart = () => {
    setGameOver(false);
    setNewBest(false);
    setFlash(null);
    ctrl.current?.restart();
    canvasRef.current?.focus();
  };

  return (
    <div className={styles.root}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => {
          const start = touch.current;
          if (start && Math.max(Math.abs(e.clientX - start.x), Math.abs(e.clientY - start.y)) > 26) onPointerUp(e);
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { touch.current = null; }}
        aria-label="Breakaway Run soccer field. Use arrow keys to dodge and jump, Space to boost."
      />

      <div className={styles.hud}>
        <BackButton className={`${styles.pixelBtn} ${styles.pixelBtnDark} ${styles.backBtn}`} onBack={onExit}/>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Score</span>
            <span className={styles.statVal}>{score}</span>
          </div>
          <div className={`${styles.statBox} ${styles.goals}`}>
            <span className={styles.statLabel}>Goals</span>
            <span className={styles.statVal}>{goals}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Best</span>
            <span className={styles.statVal}>{best}</span>
          </div>
        </div>
      </div>

      <button className={styles.soundButton} disabled={!isSoundEnabled()} aria-label={!isSoundEnabled()?"Sound muted in island settings":muted ? "Enable game sound" : "Mute game sound"} onClick={() => { setMuted(!muted); ctrl.current?.mute(!muted); }}>{muted||!isSoundEnabled() ? "Sound off" : "Sound on"}</button>
      {phase === "playing" && <button className={styles.pauseButton} onClick={() => ctrl.current?.pause()} aria-label="Pause game">Ⅱ Pause</button>}
      {phase === "playing" && <div className={styles.runInfo}>
        <div><span aria-label={`${run.lives} lives remaining`}>{"●".repeat(run.lives)}{"○".repeat(3 - run.lives)}</span><b>{run.distance} m</b><span>{run.streak > 0 ? `×${Math.min(3, run.streak)} goal streak` : "Build your goal streak"}</span></div>
        <progress max={500} value={run.distance % 500} aria-label="Distance to next 500 metre milestone" />
        <small>{run.distance < 500 ? "ROOKIE" : run.distance < 1500 ? "PLAYMAKER" : "ISLAND LEGEND"} · Next milestone {Math.floor(run.distance / 500) * 500 + 500} m</small>
      </div>}
      {phase === "playing" && <div className={styles.boostLabel}>{canBoost ? "BOOST READY · SPACE" : `BOOST CHARGE ${boostPct}%`}</div>}
      {phase === "playing" && run.goalLane >= 0 && run.goalDistance < 60 && <div className={styles.goalGuide}>
        <small>GOAL AHEAD · {run.goalDistance} m</small>
        <strong>{run.goalLane === 0 ? "← GO LEFT" : "GO RIGHT →"}</strong>
        <span>{canBoost ? "Boost through for a power goal" : "Stay low · find the green opening"}</span>
      </div>}

      {/* boost meter — fills from coins + clean dodges, glows gold when ready */}
      <div style={{ position: "absolute", top: 66, left: "50%", transform: "translateX(-50%)", width: "min(280px, 60vw)", height: 12, borderRadius: 8, background: "rgba(10,20,14,0.55)", border: "2px solid rgba(255,255,255,0.25)", overflow: "hidden", zIndex: 6, pointerEvents: "none" }}>
        <div style={{ width: `${boostPct}%`, height: "100%", transition: "width 0.12s linear", background: canBoost ? "linear-gradient(90deg,#ffd24a,#ff9d2e)" : "linear-gradient(90deg,#57b6ff,#3f8fe0)", boxShadow: canBoost ? "0 0 10px #ffce4a" : "none" }} />
      </div>

      {flash && phase === "playing" && (
        <div className={`${styles.flash} ${flash.kind === "goal" ? styles.flashGoal : styles.flashCrash}`}>
          {flash.text}
        </div>
      )}

      {hintOn && phase === "playing" && (
        <div className={styles.hintBanner}>
          Joystick / <b>← →</b> dodge · <b>↑</b> jump · reach the <b>open side</b> to score · <b>Space</b>/BOOST bursts the net
        </div>
      )}

      {phase === "playing" && <div className={styles.keyboardGuide}><span><kbd>←</kbd><kbd>→</kbd> Switch lanes</span><span><kbd>↑</kbd> Jump</span><span><kbd>SPACE</kbd> Boost</span><span><kbd>P</kbd> Pause</span></div>}
      {phase === "playing" && (
        <div className={styles.controls}>
          <button className={styles.jumpButton} aria-label="Jump" onPointerDown={(e) => { e.preventDefault(); ctrl.current?.jump(); }}>↑<small>JUMP</small></button>
          <div ref={joyPadRef} className={`joystick ${styles.islandJoystick}`} data-edge="false" role="group" aria-label="Drag to move: sideways to dodge, up to jump" draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} onPointerDown={joyDown} onPointerMove={joyMove} onPointerUp={joyUp} onPointerCancel={joyUp} onLostPointerCapture={joyUp}>
           <i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span aria-hidden="true"/>
          </div>
          {/* RIGHT — big BOOST button; glows + throbs when the meter is armed/ready */}
          <button
            className={`${styles.pixelBtn} ${styles.boostBtn} ${canBoost ? styles.armed : ""}`}
            onClick={() => ctrl.current?.boost()}
            disabled={!canBoost}
            aria-label="Boost"
          >
            {canBoost ? "BOOST ⚡" : "BOOST"}
          </button>
        </div>
      )}

      {renderError && <div className={styles.overlay}><div className={styles.panel} role="alert"><h1>The pitch couldn’t load</h1><p>This game needs WebGL graphics. Try reloading or opening it in another browser.</p><button className={`pixel-btn ${styles.overlayBtn}`} onClick={() => window.location.reload()}>Reload game</button><button className={styles.textButton} onClick={onExit}>Back to games</button></div></div>}
      {!renderError && (phase === "ready" || phase === "paused") && (
        <div className={styles.overlay}>
          <div className={`${styles.panel} ${styles.introPanel}`} role="dialog" aria-modal="true" aria-label={phase === "ready" ? "Breakaway Run" : "Game paused"}>
            <span className={styles.eyebrow}>FUTBOL ISLAND / ARCADE</span>
            <div className={styles.introBall}>⚽</div>
            <h1>{phase === "ready" ? <>BREAKAWAY<br /><em>RUN</em></> : "TAKE A BREATHER."}</h1>
            <p>{phase === "ready" ? "Three lanes. One open goal. Make your run count." : "Your run is right where you left it."}</p>
            <div className={styles.instructions}>
              <div><b>01 / DODGE & JUMP</b><span>← → or A / D to switch lanes. ↑ / W to jump. On touch, use the island joystick: push sideways to switch lanes and up to jump.</span></div>
              <div><b>02 / CHARGE & BOOST</b><span>Collect footballs to charge up. Space or the Boost button powers through every obstacle.</span></div>
              <div><b>03 / BEAT THE KEEPER</b><span>Stay low through the green opening. Consecutive goals earn up to ×3 points. You have three lives.</span></div>
            </div>
            <button autoFocus className={`pixel-btn ${styles.overlayBtn} ${styles.startButton}`} onClick={() => phase === "ready" ? restart() : ctrl.current?.pause()}>{phase === "ready" ? "KICK OFF →" : "BACK TO THE RUN →"}</button>
            <button className={styles.textButton} onClick={onExit}>Back to games</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <div className={styles.eyebrow}>FULL TIME</div><div className={styles.title}>{run.distance >= 1500 ? "ISLAND LEGEND" : run.distance >= 500 ? "PLAYMAKER" : "GOOD RUN!"}</div>
            <div className={styles.finalScore}>{score}</div>
            <div className={styles.finalRow}>
              <div>Distance<b>{run.distance} m</b></div>
              <div>Collected<b>{run.collected}</b></div>
              <div>Goals<b>{goals}</b></div>
              <div>Best<b>{best}</b></div>
            </div>
            {newBest ? (
              <div className={styles.newBest}>★ New best run! ★</div>
            ) : (
              <div className={styles.bestLine}>Best <b>{best}</b></div>
            )}
            <div className={styles.overlayBtns}>
              <button className={`pixel-btn ${styles.overlayBtn}`} onClick={restart}>Play Again</button>
              <button className={`pixel-btn ${styles.overlayBtn}`} onClick={onExit}>Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
