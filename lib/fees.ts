type Tier = { max?: number; rate: number; min?: number };
export function tieredFee(amount: number, tiers: Tier[]) {
  for (const t of tiers) {
    const inTier = t.max ? amount <= t.max : true;
    if (inTier) return Math.max(Math.round(amount * t.rate), t.min ?? 0);
  }
  return 0;
}
export function fixedBandFee(amount: number, bands?: { max?: number; feeExVat: number }[]) {
  if (!bands) return undefined;
  for (const b of bands) {
    const inBand = b.max ? amount <= b.max : true;
    if (inBand) return b.feeExVat;
  }
  return undefined;
}