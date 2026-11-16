# Drip FC art colours (Nov 15 2026)

Status: implemented (Kit Shop Nov 15; friends' view Nov 16, needs the relay deploy below).

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

## Friends (implemented Nov 16 2026; live once the relay is deployed)
Status: **implemented** on branch `dripfc-relay` (relay + client). Until the relay is deployed, friends keep seeing the club colours
(nothing breaks: the client only sends the colour slots to a relay that offers them).

Wire (multiplayer/protocol/types.ts): `Cap.KitClubColor = 16384` joins CAPS_WORLD (a party, CAPS_ALL = 255, never gets it).
`KIT_CLUB_COLOR_LEN = 29`, `KIT_CLUB_COLOR_MAX_BYTES = 330`. Slots 22..28, one palette code (`clubCode`) per club piece, **-1 = the piece
is absent or wears the club's own colours** (one value for both, so 0 stays a real code: art 0 on backing 0):
22 shirt crest, 23 shirt wordmark (backing may be 15 = none), 24 boot side mark, 25 boot heel mark, 26..28 the colours of ball
club stickers 19..21. A 29 kit is sent only when one code is set; otherwise the 22 (or 17) kit, byte for byte as before.

Relay (validate.ts `isKit` + `isClubCode`, strict): the 22-slot checks, then each colour slot is -1 or a palette code (art < 12,
backing < 12, or 15 on the two shirt slots only), a code only for a piece that is worn (crest bit, wordmark bit, side / heel bit,
sticker slot not -1), at least one code set, ≤ 330 bytes. `CLUB_PALETTE_LEN = 12` in the protocol must equal
`CLUB_PALETTE.length` (tests/dripfc-kit.cjs checks it); a new palette colour needs both plus a relay deploy. Fan-out
(roomCore.ts `kitFor` = protocol `kitForCaps`): 29 slots to Cap.KitClubColor members, the first 22 to Cap.KitClub members, the
first 17 to everyone else; a sender that was not offered the bit is cut the same way.

Client: `kitFromGear` packs the codes; connection.ts `flushKit` sends `kitForCaps(myKit, caps)` (caps = S.Caps AND this build's bits),
so an old relay gets ≤ 22 slots. `kitOutfit` reads the crest / boot codes into `Outfit.clubCc / bootCc / heelCc`; `kitBall` puts
each sticker's `cc` back on its decal (shopBallSkin.ts already tints club stickers). The bean shaders (beanSkin.ts, clubMark.ts
`beanClubInk`) take code+1 from spare `.w` channels (shirt2 = crest, boots = side, shorts = heel; 0 = club ink as before) and
draw the art colour plus a backing disc from a fixed GLSL copy of CLUB_PALETTE. My own player (islandGear.ts gearOutfit) shows the
same. The wordmark is not drawn on avatars (it never was); its code travels for future use.

Compatibility: new relay + old client: the old client never answers Cap.KitClubColor, so it sends ≤ 22 and receives 22 / 17.
Old relay + new client: S.Caps lacks the bit, the client sends ≤ 22, which the deployed `isKit` accepts. Party rooms: 17 as before.

### Deploy (owner)
Order: **deploy the relay first, then push the client** (the client is safe either way, but colours only show once both are out).
1. Relay, from this worktree (needs `npx wrangler login` once; no migration, no new secret):
   `cd /private/tmp/claude-501/-Users-khoado/e23a5642-6645-4069-b550-daeae4d02ae6/scratchpad/dripfc-relay-wt/multiplayer/relay && npx wrangler deploy`
   (or from any checkout of this branch: `cd multiplayer/relay && npx wrangler deploy`).
2. Push the client (`dripfc-relay` → main) as usual.
Rollback: `npx wrangler deployments list` (from multiplayer/relay) to find the previous version id, then
`npx wrangler rollback <version-id>`. Rolling back is safe: new clients then fall back to 22 slots on the next S.Caps.

## Admin
`sh:club_color` (Kit Shop counter, lib/analytics/countIds.ts SHOP_COUNT_EVENTS): a Drip FC colour changed (a swatch, Best
contrast or Club colours tapped). Totals only; it rides the existing counter channel, no migration.
