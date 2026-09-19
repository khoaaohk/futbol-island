# Story music

Selected: **Wildflowers — Scott Buckley**. Gentle piano and strings that build; quiet opening excerpt underneath the narration, with voice-driven ducking and a five-second fade out.

- Track/source: https://www.scottbuckley.com.au/library/wildflowers/
- Author: https://www.scottbuckley.com.au/
- License: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/
- Terms checked September 17, 2026: https://www.scottbuckley.com.au/library/using-this-music/
- Source MP3: https://www.scottbuckley.com.au/library/wp-content/uploads/2025/12/Wildflowers.mp3
- Changes: excerpt, gain adjustment, fades, narration mix and compression.
- In-app credit: Settings → About us → Story music.
- Any future YouTube upload also needs credit/source/license in its description.

Selected for Regulating Emotions: **Ascension — Scott Buckley**, https://www.scottbuckley.com.au/library/ascension/ , also CC BY 4.0 with attribution. Hopeful orchestral feel; replaces its earlier Wildflowers mix. Source MP3: https://www.scottbuckley.com.au/library/wp-content/uploads/2019/02/sb_ascension.mp3 . Same CC BY 4.0 license, with separate in-app credit.

Offline build: download the authorized sources to `/tmp/fi2-wildflowers.mp3` and `/tmp/fi2-ascension.mp3`, then run `node scripts/mix-story-music.mjs grit` and `node scripts/mix-story-music.mjs regulate` after their voice/video builds finish. This uses dry narration, never mixes on top of an already mixed soundtrack. Only synchronized movies are served; the full source track is not bundled. One native video/audio stream remains at runtime.
