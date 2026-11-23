# IndexNow after a release

IndexNow tells Bing (and Yandex, Seznam, Naver, Yep) which pages changed, so they recrawl them within hours instead of days.
Google does not use IndexNow; it reads the sitemaps (`/sitemap.xml`, `/sitemap-images.xml`, `/sitemap-video.xml`).

- Key file: `public/6813343b75608f0752c63149e9c7dc12.txt` (served at `https://futbolisland.app/6813343b75608f0752c63149e9c7dc12.txt`).
  Keep it. The key is public by design; it only proves the pings come from the site's owner.
- Script: `scripts/indexnow-ping.mjs`. It compares `lib/site/lastmod.generated.json` (written by `node scripts/gen-lastmod.cjs`)
  with the same file at the previous deploy and pings only the pages whose date changed. Batches hold at most 10,000 URLs.
- It is a **dry run by default**: it prints the URLs and sends nothing. Only `--send` makes a network call.

## After a push to main (once Vercel shows the deploy as Ready)

```sh
git fetch origin
node scripts/indexnow-ping.mjs --since <previous-main-commit>        # dry run: check the list
node scripts/indexnow-ping.mjs --since <previous-main-commit> --send # ping
```

`<previous-main-commit>` is the commit that was live before this release (for example `git rev-parse origin/main@{1}` right
after the push, or the sha of the last deploy on Vercel). Without `--since` the script tries `origin/main@{1}`, then `HEAD~1`.
Other options: `--prev saved-lastmod.json` (a saved copy of the old list) and `--all` (every page, for a first ping).

Ping only after the new pages are live: IndexNow engines fetch the URLs (and the key file) straight away.
A 200 or 202 reply means accepted; 403 means the key file is not reachable; 422 means a URL is not on futbolisland.app.

## GitHub Action (disabled)

`.github/workflows/indexnow.yml` runs the same script, but only by hand (Actions tab, "IndexNow ping", Run workflow, choose
dry run or send). It is not triggered on push. To automate it later, add a `push: branches: [main]` trigger and a step that
waits for the Vercel deployment first.

Tests: `node tests/seo-indexnow.cjs` (key file present and valid, change detection, batching, dry run sends nothing).

## Spanish pages (Nov 23 2026)
`lib/site/lastmod.generated.json` lists English paths only, so a plain run never names the `/es/...` twins (394 of the 917 sitemap
URLs). Add `--with-es` to also list each changed page's Spanish twin when the live `/sitemap.xml` lists it
(`--with-es=http://localhost:<port>` reads a local production build instead). It reads the sitemaps even in a dry run; it sends nothing
without `--send`.
