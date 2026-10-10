# IDP ↔ Coaches Board: the shared contract (Oct 9 2026)

For the agent rebuilding `components/CoachesBoard.tsx` / `lib/coaches/board/*`. The IDP never imports board code, and the board
needs nothing from the IDP except **`lib/coaches/idp/board.ts`** (types, constants and two tiny helpers). Nothing here is
built into the board yet; everything is optional, and the IDP degrades gracefully without it.

## What the IDP stores

Only a play **id** on a goal (`PlanGoal.play` in `fi2-idp-v2`) and inside a coach's goal QR (`/plan#c=…~p<id>~…`).

- An id matches `BOARD_PLAY_ID = /^[a-z0-9][a-z0-9-]{0,31}$/`. The board's ids already fit: `uid('p')` gives
  `p` + base-36 lowercase (e.g. `pk3j2a9xyz1`), and the examples are `exgiveandgo`, `exoverlap`, `express`, `excorner`.
- **Never reuse an id for a different play** (a QR printed weeks ago still carries it).
- No play content, names or drawings are stored by the IDP. A custom play lives on the coach's device; on a player's device
  only the example plays exist, so the IDP says "your coach's play" and the board shows its list when the id is unknown.

## Events and hooks

| Name | Direction | Detail | What should happen |
|---|---|---|---|
| `BOARD_OPEN_PLAY` = `'fi2-board-open-play'` | IDP → board | `{id}` | The IDP closes its dialog and dispatches this. The board (when it listens) opens the Coaches Board on that play, or on its list if the id is unknown. Today nobody listens, so the button just closes the plan; wire it when ready. |
| `BOARD_LINK_PLAY` = `'fi2-board-link-play'` | board → IDP | `{id,title,goalId?}` | Optional "Link to a player's goal" action on the board. The IDP's coach tools (only while open) pre-select that play for the next goal QR. |
| `window.__fiBoardPlays` (`BOARD_PLAYS_GLOBAL`) | board → IDP | `() => BoardPlayRef[]` | Optional. Lets the IDP list saved plays by title in "Link a play" and name a linked play. `BoardPlayRef = {id,title,format?,skill?}`; `skill` is an IDP skill family id (`scan`, `space`, `defend`, `recover`, `talk`, `touch`, `dribble`, `pass`, `switch`, `runs`, `brave`) so the IDP can suggest a play for a goal. Register it when the board module loads (no loop, no timer). |

## Suggested skill tags for the four example plays

`exgiveandgo` → `pass`, `exoverlap` → `space`, `express` (pressing a goal kick) → `recover`, `excorner` → `runs`.

## Privacy

Play ids are not personal data. Do not put player names, initials or shirt numbers in an id or a title that might be
registered through `__fiBoardPlays` (the IDP shows titles to the player).
