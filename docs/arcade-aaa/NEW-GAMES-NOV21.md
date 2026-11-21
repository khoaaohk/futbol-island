# Two new arcade games (Nov 21 2026): release note

Released on branch `games-nov21`: **Keepy-Uppy Beat** and **Hold the Line**. The arcade now has thirteen machines, and every count on
the site (the /games hub, the Library, llms.txt, the back-wall sign, the share picture) says thirteen.

## The games
- **Keepy-Uppy Beat** (`keepyuppy`, `/games/soccer-juggling-game`): juggling to music. Tap the foot, thigh and head pads as each ball
  lands, on the beat; six tracks, six real tricks and a weak-foot part. Doc: `keepyuppy-direction.md`.
- **Hold the Line** (`holdtheline`, `/games/soccer-defending-game`): you are the back line. Drag to step up together and catch the runner
  offside (judged when the ball is played, against the second-last defender), drop, slide, press. Ten teams, then the Island Premier at
  night. Doc: `holdtheline-direction.md`.

## Where they stand in the room
The back row is full (ten uprights), so both stand against the **east wall**, between the prize counter and the vending machine, as the
same upright cabinet as the row (no new model, texture or shader), turned -60 degrees like the counter (`lib/arcade/arcadeCatalog.ts`):

| Game | x | z | yaw |
| --- | --- | --- | --- |
| Keepy-Uppy Beat | 11.75 | 2.85 | -Math.PI/3 (next to the counter) |
| Hold the Line | 12.85 | 5.2 | -Math.PI/3 (toward the vending machine) |

The vending machine moved 1.7 m into the south-east corner (12,8 -> 12.6,9.6) because it hid Hold the Line, and a player standing at it,
from the room camera. The clearances are pinned in `tests/arcade-room-crowd.cjs` ("east wall"). Room cost, measured in headless Chrome
(WebGL calls per frame): at the door on desktop 78 -> 87 draw calls (about 4 per cabinet: screen, glow pool, shadow, marquee), the same
14 programs, textures 15 -> 18; on a phone at the door the east wall is off screen (55 -> 55). Standing at the new machines: 66-72 draws on
a phone, 101-108 on desktop. Desktop counts, not an iPhone temperature claim.

## The SQL to paste
`docs/arcade-aaa/new-games-nov21-supabase.sql`, once, in the Supabase SQL editor (idempotent). The last row must read
"OK, Keepy-Uppy Beat and Hold the Line installed". It adds the boards `keepyuppy` and `holdtheline` and the activity keys
`arcade_keepyuppy` and `arcade_holdtheline`, keeping every earlier id. Until it is pasted, scores save on the device and the island board
refuses them. The per-game SQL files were removed; the migrations copies are `supabase/migrations/20261207..20261210`.

## Weak spots that need a real phone and a real child
- **Keepy-Uppy Beat:** timing windows (55 / 110 / 170 ms), balls per track and the 24 px swipe are from bots; the default +20 ms audio
  offset on iOS Safari and Bluetooth speakers is untested; Around the World accepts any swipe.
- **Hold the Line:** drag gain, tap radius and wind-up times are from bots, not children; one answer per wave, the keeper is automatic,
  the line is always straight; its sound was checked through the Web Audio graph only.
- **The room:** the east wall pair is snug (0.69 m between the cabinets); the vending machine still covers the lower part of Hold the
  Line's cabinet from the camera. Worth one look on a real phone.

## Safe Hands
Rejected by the owner on Nov 21 2026 ("i dont like safe hands game"): its code, page, media, SQL and tests were removed from the release.
The direction doc is in `archive/safehands-direction.md`; the last version is on branch `game-safehands`.
