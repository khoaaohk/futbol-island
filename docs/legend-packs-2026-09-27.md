# Legend mystery packs

Local implementation, not deployed. The Island Store's component-only **Mystery packs** category opens through `itemRequest.id = 'packs:legend'`. It disables the store's 3D item-preview work. A pack costs 30 earned arcade coins and reveals one of six canonical roster players: Pelé, Marta, Mia Hamm, Johan Cruyff, Luka Modrić, Gianluigi Buffon.

`LegendPackStore` delegates purchase choice, no-repeat enforcement, balance deduction and persisted receipt to `purchaseLegendPack`. The UI never rerolls. Its latest receipt survives closing/reopening/reloading through the wallet; selecting an earlier collected card shows that receipt's coaching note. Busy-ref gating prevents a rapid double click within one render; wallet locks handle cross-tab coordination. The screen includes insufficient-funds, purchase error, opening and completed-series states. Existing MiniCard/CardBack provide the artwork; no animation timer or new renderer.

All six names were checked against the canonical card roster. Each legend has a short factual career context linked to a researched FIFA or UEFA source. Coaching notes are original Futbol Island writing, explicitly labelled **not a player quote**. Buffon's factual context concerns learning after his EURO 2000 injury setback; the note's next-ball reset after a mistake is original coaching advice, not attributed speech. Notes focus on preparation, composure, curiosity, courage, creative practice and recovery.

TypeScript and the parent wallet/browser validation results are reported separately. Real-input purchase, persistence and narrow-screen screenshots remain part of the integrated store pass rather than being inferred from this component's source.
