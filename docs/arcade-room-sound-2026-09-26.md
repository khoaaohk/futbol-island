# Arcade room sound — September 26, 2026

Local implementation, not deployed. The room has short positional cabinet melodies, pinball bells, air-hockey impacts, ticket-counter sounds and quiet walking Foley. Distance attenuates each cabinet and horizontal position pans it. These are synthesized sounds, not recorded crowd speech or licensed music.

`lib/audio/arcadeRoomSound.ts` follows the island's persisted sound mute and volume preferences. It creates one AudioContext only after an input gesture, schedules at most eight short voices, and runs from the room's existing update clock. There are no audio downloads, polling timers or separate animation loops. Hidden tabs stop sources and suspend the context. Muting does the same; entering a game or disposing the room closes the context and removes its listener.

`node tests/arcade-room-sound.cjs` passes gesture gating, the voice bound, mute persistence, hidden suspension, and idempotent disposal. Browser integration is covered by `scripts/check-arcade-isolation-browser.cjs`; browser evidence and final room checks are recorded in the room review. Emulation cannot establish physical phone temperature or speaker quality.
