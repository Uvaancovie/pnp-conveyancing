function tieredFee(amount, tiers) {
  for (const t of tiers) {
    const inTier = t.max ? amount <= t.max : true;
    if (inTier) return Math.max(Math.round(amount * t.rate), t.min || 0);
  }
  return 0;
}

function fixedBandFee(amount, bands) {
  if (!bands) return undefined;
  for (const b of bands) {
    const inBand = b.max ? amount <= b.max : true;
    if (inBand) return b.feeExVat;
  }
  return undefined;
}

module.exports = { tieredFee, fixedBandFee };
