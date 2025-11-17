Purpose: Estimate monthly repayment and totals.

FR-3.1 Inputs

amount (number; Rands; sanitized; ≥ 0 and ≤ 100,000,000).

interestRatePct (number; normalize , → .; ≥ 0 and ≤ 100).

years (enum): 5, 10, 20, 25, 30.

FR-3.2 Outputs (exact labels)

Interest Repayment

Total Loan Repayment

Total Monthly Cost

FR-3.3 Formula

r = interestRatePct / 100 / 12
n = years * 12
if amount == 0 → all outputs 0
if r == 0 → pmt = amount / n; total = amount; interest = 0
else:
  pmt = amount * r*(1+r)^n / ((1+r)^n - 1)
  total = pmt * n
  interest = total - amount


FR-3.4 Acceptance Criteria

amount = 6 000 000, interest = 10.5%, years = 20 →
Monthly ≈ R 59 902,79, Interest ≈ R 8 376 670,29, Total ≈ R 14 376 670,29.

amount = 0 → all outputs R 0,00.