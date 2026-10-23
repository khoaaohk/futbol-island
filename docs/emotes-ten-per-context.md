# Ten emotes in every context (Oct 23 2026)

Owner decision: every emote context offers the same TEN meanings, in the standard wheel order
(`lib/town/emoteReact.ts` LOCAL_EMOTES): Wave, High five, Cheer, Pass it, Juggle with me, Well played, Laugh, Dance, Thanks, Show off.
The phone bar shows them five per page (two pages); the desktop bar is the same strip.

## Wire mapping (no protocol change, no relay deploy)

- The wire value of every context emote IS the standard meaning's protocol value (`Emote` 0..9: Wave 0, Cheer 1, High five 2,
  Juggle 3, Show off 4, Well played 5, Pass it 6, Laugh 7, Dance 8, Thanks 9). Exactly one script per (context, wire value).
- The friend's avatar picks the script from the SENDER'S protocol mode: Jetpack / Parachute = flying, Swim = swimming,
  Scooter / Bike / Moped = that vehicle (`lib/town/emoteContexts.ts` `flourishForWire`), as before. Walk / Run = the moving set or the
  standing emote. The order on the wheel is `WHEEL_WIRE_ORDER = [0, 2, 1, 6, 3, 5, 7, 8, 9, 4]` (`lib/town/rideEmotes.ts`).
- Local ids (analytics `em:e<n>`): flying 20-29, swimming 30-39, rides 60-89 (the old 20-24 / 30-34 / 60-74 keep their ids).
  Old clients receive the same 0..9 value and show that standing emote's bubble (a flying / swimming / riding Pass it or Juggle
  still shows as the ball emote's bubble there; nothing else is sent).
- Re-mapped wires on old ids so the meanings line up: Loop-de-loop 8 -> 4 (Show off), Side-by-side glide -> "Thank-you glide" (9, hand on
  heart), Duck-dive pop-up 8 -> 4 (Show off), Back float 4 -> 9 ("Thank-you float"). Ride tricks 60-74 kept their wires.

## The sets

| Meaning (wire) | Flying | Swimming | Scooter | Bike | Moped |
|---|---|---|---|---|---|
| Wave (0) | Wing wave | Splash wave | Deck wave | Back-pedal wave | Cruiser wave |
| High five (2) | Fly-by high five | Splash high five | Hop 180 | Bunny hop | Wheelie pop |
| Cheer (1) | Barrel roll | Water spray cheer | Jump cheer | No hands! | Rev it up |
| Pass it (6) | Star pass | Splash pass | Low five | Side five | Handlebar five |
| Juggle with me (3) | Comet keepy-ups | Bubble keepy-ups | Knee keepy-ups | Pedal keepy-ups | Header nods |
| Well played (5) | Jetpack salute | Seal clap | Flamingo wave | No-hands clap | Thumbs-up rev |
| Laugh (7) | Upside-down giggle | Tread & laugh | Kick bounce | Wobble giggle | Beep beep |
| Dance (8) | Sky dance | Tread dance | Nose pivot | Stoppie | Seat shimmy |
| Thanks (9) | Thank-you glide | Thank-you float | Thank-you bow | Ring-a-ding | Kickstand salute |
| Show off (4) | Loop-de-loop | Duck-dive pop-up | Tail-whip | Wheelie | Burnout donut |

All are visual only and short (2.8-4 s). Flying / swimming: rig-root roll / pitch / lift + one arm pose (`applyRideEmote` arm codes
0 wave, 1 fist pump, 2 air five, 3 salute, 4 toss / scoop, 5 clap, 6 hand on heart); the `ripple` flag is a splash ring in the water and one
sparkle ring in the air (the glowing star / comet). Same body / camera pair framing as before. Rides: in place, wheels on the ground
(`tests/ride-ground.cjs`), inside EMOTE_BOUNDS and the phone frame (`tests/ride-emotes.cjs`).

## Pass it / Juggle with me outside the ground

No balls in the air, in the water or on a ride. Each context has a ball-free two-person version (star pass, splash pass, handlebar /
low / side five; comet / bubble / knee / pedal keepy-ups, header nods). Decision: **instant and one-way**, no Join card. The Join card
(`lib/multiplayer/emoteAsk.ts`) exists to start a two-ball duet both players must take part in; these versions only animate the sender
(the friend sees it on the sender's avatar), so an ask would block flight / swimming for nothing. They still need a friend near in the
SAME context (`sharedBlocked`: flying = friendFlyingNear, swimming = friendSwimmingNear, a ride = friendNear): the wheel greys them
("Needs a friend nearby") and Town refuses the pick. On the ground nothing changed (the ask / duet flow stays).

## Heat

No per-frame allocation: `flourishAt` writes the caller's `Flourish`, ride tricks write the shared `rideBuf` / `rideScript.pose`
(`RT_CH` Float32Array). The sparkle reuses the one pooled emote ring (`emoteBubbles.spark`). Nothing runs when no emote plays.
