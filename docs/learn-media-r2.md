# /learn clips on Cloudflare R2 (Nov 3 2026)

- Bucket `futbol-media` (Cloudflare account khoa0aohk@gmail.com), served by the worker in `multiplayer/media/` at
  `https://futbol-media.khoa0aohk.workers.dev` (Range support, 1-year immutable cache, CORS for futbolisland.app and localhost).
  Keys: `learn/video/<name>.mp4` (every clip in `public/learn/video`) and `masters/<name>_master.mp4` (full-quality masters, 2560 wide,
  NOT served: the worker answers 404 for `masters/`; download them with `npx wrangler r2 object get futbol-media/masters/<file> --remote`).
- Upload / refresh after a re-record: `node scripts/upload-learn-media.cjs [--masters <dir>]` (skips unchanged files; state in
  `multiplayer/media/uploaded.json`). Deploy the worker: `cd multiplayer/media && npx wrangler deploy`.
- The site still serves its own clips. To move them to R2 set `MEDIA_BASE` in `lib/site/learnMedia.ts` to the worker URL: then
  `learnUrl()` points every `/learn/video/*.mp4` there (same path and `?v=<hash>`). Posters stay on the site. Revert by setting it back to ''.
- No custom domain yet (the Cloudflare account has no zone for futbolisland.app), so the URL is a workers.dev one.
