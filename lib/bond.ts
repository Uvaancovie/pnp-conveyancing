import bondConfig from '../config/fees.bond.json';

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
  // Calculate attorney fee using LSSA/LPC sliding scale + VAT
  let attorneyFeeExVat = 0;
  for (const band of (bondConfig as any).attorneyFeeBands) {
    if (!band.upTo || bondAmount <= band.upTo) {
      attorneyFeeExVat = band.fee;
      break;
    }
  }
  const bondAttorneyFee = attorneyFeeExVat * (1 + bondConfig.vatRate);
  
  // Calculate deeds office fees based on bond amount
  let deedsOfficeFees = 0;
  for (const band of bondConfig.deedsOfficeByBond) {
    if (!band.upTo || bondAmount <= band.upTo) {
      deedsOfficeFees = band.fee;
      break;
    }
  }
  
  // Get disbursements from config
  const postagesAndPetties = bondConfig.disbursements.postagesAndPetties;
  const electronicGenerationFee = bondConfig.disbursements.electronicGenerationFee;
  const electronicInstructionFee = bondConfig.disbursements.electronicInstructionFee;
  const deedsOfficeSearches = bondConfig.disbursements.deedsOfficeSearches;
  
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