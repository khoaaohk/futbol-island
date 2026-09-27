# Bean characters in the real game: contract (Sep 25 2026)

The user approved the "Bean buddies" direction. See the prototype at `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/bf21bd3b-8bef-46f7-a44a-b2461b53a632/scratchpad/characters2/` (bean.js, main.js) and the motion demo at `scratchpad/charpage/bean-motion.html` plus `scratchpad/charpage/src/`.

Their words: "those look great, we will need two teams, 11 each side, and then regular NPC characters. We also need the ability to have a character builder for the main male and female characters. Make sure each team has the same uniforms."

It's our own design, inspired by the Coastal World approach, with no copied characters.

**Rules:**
- AGENTS.md applies: teach football; phone heat is a primary requirement (docs/performance-guide.md).
- Nothing is committed or deployed. Don't restart the :8092 dev server.
- One owner per file. Re-read any shared file right before editing it, and never revert another lane's change.

## What stays the same

- The motion solver in `lib/graphics/player.ts`: foot locks, reactions, called/ready, squash, flight, vehicles and shirt-number logic.
- Bean bodies are a **skin** driven by the solver's hidden joints. The limbs are vertex-shader bezier tubes from shoulder/hip through elbow/knee to hand/ankle, as in the prototype.
- The `PlayerRig` API is unchanged, so every existing `createPlayer` call keeps working.

## Style switch

- New `lib/graphics/characterStyle.ts` exports `CHARACTER_STYLE: 'bean'|'classic'`, default `'bean'`. `'classic'` renders exactly as today, for rollback and tests.
- **Costumes (animal club costumes)** are built for the classic body. While a costume is equipped, that rig renders classic until the costumes are refit. This is a known follow-up for the user.

## BeanLook (lane A defines it in `lib/graphics/beanLook.ts`; everyone imports it)

```ts
type BeanLook = {
  body: string;            // signature body colour (hex)
  skin: string;            // face-panel tone (hex)
  build: 'tall'|'regular'|'short'|'wide';
  eyes: 'dots'|'ticks'|'ovals'|'sleepy'|'happy';
  mouth: 'smile'|'grin'|'smirk'|'o';
  blush?: string;
  hair?: { style: 'none'|'crop'|'tuft'|'puffs'|'bun'|'ponytail'|'curls'|'long'; color: string };
  headwear?: 'none'|'cap'|'beanie'|'headband'|'bucket'|'visor'|'keeper';
  headwearColor?: string; headwearColor2?: string;
  gloves?: string;         // keepers
};
type Outfit = { kind: 'kit'|'casual'; shirt: string; shirt2: string; shorts: string; socks: string; socks2?: string; boots: string; number?: number|null };
```

`PlayerRig` gains `setBeanLook(look: BeanLook, outfit: Outfit)`, which is a no-op in classic style, and `setExpression(e)` with the expressions `neutral|calling|determined|beaten|happy|surprised|focused`. The glue drives expressions from `called`, `reaction` and goals.

## Lanes

| Lane | Owns | Job |
|---|---|---|
| **A: bean skin** | new `lib/graphics/beanSkin.ts`, `beanLook.ts`, `characterStyle.ts`, `lib/graphics/playerBatch.ts`, the **skin hook lines** in `player.ts` (additive only), `lib/graphics/shirtNumbers.ts` (bean back placement), new `tests/bean-skin.cjs` | A production port of `bean.js`: shared materials; a **face atlas** (all expression × eye/mouth variants in one shared texture, cells chosen per instance); shirt numbers on the bean back; bean hair/headwear meshes; **instancing** so 22 players + ~10 NPCs stay a small number of draws (per-player limb control points via instanced attributes or a data texture, not per-rig materials); LOD (hide face/number when tiny, like the shirt numbers). It must pass the existing player/foot-lock/reaction tests in both styles. |
| **B: motion** | the motion code in `lib/graphics/player.ts` (not A's hook lines), `lib/town/match/choreo.ts`, minimal edits in `lib/town/match/matchSim.ts` | Port the prototype's **keeper dive** (set, push off, full stretch, land on the side, get up) and **jumping header** (take-off, contact at the peak, landing squash) into the rig as new optional `PlayerMotion` fields (e.g. `dive?: {progress, dir}`, `jump?: {progress, height}`). Drive them from live matches: keeper saves dive, and aerial duels/crosses jump. Also improve the **slide tackle** (the round body stayed too upright in the prototype). Add tests; keep the sim-balance gates. |
| **C: teams + NPCs** | new `lib/town/beanLooks.ts` (team kits + deterministic player looks + NPC looks), and the look wiring at the call sites in `lib/town/fieldRuntime.ts`, `lib/graphics/islandNpcs.ts`, `lib/town/coachPractice.ts`, `lib/arcade/passPuzzleScene.ts`, `lib/graphics/volleyballGame.ts`, `lib/graphics/liveKnockout.ts`, `components/Pitch.tsx`, and the **local NPC** lines in `components/Town.tsx` | **Two teams of 11. Every player on a team wears the identical kit** (same shirt, shorts, socks and boots), with keepers in a distinct keeper kit as the Laws require. Players vary only in body colour, face, hair and build. No random hats in matches (hair only; keepers may wear a keeper cap). Regular islander NPCs get varied casual outfits and headwear. Everything is seeded by id, so looks are stable. Format support: 11v11, 9v9, 7v7, futsal. |
| **D: character builder** | `lib/town/customization.ts` (with save migration), `components/CharacterPreview.tsx`, the character-builder UI (find the existing character/customization screen), and the **main player creation line** in `components/Town.tsx` | Builder for the main **male and female** characters: body colour, face tone, eyes, mouth, hair style + colour, build, headwear. Keep the existing vehicle/ball/costume options. Male and female presets set sensible defaults (e.g. hair styles) but every option stays open to both. Live 3D preview using the real rig. Reuse the app's design system (IslandBrush, cream cards, gold pills, dark see-through dialogs). Migrate old saves (`character`, `face`, `body`, `clothing`) into BeanLook defaults. |

## Gates (every lane)

- typecheck and `npm test`;
- your new tests;
- all existing `tests/player-*.cjs`, `tests/shirt-numbers.cjs`, `tests/choreo.cjs`, the live/match tests and the heat tests (`tests/heat-idle.cjs`, frame-cap);
- visual checks with headless Chrome at 390×844 and 1280×800 on the real app (look at the screenshots).

A reports draw calls and triangles for a live 11v11 plus the town in the performance guide (emulation numbers, not iPhone temperature).

When your lane is done, append a "Lane X: status" section here.

## Lane D: status (Sep 25 2026, local, not committed)

**Done**
- `lib/town/customization.ts`: `CharacterCustomization` gains `bodyColor, skinTone, eyes, mouth, hair, hairColor, build, headwear, headwearColor`. Colours are palette ids (not raw hex), so every field sanitises against `CUSTOMIZATION_OPTIONS` like the gear does. Exports:
  - `BEAN_KEYS`, `BEAN_PRESETS` (male: coral / crop / dots; female: sky / ponytail / ovals), `selectCharacter` (a preset sets hair, eyes, mouth, body colour and headwear, plus the old kit default; it keeps face tone, build, gear and costume), and `applyCustomization(value,key,id)` (one choice; face tone and build keep the classic `face`/`body` in step for costumes and classic style).
  - `beanLookFor(value)` → `BeanLook`, `playerOutfit(value)` → the player's own kit from `clothing` (classic = gold home, coast = blue away, sunset = orange) with `number: 10` (`MAIN_PLAYER_NUMBER`).
  - `migrateBeanFields(legacy)` and `SHIRT_NUMBER_ROLES` (classic 1–11 → positionReference ids).
- **Save migration** (same storage key): missing or unknown bean fields come from the old fields. `character` picks the preset (captain → gold headband, explorer → green bucket hat), `face` gives the tone (warm → caramel, deep → cocoa, light → peach) and `body` gives the build (balanced → regular, strong → wide, slim → tall). Unknown keys are dropped.
- `components/CharacterCustomizer.tsx` (+ module CSS): the Character tab is now the builder.
  - "Start from" Male/Female uses the existing `CharacterToggle`. IslandBrush group headings sit on the wardrobe's cream card. Colours are swatches; eyes, mouth, hair, build and headwear are gold paper pills with the wardrobe's pink pressed state. Headwear colour only appears once a hat is chosen.
  - The Kit pills lead into the "Why number 10?" lesson: tap 1–11 to see the traditional role, with the attack line and key skills taken from `positionReference.json` (11v11).
  - The costume select is kept. When a costume is equipped, a note under the preview explains that the costume body shows. The Balls & rides tab is unchanged.
  - The preview is sticky: beside the options on desktop, pinned above them on phones.
- `components/CharacterPreview.tsx`: the real rig with `setBeanLook(beanLookFor, playerOutfit)`, shirt 10 and a neutral expression (so the chosen eyes and mouth show). **No idle loop.** It draws on change, resize or drag-to-turn (one coalesced frame per pointer move), plus a bounded 0.9 s settle burst at ≤24 fps. Nothing draws while the page or the preview is hidden (IntersectionObserver + visibilitychange). Reduced motion gives a single frame. Measured on the builder at rest (390 phone profile): 0 rAF/s, 0 preview frames. Onboarding and PositionGuide share this preview, so they are now on-demand too.
- `components/Town.tsx` (main player only): `createPlayer('you'…)` line and the `appliedCustomization` flow call `player.setBeanLook(beanLookFor(c), playerOutfit(c))` after `setAppearance`. Shirt number stays `DEFAULT_PLAYER_NUMBER` (10).
- Tests: `tests/customization.cjs` covers migration (male/female/captain/explorer, loadCustomization from an old save), sanitising (bad values, unknown keys, non-objects, round trip), both presets, every option on both presets reaching the `BeanLook`, classic field sync, the kit + number 10, the number-lesson references, and the rig accepting every look.

**Gates:** `tsc`, `npm test`, customization, heat-idle, player-appearance/batch/profiles/reactions, shirt-numbers, club-costumes, costume-heads and coin-quest pass. `tests/live-knockout-work.cjs` (batch count 13 vs 14) and `tests/movement-work.cjs` (merged-mesh delta 5 vs 7) fail on rig mesh counts. That is lane A's in-progress `player.ts`/batching work; lane D touches no mesh code.

## Lane C: status (Sep 25 2026, local, not committed)

**`lib/town/beanLooks.ts`** (pure data, no three.js):
- `TEAM_PALETTES`: seven island kits (gold, teal, coral, navy, plum, cream, crimson). Gold `#edb957` vs teal `#356478` is the default pair (`DEFAULT_MATCH_KITS`). `KEEPER_PALETTES` has six keeper kits.
- `matchKits(home, away)` resolves a pair plus two keeper kits. The clash check is CIE76 ΔE on the shirt, with `KIT_CLASH_MIN = 35`. A clashing away pick falls back to the next palette that doesn't clash. Each keeper kit is the first one that clashes with neither team (and the away keeper also avoids the home keeper), as Law 4 requires. The default pair gives green (home GK) and volt (away GK).
- `matchPlayerDress(key, side, keeper, number, kits)` puts the team kit on verbatim; only the number differs. The look varies by key: body, face tone, eyes, mouth, hair and build. Outfield players always get `headwear:'none'`. Keepers get gloves (kit trim) and, half the time, a keeper cap in kit colours.
- **Body colour families (readability):** from distance or from above, the bean body is most of what you see, and the kit is only the lower band. So a body leans to its own team's colour family and stays at least `BODY_KIT_MIN = 38` hue-weighted ΔE from the opponent's shirt and the keeper kits. With the default pair, gold players get warm bodies and teal players get cool ones. Keepers get bodies that read as neither team. Every family keeps at least 4 colours.
- `fieldTokenDress(pitch, token, number, simKeeper)` is used by fieldRuntime for live matches **and** taught plays and quizzes. A keeper is the `gk`/`dgk` slot, a token labelled GK, or the sim's `isGK`. Looks are seeded by pitch + slot. Numbers still come from `classicShirtNumber`.
- `npcDress({id, role, character, face, clothing})` gives islanders `kind:'casual'` outfits. Tops come from the NPC's old clothing family, with varied trim, bottoms, socks and shoes. Headwear suits the role (`roleHeadwear`): coach/mentor get cap or visor; reporter/fan get cap or beanie; beach/pier get bucket, visor, cap or headband; market/cafe get bucket, cap or visor; players get headband, cap or beanie. The old `face` maps to a skin-tone band and `character` biases hair styles. Everything is stable per id.
- `sideGameDress(key, side, number)` is used by two-team side games (no hats, identical kits).

**createPlayer call sites:**
| Site | Status |
|---|---|
| `lib/town/fieldRuntime.ts` (live 11v11/9v9/7v7/futsal + plays + quiz replays) | bean look, team kits, keeper kits, classic numbers |
| `lib/arcade/strikerScene.ts` → `arcadeStage.player(color, dress)` → `islandArcadePlayer.ts` (Island Strikers) | bean look, team kits, keeper kits. The selected player stays marked by the existing ring. |
| `lib/arcade/arcadeGames.ts` (runner/tennis/pinball) | player 0 gets the home kit; the three opponents get an identical away kit. In the runner, `useMainAppearance` now also applies the builder's `beanLookFor`/`playerOutfit`. |
| `lib/arcade/passPuzzleScene.ts` | attackers home kit, defenders away kit, keeper away-keeper kit (#1) |
| `lib/graphics/liveKnockout.ts` | alternating home/away team kits |
| `lib/graphics/volleyballGame.ts` | 2v2 team kits plus role headwear (beach roles) |
| `components/Town.tsx` local NPCs (draw-the-pass lesson passer #8 / defender #4) | home / away kits |
| `lib/graphics/islandNpcs.ts`, `lib/town/coachPractice.ts` | casual outfits + role headwear |
| `components/Pitch.tsx` | bean look + kits (home players numbered by their id). **Note:** `Pitch` is only mounted by `components/Academy.tsx`, which nothing renders, so it is dead code in the current app. |
| `components/Town.tsx` main player, `components/CharacterPreview.tsx` | lane D |
| `components/CostumePreviews.tsx`, `components/MotionLab.tsx` | intentionally left (costumes render the classic body; dev study) |

Iconic plays and PassportPitch/VisualQuestion are 2D canvas/SVG, with no rigs.

**Tests:** new `tests/bean-looks.cjs` covers:
- every palette pairing, checking home/away/two keepers pairwise with no clash;
- 11v11/9v9/7v7/futsal from the real `MatchSim` rosters: one identical kit per team, keepers distinct from both teams and from each other, no hats, numbers equal to `classicShirtNumber`;
- every taught play/quiz in `public/lessons/*.json`: one kit per side, keeper kits clear;
- the Island Strikers roster;
- determinism;
- body families;
- all NPCs valid, varied and role-suited;
- a static scan that every createPlayer call site calls `setBeanLook` (or is on the documented left-alone list).

**Gates:** `tsc` clean. `npm test` passes, as do bean-looks, bean-skin, all `player-*` except body-review, shirt-numbers, choreo, live-field-frame, heat-idle, frame-cap and customization. Two tests fail outside lane C: `player-body-review` (support-height, motion) and `live-knockout-work` (batch count 13 vs 14). The knockout failure predates lane C's wiring: it was already failing while `setBeanLook` was still A's no-op.

**Visual** (headless Chrome, 1280×800 and 390×844; scratchpad `laneC/shots*.cjs`, `laneC/shots/`): I checked a live 11v11 (overview, mid-distance, both keepers close-up), a taught 11v11 play, a quiz replay, Island Strikers (1280 and 844×390 landscape) and eight town NPCs. Both teams wear identical kits. The GKs are green with a cap and yellow gloves, and volt with dark gloves. Warm/cool body families make gold vs teal readable at a distance and from the Strikers top-down camera; before the families were added, bodies of every colour made the teams hard to tell apart. NPCs show varied tops and caps, beanies, bucket hats and visors.

**Note for lane A:** team read still depends mostly on body colour. A larger kit area on the bean (for example, the shirt reaching the shoulders) would make teams read better at LOD distances.
- **After lane A's skin landed:** `tsc` and customization still pass. The preview frames the bean by the classic joint meshes it follows, because bean meshes carry loose culling boxes and fitting to them left the character tiny. Costumes still frame their visible meshes. This uses `beanSkinOf` from `beanSkin.ts` (import only).
- **Visual checks** (headless Chrome on :8092, 390×844 DPR 3 and 1280×800 DPR 2): the default, female preset, male preset, option changes (lime / curls / ginger / happy / grin, then red cap / wide / coast kit), the number lesson and an old female/deep/slim/sunset save (migrated to female, cocoa, tall, sunset kit) all render the bean live. A migrated save with a beanie shows the main player in the town as a lime bean with a beanie in the orange kit. Screenshots are in the session scratchpad `laned/`.
- **Notes for lane A (not changed by D):** the away/coast kit shirt `#356478` reads as dark green under the preview's sunset lighting, and the ponytail is hard to read from the front three-quarter view.

## Lane E: status (Sep 25 2026, local, not committed)

**Bean costumes are live.** All 24 island costumes (23 club-story animals plus the Matchday Fox; the brief said 25, but the data has 24) now have a bean version, so a costumed rig no longer falls back to the classic body.

- **Design: onesie + hood.**
  - The hood is a soft rim framing the face panel, plus the animal's ears, horns, mane, comb, antlers or crest on the head-top.
  - Birds, the dinosaur, wolves, the dog, the pig and the puma also get a kigurumi snout or beak visor with eyes above the face.
  - The face panel is untouched: the player's own skin tone, eyes, mouth and live expression show through (AGENTS.md).
  - The body carries the animal's pattern (stripes, bands, patches, belly, orca saddle, spots) and the island training colour as a sash, or a collar band for the bee, zebra and dog.
  - Tails, wings, flippers, back spikes and fins are added parts. Paws and hooves are mitten and boot tints.
- **Code:** new `lib/graphics/beanCostumes.ts`, which uses only lane A's exported API (`beanSkinOf`, `BeanMaterial`, `BD`, `beanBodyDims`).
  - **The switch:** `attachBeanCostumes(rig)`, wired by lane A's one-line hook in `createPlayer`. For a costume with a bean version, it calls lane A's `setAppearance` with `costume: 'none'`, so the skin stays active and the classic body and costume are never built. It then swaps the body and limb materials for `BeanMaterial` subclasses that sample the costume pattern and limb bands. Face, expression and number still come from the data row.
  - It hides hair and hats with `layers` (not `.visible`, which lane A owns) and attaches the merged parts to the joints.
  - Unknown ids, or any future costume without a bean version, keep lane A's classic fallback. Classic style is a no-op.
  - Changing the build through `setBeanLook` refits the parts. Removing the costume restores lane A's materials and layers.
- **Heat:**
  - Parts are merged per joint (torso, lumbar, chest, shoulders, elbows) into at most 7 meshes, with one shared vertex-colour material for every costume. The classic costumes used up to 29 meshes.
  - Part geometry is cached per costume × build and shared by every wearer. It is never rebuilt per frame, and there are no per-frame updates.
  - There is one 256² pattern canvas per costume, created on demand and shared, not one per player.
  - Up to 4.2k part triangles per costume.
- **UI:** `components/CostumePreviews.tsx` renders the bean versions on the player's own bean look (face, build, kit and number 10), framed from the feet to the top of the costume. `components/CostumeCollection.tsx` needed no change. Costume stories and teaching data are untouched.
- **Tests:** new `tests/bean-costumes.cjs` covers:
  - every id × 4 builds builds, with finite geometry, the mesh and triangle budgets, and distinct looks;
  - the shader hooks are found in lane A's compiled body and limb shaders;
  - on a real bean rig: parts on joints, skin active, no classic costume or classic meshes visible, expression still changes under the hood, build refit, removal restores, unknown ids fall back to classic, shared geometry and material;
  - classic style is untouched.
- **Gates:** `tsc` is clean, `npm test` passes, and club-costumes, costume-heads, bean-skin, player-appearance, player-batch and shirt-numbers pass. `bean-looks` currently fails on lane C's own palette assertion ("away body … reads as the opponent"), which is unrelated to costumes.
- **User decisions (Sep 25 2026), done:**
  - Every club costume now reads as its club's home kit. The new `CLUB_KIT_COLOURS` in `lib/town/costumes.ts` sets body = main kit colour, accent = second kit colour, and a pale natural chest. The mascot `color`/`accent` fields there are unchanged and still used by the history lessons. This applies to both the classic and bean bodies, via `islandCostumes.ts`. Examples: blue-and-garnet Barça cat, red Arsenal croc, royal-blue Chelsea lion, red Nagoya orca (now clearly different from black Santos), pink Cerezo wolf, navy-and-gold Pumas puma. Natural cues are kept: eyes, noses, beaks, the white chest, the rooster's red comb. Atlético's gold back band is gone; it now has black-and-white stripes. Flamengo has red-and-black hoops. The Matchday Fox has no club and keeps its gold and teal. Island names and habits stay original game fiction, and the collection note now says "in their clubs' colours".
  - All sashes are removed. Only the dog keeps a collar, as part of a dog's look, in the club kit colour.
  - `tests/club-costumes.cjs` now asserts the club colours in place of the old "no club kit palette" rule, with a dated comment. `tests/bean-costumes.cjs` checks the club body colour on the sleeves and club colours in the parts.
  - The Santos orca was redone: white eye patches on the front of the hood, a white chin and belly, a tall raked dorsal fin that shows above the shoulders, and broad flippers with white undersides.
  - The puma was redone: rounded upright ears with dark backs, a tawny face rim, a muzzle with whisker pads and a pink-brown nose, and a long tail with a dark tip.
  - The classic body's own training scarf in `clubCostume.ts` (classic style only) is unchanged.
- **Superseded, kept for the record:**
  1. **Sash colour.** I used the island training colours, following the existing "no club kit palette" rule in `tests/club-costumes.cjs`, not the real club kit colours the brief mentioned. Switching is a one-line change in `specFor`.
  2. **Island palettes.** Twelve costumes use island palettes that differ from the club palettes (for example, Glint the eagle is purple and gold, while Benfica's eagle is brown), as the classic costumes did.
  3. **The puma** reads the weakest (low round ears plus a muzzle).
  4. **Santos orca eye patches** sit on the sides, so a front view barely shows them.

**Lane C update: same body colour per team** (user direction, Sep 25). In every team context, each player on a team now has the SAME body colour as well as the identical kit. The contexts are:
- live games at all formats, plus taught plays and quiz replays;
- Island Strikers and the arcade team games;
- Pass Puzzles;
- the rooftop knockout and volleyball;
- the draw-the-pass lesson NPCs.

How it works:
- `teamBodyColour(kit)` is a light tint of the shirt: dark shirts are lifted 30%, mid shirts 14% and light shirts 6%. With the default kits, the bodies are gold `#eebd61`, teal `#7293a1`, the green home keeper `#589f71` and the volt away keeper `#dbed46`.
- `kitsClash` now checks shirts **and** team bodies. So for every palette pairing, the four bodies are at least ΔE 35 apart (the closest pair is 35.8).
- Individual variety is now only in shape and character: build, hair style and colour, face tone, eyes and mouth. Outfield players still wear no hats.
- The warm/cool body families from the first pass are removed. Islander NPCs keep colourful bodies and casual outfits.
- `teamedLook(ownLook, dress, number)` gives the player's own character team colours while keeping their own build, hair and face. `islandArcadePlayer` uses it for rig 0 ("you") in Island Strikers and the arcade games, and the existing ring still marks the selected player.
- **Open item for lane D:** the main Town rig appears in the draw-the-pass lesson (as receiver) and in the rooftop knockout when you join. That line belongs to lane D. To follow the team, it can call `teamedLook(beanLookFor(c), sideGameDress('you','home'), 10)` while those activities are active.

`tests/bean-looks.cjs` now checks:
- one kit + body per team for every format;
- every taught play and quiz, and the Strikers roster;
- the same body in every team context (`sideGameDress`/`matchPlayerDress`);
- body distances for all pairings;
- keeper bodies distinct;
- shapes still vary;
- `teamedLook` keeps the player's shape;
- NPC bodies stay colourful.

I retook the live 11v11, play and Strikers screenshots at match distance (1280 and 390 wide). Gold vs teal reads instantly, and the keepers are green and volt.

## Lane B: status (Sep 25 2026, local, nothing committed or deployed)

**Rig (`lib/graphics/player.ts`, motion code only; lane A's skin hook lines untouched).** New optional `PlayerMotion` fields:
- `dive?: {progress, dir: -1|1, height?}` with milestones `DIVE_PHASE` (push .1, lift .18, contact .3, land .42, rise .6, up .92). The sequence is: set low → push off the near foot → airborne full stretch (a clear gap under the body) with both gloves leading past the head (top hand over, bottom hand under) → land on the side with the underneath arm coming forward to cushion → up via the knees.
  - The roll and lift live on the **pelvis** (the body root), because hosts overwrite `root.position.y` and `root.rotation.z`. The host keeps root travel.
  - Both boots are released from the push-off until the keeper is back on his feet. A diving keeper never turns to face his own sideways travel.
  - A landing squash fires once. Clearing the field fades the dive out over ~.15 s.
- `jump?: {progress, height}` with `JUMP_PHASE` (take-off .24, peak .47 = header contact, land .7). It loads, lifts the root by `height`, tucks the legs and points the toes at take-off. Arms swing unless a reaction (the header) owns them. A take-off stretch and a landing squash on both feet fire once each. It combines with `reaction: 'header'`.
- **Slide upgrade:** the hips drop to ~.3 m, the torso leans back ~42°, the lead leg lies long and flat on the grass to the ball, the trailing leg tucks and the trailing hand is out on the turf. This intentionally changes the `'slide'` reaction output.
- **Ground guard:** runs only while diving, jumping, sliding or stumbling. Every body part is an ellipsoid on its joint (body = the bean lathe of the widest build in bean style, the jersey in classic; plus head, shoulders, elbows, hands, hips, knees and boots). Its exact lowest point is lifted to ≥ 1.5 cm by raising the pelvis. Boots may rest as deep as they stand flat in the ordinary gait. No world-matrix traversal. If beanSkin later exposes its real shape, `groundBody` can read it.
- **Parity:** with no `dive`/`jump` field, every joint is identical frame-for-frame to the pre-lane-B rig. This is proven by a golden hash (`tests/fixtures/player-motion-parity.json`, written from the old file) over 10 scenarios (sprint + brake, cut + plant, backpedal/jockey/ready, shot, pass, receive, the upright reactions, called + squash, keeper reach, walk), in both styles and with lane A's skin attached.

**Live wiring (`lib/town/match/choreo.ts` + minimal `matchSim.ts`).**
- **Shots:** choreo reads each shot ahead. It predicts when the ball enters the keeper's save reach (keeper motion and the strike keep-out included). When the save is ≥ 3.5 u from him, or the ball will beat him, it starts the dive so the hands arrive with the ball, re-timing it during the set.
  - It sets the dive side, a height from the shot placement, and the keeper's facing toward the shot.
  - A parry during a dive does not stack a deflect reaction on top.
- **Keeper travel (sim):** new read-only `venue`, `aerial`, `keeperDive`, `saveReach` and `flightHold`. On a distance save or parry the keeper travels to where he met the ball over the flight (`gkDive`, ~.19 real s). It is cleared on kick-off.
- **Crosses:** for a header cross dropping onto its target, the target and the nearest outfield challenger jump. The header reaction is timed to snap at the jump peak.
- **Slides:** tackles and lunging interceptions (unchanged triggers) use the upgraded slide.
- **Measured (headless, 6 × 6 min):** in 11v11 the hands meet the ball at dive progress .31–.38 (contact .30, full stretch until .42), and headers land at jump progress .44–.55 (peak .47). Keepers dive about 5–6 times a live minute because the sim shoots that often.

**Gates.**
- typecheck ✓, `npm test` ✓.
- New `tests/player-dive-jump.cjs` ✓. It covers: parity; the dive sequence for both sides × 3 heights (set, root arc, airborne gap, roll, hands leading, top/bottom hand, lying on the grass, back up, landing squash, no NaN, locks released, no pelvis pops); bean-shape and classic mesh min-Y ≥ 0 at every frame for the dive, jump, slide and stumble; the jump (load, lift = height at the peak, tuck, both feet on landing, squash, header on top); the slide (hips low, lean, lead leg on the grass); and live choreo/sim wiring in 11v11 + futsal.
- All `player-*`, shirt-numbers, choreo, live-*, match-*, striker, heat-idle, frame-cap, body-mechanics-glue and bean-* tests pass. The exceptions are `player-body-review`, `movement-work` and `live-knockout-work`, which fail identically on an untouched copy of the pre-lane-B tree (not caused by this lane).
- **Sim balance, 96 out-of-gate seeds (#24–119), before → after:**

  | Format | Goals/game | Switches/min | One-sided |
  |---|---|---|---|
  | futsal | 4.94 → 4.97 | 14.12 → 13.91 | 24 → 27 |
  | 7v7 | 4.01 → 4.00 | 11.82 → 11.83 | 22 → 18 |
  | 9v9 | 3.94 → 3.59 | 8.48 → 8.70 | 18 → 18 |
  | 11v11 | 3.76 → 3.60 | 10.42 → 10.10 | 20 → 24 |

  All goals and switches are within ±9 %. One-sided moves within count noise (SD ≈ 4.5). 11v11 crosses/game read .43 → .72 on that sample, but a second independent sample (#120–215) gives .57 → .56, so it was seed noise.

**Visual (live match at :8092, headless Chrome, bean and classic, 1280×800 and 390×844, low front/side cameras):**
- The keeper dive (11v11 and futsal) is airborne and stretched with the gloves leading, rests on the grass on its side, and gets up with nothing below the pitch.
- The slide reads as a real slide.
- No natural header cross came within 170 s. The jumping-header strip uses a header injected through `choreo.apply` on a live rig, so it exercises the same rig path. Live header timing is covered by the test.

**Open items:**
1. After a caught dive the ball sits at the keeper's dribble contact (fieldRuntime glue, not lane B), which is near his head while he lies. Putting it in the gloves is a small glue follow-up.
2. Costume rigs render classic but keep the bean ground shape, so they rest a few cm higher when lying.

## Lane F: status (Sep 25 2026, local, nothing committed or deployed)

Vehicles and gear on bean bodies, plus falls and run-overs. The rig's ride poses in `player.ts` are unchanged: the rides meet the bean instead. Bean placements apply only while the rig shows a bean (lane A's `bean-body` mesh, shape read from its data row, so every build fits). Classic style keeps the original geometry byte-for-byte.

**Files:** new `lib/graphics/beanGearFit.ts` (bean envelope maths mirroring lane A's `beanPoint`) and `lib/graphics/knockdown.ts` (fall ground keeper + fall faces). Edited: `vehicle.ts`, `flightExtras.ts`, `jetExhaust.ts`, `parachute.ts`, `ballReactions.ts` (truck knockdown roll/squash + ground keeper hook), `streetTraffic.ts` (bean pickup bed only). Town.tsx additions (three lines): `parachute.attachHands(...,vehicle.harnessAnchor)`, the knockdown lift while `crash>0`, and the knockdown face.

**Per-mode checklist** (tests/bean-vehicles.cjs asserts each; `BEAN_VEHICLES_CHECKLIST=1` prints it)
- Scooter ×6 (street, coast, sunset, mint, stunt, comet): hands on grips; decks and rails drop .07 so the front sole stands on the deck; push foot never through it; nothing below ground or inside the ride. OK
- Bike ×6 (city, basket, trail, BMX, road, mountain): saddle drops to the bean's lowest point (gap under 3.5 cm); crank moved to the centre of the circle the soles trace, with new pedals and crank arms that follow the feet (sole on pedal); trail-bike bag and mountain shock moved clear of the belly and legs. OK
- Moped ×6 (classic, coast, sunset, retro, delivery, sport): lower saddle, footrest and retro floor at sole height, narrower body box, step-through top tube, fairing, sport nose and rear racks moved clear. OK
- Moped superman: hands stay on the grips, body clear. OK. **Moped stand: the soles are 17 cm into the saddle.** The +.62 stand lift lives in player.ts. For lane B: in bean style, use ≈ +.79 (or +.62 + 0.17).
- Twin jet and helicopter pack (all 4 builds): the pack follows the torso joint, sits flush on the bean's back (0–6 cm gap, never inside), and stays on the back through Superman and hard banks. The harness is two flat backpack straps (over the shoulder, down the front, under the arm) plus a slim sternum strap, laid on the bean's own surface (≤ 1.2 cm off it on every build). This replaces the first version's round hoops, which floated off the body; see `final/harness-desk-sheet.png` and `final/harness-phone-sheet.png` for front, 3/4, back and banked views. The pack drops so the bucket brim and ponytail clear it. The downwash emits from the moved nozzles (`gearState.packBack`). OK
- Flying car and mini-plane: bean seated in the cockpit; wheel lowered to the hands; new mini-plane yoke under the hands; seat backs moved behind the bean. OK
- Rocketboard: board drops .15 so the soles sit on the deck. OK
- Iron Man: a new bean-fit suit. A rounded red shell follows the bean (lower half on the torso, upper half on the chest joint, so it bends with the spine), with a gold waist band, arc reactor and rounded pieces on the noodle limbs. Two faces: **open** (default; a gold rim, and the bean's own expression shows) or **faceplate** (gold with glowing eye slits), via `vehicle.setArmorFace('open'|'plate')`. Bean hair and hat are hidden while it is worn and restored after. The shell sits outside the bean on every build. OK
- Parachute: the harness lines leave the bean's shoulder sides (`vehicle.harnessAnchor`), 1 cm from the surface. OK
- Truck bed (bean style): a cooler seat .43 m tall and the bed floor lowered .12 m. The bean sits on the cooler and its soles rest on the floor. The bed point is unchanged. OK
- Costume + gear (fox + BMX, Iron Man, helicopter): the fit follows the body the costume shows, and everything stays finite. OK
- Falls: run over by traffic, ride crash (scooter/bike/moped), jetpack breakup fall (hang, fall, crater, dizzy), rooftop hang/fall/dizzy, parachute landing, wall splat, NPC truck knockdown. No NaN, the lowest point is on the ground every frame (boots may rest 1.3 cm in, as when standing), and the get-up completes. Before the ground keeper, the pancaked ride crash put the bean 57 cm underground. The NPC truck hit now does one forward roll while sliding, then squashes on landing. Faces: surprised → beaten while down → happy on the get-up → neutral. OK

**Screenshots** (`/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/bf21bd3b-8bef-46f7-a44a-b2461b53a632/scratchpad/laneF/final/`): `modes/<mode>-side.png`, `modes/<mode>-q.png` (1280×800) and `modes/phone-<mode>-q.png` (390×844) for all 40 cases. Overview sheets: `sheet-ground.png`, `sheet-air.png`, `sheet-phone.png`. Iron Man faces: `ironman-open-vs-faceplate.png`. Burst strips from the real app: `strip-runover.png`, `strip-jetfall.png`, `strip-npc-truck.png`.

**Gates:** tsc; npm test; bean-vehicles (new); travel-modes, ironman-helmet and parachute-landing in both styles; flight-poses, flight-turning, idle-flight-effects, jetpack-actions, offshore-flight, ride-ramps, ride-stair-pose, rooftop-travel, truck-collisions, truck-ramps, held-wheelie, customization, ball-reactions, club-costumes, costume-heads, heat-idle, knockout-grounding, shirt-numbers, player-appearance and player-reactions. `tests/store-ball-signatures.cjs` fails on its own loader (`./ballSparkles` via ballEffects.ts), not on lane F code.

**Perf:** no new loops. The pack follows the torso with one matrix multiply per frame while flying. The knockdown ground keeper runs about 110 point transforms only while someone is down. Armour and harness geometry is rebuilt only when the build changes. The pedals are 4 small meshes, shown on bean bikes only.

**Asks for other lanes**
- Lane B: the moped stand lift (above). Juggle head contact (`walkBall.juggleContact` head y 2.04) sits about 19 cm above the bean top (1.74 plus hair): the head touch should use the bean top plus the ball radius. That needs a bean head height from the rig (lane A `juggleHead`-style getter that does not switch to the costume routine).
- Lane A: the gear hides `bean-hair`/`bean-hat` by mesh name, so keep those names. Noodle kinks: none seen in the strips; the arms fold tightly in the truck-bed sit.

**Lane C: main player in team activities.** Lane D is done, so lane C now owns the main-player spot.
- In `components/Town.tsx`, the frame loop checks whether a team activity is on: `lessonRef.current` (the draw-the-pass lesson) or `liveKnockout.joined` (the rooftop knockout).
- While one is on, the player's own character wears `mainPlayerDress(beanLookFor(c), playerOutfit(c), true, 10)`. That is `teamedLook` with the home team body and kit, number 10, and their own build, hair and face.
- When the activity ends, `setBeanLook` restores their own look and outfit untouched. A customization change during an activity re-applies the team dress.
- It only re-applies when that state changes, so there is no per-frame cost.
- Tested in `tests/bean-looks.cjs`. The screenshot is `laneC/shots/lesson-*.jpg`: in the lesson, "you" and the passer are gold, matching the coach card's "watch the gold shirt", and the defender is teal.

**Lane B follow-up (lane F hand-offs, bean style only; classic identical, parity fixtures pass):**
- Moped stand: when the bean skin is active (`root.userData.beanBody`), the stand lift is .79 × stand instead of .62, so the boots stand on the saddle rather than sinking ~17 cm into it.
- Juggling head touch: new `PlayerRig.headTop` gives the bean crown in world metres (pelvis rest + `beanBodyDims().attach.headTop.y` + .03 hair, × root scale; undefined in classic). It is used in `lib/town/walkBall.ts` `juggleContact` (the head touch lives there, not in ballReactions.ts) as crown + .2 (ball radius + 1 cm), and passed through by one additive `headTop:player.headTop` in Town.tsx's walk-ball environment.
- **For lane A:** `tests/bean-skin.cjs` asserts that bean joints equal classic joints, and its moped-stand frames (line 52) now differ by design (+.17 × stand on the pelvis). Please exempt `mopedStand > 0`, or compare against the lifted pelvis.

## Lane A: status (bean skin core) — done, local, not committed

**Files:** `lib/graphics/beanSkin.ts` (new), `beanLook.ts` (new), `characterStyle.ts` (new), `playerBatch.ts` (bean row textures), `shirtNumbers.ts` (appended `SHIRT_NUMBER_COVER_GLSL`, `BEAN_NUMBER_U`, `BEAN_DIGIT_HEIGHT`), `tests/bean-skin.cjs` (new). In `player.ts`:
- the return is `attachBeanCostumes(attachBeanSkin({...rig}, joints, id, team, articulatedHands, characterStyle()))`, which includes lane E's hook, added on request;
- the two imports;
- the `setBeanLook`/`setExpression` type fields;
- the ground guard reads `root.userData.beanBody.ground`, done at lane B's request.

`characterGlow.ts` got one line: no shells for bean limbs, hair or hat, because their raw geometry is a rest pose.

**What renders**
- Every rig has four meshes, named `bean-body`, `bean-limbs`, `bean-hair` and `bean-hat` (keep these names; lane F hides hair/hat by name). The classic meshes stay in the tree, hidden.
- **Body.** One geometry for all builds, bent by the lumbar/chest rotations. At the top it matches `player-chest` exactly.
  - Kit bands: shorts to 10% of the bean, the shirt to 58.5% (just under the face panel), a collar stripe, then the kid's own colour on the crown.
  - The face atlas has 26 cells: the kid's own eyes × mouth for `neutral` (20), plus one cell per other expression (6). The number sits on the back.
- **Limbs.** Kit sleeves reach the elbow, with a cuff. Shorts cover the thigh top; kit socks cover most of the shin, with a stripe. Mittens take the body colour, or the gloves colour ×1.45 for keepers. Boots have a cream sole.
- **Hair:** crop, tuft, puffs, bun, ponytail (bigger, swept to one side so it reads from the front three-quarter), curls, long. **Headwear:** cap, beanie, headband, bucket, visor, keeper. Short hair hides under covering hats.
- **Colour.** The clay shading keeps half of each part's own hue under tinted light and lifts ambient by its brightness, not its tint. At sunset a blue kit stays blue and the sky body stays sky, where before they read dark green and teal.

**API for other lanes**
- `beanBodyDims(build)` gives armor-torso-local dims (`y0, H, W, D, belly, taper, lean, faceU/faceY/faceRX/faceRY, numberU, radius(u), point(u,a)`), plus these extras:
  - `head: {R, origin, top}`;
  - `ground` (guard spheres);
  - `attach.{headTop, hood, back, tail, frontBelly}`, with `attach.chest.*` in player-chest local coordinates.
- `rig.root.userData.beanBody` holds these dims only while the bean shows. It is undefined in classic style and while a classic costume shows, so the ground guard follows whichever style renders.
- **Where the face lives:** on the torso bean, not on player-head. Hiding player-head does not hide the face.
- `beanSkinOf(rig)` returns the skin: data row, look, outfit, expression, faceCell and `active`.
- `BeanMaterial(kind, source)` takes either the rig's row (a Float32Array or `beanRowHandle`) or a batch texture. Lane E's shader hooks rely on two strings in the body/limbs fragment code: ` // Derivatives outside the region branches` and ` diffuseColor.rgb=col;\n}`. Keep them.
- **Style.** `characterStyle()` returns `'bean'` in the browser (`?characters=classic` for A/B). Headless Node, and fixtures that only mock `document`, stay classic unless a test calls `setCharacterStyle('bean')` or sets `globalThis.FI_CHARACTER_STYLE`.

**Limbs cannot break**
- The curve runs straight → circular fillet → straight. The fillet's tangent length is capped at K × the shorter segment, so it can't cusp. At a full fold the arc shrinks to a point and the tube rounds over it at full radius.
- The ring frame uses the curve's plane normal, which is perpendicular to every tangent and constant along the limb, so rings don't twist or flip. The radius never drops below 1.5 cm. Endpoints are exact.
- Band colours come from arc length in the fragment shader: no duplicated rings, no seam gaps.
- Tested cases: knee 90/150/179.5/180°, elbow 160/178°, straight, pointing straight up and down (the old flip case), hinge along the limb, hyperextension, a very short or zero segment, all joints coincident, folded past the hip, a shin driven into the ground (the dive spike case), a knee 3 m away, 1,500 random joint sets, and 624 limb poses from the rig's own runs, strikes, slides, dives, jumps, flights and rides.
- The shader matches the CPU mirror on the GPU (limb silhouette IoU 0.984). Close-ups of a 172° knee fold, a 160° elbow and dive frames are in `scratchpad/laneA/` (`elbow.png`, `bend-close.png`, `bend-far.png`, `dive-*.png`).

**Draw calls:** 32 characters batched cost 5 draws (colour + shadow), against 21 classic. The real app's town falls 353 → 213 draws (phone) and 687 → 416 (desktop). The full table, costs and tradeoffs are in `docs/performance-guide.md`: emulation numbers, not iPhone temperature.

**Gates**
- Pass: tsc, `npm test`, `tests/bean-skin.cjs` (all sections, including the browser one), all `tests/player-*.cjs` except `player-body-review`, `shirt-numbers`, `choreo`, `heat-idle`, `frame-cap`, `live-field-frame`, `live-match-patterns`, `live-game-effects`, `character-glow-idle`, `knockout-grounding` and `costume-heads`.
- Already failing before this lane, unchanged in classic style: `player-body-review`, `movement-work` (5≠7), `live-knockout-work` (13≠14, logged at 13:41 today) and `volleyball-batch` (53≠58, in the shirt-number lane's log). I did not change their expectations, because the new counts don't come from these changes.
- With bean forced into the existing tests, every motion test passes. Only classic-geometry fixture counts differ (player-batch 10 batches, the jersey morph texture, the classic number panel), plus `player-dive-jump`'s `lowest()`, which reads raw geometry positions and so can't see shader-deformed bean parts.

**Screens:** `scratchpad/laneA/app/*-bean-{390x844,1280x800}.jpg` show the town, the player close-up and back, the 11v11 at the match camera and mid-range, keeper and striker close-ups, and an NPC. The harness shots in `scratchpad/laneA/*.png` show the line-up, back, hair, faces, colours at sunset and the batch.

**Follow-ups:**
- The face ignores `player-head` rotation (gaze and headers show through the torso only).
- Individually rendered NPCs are 4 draws each; a scene-level NPC batch would cut that further.
- The "long" hair drape is simple and could use a softer edge.
- **Simplified builder (user request "not too long"):** 13 builder steps are now 5, and More holds the rest.
  - The 5 steps: **Pick a look** (Male/Female toggle + 4 ready-made looks each, `LOOK_PRESETS`/`applyLook`), **Skin**, **Hair** (style + colour in one step), **Face** (6 eyes+mouth combos, `FACE_STYLES`/`applyFace`) and **Kit · No. 10** (the "Why No. 10?" lesson is a disclosure).
  - **More** (collapsed): body colour, build, headwear + colour, separate eyes/mouth, island costume.
  - Phone rows are swipeable rails. Every control is ≥44px and selects use 16px text; the stale device-guard allowlist entries for this file are removed.
  - Phone scroll: 2547 → 1043 px (756 visible). Desktop scroll: 1874 → 935 px (712 visible). The preview stays pinned.
  - Saves and migration are unchanged; tests cover the looks/faces.
  - Screenshots: scratchpad `laned/simplify/{before,after}-{390,1280}.png`, `after-scrolled-390.png`, `after-more-390.png`.

## Combos lane: status (Sep 26 2026, done incl. follow-ups, local, nothing committed or deployed)

**Owns:** new `lib/town/match/combos.ts`, new `tests/match-combos.cjs` and new `scripts/combo-balance.mjs`. Everything else is a small hook block marked `[combos]`.

**What it adds.** The sim still picks one action per beat. `combos.ts` plans the multi-step sequences and reactions around it. Every outcome is decided at the moment of the action, as the sim does for passes. Combos have their own seeded RNG, so the sim's random stream is untouched and each seed is deterministic. Every sequence announces itself in the match feed with the reason it works (the FieldTranscript shows it).
- **Rebounds.** On a parry (lane B's `saveOutcome`):
  - About 45% (the rate varies by format) drop into the danger zone, 11–28 u out. Nearest attackers and defenders race for it; the striker gambles (a head start) and the defenders ball-watch. The winner is decided at the parry.
  - The rebound comes off the keeper as a ground ball (tap-in), a knee-high bounce (volley, via lane B's acrobatic finish) or a loop (a jumping header, via lane B's jump).
  - The keeper stays down ~.85 real s (`pinned`), matching the dive's get-up. A follow-up not decided as a goal is snatched wide while he is down; it never goes in by accident.
  - Other parries are pushed wide: a scramble, with the keeper briefly down.
  - Post and bar hits start a scramble too. The second attacker crashes the far side and a defender covers the goal line.
- **Box attacks (7v7 rarely, 9v9, 11v11).**
  - A wide carrier in the final third sets runs to the near post, the far post and the penalty spot (plus an overlap by a team-mate on the same flank), and drives on toward the byline.
  - Once a runner is really arriving, the ball is delivered one of four ways: a low near-post cross (acrobatic finish), a high far-post cross for a jumping header, a cut-back along the ground, or a knee-high pull-back for a volley.
  - Crosses are led into the runner's path.
  - Undecided finishes are placed where the keeper can save them, and get no .16 s keep-out from close range.
- **One-two finishes:** the return pass in the final third is struck first time.
- **Lay-offs:** a striker with his back to goal lays it off for a runner arriving to shoot. In futsal the pivô first **shields** (skill-moves `shield`), then lays it off.
- **Through balls:** played behind the last line, into the runner's path, onside at the strike.
- **Futsal only:**
  - **Sole roll** to shield under pressure: lane B's `soleRoll` pose, and the sim rolls him across, away from the presser.
  - **Flick-up** over a lunging defender who is square in front and close, with no cover behind him.
  - **Rainbow flick** (skill-moves `rainbowFlick`, heel flick timed to the sim's launch). Only against a flat-footed defender, at pace, and rarely.
  - **3-1 rotations:** a team-mate fills the spot a pass-and-go runner leaves.
  - **Kick-in routine** in the attacking half.
- **1v1 skills, when the sim's own duel logic lets a dribbler knock it past an isolated defender:** stepover, body feint, drag-back, Cruyff turn near the touchline, and La Croqueta in futsal. The sim's knock is held until the pose's push contact. The defender can still tackle during the sell, then the knock is released exactly as the sim chose it. A drag-back or Cruyff turn goes away from the tackle.
- **Game state** (`TUNE[format].state`, `finishScale`):
  - Outdoors, a side ahead sits deeper: combination rate ×.5 one up and ×0 two up; ×1.25 one down, ×1.5 two down.
  - First-time finish quality follows the score in every format: ×.6 two up, ×.85 one up, ×1.08 one down, ×1.15 two down.
  - Futsal keeps only the finish scaling. There, combinations don't decide who wins, so throttling the leader handed him the game (see Balance).

**Hooks (grep `[combos]`; please keep them).**
- **`matchSim.ts`:**
  - the import, and the `combos` field + ctor line;
  - `doPass`: `tx/ty` are `let`, plus `passLead`;
  - `doShot(fromId, xgMul = 1)`: `* xgMul` in the xG line (lane B now passes `ACRO_XG` through the same parameter);
  - `this.combos?.step(dt)` after the ball logic;
  - `onParry` after the parry touch;
  - the claim branch: `comboFinish` joins the acrobatic first-time finish;
  - `onBall` before the return-pass decision: `comboTook` skips the default pick, but the tackle check still runs;
  - `onBeatMan` inside the knock-past;
  - `runTarget` after the loose-ball chasers;
  - `pinned` after the keeper-dive block.
- **`fieldRuntime.ts`:** the import, `comboView` in `Entry`, `consume` after `choreo.consume`, `apply` + `settle` after `choreo.apply`, and `ball` after the flick lift. During a skill the ball follows `skillBall` relative to the rig and hands back through the recovery phase.
- **`matchEffects.ts`:** one line announces `sim.combos.feed`.
- **`liveBallPhysics.ts`** (render only): a kick flagged in `sim.combos.launchLift` starts its arc off the grass, with the same apex and landing time: the rebound from the keeper's hands (the ball's current height), the rainbow from the heel (the skill's ball path at the flick). Every other kick starts at 0, byte for byte as before (tested).
- **`choreo.ts`:** the cosmetic hash-triggered futsal sole roll / flick-up are skipped when `sim.combos` is present (one marked condition), so they never double up with the sim-driven ones. `tests/player-signature-moves.cjs` runs its lane-B futsal check with combos off (marked), which is the path where those triggers still run.
- **Switch:** `comboSettings.enabled=false` gives the old game byte for byte: the 96-seed numbers reproduce exactly.

**Tests.** `tests/match-combos.cjs` passes. It covers:
- the switch, and the hooks being present;
- the rebound path: parry → live ball → winner → keeper down → first-time follow-up → a goal or wide, never saved by a lying keeper;
- a defender winning the race, a wide parry being a scramble, and the header and volley rebounds;
- determinism in real 7v7 and futsal matches;
- rebound goals being occasional, not every time;
- the one-two return finished first time;
- box-attack runs, the cut-back to the arriving midfielder finished first time, and the far-post header;
- context rules for the futsal flick-up and rainbow (a lunging defender gets the flick-up; no flick when the defender is behind, beside, 15 u away, covered, or in the carrier's own third) and a natural-match scan that every flick was taken in context, with the rainbow rare;
- the sole roll being futsal-only and away from the presser;
- view timing: the flick and rainbow contacts land on the sim's touch, the ball follows the skill path, and a header gets no leg swing on top;
- the held 1v1 knock being released as the sim chose it;
- the render arc: a flagged launch starts at the hands / heel with the sim's apex and landing time, while an ordinary loft still starts on the grass;
- the 1.3 s live rainbow.

`tsc`, `npm test`, choreo, all live-*/match-*, striker-match, player-dive-jump, player-signature-moves, skill-moves, body-mechanics-glue and kickoff-ready pass. `live-knockout-work` fails with the known pre-existing batch count (13 vs 14), not caused by this lane.

**Balance (final, Sep 26).**

*The standard 288 games* (`node scripts/combo-balance.mjs --seed-start S --seeds 96 [--combos off]`, samples #24/#120/#216), off → on:

| Format | Goals/game | Switches/min | One-sided (≥3), /288 |
|---|---|---|---|
| futsal | 5.33 → 5.06 (−5.1%) | 13.89 → 14.40 (+3.7%) | 66 → 57 |
| 7v7 | 3.94 → 3.99 (+1.2%) | 11.77 → 12.04 (+2.3%) | 47 → 57 |
| 9v9 | 3.61 → 3.90 (+7.8%) | 8.62 → 8.82 (+2.3%) | 49 → 71 |
| 11v11 | 3.78 → 3.85 (+1.7%) | 10.41 → 10.87 (+4.5%) | 62 → 57 |

*One-sided games need a bigger sample.* Configs that differ by 0.3 flicks a game ranged 45–73 per 288 on the same seeds: any change reshuffles every game. So each config was also measured over 1,728 distinct games (18 × 96 seeds, #24–#1751; scratchpad `combos/bigsweep.sh` + `bigana.mjs`). Per-288 mean, ± binomial SE, with the six 288-blocks:

| Format | Off | On (final) | var(goal diff) off → on | Goals off → on |
|---|---|---|---|---|
| futsal | 61.3 ±6.9 (66/56/58/56/58/74) | 63.3 ±7.0 | 4.29 → 4.31 | 5.19 → 4.94 |
| 7v7 | 54.0 ±6.6 (47/53/50/54/58/62) | 53.5 ±6.6 | 3.66 → 3.67 | 3.86 → 4.09 |
| 9v9 | 58.2 ±6.8 (49/62/65/55/59/59) | 59.2 ±6.9 | 3.93 → 3.85 | 3.70 → 3.83 |
| 11v11 | 57.0 ±6.8 (62/55/60/60/58/47) | 56.7 ±6.7 | 3.74 → 4.05 | 3.72 → 3.82 |

- Every format is within +2 of its baseline (1 SE ≈ 6.8). The standard block (#24–#311) happens to be the lowest 9v9 "off" block of the six (49, against a true 58.2); that is why it read +40%.
- **Mechanism.** Combo goals are not a snowball: the final winner scores 70% of them, against 74% of ordinary goals, and they don't favour the possession-dominant side.
  - The outdoor rise came from extra goal volume. It is fixed by the lead brake, finish scaling and lower 9v9 rates (`TUNE`: danger .3, through .1, box .35, finish ×.85).
  - In futsal no single feature explains it (each variant 64–76 per 288), and the side doing the combinations gained nothing (goals 5.19 → 4.98). So the lead brake throttled the leader's *harmful* moves and helped him (brake on: 69–72, brake off: 63.3; making leaders stop rotating/showboating made it 80.5). Futsal therefore keeps only the finish scaling.
  - Style match-ups are not amplified (futsal combos narrow them: press +.38 → +.15, counter −.40 → −.25 goal difference).

**Per game (on, mean of the 288), futsal / 7v7 / 9v9 / 11v11:**
- Rebounds: danger-zone parries 1.19 / .70 / .41 / .82; post or bar scrambles 3.77 / .91 / .69 / .89; follow-up shots .43 / .39 / .37 / .58; rebound goals .19 / .17 / .10 / .21.
- Box attacks: – / .01 / 1.25 / 1.85. Near post – / .01 / .17 / .41; far post –/–/ .11 / .09; cut-back –/–/ .06 / .12; pull-back volley –/–/ .02 / .04; box goals – / .01 / .08 / .20.
- One-twos: 7.0 / 5.2 / 2.9 / 2.4.
- Lay-offs: .32 (pivô) / .23 / .47 / .52.
- Through balls: 1.07 / .82 / 1.23 / 2.11.
- Futsal: sole roll 3.5, flick-up 1.8, rainbow .20, croqueta 1.5, shield .3, rotations 22, kick-in routine .02.
- 1v1 skills per game: stepover 1.4 / 5.4 / 4.2 / 4.3; feint 1.1 / 3.0 / 2.2 / 2.0; drag-back 1.9 / 2.1 / 1.7 / 1.8; Cruyff – / .23 / .38 / .29.

**Visual** (headless Chrome on :8092, bean style). `scratchpad/combos/strip.cjs` finds an event in a throwaway sim with the same seed and a fixed step, swaps an identical fresh sim into the live venue, fast-forwards to just before the event, and lets the real render loop play it. Strips are in `scratchpad/combos/shots/`:
- `rebound+reboundShot-11v11-…-box.png` (final code): the keeper dives and parries, the ball drops at the striker's feet while the keeper lies on the grass, tap-in, goal as the keeper gets up.
- `rebound+reboundGoal-11v11-…-box.png`: the keeper parries at full stretch, the ball loops up, two players jump, and the header goes in while he gets up.
- `reboundGoal-11v11-…-box.png`: a parry, a race and a first-time finish.
- `cutback+boxShot-11v11-…-top.png`: a byline cut-back to the arriving midfielder, struck first time and saved.
- `cutbackVolley-11v11-…-{top,side}.png`: a pull-back volleyed first time.
- `farPost+boxShot-11v11-…-top.png`: a cross from the right and a far-post header, saved.
- `oneTwoShot-9v9-…-high.png`: a lay-off, the one-two and a first-time shot.
- `oneTwo-7v7-…-high.png`
- `soleRoll-futsal-…-side.png`
- `rainbow+skillBeaten-futsal-…-side.png` (final code, live 1.3 s tempo, seed 730): the ball rolls up the leg, the heel flick leaves from ankle height with no dip, the ball goes over the defender's head, and he collects it behind him.
- `flickUp-futsal-…-side.png`: a blocked flick.

**Closed follow-ups (Sep 26):**
1. The duplicate futsal poses are gated in choreo (above).
2. The lofted-arc start height is in `liveBallPhysics` (above).
3. **Live rainbow at 1.3 s** (`LIVE_SKILL_SECONDS` in combos). The host drives `SkillMotion.progress`, so `skillMoves.ts` needed no edit: same poses and contacts, played faster (heel flick after .55 s instead of 1 s). The rainbow's air time now follows real gravity for its 2 m peak (≈1.28 s), not the pose tempo.

**Open:** cut-back volleys stay rare (.02–.04 a game). A natural one is on 11v11 seed 4288 (`cutbackVolley-11v11-…-{top,side}.png`).

## Skill moves lane: status + hooks (Sep 26 2026, local, nothing committed or deployed)

**Owns:** new `lib/graphics/skillMoves.ts` (all move poses, ball paths, the rig driver and the host helpers), new `tests/skill-moves.cjs`, new `docs/player-moves/MOVES.md` (research catalogue, fine-tunes, API), and the dev demo page `app/skill-lab/page.tsx` + `components/SkillLab.tsx`. Twelve moves: bodyFeint, stepover, scissors, cruyffTurn, dragBack, croqueta, elastico, roulette, **rainbowFlick**, shield, shoulderCharge and scan. They are written into the rig's existing one-shot reaction channels, so lane B's leg solver, locks, spine and arm blending do the work. Every ball contact is pinned to the touching boot at load time (1–5 cm on the solved rig).

**Hooks in `lib/graphics/player.ts`** (grep `skill moves lane` / `skill`; please keep them):
1. `import {createSkillDriver,type SkillMotion} from './skillMoves';`
2. `PlayerMotion.skill?: SkillMotion` (with a doc comment), right after `move`.
3. The state line after the signature-move state: `const skill=createSkillDriver();let skillSupport:-1|0|1=0,plantKick=false;`
4. After `const diving=…,airMove=…`: `skill.input(airAllowed?motion?.skill:undefined,dt,airJump||!airAllowed);const skilling=skill.active;`
5. The leg-move block: `skillSupport=0;` before it, `||skilling` in its condition, and `if(skilling)skillSupport=skill.write(react,reduced);` inside it.
6. The `supportIndex` line starts with `skillSupport!==0&&action===0?(skillSupport<0?0:1):`, so the move's weight-bearing boot is the one kick-support planted.
7. Before the ground guard: `if(skilling){const q=skill.squash(discontinuity,dt);…}`; `||skilling` joins the ground-guard condition.

**Fine-tunes to base motion** (intentional classic-output changes, `docs/player-moves/MOVES.md` § fine-tunes):
- **(a) Arm counter-swing:** `phase+(1-index)*Math.PI-…` in the arm terms (was `index*Math.PI`: the arms paced with the same-side leg), plus `armAmp=(.34+.4*sprint)`. The shoulder-yaw line keeps `index*Math.PI` (coil-driven; `player-teaching-expression` locks it).
- **(b) Plant step:** `if(action>0&&previousAction===0)plantKick=true;`, a stepFoot of the support boot at the top of the `kickHold` block, and `pelvis.position.z+=.12*smooth(kick/.2)*action`.
- **(c) Coming to rest:** an `else if(planted…&&!moving…)` rest step after the running lift-off block.

**Parity fixture:** `tests/fixtures/player-motion-parity.json` was regenerated (lane B's `--write-golden` code path) after fine-tunes (a)–(c).
- I verified first that the hooks alone (fine-tunes disabled) reproduce the old golden exactly in both styles: 20/20 scenario × style hashes. So the new hashes are the pre-lane-B rig + (a)–(c), and nothing else.
- `receive` and `reactions` are unchanged. The other eight moved.
- The old hashes are in the session scratchpad `skills/player-motion-parity.pre-skill.json`.
- The assert message in `player-dive-jump` still says "pre-dive rig"; it now means "the rig before any new optional field".

**Demo trigger:** `localhost:8092/skill-lab?skill=feint` (aliases include rainbow, cruyff, dragback and scan; `&side=-1`, `&view=side|q|front|back|top`). `window.__fiSkill.shot(type,p,side,view)` gives single frames for strips. Live play is wired by the combos lane (`lib/town/match/combos.ts` `SKILL_MOVE`/`SKILL_TIMING` read `SKILL_MOVES` directly, and `tests/match-combos.cjs` passes against this module). No `choreo.ts` edits from this lane.

**Cost:**
- No `skill` field: one call and a few branches per rig per frame, with zero allocations.
- While a move plays (on that one rig): ~20–30 µs per update in Node on desktop (keyframes, the support lock, the ground guard).
- The lab page renders only while playing, stops after three loops and sleeps when hidden.

**Gates:**
- tsc passes, and so does `npm test`.
- `tests/skill-moves.cjs` covers every move × both feet × classic and bean: contacts < 7 cm on the solved rig, grounded boots < 7.5 cm/frame (a real skid is 10–40 cm), nothing under the pitch, legs within reach, key poses, fade-out, reduced motion, helpers, and parity with no `skill`.
- `tests/player-dive-jump.cjs` passes in full.
- These pass: all `player-*`, `motion-study`, `field-contact-motion`, `choreo`, `shirt-numbers`, `bean-skin`, `live-match-patterns`, `body-mechanics-glue`, `heat-idle`, `frame-cap`, `kickoff-ready`, `dribble-smoothness` and `match-combos`.
- `player-body-review` and `movement-work` fail with the same values as before this lane started.

**Strips:** scratchpad `skills/final/<move>-{side,q}-1280x800.png` (all 12 moves plus the base motions), `…-390x844.png` (feint, Cruyff, rainbow, scan, shield) and `…-L.png` (left foot: stepover, rainbow, Cruyff).

**For lane A (not changed here):** the bean face ignores `player-head` yaw and pitch, so looks such as the scan and the rainbow's look-up are carried by chest yaw and pitch. A face that follows the head would let `scan` use more head and less chest.

## Lane B: signature moves + goalkeeping — DONE (Sep 26 2026, local, nothing committed or deployed)

**Status: done.** Integrations may build on these fields, constants and hooks. Please keep out of the regions marked below and ask lane B before changing them.

**Rig (`lib/graphics/player.ts`, motion code only).**
- New `PlayerMotion.move?: {kind, progress, side, height?}` for `SignatureMove` = `bicycle|scissor|divingHeader|volley|backHeel|soleRoll|flickUp`. `MOVE_PHASE[kind] = {contact, land, seconds}`.
  - **Airborne moves:** bicycle (back to goal, horizontal on the back, kicking leg scissoring over the head, lands on the back with the hands cushioning), scissor (side-on volley in the air, lands on the side and the bottom arm) and diving header (flat launch, head first, lands on the chest and bent arms). They pose post-solve on the pelvis, free both boots, and land with a squash. The yaw ignores sideways travel.
  - **Leg moves:** volley (`height` 0 = half-volley … 1 = full volley), back heel (behind the standing leg), sole roll (sole on top of the ball, rolling it across) and flick-up (toes under, then scoop). They write the existing reaction channels (kicking leg free, the other boot planted via `hold`) and add a contact stretch.
  - The ground guard runs for every move.
- `dive` gains `kind?: DiveKind` (`side|collapse|tip|spring|smother|stand`, timings in `DIVE_KINDS`) and `outcome?: SaveOutcome` (`catch|parry|tip`).
  - **Take-off foot:** the near boot (the dive side) power-steps out and is the last to leave the grass; the far knee drives first. A collapse side-steps, then drops.
  - **Hands:**
    - A catch brings the gloves together behind the ball, then gathers it into the chest. That is a W above the head or a basket at the chest when standing, and a pull-in after a diving catch.
    - A parry keeps the arms long and pushes out.
    - A tip reaches the top hand long and flicks it; the other hand tucks.
  - Tip and spring saves settle fully onto the side after landing. A smother spreads low and wide at the feet.
  - The existing fieldRuntime glue already puts a held ball at the gloves' midpoint, so after a catch it sits in the gloves at the chest. No fieldRuntime keeper change was needed.
- Ground guard boot clearance now follows the rendered boot (classic 0.079 / bean 0.086 × leg scale). With the fields absent, parity with the old rig still holds (golden hashes, both styles).
- Reserved regions (lane B): `poseDive`, `poseKeeperHands`, `diveFootwork`, `signatureLegs`, `poseAirMove`, `groundGuard`, the move/dive state block at the top of `update`, and the `legMove`/`diveLegs` block before `airFree`.

**Live wiring (`choreo.ts`, lane B sections).**
- **Keeper save type from the shot:**
  - at the body → stand;
  - one-on-one → smother;
  - low and near → collapse;
  - top corner → tip;
  - mid height within a few metres → spring;
  - otherwise the side dive.
- **Keeper hands:** they follow `sim.saveOutcome`, and a goal shows long arms.
- **Acrobatic finishes:** when `sim.acrobatic` names the target, the move is picked from the predicted contact height and orientation: bicycle (high, back to goal), scissor (high or mid, side-on), diving header (low cross) or volley/half-volley (dropping ball).
  - Contact is predicted with the sim's air drag and strike keep-out, so the move's contact phase lands within 0.04 of the strike.
  - The same predictor now also times the jumping header.
- **Back heel:** a short pass to a team-mate behind the passer (wind-up turn over 2.3 rad and under 28 u) is flicked back instead of turned, with contact at the wind-up's end.
- **Futsal skills:** the sole roll comes when shielding under pressure; the flick-up comes to beat a man in front. The flick hands over to the strike after its contact (a self-volley). Both are rare in the bigger formats.
- **Flick ball height:** `choreo.ballLift(id)` lifts the held ball after the flick's contact. It is used by one line in fieldRuntime (`held.y+=e.choreo.ballLift(owner)`).

**Sim (`matchSim.ts`, lane B lines).**
- **Acrobatic finishes:** `acrobatic` (28% of crosses or balls over the top within 75 u of goal) is taken first time at the claim, struck immediately (no wind-up), with xG × `ACRO_XG` 0.7. The combos lane shares that claim block.
- **Save outcome:** `saveOutcome` is pre-rolled at the strike, with the same 20% deflection as before.
- **Tips:** a high ball is tipped up and over the bar for a corner, with a fast enough path to clear the bar.
- **Goal line:** a non-shot ball crossing it above the bar is no longer a goal.

**Gates.**
- typecheck ✓, `npm test` ✓.
- `tests/player-signature-moves.cjs` ✓: 7 moves × 2 sides (contact pose, ground guard in both styles, no pops, planted or free boots, squash, reduced motion), plus live contexts and contact timing.
- `tests/player-dive-jump.cjs` ✓, now also covering:
  - every save type × outcome × direction: take-off foot, glove contact, catch gap and ball held at the chest, ground guard in both styles;
  - the live type and outcome mix;
  - a deterministic tip-over-the-bar → corner, never a goal.
- All other player, choreo, live, match, heat and bean tests pass. `player-body-review`, `movement-work` and `live-knockout-work` fail the same way on the pre-lane-B tree.
- **Sim balance, 96 seeds per format** (the combos lane switched off to isolate this lane), pre → post, sample #24–119:

  | Format | Goals/game | Switches/min |
  |---|---|---|
  | futsal | 4.97 → 5.15 (+3.6%) | 13.91 → 13.93 |
  | 7v7 | 4.00 → 3.75 (−6.3%) | 11.83 → 11.75 |
  | 9v9 | 3.59 → 3.48 (−3.2%) | 8.70 → 8.77 |
  | 11v11 | 3.60 → 3.98 (+10.4%) | 10.10 → 10.50 |

  The 11v11 figure was attributed:
  - With acrobatic finishes off and the old claim-time roll, the pre-change numbers come back exactly.
  - Two more samples (#120, #216) give 3.70 → 3.67 and 3.70 → 3.70.
  - So over 288 games, 11v11 goals move +3.1% (seed chaos from the moved roll).
- Strips (live play, or forced through `choreo.apply` where rare): `scratchpad/laneB/shots2/` (1280×800 and 390×844, bean plus classic spot checks).

**Lane B addendum (Sep 26): ball-contact verification.** New two-pass strips put the ball in flight: pin the player, record the real contact limb, then replay with the live ball on its path at the height choreo would assign. They showed that the finish choice didn't match the rig's reach for scissors and volleys. Fixes:
- `choreo.acrobaticMove(h, back, header)`: the height → move mapping is now exported and tied to the rig's contact limb:
  - bicycle, 1.45–1.95 m with the back to goal;
  - scissor, 0.9–1.45 m;
  - diving header, 0.4–0.9 m low cross;
  - volley, ≤ 0.9 m with the boot height matched.
  `tests/player-signature-moves.cjs` asserts the limb sits within about one ball diameter of the ball centre (h + 0.19 above the feet) across the range.
- Scissor: higher flight and leg sweep (boot at about 1.45 m at contact) and a later, more physical landing (land 0.56).
- Measured at the contact frame, ball to limb: bicycle 0.20 m, scissor 0.14–0.38, diving header 0.26, volley 0.26, tip 0.14 (top glove, then up and over the bar), parry 0.28 (out around the post). The catch is held in the gloves at the chest.
- Strips: `scratchpad/laneB/shots3/` (1280×800 and 390×844).
- Rebounds (combos lane): a new shot may interrupt a keeper's dive once he is getting up (progress ≥ 0.6), so a caught rebound shows catching hands.

## Moves batch 2: status + hooks (Sep 26 2026, local, nothing committed or deployed)

Research, the move table and where each move appears: `docs/player-moves/MOVES.md` § F. There are 17 new skill moves in `lib/graphics/skillMoves.ts` (29 in total): insideCut, outsideCut, fakeShot, nutmeg, chipShot, finesseShot, trivela, toePoke, knuckleball, blockTackle, pokeTackle, keeperThrow, keeperRoll, keeperPunt, airplane, kneeSlide and thankPasser. No `player.ts` edits.

**Hooks and changes outside `skillMoves.ts` (please keep them):**
- **`skillMoves.ts`:**
  - `SkillSpec.group` and the `laces` surface.
  - The ballistic `bend` on ball keys.
  - The skill driver fades a move in over ~0.08 s when it is joined part-way.
- **`previewMoves.ts`:**
  - Grouped arrow list (34 moves); `moveCaption` reads "Group · Label n/34".
  - `skillProgram` for the batch 2 moves: off-centre starts, and the keeper takes the ball into his hands first.
  - The showcase adds the inside cut and the fake shot (21.2 s).
- **`combos.ts`:**
  - **Sim:** `onBeatMan` also shows the inside/outside cut, the fake shot and the nutmeg. They are picked from the existing roll, so there is no extra random number.
  - **View (render only, `createComboView`):**
    - `shotStyle` / `keeperStyle` pick how a shot is struck and how a keeper distributes, at the wind-up.
    - Standing tackles become a block or a poke.
    - The scorer celebrates.
    - The build-up is warped so the contact lands on the sim's release.
    - It exports `VIEW_MOVES`, `KEEPER_RELEASE`, `counts`, `holds(id)` and `kickStyle(kicks)`.
    - `ball()` takes `base` (the grass height in `out`'s space). **Fix:** before this, live skill balls were drawn 10.5 cm low, because fieldRuntime's ball space has the grass at 0.105.
- **`fieldRuntime.ts`:**
  - A keeper's throw, roll or punt carries the ball on the authored hand path (`holds`).
  - `.295` is passed as the ball base.
  - `kickStyle` is passed to `ballPhysics.step`.
  - The teaching branch draws the step skill's ball, the keeper's hand release, and the throw arc.
- **`liveBallPhysics.ts`:** an optional `style` param. A chip loops over the keeper, only on a goal the sim decided. A knuckleball darts. `null` is byte for byte as before.
- **`formatLessons.ts` + `teachingMotion.ts`:** the optional `FieldStep.skill` = `{id, type, side?, start?, at?, toward?}`. It is played on the authored path:
  - a keeper's release lands on the lesson's release;
  - a receiving defender's block lands on the pass arrival;
  - a travelling carrier ends facing his path.
- **`public/lessons/*.json`:**
  - 8 `skill` fields: 7v7 next7_dribbleroom S4, learn7_receive S3 and gap7_lostball S1; 9v9 next9_shortcornerbudget S11; 11v11 trn_11_recover S6; futsal f_pivot S3, bld_f_splitcb S2 and bld_f_passtofeet S7.
  - Two beats on bld_f_passtofeet S7 (protect, then pass).
  - Everything else is byte-identical. The quiz merge keeps unknown step fields.
- **`scripts/quiz/authored/`:** 6 new "which move" questions:
  - 7v7: learn7_receive, next7_dribbleroom;
  - 9v9: next9_shortcornerbudget;
  - futsal: bld_f_splitcb, f_pivot;
  - 11v11: trn_11_recover.
  - `check-authored` passes. **Not merged:** they need `merge-visual-questions.py <format>` plus Kokoro voicing (`scripts/plays/kokoro-lessons.py <hashes>`). No Kokoro venv exists right now, and a merge without voices would fail `visual-quiz` / `lesson-catalog`.
- **`SkillLab.tsx`:** aliases, context rigs for the new groups, and no ball for the celebrations.

**Tests:**
- Extended: `skill-moves` and `preview-moves`, plus a batch 2 block in `match-combos`.
- New: `lesson-skills` (plays and quiz replays).

### Futsal creative layer (Sep 26 2026, same lane, local)

Details are in `docs/player-moves/MOVES.md` ("Futsal: the creative game"). All changes are in `combos.ts`, behind `comboSettings.futsalCreative` (default true; false gives the batch-2 game):
- **Sim:**
  - take-ons (`startTakeOn`, `TAKE_ON_RATE = .3`, with a `takeOn` hold/exit in `runTarget` and `onBall`);
  - the full futsal beat-man library;
  - the flick-volley finish (`FinishKind 'flickVolley'`, `volleyRange`);
  - a higher rainbow share (it stays rare).
- **View:**
  - the futsal `shotStyle` branch;
  - the pivô's back-heel lay-off (lane B `backHeel` through the view, with `facing`);
  - feed lines via the new `Combos.announce` (feed only, never the sim's message).
- **Fix:** beat-man poses exit on the side of the sim's knock (both teams). Before, blue's exits were mirrored.

**Balance** (1,152 futsal games each, #24–#1175, before = `futsalCreative:false`, after = on):

| | Before | After | Change |
|---|---|---|---|
| Goals per game | 4.98 | 4.78 | −4.0% |
| Switches per min | 14.61 | 14.66 | +0.3% |
| One-sided per 288 | 70.0 ±7.3 (blocks 68/77/73/62) | 61.0 ±6.9 (blocks 71/60/56/57) | within noise |
| Shots per game | 27.2 | 26.7 | |

Grass formats are byte-identical (tested in `match-combos`).
