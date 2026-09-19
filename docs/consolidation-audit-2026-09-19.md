# Consolidation audit — September 19, 2026

## Conclusion

No missing deployed-project files were found. The renamed active project builds independently of both archived projects. This verifies consolidation integrity, not a completely bug-free app: the full test run has five failures described below.

## Deployment identity and comparison boundary

Vercel inspection resolves futbolisland.app to READY production deployment `dpl_FCU3DG5Q14G7DgXfiMuLAkJL4Eew`, created September 18 at 18:45 PDT. The local .vercel project identity still matches the deployed Futbol Island project.

The pre-cleanup manifest records the local source used for that deployment; it is not a source archive downloaded from Vercel. Comparing the current folder to it found 6,138 identical files, zero missing files, and six expected changes: PROJECT.md plus five offline legacy-import/narration scripts whose relative paths were updated after the folder rename. Runtime code, public assets, package.json, package-lock.json, environment file, deployment configuration, tests and vendor material match that snapshot. Browser progress storage keys were deliberately retained.

Fifteen live public files were independently fetched and matched byte-for-byte: all six public/lessons JSON files, six shared artwork/font/texture assets, and three narration samples. This sampling does not claim every deployed file was downloaded. All 5,508 unique asset references found in lesson JSON resolve locally.

## Recovery archives

Both archives were reopened and every regular file rehashed against its manifest: original project 39,027 files; visual refresh 18,955 files. Unique source/assets, private configuration, Git history where present, models and offline Python tools are preserved. Only node_modules, .next and .next-dev were omitted. Recovery instructions are in ../project-archives/2026-09-19-audit/README.md relative to the project root. Never extract the original archive over the active futbol-island directory.

## Build and tests

A fresh production build passes from the renamed folder without restored legacy folders. Full Node test run: **87 passed, 5 failed out of 92**. Failing tests and runtime files are unchanged from the pre-cleanup snapshot; these are not removed-file regressions:

| Test | Observed failure |
| --- | --- |
| jetpack-actions | VM test harness lacks require for exploreActivity import |
| lesson-gestures | VM test harness lacks window for the blur listener |
| live-game-effects | Canvas stub lacks save() |
| store-ball-signatures | Test loader cannot resolve ./ballSparkles |
| travel-modes | Rider hands reach handlebars assertion fails; needs geometry/expectation investigation |

No assertions were weakened and no gameplay behavior was changed to conceal these findings. Passing tests include native touch controls, lesson catalog/presentation, paths, audio, customization, progress and world simulation. This audit does not establish physical iPhone temperature or Safari behavior.

## Moving forward

- Work and deploy from `futbol-island/` only. Other versions are recovery archives.
- Normal runtime/build has no dependency on archived folders. Five offline scripts require restoring the original archive to `project-archives/restored/futbol-island`; recreate Node dependencies and rebuild the Python environment at that path before using them. Model files are retained. Offline voice generation itself was not rerun.
- Browser audit script check-island-layout.cjs relies on locally installed Playwright/Chromium paths, with PLAYWRIGHT_MODULE and CHROMIUM_PATH overrides. Those tools are outside this project; a new machine must install/configure them.
- Local .env.local is retained and ignored for upload. Production environment values are managed by Vercel; secret values were not printed or independently compared.
- At audit time the active project had no .git directory. Subsequently initialized version control for https://github.com/khoaaohk/futbol-island at the user’s request. Private recovery archives and local secrets remain outside Git; keep a separate private backup for those.
- No redeployment was needed or performed for this audit; deployed runtime files did not change.
