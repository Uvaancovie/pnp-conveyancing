export type Bracket = { upTo?: number; base?: number; rate: number; threshold?: number };
export function calcTransferDuty(price: number, brackets: Bracket[]) {
  for (const b of brackets) {
    const inBand = b.upTo ? price <= b.upTo : true;
    if (inBand) {
      const taxable = Math.max(0, price - (b.threshold ?? 0));
      return Math.max(0, Math.round((b.base ?? 0) + taxable * b.rate));
    }
  }
  return 0;
}