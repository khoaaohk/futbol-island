import * as B from "@babylonjs/core";
import { BLOCK_LENGTH, BLOCKS_PER_DISTRICT, ROUTE_BLOCKS, ROUTE_LENGTH, DISTRICTS, visibleBlock } from "./runnerRoute";

/** A coastal football district, built once and recycled in six distinct blocks. */
export function buildRunnerScenery(scene: B.Scene) {
  const material = (name: string, color: string, glow = 0) => {
    const m = new B.StandardMaterial(name, scene);
    m.diffuseColor = B.Color3.FromHexString(color);
    m.emissiveColor = m.diffuseColor.scale(glow);
    m.specularColor.setAll(0.015);
    m.twoSidedLighting = true;
    return m;
  };
  const sand = material("warmLimestone", "#e5cda3");
  const sea = material("coastalWater", "#6faaa9", 0.18);
  sea.disableLighting = true;
  sea.emissiveColor = B.Color3.FromHexString("#8ebcba").toLinearSpace();
  const ink = material("deepMarine", "#123b59");
  const mint = material("clubMint", "#b9c89a");
  const white = material("warmWhite", "#f5f1dc");
  const trunk = material("palmWood", "#9b7350");
  const leaves = material("palmJade", "#557556");
  const lightLeaves = material("palmTips", "#899c64");
  const coral = material("clay", "#be826b");
  const yellow = material("clubGold", "#d9c78a");
  const lavender = material("lavender", "#a498cb");
  const glass = material("windowBlue", "#275878");
  const facades = [material("ochreHouse", "#cbbc90"), material("pinkHouse", "#c98678"), material("blueHouse", "#98b4a4")];
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, mat: B.Material, parent?: B.TransformNode) => {
    const mesh = B.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.position.set(x, y, z); mesh.material = mat; mesh.isPickable = false; mesh.receiveShadows = true;
    if (parent) mesh.parent = parent;
    return mesh;
  };
  const sphere = (name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: B.Material, parent?: B.TransformNode) => {
    const mesh = B.MeshBuilder.CreateSphere(name, { diameter: 1, segments: 12 }, scene);
    mesh.position.set(x, y, z); mesh.scaling.set(sx, sy, sz); mesh.material = mat; mesh.isPickable = false;
    if (parent) mesh.parent = parent;
    return mesh;
  };
  // A true sky gradient, independent of the exposure of the playing field.
  B.Effect.ShadersStore.runnerSkyVertexShader = `precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; varying vec3 skyDirection; void main(){skyDirection=position;gl_Position=worldViewProjection*vec4(position,1.0);}`;
  B.Effect.ShadersStore.runnerSkyFragmentShader = `precision highp float; varying vec3 skyDirection; void main(){vec3 d=normalize(skyDirection);float h=pow(max(0.0,d.y),0.55);vec3 c=mix(vec3(0.76,0.83,0.79),vec3(0.43,0.65,0.69),h);float sun=pow(max(0.0,dot(d,normalize(vec3(-0.45,0.32,0.8)))),180.0);c+=vec3(1.0,0.73,0.38)*sun*0.35;gl_FragColor=vec4(c,1.0);}`;
  const sky = B.MeshBuilder.CreateSphere("coastalSky", { diameter: 290, segments: 24, sideOrientation: B.Mesh.BACKSIDE }, scene);
  const skyMat = new B.ShaderMaterial("coastalSkyMaterial", scene, "runnerSky", { attributes: ["position"], uniforms: ["worldViewProjection"] });
  skyMat.backFaceCulling = false; skyMat.disableDepthWrite = true; sky.material = skyMat; sky.infiniteDistance = true; sky.isPickable = false;
  const cloudMat = material("cloudCream", "#ffffff", 0.4);
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 48;
    for (let puff = 0; puff < 4; puff++) sphere("cloud", x + puff * 4, 17 + (i % 3) * 6 + (puff % 2), 100 + (i % 2) * 20, 11, 3.5 + (puff % 2) * 2, 5, cloudMat);
  }
  const hill = material("distantHeadland", "#439693");
  sphere("headland", -66, -2, 120, 80, 24, 35, hill);
  sphere("headland", 63, -3, 142, 75, 34, 38, hill);
  box("islandFoundation", 28, 0.9, 210, 0, -0.65, 78, sand);
  box("ocean", 300, 0.1, 340, 0, -1.2, 95, sea);
  const foam = material("waterGlints", "#b5e9dd", 0.25);
  for (let i = 0; i < 24; i++) {
    const side = i % 2 ? 1 : -1;
    box("waterGlint", 1.5 + (i % 4), 0.012, 0.16, side * (17 + (i * 7 % 25)), -1.13, i * 6 - 10, foam);
  }
  for (const side of [-1, 1]) {
    box("touchline", 0.09, 0.018, 210, side * 3.9, 0.032, 78, white);
    box("rubberTrack", 2, 0.035, 210, side * 5.2, 0.025, 78, coral);
    box("trackStripe", 0.045, 0.015, 210, side * 5.2, 0.05, 78, white);
    box("curb", 0.24, 0.17, 210, side * 6.3, 0.08, 78, white);
  }
  const makeSign = (label: string, background: string, color: string) => {
    const tex = new B.DynamicTexture(`sign-${label}`, { width: 1024, height: 256 }, scene, true);
    const ctx = tex.getContext() as unknown as CanvasRenderingContext2D; ctx.fillStyle = background; ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = color; ctx.font = "900 90px sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, 512, 160); tex.update();
    const m = material(`signMat-${label}`, "#ffffff", 0.12); m.diffuseTexture = tex; m.backFaceCulling = false; return m;
  };
  const signs = [makeSign("COASTAL CUP", "#133b59", "#f3d587"), makeSign("MAKE WAVES.", "#a5e8b3", "#133b59"), makeSign("FUTBOL ISLAND", "#e48f74", "#ffffff")];
  const palm = (x: number, z: number, parent: B.TransformNode, flip: number) => {
    const path = [new B.Vector3(x, 0, z), new B.Vector3(x + flip * 0.2, 2, z), new B.Vector3(x + flip * 0.55, 4, z), new B.Vector3(x + flip * 1.1, 6.2, z)];
    const stem = B.MeshBuilder.CreateTube("curvedPalm", { path, radius: 0.2, tessellation: 10, cap: B.Mesh.CAP_ALL }, scene); stem.material = trunk; stem.parent = parent;
    const crown = path[3];
    for (let i = 0; i < 9; i++) {
      const angle = i * Math.PI * 2 / 9;
      const left: B.Vector3[] = [], right: B.Vector3[] = [];
      for (let j = 0; j <= 7; j++) {
        const t = j / 7, distance = t * 3.25;
        const width = Math.sin(t * Math.PI) * 0.42;
        const y = crown.y + Math.sin(t * Math.PI) * 0.45 - t * t * 0.75;
        left.push(new B.Vector3(crown.x + Math.cos(angle) * distance + Math.sin(angle) * width, y, z + Math.sin(angle) * distance - Math.cos(angle) * width));
        right.push(new B.Vector3(crown.x + Math.cos(angle) * distance - Math.sin(angle) * width, y + 0.08, z + Math.sin(angle) * distance + Math.cos(angle) * width));
      }
      const frond = B.MeshBuilder.CreateRibbon("palmFrond", { pathArray: [left, right], sideOrientation: B.Mesh.DOUBLESIDE }, scene); frond.parent = parent; frond.material = i % 3 ? leaves : lightLeaves;
    }
  };
  // Everything built so far is the STATIC backdrop + running track (sky, clouds, headlands,
  // ocean, foam, touchlines, curbs) — none of it ever moves. Freeze each world matrix so
  // Babylon skips their per-frame recompute. The sky is EXCLUDED: infiniteDistance meshes
  // must re-follow the camera every frame, so freezing it would peg it in place.
  for (const m of scene.meshes) if (m !== sky) { m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; }

  const sections: B.TransformNode[] = [];
  const shadowCasters: B.Mesh[] = [];
  for (let i = 0; i < ROUTE_BLOCKS; i++) {
    const root = new B.TransformNode(`coastalBlock${i}`, scene); sections.push(root);
    for (const x of [-1.2, 1.2]) box("laneGuide", 0.045, 0.01, 1.8, x, 0.035, 0, white, root);
    for (const side of [-1, 1]) {
      const district = DISTRICTS[Math.floor(i / BLOCKS_PER_DISTRICT)];
      const kind = district.kind;
      const sx = side * 9;
      palm(side * 7.6, -7, root, side);
      if (kind === 0) {
        // Layered club stands with shaped seats and fans, shaded by a striped canopy.
        for (let row = 0; row < 3; row++) {
          const x = side * (8 + row * 0.8), height = 0.3 + row * 0.5;
          box("standStep", 0.9, height, 9, x, height / 2, 0, ink, root);
          for (let seat = 0; seat < 7; seat++) {
            const z = seat * 1.15 - 3.5;
            box("seatBase", 0.56, 0.1, 0.68, x, height + 0.08, z, mint, root);
            box("seatBack", 0.1, 0.45, 0.68, x + side * 0.25, height + 0.28, z, mint, root);
            if ((seat + row + i) % 3 !== 0) {
              sphere("fanShirt", x, height + 0.42, z, 0.42, 0.56, 0.42, [coral, white, yellow, lavender][(seat + row) % 4], root);
              sphere("fanHead", x, height + 0.85, z, 0.29, 0.32, 0.29, sand, root);
            }
          }
        }
        for (const z of [-4.7, 4.7]) box("canopyPost", 0.12, 3.8, 0.12, side * 10.4, 1.9, z, white, root);
        for (let stripe = 0; stripe < 8; stripe++) {
          const roof = box("canopyStripe", 3.7, 0.12, 1.25, side * 9.3, 3.8, stripe * 1.25 - 4.4, stripe % 2 ? white : coral, root); roof.rotation.z = side * 0.12;
        }
      } else if (kind === 1) {
        // Pastel clubhouses with overhangs, recessed windows and balcony rails.
        const height = 4.5 + i % 3;
        box("clubhouse", 4, height, 8, side * 10.2, height / 2, 0, facades[i % 3], root);
        box("roofTrim", 4.35, 0.25, 8.3, side * 10.2, height + 0.1, 0, white, root);
        for (let floor = 0; floor < 2; floor++) for (const z of [-2.5, 0, 2.5]) {
          box("windowFrame", 0.14, 1.55, 1.35, side * 8.15, floor * 2 + 1.5, z, white, root);
          box("window", 0.15, 1.25, 1.1, side * 8.06, floor * 2 + 1.5, z, glass, root);
          box("windowShade", 0.65, 0.13, 1.65, side * 7.9, floor * 2 + 2.35, z, coral, root);
        }
        box("door", 0.16, 1.8, 1.15, side * 8.06, 0.9, 0, ink, root);
      } else {
        // Open plazas keep the skyline from becoming a repeated wall.
        box("planter", 1.1, 0.55, 7.5, sx, 0.28, 0, white, root);
        for (let shrub = 0; shrub < 6; shrub++) sphere("hedge", sx, 0.9, shrub * 1.2 - 3, 1.3, 1.1, 1.5, shrub % 2 ? leaves : lightLeaves, root);
        box("bench", 0.7, 0.15, 3, side * 7.6, 0.6, 1, sand, root);
        for (const z of [-0.1, 2.1]) box("benchLeg", 0.45, 0.6, 0.13, side * 7.6, 0.3, z, ink, root);
      }
      const board = B.MeshBuilder.CreatePlane("clubBoard", { width: 5.6, height: 1.05 }, scene);
      board.parent = root; board.position.set(side * 6.7, 0.75, 0); board.rotation.y = side * Math.PI / 2; board.material = signs[(i + (side > 0 ? 1 : 0)) % 3];
      for (const z of [-3, 3]) box("boardPost", 0.12, 1.1, 0.12, side * 6.75, 0.55, z, ink, root);
    }
    const batches = new Map<B.Material, B.Mesh[]>();
    for (const mesh of root.getChildMeshes()) {
      if (!(mesh instanceof B.Mesh) || !mesh.material) continue;
      mesh.computeWorldMatrix(true); const batch = batches.get(mesh.material) ?? []; batch.push(mesh); batches.set(mesh.material, batch);
    }
    for (const meshes of batches.values()) {
      const merged = B.Mesh.MergeMeshes(meshes, true, true);
      if (merged) { merged.parent = root; merged.isPickable = false; merged.receiveShadows = true; shadowCasters.push(merged); }
    }
    root.position.z = i * BLOCK_LENGTH;
    root.setEnabled(visibleBlock(root.position.z));
  }
  return {
    shadowCasters,
    update(move: number) {
      for (const section of sections) {
        section.position.z -= move;
        if (section.position.z < -30) section.position.z += ROUTE_LENGTH;
        const visible = visibleBlock(section.position.z);
        if (section.isEnabled() !== visible) section.setEnabled(visible);
      }
    },
    reset() { sections.forEach((section, i) => { section.position.z = i * BLOCK_LENGTH; section.setEnabled(visibleBlock(section.position.z)); }); },
  };
}
