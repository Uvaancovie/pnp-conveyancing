export interface RepaymentResult {
  pmt: number;
  total: number;
  interest: number;
}

export function monthlyRepayment(
  principal: number,
  annualRate: number,
  years: number
): RepaymentResult {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    const pmt = principal / numPayments;
    return { pmt, total: principal, interest: 0 };
  }
  
  const pmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
              (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const total = pmt * numPayments;
  const interest = total - principal;
  
  return { pmt, total, interest };
}