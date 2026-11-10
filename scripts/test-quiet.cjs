#!/usr/bin/env node
// `npm run test:quiet` (Oct 15 2026; Nov 10 2026: now the pooled runner in scripts/run-tests.cjs, which `npm test` also
// uses). Prints only failures, every failure at the end, the fixture md5 and an "N/M passed" summary. Options and the
// test manifest (tests/manifest.json, tests/quarantine.json) are documented at the top of scripts/run-tests.cjs.
//   npm run test:quiet                    whole non-quarantined suite, 3 at a time
//   npm run test:quiet -- fishing zip     only tests whose path contains "fishing" or "zip"
//   npm run test:quiet -- --jobs 4        pool size      --core  the old npm test chain only     --list  show selection
require('./run-tests.cjs');
