# SEO snapshot (admin SEO tab)

The SEO tab on `/admin` shows Google Search Console numbers from one committed file:

    data/seo/snapshot.json

There is no Google API. The daily Search Console browser run (Claude in Chrome, signed in as the site owner) reads the
reports and updates this file. The tab reads it on the server, only for a signed-in admin (`app/admin/page.tsx` →
`lib/seo/snapshot.ts`), so the numbers never reach a signed-out visitor. If the file is missing or does not pass the
checks, the tab shows a friendly empty state; our own "Search arrivals" still show under it.

The checks live in `lib/seo/snapshotSchema.mjs` and run three ways: in the app, in `node scripts/seo-snapshot.mjs`, and in
`tests/admin-seo.cjs`.

## Fields

| Field | What to put in it | Where in Search Console |
| --- | --- | --- |
| `schemaVersion` | `1` | |
| `asOf` | today, `YYYY-MM-DD` (the day of the run) | |
| `gscDataThrough` | the last day the Performance report has data for (usually 2 days ago) | Performance, last day on the chart |
| `windows.d28` | `{clicks, impressions, ctr, position, queries, pages, prev}` for "Last 28 days". `ctr` is a fraction: 4.7% is `0.047`. `prev` is the previous 28 days from the Compare view, or `null` | Performance, date filter "Last 28 days" (Compare for `prev`) |
| `windows.d7` | the same for "Last 7 days", or `null` when not read | Performance, "Last 7 days" |
| `windows.h24` | optional, the same fields for Search Console's **"24 hours"** view (fresh, partial data; shown as "Today"), or `null`/absent when not read | Performance, date filter "24 hours" (Compare for `prev`) |
| `windows.d1` | optional, one whole day: the same fields plus `day` (YYYY-MM-DD, normally yesterday; shown as "Yesterday"), or `null`/absent | Performance, More → Custom (that one day), or the DAYS tab row |
| `daily` | `[{day, clicks, impressions}]` per day when the chart is read; may stay `[]` | Performance chart, hover or Export |
| `topQueries` | up to ~25 rows `{query, clicks, impressions, position}`, by impressions. `clicks: null` when Google does not show them | Performance, Queries table |
| `topPages` | up to ~30 rows `{path, clicks, impressions, position}`; `path` starts with `/` | Performance, Pages table |
| `index` | `{asOf, indexed, notIndexed, previous, reasons}`. `asOf` is the date Google prints on the Pages report. `previous` is the last different reading `{asOf, indexed, notIndexed}` (keep it until the numbers change). `reasons` is `[{reason, pages, validation, examples?}]` in Google's wording; `validation` is e.g. `"Started 2026-11-15"`, `"Passed 2026-11-20"` or `null`. The reasons should add up to `notIndexed` (a warning if not) | Indexing > Pages |
| `sitemaps` | `[{path, lastRead, status, discovered}]` | Indexing > Sitemaps |
| `workLog` | one entry per run day, oldest first: `{day, requested:[paths], alreadyIndexed, note?}`. Keep the last 30 entries | the run's own indexing requests |
| `history` | append-only, one row per snapshot day, oldest first: `{day, clicks, impressions, ctr, position, indexed}` (the headline numbers of that run; `indexed` may be `null`) | copy from the fields above |

Positions 5-20 get a "Quick win" badge on the tab. The "What's happening" lines are worked out from `history`, `index` and
the quick wins; nothing needs writing by hand.

## The daily run, step by step

1. `git pull` on `main` (only this file changes, so there is nothing to merge).
2. Read Performance for **24 hours** (`windows.h24`, "Today"), **yesterday** (`windows.d1`, More → Custom), **7 days** and
   **28 days** (the owner asked for Today / Yesterday / 7 days on Nov 16 2026; turn on Compare for `prev`), then Pages,
   Sitemaps, and do the day's indexing requests. The table rows can be read with one script in the page (all `tr` cells).
3. Edit `data/seo/snapshot.json`:
   - set `asOf` to today and `gscDataThrough` to the report's last day;
   - replace `windows`, `topQueries`, `topPages`, `index` and `sitemaps` with today's readings (move the old `index`
     numbers into `index.previous` when they change);
   - append today's row to `history` (never edit or delete older rows; if the run happens twice in a day, replace that
     day's row);
   - append today's entry to `workLog`, and drop the oldest entries so at most 30 remain.
4. `node scripts/seo-snapshot.mjs` must print `seo-snapshot: OK` (exit 0). Fix any `error:` lines; `warning:` lines are
   allowed but worth a look.
5. Commit and push ONLY `data/seo/snapshot.json` (the owner gave standing permission for this data-only push, never code):
   `git add data/seo/snapshot.json && git commit -m "SEO snapshot YYYY-MM-DD"` and push with the release push recipe.
