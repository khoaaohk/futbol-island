# Arcade comic shading kit (3D)

The arcade's house style (owner, Nov 10 2026: "all these games should be in the new style"): Breakaway Run's comic print
look as shared code. One implementation: Breakaway (`runnerTrack.ts`, `looks/runner.ts`, `runnerGame3d.ts`) and Pass Puzzles
(`passPuzzleScene.ts`, `puzzleComic.ts`, `looks/puzzle.ts`) both import it. The HUD half lives in `components/games/comic/`.
Import from the files (`./comic/shading`), not the folder: the node tests cannot resolve a directory import.

## Adopt it in a game
1. **Look:** `comicLook({id, background, fog, camera, sun:{position, shadowMapSize, frustum, ...}, ball, environment})`
   (`look.ts`). The base gives no tone mapping, a white sun (2.6), a neutral hemisphere (0.55), matte surfaces and the heat
   rules. Keep those light levels: the band thresholds assume them. Put the sun LOW (15 to 25 degrees) for long shadows.
2. **Uniforms:** one set per game, `const ink=createComicUniforms({...})`, then `comicDotCell(ink, renderer)`.
3. **Materials:** `comicMaterial(material, {uniforms:ink})` on every lit material (Standard / Lambert / Phong; vertex colour,
   instance colour and maps all work), or `comicTree(root, {uniforms:ink})`. Characters, balls and thin hero props add
   `rim:true` (sun rim + ink edge). A game with its own shader chain calls `comicShaderEdit(shader, opts)` inside it instead.
4. **Rim:** `aimComicSun(ink, directionTowardSun, camera)` before each render in which the camera or the sun moved.
5. **Props:** build them with `inkedPart(out, geometry, colour, partAt(x,y,z), inkWidth, round)` and `bakeParts(out)`:
   the outline is an inverted hull inside the same geometry, so it costs triangles but no draw.
6. **Impact:** `comicStarGeometry()` twice (ink behind, colour in front, unlit, facing the camera), only while it shows.
7. **Backdrop** (static cameras only): `comicCoastTexture()` on one unlit quad (`backdrop.ts`).

## Parameters
| Where | Parameter | Default (Breakaway) |
| --- | --- | --- |
| `createComicUniforms` | `bands` [shadow ends, light starts], lit / albedo ratio | `[.24, .335]` |
| | `dot` halftone cell px (`comicDotCell`: 3.4 css px x pixel ratio) | 5 |
| | `shade`, `light` multiply tints of the two bands | violet `(.55,.47,.74)`, warm `(1,.96,.86)` linear |
| | `rim` colour, `rimStrength`, `ink` colour | `#ffd98a`, 1, `#231a2e` |
| `comicShaderEdit` / `comicMaterial` | `rim`, `inkWidth` (x the default line), `gate` (GLSL bool), `pars`, `defines` | off, 1, none |
| | hooks `afterLit`, `afterTone`, `rimLight`, `rimAfter` (GLSL; see Breakaway's lamp pools and lightning) | none |
| scene light | direction = the stage's one directional light; `uInkSunV` only aims the rim | |
Hex tints passed as strings are converted from sRGB: `'#8f78b8'` is much darker than the default violet. Omit `shade` to match.

## Cost
No pass, light, render target or texture. About 12 fragment instructions per lit pixel; `rim` adds one `fwidth`. Each
(material type, rim, inkWidth) is one program. Ink hulls roughly double a prop's triangles (0 draws).

## Traps
- A mesh with baked hulls must not both cast and receive shadows: the hull shadows the part inside it. Split casters
  (props) from receivers (ground, kerbs), as Breakaway and Pass Puzzles do.
- Hulls suit convex boxes, cylinders and cones; thin or concave shapes take the `rim` ink edge instead.
- Materials shared with another renderer need `gate` (Breakaway: `runnerBendCfg.w>.5`).

## Converting a realistic scene: what must be repainted
The bands replace the lighting, so anything that fakes light in a texture now fights them. Remove or repaint: baked
light pools, gobos and vignettes (canvas or CSS), ambient-occlusion blobs with soft gradients (use a flat disc with a
dotted edge), grain / noise / roughness maps, fog used as depth haze, tone mapping and exposure, emissive glow. Repaint
textures as flat colour with an ink edge; move colour into vertex colour where you can (Pass Puzzles dropped 4 textures).

## What did not generalise
Breakaway's sky (it turns with the route, changes weather and animates: stays a shader in `runnerTrack.ts`), its speed lines
and dust (route-space pools in `runnerFx.ts`) and the terrain / lamp / lightning hooks. Pass Puzzles has its own speed
streaks. If a third game needs the same thing twice, lift it here then.
