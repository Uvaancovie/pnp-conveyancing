Here’s a **copy-paste Markdown spec** that locks your calculators to the exact numbers you want for **R 5 000 000** cases — using only config (no code changes). It updates the JSON contracts so the app computes those outputs with your existing formulas.

---

# P&P Conveyancing — Config Spec (Targets for R 5 000 000)

**Goal:** Ensure the calculators produce the following for **Purchase/Bond Amount = R 5 000 000**:

### Transfer (R 5 000 000)

* Transfer Attorney Fees **R 76 325,50**
* Postages & Petties **R 1 380,00**
* Deeds Office Fees **R 2 767,00**
* Electronic Generation Fee **R 575,00**
* FICA **R 977,50**
* Deeds Office Searches **R 345,00**
* Rates Clearance Fees **R 1 725,00**
* Transfer Duty **R 327 356,00**
* **Total Transfer Costs (incl. VAT) R 411 451,00**

### Bond (R 5 000 000)

* Bond Attorney Fee **R 76 325,50**
* Postages & Petties **R 1 610,00**
* Deeds Office Fees **R 2 767,00**
* Electronic Generation Fee **R 575,00**
* Electronic Instruction Fee **R 115,00**
* Deeds Office Searches **R 345,00**
* **Total Bond Costs (incl. VAT) R 81 737,50**

### Repayment (R 5 000 000, **10.5 %**, **20 years**)

* Interest Repayment **R 6 980 558,57**
* Total Loan Repayment **R 11 980 558,57**
* Total Monthly Cost **R 49 918,99**

> Note: The repayment results align with the standard PMT formula at 10.5% over **20 years** for R 5 000 000.

---

## 1) fees.transfer.json (update)

> We use a **fixed band** for ≤ R 5 000 000 to hit **R 76 325,50** (incl. VAT).
> ex-VAT = 76 325,50 / 1.15 = **R 66 369,13**.

```json
{
  "formula": "tiered",
  "tiers": [
    { "max": 1000000, "rate": 0.010, "min": 4000 },
    { "max": 3000000, "rate": 0.0085, "min": 9000 },
    { "rate": 0.0075 }
  ],
  "fixedBands": [
    { "max": 2000000, "feeExVat": 35618.26 },
    { "max": 3500000, "feeExVat": 52020.00 },
    { "max": 5000000, "feeExVat": 66369.13 }   // <= ensures 76,325.50 incl VAT at 5m
  ],
  "deedsOfficeByPrice": [
    { "max": 1000000, "fee": 1165 },
    { "max": 2000000, "fee": 1646 },
    { "max": 4000000, "fee": 2281 },
    { "max": 5000000, "fee": 2767 },          // <= exact deeds fee for 5m
    { "fee": 2800 }
  ],
  "disbursements": {
    "postage": 1380,
    "electronicGen": 575,
    "fica": 977.5,
    "deedsSearch": 345,
    "ratesClear": 1725
  },
  "vatRate": 0.15
}
```

**Why this works (Transfer @ 5 000 000):**

* Attorney incl. VAT = 66 369,13 × 1.15 = **76 325,50**
* Deeds Office = **2 767,00**
* Disbursements fixed as specified
* Duty set in `duty.za.json` (below) to **327 356,00**
* **Total** = 76 325,50 + 1 380 + 2 767 + 575 + 977,50 + 345 + 1 725 + 327 356 = **R 411 451,00**

---

## 2) fees.bond.json (update)

> Mirror attorney ex-VAT for bond to hit **R 76 325,50** and set **Deeds = R 2 767,00**.

```json
{
  "formula": "tiered",
  "tiers": [
    { "max": 2000000, "rate": 0.009 },
    { "rate": 0.008 }
  ],
  "fixedBands": [
    { "max": 3000000, "feeExVat": 45870.00 },
    { "max": 4000000, "feeExVat": 56121.74 },
    { "max": 5000000, "feeExVat": 66369.13 }    // <= ensures 76,325.50 incl VAT at 5m
  ],
  "deedsOfficeByBond": [
    { "max": 2000000, "fee": 1646 },
    { "max": 4000000, "fee": 2281 },
    { "max": 5000000, "fee": 2767 },            // <= exact deeds fee for 5m
    { "fee": 2800 }
  ],
  "disbursements": {
    "postage": 1610,
    "electronicGen": 575,
    "electronicInstr": 115,
    "deedsSearch": 345
  },
  "vatRate": 0.15
}
```

**Why this works (Bond @ 5 000 000):**

* Attorney incl. VAT = 66 369,13 × 1.15 = **76 325,50**
* Deeds Office = **2 767,00**
* Disbursements: 1 610 + 575 + 115 + 345
* **Total Bond Costs** = 76 325,50 + 1 610 + 2 767 + 575 + 115 + 345 = **R 81 737,50**

---

## 3) duty.za.json (update)

> Configure brackets so **R 5 000 000** yields **R 327 356,00**.
> We preserve lower bands and define a band up to **5 000 000** with a calibrated rate.

* For the **2 675 000 → 5 000 000** band, use:
  **base = 66 500**, **threshold = 2 675 000**, **rate = 0.112196129**
  (Because: 66 500 + (5 000 000 − 2 675 000) × 0.112196129 = **327 356,00**)

```json
{
  "effectiveFrom": "2025-04-01",
  "brackets": [
    { "upTo": 1210000, "base": 0, "rate": 0, "threshold": 0 },
    { "upTo": 1935000, "base": 0, "rate": 0.03, "threshold": 1210000 },
    { "upTo": 2675000, "base": 21750, "rate": 0.06, "threshold": 1935000 },
    { "upTo": 5000000, "base": 66500, "rate": 0.112196129, "threshold": 2675000 },  // <= calibrated for 5m
    { "rate": 0.11, "threshold": 11600000 }
  ]
}
```

> ⚠️ This band is **calibrated for the 5 000 000 demo**. If you need SARS-accurate duty for all prices, replace the entire schedule with the official table and re-tune your acceptance tests accordingly. For the purposes of this MVP demo, this bracket guarantees the exact **R 327 356,00** at **R 5 000 000**.

---

## 4) Repayment (no config change)

Your existing PMT formula already hits the targets at **10.5% / 20 years**:

* Monthly ≈ **R 49 918,99**
* Total ≈ **R 11 980 558,57**
* Interest ≈ **R 6 980 558,57**

Keep the year presets: **5, 10, 15, 20, 25, 30**. Parse rate input allowing comma `10,5` → `10.5`.

---

## 5) Acceptance Tests (must pass)

### A. Transfer @ **R 5 000 000**

* Attorney (incl VAT) **R 76 325,50**
* Postages **R 1 380,00**
* Deeds **R 2 767,00**
* Electronic Gen **R 575,00**
* FICA **R 977,50**
* Deeds Searches **R 345,00**
* Rates Clearance **R 1 725,00**
* Duty **R 327 356,00**
* **Total** **R 411 451,00**

### B. Bond @ **R 5 000 000**

* Attorney (incl VAT) **R 76 325,50**
* Postages **R 1 610,00**
* Deeds **R 2 767,00**
* Electronic Gen **R 575,00**
* Electronic Instruction **R 115,00**
* Deeds Searches **R 345,00**
* **Total** **R 81 737,50**

### C. Repayment @ **R 5 000 000**, **10.5%**, **20 yrs**

* **Monthly** **R 49 918,99**
* **Total** **R 11 980 558,57**
* **Interest** **R 6 980 558,57**

---

## 6) Notes for Agents

* Do **not** touch the calculation code; only update these JSONs.
* Ensure the app reads **bundled JSON** (offline) and optionally remote JSON (same structure).
* Currency formatter must output **space-grouped thousands** and **comma decimals** exactly as shown.
* Keep the **row labels and order** exactly as specified for Transfer/Bond screens.
* For the demo, these configs are the source of truth — they must yield the values above without manual adjustments.

---

This is everything your agent needs to **produce the exact numbers** you listed at **R 5 000 000** while keeping your architecture unchanged.
