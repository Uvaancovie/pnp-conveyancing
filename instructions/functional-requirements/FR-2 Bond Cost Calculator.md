Purpose: Compute once-off bond registration costs.

FR-2.1 Inputs

bondAmount (number; Rands; sanitized; ≥ 0 and ≤ 100,000,000).

FR-2.2 Outputs (exact labels & order)

Bond Attorney Fee (incl. VAT)

Postages & Petties

Deeds Office Fees

Electronic Generation Fee

Electronic Instruction Fee

Deeds Office Searches

Total Bond Costs (incl. VAT)

FR-2.3 Business Rules

Attorney fees (incl. VAT): same fixedBands → tiered → VAT logic as FR-1 but from bond fee config.

Deeds Office Fees: by bondAmount bands (bond table).

Disbursements: constants from bond config.

Total: sum of rows 1–6; show as row 7.

FR-2.4 Validation & Errors

Empty → treat as 0 and show zeros.

Out of range → same error copy as FR-1.

FR-2.5 Acceptance Criteria (examples)

bondAmount = R 4 000 000 → rows match and Total ≈ R 69 464,00.

bondAmount = R 3 000 000 → Bond Attorney Fee = R 52 750,50 and Total = R 57 676,50.