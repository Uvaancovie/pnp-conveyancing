Purpose: Compute a transparent quote for transfer-related costs.

FR-1.1 Inputs

purchasePrice (number; Rands; sanitized from user text: strip spaces/commas; must be ≥ 0 and ≤ 100,000,000).

FR-1.2 Outputs (exact labels & order)

Transfer Attorney Fees (incl. VAT)

Postages & Petties

Deeds Office Fees

Electronic Generation Fee

FICA

Deeds Office Searches

Rates Clearance Fees

Transfer Duty

Total Transfer Costs (incl. VAT)

FR-1.3 Business Rules

Attorney fees (incl. VAT):

If fixedBands has a band where purchasePrice ≤ max, use that band’s feeExVat × (1 + vatRate).

Else compute tieredFee = max(rate × purchasePrice, min) (ex-VAT), then add VAT.

Deeds Office Fees: pick the first band where purchasePrice ≤ max; else last band.

Disbursements: constants from config JSON.

Transfer Duty (SARS brackets):
duty = base + max(0, purchasePrice − threshold) × rate for the first bracket that matches (or last open-ended).

Total: sum of all eight cost rows above; show as row 9.

FR-1.4 Validation & Errors

If input empty → treat as 0 and show zeros for all lines.

If purchasePrice < 0 or > 100,000,000 → inline error “Enter a valid amount between R 0 and R 100 000 000”.

FR-1.5 Acceptance Criteria (examples)

For purchasePrice = R 2 000 000, rows match the known values and Total = R 81 397,50.

For higher band scenarios, attorney/deeds/duty reflect configured band values (e.g., Attorney R 59 823,00; Deeds R 2 281,00; Duty R 162 356,00 when applicable).