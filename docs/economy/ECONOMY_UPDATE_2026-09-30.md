# Economy note: the learning loop's two coin sources (30 Sep 2026, lane 3)

Local only. This follows [the 29 Sep update](ECONOMY_UPDATE_2026-09-29.md) and keeps its goals. Learning pays best, and a regular player owns everything in 60–90 days.

## New sources

| Source | Pay | Limit | Wallet id | Metered? |
|---|---|---|---|---|
| Daily warm-up: right answer at a due review | `LEARN_COINS.review` = **2** | **3 paid a day** (`REVIEW_PAID_PER_DAY`), so at most **6 coins a day** | `learn:review:<local day>:<1-3>` | No (learning coin) |
| Book "Take it to your game": first right answer | `LEARN_COINS.book` = **5** | once per book, 36 sold books, so at most **180 coins, one-off** | `learn:book:<bookId>` | No (learning coin) |

- The warm-up is the only **daily-repeatable** learning coin. The cap is enforced twice:
  - in the review store (`payReview`);
  - by the wallet's idempotent ids, three per day.
- Everything else in the learning loop pays nothing:
  - Spot-it callouts;
  - magazine, job, fishing and ball-hunt ticks;
  - the mastery screen (removed 1 Oct 2026).
- Books stay 100 coins. A check returns 5% of the price. It gives reading a football payoff without turning books into an earning loop.

## Impact (`tests/economy.cjs` §7, 5-seed means, 200 days)

**Worst case:** the warm-up is fully paid **every** day from day 1, and every book check is paid up front.

| Player | Own everything, before | Worst case |
|---|---|---|
| Casual, 15 min daily | day 122 | day 110 |
| Regular, 20 min daily | day 84 | day 78 (target 60–90 ✓) |
| Engaged, 45 min daily | day 49 | day 46 |

- A realistic player earns less. Reviews are only due for lessons already passed, they thin out as lessons reach the 14- and 30-day boxes, and right-first-time is not guaranteed.
- A day of warm-ups pays at most 6 coins. That is:
  - under a tenth of a casual day (74);
  - less than one new lesson quiz (12), so new learning still pays best.

## Guard rails added to `tests/economy.cjs` (§7)

- The daily warm-up max is at most 10% of a casual day, and less than one lesson quiz.
- A book check is under 10% of a book, and all book checks together are under 5% of the sink.
- Review and book ids are never metered.
- Worst case: the regular player stays inside 60–90 days, the casual player finishes at most 14 days sooner, and there are no new dry spells.

## Wall rebounds pay (30 Sep 2026, docs/island-jobs.md §11)
The job grew from 10 passes + 3 shots (~30 s) to 50 passes + 15 shots from a moving circle (~3.5 min). At 8 coins it paid the
lowest per minute of all jobs (1.95 coins/min). **Raised to 26** (user-approved): 26 / 4.1-min shift = **6.34 coins/min**, against a
median of 6.29 for the other ten jobs (range 3.40–7.27; `JOB_MINUTES` + 0.6-min overhead in `jobEconomy.ts`).
- **Rules unchanged:** +4 the first time, full pay twice a day, half (13) twice, then 1-coin tips, all under the Training meter.
- **Sim:** jobs are now timed one by one (`jobMin`); the short jobs still average 1.5 min. Owning everything (20-seed means, 200
  days): casual 121 → 123, **regular 85 → 85** (inside 60–90), engaged 49 → 49. Learning stays 49–51% of coins in days 8–30.
- **Guards:** `tests/island-jobs.cjs` pins 26, the tiers and per-minute parity (±10% of the median); `tests/economy.cjs` §2 keeps
  the short jobs in the 7–10 band and checks that wall rebounds is never the best-paid job per minute.

## Fuel (30 Sep 2026, [FUEL_2026-09-30.md](FUEL_2026-09-30.md))

- **What it is:** a 0–100 fuel bar in the coins bar.
  - Flying, rides and sprinting use it; walking barely does and always works.
  - Learning never uses it.
  - Konbini food and drinks, drink machines and pocket fruit refill it, and so does breakfast (50) each new day.
  - Nothing drains offline.
- **New sink, no new source.** First sim (20-seed means, every refill bought): fuel was 3–9% of income, and owning everything
  moved casual 121 → 126, regular 85 → 87, engaged 49 → 55.
- **Eased for a kids' game (user, 30 Sep 2026):** lower rates (a tank ≈ 28 min flying), a full tank at breakfast, about double
  the food values. With these, **no simulated session drains past breakfast**, so the fuel coin sink is negligible (0% of income;
  regular still day 85). Fuel is now mainly a nutrition lesson.
- **Free water fountains** (six, +25 a sip, 90 s rest each, W on the map) are the first step of the zero-coin path, before garden
  fruit. A 90-minute heavy flyer refuels for free in 0.45 min (1.45 min with fruit alone). Details: FUEL_2026-09-30.md §2.5 and §4.
- **Quiz coins: unchanged.** No new or repeatable quiz pay (overjustification evidence; learning already pays best).
- **Guards:** `tests/economy.cjs` §9, `tests/fuel.cjs` and `tests/water-fountains.cjs`.

## Garden shift (30 Sep 2026, docs/island-jobs.md §13)
The Community Garden became a paid job: pick 8 (≥ 2 fruit, ≥ 2 veg), drop them in the garden crate.
- **Pay 10** (+4 first time; then 10, 5, 5 and 1-coin tips; Training meter unchanged). `JOB_MINUTES` 1.0 (≈ 95 m of paths, 8 pick
  poses, the crate) + 0.6 overhead = 1.6-min shift → **6.25 coins/min**, the median of the jobs (range 3.40–7.27; wall rebounds 6.34
  is still within 10% of the new median). The short jobs now average 1.51 min a shift.
- **Gardener's share** 2 / 1 / 1 produce (≤ 6 coins), sold through the market allowance and the Training meter.
- **No double pay:** free picking stays, but not during a shift; shift picks go to the crate and regrow. The sim takes the shift's
  8 picks out of that session's garden pool (`SEP30_GARDEN`).
- **Sim (20-seed means, 200 days), without → with the job:** casual15 123 → 122, **regular 85 → 85** (inside 60–90), engaged 49 → 49;
  learning share unchanged (48–51% in days 8–30). Metered daily job ceiling 147 → 152 (raw 322 → 352): the meter, not the job
  count, sets the ceiling. Config `after,no-garden-shift` in `scripts/economy-sim.cjs`; guard `tests/economy.cjs` §10.
