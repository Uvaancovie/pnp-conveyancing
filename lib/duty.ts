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

// Provide full transfer cost calculation (attorney + disbursements + duty)
import transferConfig from '../config/fees.transfer.json';
import { fixedBandFee, tieredFee } from './fees';

export function calcTransferCosts(amount: number) {
  const p = amount;
  // Attorney fees: fixed bands or tiered
  const exVat = fixedBandFee(p, (transferConfig as any).fixedBands) ?? tieredFee(p, (transferConfig as any).tiers);
  const transferAttorneyFee = Math.round(exVat * (1 + (transferConfig as any).vatRate));

  const deedsOfficeFees = (transferConfig as any).deedsOfficeByPrice.find((b:any)=>!b.max || p <= b.max)?.fee ?? 0;
  const d = (transferConfig as any).disbursements;
  const postagesAndPetties = d.postage ?? d.postagesAndPetties ?? 0;
  const electronicGenerationFee = d.electronicGen ?? d.electronicGenerationFee ?? 0;
  const fica = d.fica ?? 0;
  const deedsOfficeSearches = d.deedsSearch ?? d.deedsOfficeSearches ?? 0;
  const ratesClearanceFees = d.ratesClear ?? d.ratesClearanceFees ?? 0;

  const duty = calcTransferDuty(p, (require('../config/duty.za.json') as any).brackets);

  const total = transferAttorneyFee + postagesAndPetties + deedsOfficeFees + electronicGenerationFee + fica + deedsOfficeSearches + ratesClearanceFees + duty;

  return {
    transferAttorneyFee,
    postagesAndPetties,
    deedsOfficeFees,
    electronicGenerationFee,
    fica,
    deedsOfficeSearches,
    ratesClearanceFees,
    transferDuty: duty,
    total,
  };
}