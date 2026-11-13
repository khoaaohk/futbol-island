# DRIP FC Stadium crowd recordings

- **What:** the real crowd under the stadium soundscape (`lib/audio/stadiumSound.ts`, owner Nov 13 2026: "it must feel like
  the English Premier League"): a match-day bed, a roar, two goal eruptions, two near-miss "oohs", a groan, applause, the
  referee's whistle and two stadium PA announcements. The crowd's chants on top stay synthesised and original.
- **Where:** `public/audio/stadium/*.m4a` (AAC-LC, 32 kHz, 40–64 kbps; 12 files, about 0.7 MB in all). They are fetched only
  after the first gesture, on the first approach to the stadium, and dropped again once you have been away for 30 s.
- **Licence:** every recording is **CC0 1.0** (public domain dedication,
  https://creativecommons.org/publicdomain/zero/1.0/), checked on each file's Freesound page on Nov 13 2026. Only the public
  preview MP3s were used (no login). No CC-BY-NC, no broadcast audio. CC0 needs no credit; we credit the recordists anyway.
- **Content check:** generic crowd atmosphere only. Passages with audible singing, club songs, PA music or words were left out
  (each source was inspected by spectrogram and an offline speech-to-text pass; the bed and roar windows are wordless roar).
- **Processing:** trimmed, RMS-normalised with a soft peak limit at −1 dBFS, faded; the two loops (`bed`, `roar`) are
  cross-faded into seamless loops with 0.25 s of wrap-around padding at each end (the runtime loops [0.25 s, end − 0.25 s]).
  The scripts are in `scripts/stadium-crowd-audio/` (`prep.py`, `pa.py`).

| File | Source (title, recordist) | Licence | Used |
|---|---|---|---|
| `bed.m4a` | "Norwegian football match / soccer game ambience XY to ORTF, AB and Binaural" by Vogyik, https://freesound.org/people/Vogyik/sounds/868982/ (a processed excerpt of "Norwegian football match/soccer game ambience.WAV" by habbis92, https://freesound.org/people/habbis92/sounds/206003/, Viking Stadion, Stavanger) | CC0 1.0 (both) | 25.0–44.2 s (ORTF take), 18 s loop |
| `roar.m4a` | "19 Football Crowd - Reaction To Goal.flac" by D.jones, https://freesound.org/people/D.jones/sounds/528799/ | CC0 1.0 | 15.0–32.2 s (the steady roar, before any singing), 16 s loop |
| `goal.m4a` | the same recording by D.jones, https://freesound.org/people/D.jones/sounds/528799/ | CC0 1.0 | 3.4–14.4 s (the eruption) |
| `goal2.m4a` | "Goal.wav" by Sandermotions, https://freesound.org/people/Sandermotions/sounds/494352/ (Cambuur Stadion, Leeuwarden) | CC0 1.0 | 4.7–14.8 s |
| `ooh.m4a` | "Soccer stadium Oehh.wav" by Sandermotions, https://freesound.org/people/Sandermotions/sounds/494362/ | CC0 1.0 | 1.6–8.6 s, mono |
| `ooh2.m4a` | "football game in a big arena" by ckater, https://freesound.org/people/ckater/sounds/353418/ (Hanover) | CC0 1.0 | 3.4–9.6 s (a missed chance), mono |
| `groan.m4a` | "CRWDReac_Crowd Sigh In Disappointment_ShaneVincent_GSC24_XY-AKG214-96k.wav" by ShangusBurger, https://freesound.org/people/ShangusBurger/sounds/763880/ | CC0 1.0 | 0.7–5.6 s, mono |
| `applause.m4a` | "R08-26-Crowd Applauding.wav" by craigsmith, https://freesound.org/people/craigsmith/sounds/480692/ | CC0 1.0 | 0.3–7.3 s, mono |
| `ole-shouts.m4a` | "G30-74-Bullfight Crowd Ole.wav" by craigsmith, https://freesound.org/people/craigsmith/sounds/438434/ (a crowd SHOUTING "Olé!": no tune, no words beyond the shout) | CC0 1.0 | 4.2–9.2 s (two shouts), mono, under the end of our own synthesised olé song |
| `whistle.m4a` | "Referee whistle blow, gymnasium.wav" by SpliceSound, https://freesound.org/people/SpliceSound/sounds/218318/ | CC0 1.0 | 0–1.4 s, mono |
| `pa-welcome.m4a` | the chime: "Audio 03_03.flac" (a stadium PA ding-dong) by Streety, https://freesound.org/people/Streety/sounds/31133/ ; the voice: "Good afternoon, and welcome to Drip F C Stadium!" rendered offline with Kokoro-82M (hexgrad, Apache-2.0, https://huggingface.co/hexgrad/Kokoro-82M), voice `bm_george` | CC0 1.0 (chime); Apache-2.0 (Kokoro) | chime + voice through a band-limited "tannoy" with the bowl's slap echoes |
| `pa-goal.m4a` | the same chime by Streety, https://freesound.org/people/Streety/sounds/31133/ ; the voice: "Gooaal! What a strike! What a goal, here at Drip F C Stadium!" (Kokoro-82M, `bm_george`) | CC0 1.0 (chime); Apache-2.0 (Kokoro) | as above |

No speech engine runs in the app: the two announcements are ordinary audio files.
In-app credit: Settings → About us → Story music → "Stadium crowd".
