# Drip FC art colours (Nov 15 2026)

Owner request: in the Kit Shop, players can recolour the Drip FC club art they place so it shows up against their boots,
shirt and ball. Drip FC stays the only club kit; every Drip FC item keeps "Drip FC club kit" + the "Sponsor" tag; coins only.

## What players get
- Each placed piece (ball / boot sticker, shirt crest, shirt wordmark) has **Art** and **Background** colours from
  `CLUB_PALETTE` (lib/shop/dripKit.ts): the club's blue, navy and white plus nine Boot Studio colours. No free picker.
- **Club colours** puts the piece back to the club's own (white on club blue; on a shirt, the club print: white or navy
  ink straight on the shirt). Shirts also offer Background **None**.
- **New pieces always start in club colours** (owner, Nov 15 2026). When a pair is hard to read, a gentle hint appears with
  **Best contrast**; nothing changes until the player taps.
- Readability (WCAG relative luminance): art ≥ 3:1 on its backing, backing ≥ 2:1 on the item under it (boot zone colour,
  the ball's two main panel colours, the shirt main colour or the sleeve). Printed without backing: art ≥ 3:1 on the shirt.
- Free: purchase ids ignore the colours (`stripClubColors` in lib/shop/shopPurchases.ts), so recolouring an owned design
  costs nothing and the owned copy takes the new colours. Prices and presets are unchanged.

## Storage
One integer per piece, `art | backing << 4` (`clubCode`): `cc` on a club ball / boot decal, `cc` (crest) and `wc`
(wordmark) on the shirt's `club` block. Backing 15 = none (shirt only). The default is never stored, so older saves,
presets and purchase ids are byte for byte unchanged. Cleaned by the existing validators (validateBall / validateBoots /
cleanJerseyClub). No new storage key (docs/accounts-design.md, Kit Shop row).

## Shorts
There is no shorts garment or Drip FC placement on shorts: the avatar's shorts are the shirt's accent colour
(lib/shop/islandGear.ts). The chest crest and the wordmark sit on the chest, away from the shorts, so the contrast check
uses the shirt colour only.

## Friends (not yet: needs a relay deploy)
The relay's `isKit` (multiplayer/protocol/validate.ts) checks the exact length (17 or 22) and every Cap.KitClub slot's
range, and the 24-bit ball sticker slots are fully used, so colours cannot ride in the current kit. Friends therefore see
the club colours (graceful: the kit is unchanged). The relay change, for the owner to deploy:
1. `types.ts`: `Cap.KitClubColor = 16384` (add to CAPS_WORLD); `KIT_CLUB_COLOR_LEN = 29` with slots 22 crest code, 23 wordmark
   code (0 when no shop jersey), 24 boot side code, 25 boot heel code (0 when no shop boots), 26..28 the codes of ball club
   stickers 19..21 (-1 when that sticker is absent); `KIT_CLUB_COLOR_MAX_BYTES = 330`.
2. `validate.ts isKit`: also accept length 29: the 22-slot checks, then each of 22..28 in 0..255 (or -1 / 0 as above).
3. `roomCore.ts kitFor` and the S.Kit fan-out: send 29 slots to members with Cap.KitClubColor, the first 22 to
   Cap.KitClub members, the first 17 to everyone else (as today).
4. Then the client: `kitFromGear` adds the slots when the relay offers the cap, `kitBall` / `kitOutfit` read them, and
   lib/graphics/beanSkin.ts tints the avatar's crest and boot marks.

## Admin
`sh:club_color` (Kit Shop counter, lib/analytics/countIds.ts SHOP_COUNT_EVENTS): a Drip FC colour changed (a swatch, Best
contrast or Club colours tapped). Totals only; it rides the existing counter channel, no migration.
