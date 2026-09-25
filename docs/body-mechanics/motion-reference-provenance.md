# Compact motion-reference provenance

Source: [CMU Graphics Lab Motion Capture Database](https://mocap.cs.cmu.edu/), supported by NSF EIA-0196217. The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.

CMU states that its data can be included in commercially sold products but cannot be resold directly, even in converted form. These derived curves are incorporated into Futbol Island's character animation; do not redistribute them as a standalone motion asset package. No AI4Animation, LAFAN1 or Mixamo data is included.

Manually selected sources downloaded September 22, 2026:

- `https://mocap.cs.cmu.edu/subjects/09/09.asf`
- `https://mocap.cs.cmu.edu/subjects/09/09_01.amc` — running.
- `https://mocap.cs.cmu.edu/subjects/10/10.asf`
- `https://mocap.cs.cmu.edu/subjects/10/10_01.amc` — soccer kick.

`scripts/bake-motion-reference.mjs` reads these local files, resolves ASF axes/hierarchy and AMC degrees into root-heading-relative positions, then retargets upper-arm directions, elbow flexion and chest orientation into six scalar channels. It removes the average posture, closes the running loop and samples 25 points. Output is `lib/graphics/motionReference.ts`; frame selections, assumed 120 Hz sampling, hashes and mean values are recorded in `motion-reference-analysis.json`. The source trial files stay outside the runtime/public assets. The importer never crawls or downloads the database.

The running excerpt spans zero-based frames 35–123 (rearward left-ankle extrema). The soccer excerpt spans 568–658, normalized around a forward ankle-speed maximum at 598. This is a **contact timing proxy**, not a captured ball-contact annotation: the file does not supply the ball trajectory. Our constrained strike curve and release marker retain authority over contact. Only small demeaned upper-body accents are used; raw source foot/root travel is not imposed on the game.

Reproduce with `node scripts/bake-motion-reference.mjs /path/to/four/source/files`. The tool also writes `/tmp/fi-mocap-reference.svg` for inspection. Source skeleton motion was inspected in a rendered side-view contact sheet; in-game integration is separately covered by the body-mechanics browser check. This is a small reference set, not a general motion-matching database or a trained character model.
