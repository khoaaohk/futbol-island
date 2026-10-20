# Water design audit, 19 Oct 2026 (local, not deployed)

Game-design / art-direction pass on the island's water against the "Tide Bound" reference (clear shallows, soft coral IN the
water, depth, soft caustic net, life, no heavy overlays). Dev build, headless Chrome/Metal, desktop 1024x640, phone 390x844 DPR 2,
teleport via `fi2-arcade-departure-v1`. Shots: `docs/water/audit-{before,after}-{shallows,bay,sea,dive,jet,fish,whale,manta,phone}.png`,
`audit-after-pier.png` (south pier, served by the window), `audit-saver-{bay,fish}.png` (Battery saver: opaque sea; Coral Garden
NOT served by the window, so the spot's own reef shows).

## Scorecard (1-5, before -> after)

| Criterion | Score | Note |
|---|---|---|
| Readability (water / coral / shore / player) | 4 -> 4 | shore, swimmer and sea clear; coral was a teal smudge |
| Depth & clarity | 3 -> 3.5 | clear shallows good; open sea was a flat cyan sheet |
| Motion & life | 3 -> 3 | net drift, swells, whale shark and mantas good; fish schools tiny from the 22 m swim camera |
| Consistency across modes | 3 -> 3.5 | fishing reefs used a different (muted) palette; dive looks like surface swim |
| Colour harmony with the island | 4 -> 4 | pastel turquoise fits the island |
| Kid appeal / wow | 3 -> 3.5 | whale shark / manta are the wow; coral now has pinks, purples, oranges |
| Heat cost | 4 -> 4 | fixes add 0 draws, ~2 ALU on the ocean; draw counts identical before/after in every view |

## Top 8 issues (by player impact) and cheap fixes

1. **Coral reads as mono teal silhouettes** (the accents exist, the reef shader absorbs, desaturates and over-paints them).
   FIXED: `clearWindow.ts underMaterial` reef `CLEAR_UNDER(.75,.8,'.95,.5',.55,.6)` -> `(.3,.8,'1.15,.85',.4,.35)`;
   `waterSurface.ts CLEAR_WIN.alpha` [.16,.5] -> [.14,.42].
2. **Fishing spots' coral did not match the walking water** (per-theme `muted` palettes). FIXED: one palette `CLEAR_CORAL`
   (teal, accents, accentShare .5, grass) in `fishing/underwater.ts`; `clearWindow.ts` paints from it; every shore theme's
   `coral` = `clearCoralMix(i)` (accents and teals 1:1, rotated per spot so the leads still differ), grass pulled to the same greens.
   Served spots use the window itself; unserved spots (piers/boats out of reach, tiers 3-4, Battery saver) now show the same colours.
3. **Open sea is a flat cyan plane under an even caustic net** ("cracked glass", no depth). FIXED: `waterSurface.ts` ocean
   fragment mixes toward deep blue `vec3(.02,.19,.4)` by `smoothstep(25,110,d)*.55`; the net's weight `(.6+.9*nearS)` -> `(.2+1.3*nearS)`
   (unchanged in the shallows, a third at sea).
4. **Submerged animals read as dark navy holes** (sharks, deep shapes). FIXED: `seaVeil.ts SEA_COLOR` (.03,.2,.24) -> (.05,.27,.33).
5. **Diving barely differs from surface swimming** at the follow camera. Fix: `swimClear.ts` ease `SWIM_CLEAR.diveAlpha` .36 -> ~.25
   and a 10-15 % darker/bluer bed under `uSwimDive` (uniform only). Not done (dive work just finished).
6. **Broad pale swell bands sweep over the clear window** (phone shot) and the pale sand shelf ends in a crisp drop-off line.
   Fix: `waterSurface.ts` scale `reach*crest*vec3(.1,.14,.12)` by `(1.-.6*clearWinMask)`; bed `smoothstep(1.5,9.,cwD)` -> `(1.5,13.,cwD)`.
7. **Sea life is small and sparse from the 22 m swim camera** (fish schools barely read). Fix: `clearWindow.ts CLEAR_LIFE.fish`
   size x1.3 and `per` 6 -> 8 (same instanced draw, vertex-only cost).
8. **Heat: the blended window stays open in the jetpack view (camera ~41 m, 267 draws) and in open water ~40 m out.** Fix:
   `clearWindow.ts` close above ~25 m camera height (performance-guide rec (d)); open only when the look point is inside the band.

## Checks

`npx tsc --noEmit` clean; `npm run -s test:quiet` 216/216. `tests/fishing.cjs` depth test now skips coral colours already within
0.15 of the water's deep tint (teal corals from the shared palette; the pull toward the tint is moot there). Battery saver: opaque
sea, static net, the swim seabed disc, the unserved fishing reef in the shared palette (audit-saver-*.png). Not verified on an iPhone.
