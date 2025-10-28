duty.za.json → brackets[] with { upTo?, base, rate, threshold }.

fees.transfer.json → fixedBands[], tiers[], deedsOfficeByPrice[], disbursements, vatRate.

fees.bond.json → fixedBands[], tiers[], deedsOfficeByBond[], disbursements, vatRate.

theme.json → { brand, primary, primaryActive, accent, whatsappNumber, disclaimer }.

The app must render and compute solely from these JSONs (plus user inputs). Updates to fees/duty should not require code changes.