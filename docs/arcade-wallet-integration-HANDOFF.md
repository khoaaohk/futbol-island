# Shared coin spending — integration complete locally

September 27, 2026. Not committed or deployed.

The arcade wallet is now the single spendable balance for island jobs, market sales, arcade plays, packs and vending purchases. The vending history no longer gets subtracted a second time. Existing job/welcome/market sources retain their IDs and amounts.

Old `fi2-vending-v1.spend` records are imported into core debits with stable item/cost/time/occurrence identities. Reordering or cleaning old history cannot migrate a payment twice. Existing ownership is preserved, including if an old split balance was overdrawn; later earnings cover that outstanding spending. Reconciliation persists the migration under the wallet lock. The old ledger is kept for history and unlock grants.

New gear transactions use `buyVendingWithCoins`: one core write stores both debit and item identity. That receipt is the durable ownership record. If saving secondary vending history fails, reading/reloading recovers ownership from the receipt. A failed core write grants nothing and costs nothing. Vending history and the shared wallet have separate lock names, avoiding recursive acquisition of the same lock. Packs continue through the existing pack transaction.

`payArcadePlay` remains 3 coins per new play. Pause/resume remains free.

Home editing and collectible purchases are gated by `HOME_DECOR_ENABLED=false`, at the user's request. The staged home room is not accessible in Settings. Display items remain previews and cannot debit coins.

Validation: `tests/home-wallet.cjs`, `tests/arcade-wallet-spending.cjs`, vending/fishing/jobs regressions and TypeScript pass. Desktop and390×844 browser checks confirm migrated balances, purchase debit, reload, hidden home entry and blocked preview purchase. No server restart or physical-phone temperature claim.
