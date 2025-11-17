function monthlyRepayment(principal, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (!principal || !years) return { pmt: 0, total: 0, interest: 0 };
  if (r === 0) {
    const pmt = principal / n; return { pmt, total: principal, interest: 0 };
  }
  const pmt = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = pmt * n; const interest = total - principal;
  return { pmt, total, interest };
}

module.exports = { monthlyRepayment };
