import bondConfig from '../config/fees.bond.json';
import { fixedBandFee, tieredFee } from './fees';

export interface BondCosts {
  bondAttorneyFee: number;
  postagesAndPetties: number;
  deedsOfficeFees: number;
  electronicGenerationFee: number;
  electronicInstructionFee: number;
  deedsOfficeSearches: number;
  total: number;
}

export function calcBondCosts(bondAmount: number): BondCosts {
  // Attorney fee: use fixed bands first, then tiered fallback
  const exVat = fixedBandFee(bondAmount, (bondConfig as any).fixedBands) ?? tieredFee(bondAmount, (bondConfig as any).tiers);
  const bondAttorneyFee = Math.round(exVat * (1 + bondConfig.vatRate));
  
  // Calculate deeds office fees based on bond amount
  let deedsOfficeFees = 0;
  for (const band of bondConfig.deedsOfficeByBond) {
    if (!band.max || bondAmount <= band.max) {
      deedsOfficeFees = band.fee;
      break;
    }
  }
  
  // Get disbursements from config
  const postagesAndPetties = bondConfig.disbursements.postage ?? 0;
  const electronicGenerationFee = bondConfig.disbursements.electronicGen ?? 0;
  const electronicInstructionFee = bondConfig.disbursements.electronicInstr ?? 0;
  const deedsOfficeSearches = bondConfig.disbursements.deedsSearch ?? 0;
  
  const total = bondAttorneyFee + postagesAndPetties + deedsOfficeFees + 
                electronicGenerationFee + electronicInstructionFee + deedsOfficeSearches;
  
  return {
    bondAttorneyFee,
    postagesAndPetties,
    deedsOfficeFees,
    electronicGenerationFee,
    electronicInstructionFee,
    deedsOfficeSearches,
    total
  };
}