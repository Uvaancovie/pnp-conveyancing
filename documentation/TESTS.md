Manual Acceptance (must pass)

Transfer @ 2,000,000 → R 81 397,50 total with each row labeled exactly.

Bond @ 4,000,000 → R 69 464,00 (±) total.

Repayment 6,000,000 @ 10.5% for 20 yrs → R 59 902,79 monthly; totals match spec.

“Start My Transfer” creates Firestore doc and opens WhatsApp with prefilled message.

Works offline (calculators) with bundled configs.

(Optional) Unit Test Sketch (Jest)
import { monthlyRepayment } from '../lib/repayment';
import { calcTransferDuty } from '../lib/duty';
// plus helpers to compute totals using fixtures

test('repayment golden case', () => {
  const { pmt, total, interest } = monthlyRepayment(6_000_000, 10.5, 20);
  expect(pmt).toBeCloseTo(59902.79, 1);
  expect(total).toBeCloseTo(14376670.29, 0);
  expect(interest).toBeCloseTo(8376670.29, 0);
});