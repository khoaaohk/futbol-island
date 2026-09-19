# Volleyball character rendering — September 15, 2026

Local change; not deployed. This reduces rendering submissions while retaining the court, four character appearances, rally animation and football-linked conversations. It is not a measured iPhone temperature or battery result.

`lib/graphics/volleyballGame.ts` batches each fully visible character separately, retaining the original merged source rigs for edge rendering and exact per-character picking. A conservative visibility margin switches partially/offscreen characters back to ordinary per-part rendering. Exactly one representation renders per character. This preserves native color/shadow culling and avoids the initially observed regression from grouping offscreen players together. Source rigs retain world-space poses, `volleyballNpcId` metadata and entry references for conversations, hover pause and hit reactions. Each per-player batch computes tight bounds; hovered/frozen poses do not request repeated instance uploads. Whole-court offscreen pause remains.

The retained hybrid uses **58 batches instead of 108 character meshes when fully visible**, with **29,712 unchanged body triangles**. Because each batch belongs to one player, its source rig retains per-joint merging; the cross-player requirement to disable merged geometry in live matches does not apply here. Geometry remains identical to the original court, including the fallback path.

A deterministic native-frustum fixture compared the original module and final implementation at identical rally timings and a 440×760 mobile camera. Counts below include the ball and its stripes; they represent main-view submissions, not an entire island render or GPU timings.

| Flight height | Original calls | Final calls | Original/final triangles |
| --- | ---: | ---: | ---: |
| 0 | 112 | 62 | 31,216 / 31,216 |
| 10 | 112 | 62 | 31,216 / 31,216 |
| 20 | 78 | 63 | 21,276 / 21,276 |
| 28 | 13 | 13 | 4,728 / 4,728 |
| 32, 40 | 0 | 0 | 0 / 0 |

Rejected approaches: a single 14-batch court group added 25,776 triangles in the actual island's high-flight edge view; tighter per-player batches alone still added roughly 3,312 triangles in the isolated edge fixture. The final fallback removes that measured main-view edge overhead instead of accepting invisible geometry as the cost of batching.

Validation: `node tests/volleyball-batch.cjs`, generic player-batch tests and TypeScript validation pass. The volleyball regression covers body triangle parity, all four picking identities, nearest interaction, hover freeze, active hit poses, stunned-character exclusion, offscreen sleep, reveal, full-view/edge switching, exactly one representation per player, bounded edge submission and disposal. The original-module comparison fixture is `/tmp/fi2-volleyball-frustum.cjs`; temporary fixtures may disappear. Final whole-island browser validation belongs to the parent task.

Final upload refinement: fallback characters no longer regenerate/upload invisible batch matrices each pose. Returning to full visibility refreshes their current batch even if hovering has frozen the rally. The regression test checks both idle fallback buffer versions and hover-frozen return. Whole-island edge verification before this additional CPU-only gating measured calls 224→223 and triangles 266,401→266,235; the control field remained at 213 calls. GPU timings varied similarly in the unchanged control, so no GPU-time or cooling improvement is claimed from that run.
