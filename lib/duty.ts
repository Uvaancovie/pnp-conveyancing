import dutyConfig from '../config/duty.za.json';
import transferConfig from '../config/fees.transfer.json';

export function calcTransferDuty(propertyValue: number, acquisitionDate?: Date): number {
  // Default to today if no date provided
  const dateToUse = acquisitionDate || new Date();
  
  // Find the applicable schedule based on effectiveFrom date
  const applicableSchedule = (dutyConfig as any).schedules
    .filter((s: any) => new Date(s.effectiveFrom) <= dateToUse)
    .sort((a: any, b: any) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())[0];
  
  if (!applicableSchedule) {
    // Fallback to first schedule if none found
    console.warn('No applicable duty schedule found, using first available');
    return 0;
  }
  
  // Calculate duty using the selected schedule's brackets
  for (const bracket of applicableSchedule.brackets) {
    if (!bracket.upTo || propertyValue <= bracket.upTo) {
      return bracket.base + Math.max(0, propertyValue - bracket.threshold) * bracket.rate;
    }
  }
  return 0;
}

export interface TransferCosts {
  transferAttorneyFee: number;
  postagesAndPetties: number;
  deedsOfficeFees: number;
  electronicGenerationFee: number;
  fica: number;
  deedsOfficeSearches: number;
  ratesClearanceFees: number;
  transferDuty: number;
  total: number;
}

export function calcTransferCosts(propertyValue: number): TransferCosts {
  // Calculate attorney fee using LSSA/LPC sliding scale + VAT
  let attorneyFeeExVat = 0;
  for (const band of (transferConfig as any).attorneyFeeBands) {
    if (!band.upTo || propertyValue <= band.upTo) {
      attorneyFeeExVat = band.fee;
      if (band.rate && propertyValue > band.upTo) {
        attorneyFeeExVat += (propertyValue - band.upTo) * band.rate;
      }
      break;
    }
  }
  const transferAttorneyFee = attorneyFeeExVat * (1 + transferConfig.vatRate);
  
  // Calculate deeds office fees based on property value
  let deedsOfficeFees = 0;
  for (const band of transferConfig.deedsOfficeByPrice) {
    if (!band.upTo || propertyValue <= band.upTo) {
      deedsOfficeFees = band.fee;
      break;
    }
  }
  
  // Get disbursements from config
  const postagesAndPetties = transferConfig.disbursements.postagesAndPetties;
  const electronicGenerationFee = transferConfig.disbursements.electronicGenerationFee;
  const fica = transferConfig.disbursements.fica;
  const deedsOfficeSearches = transferConfig.disbursements.deedsOfficeSearches;
  const ratesClearanceFees = transferConfig.disbursements.ratesClearanceFees;
  
  // Calculate transfer duty
  const transferDuty = calcTransferDuty(propertyValue);
  
  const total = transferAttorneyFee + postagesAndPetties + deedsOfficeFees + 
                electronicGenerationFee + fica + deedsOfficeSearches + 
                ratesClearanceFees + transferDuty;
  
  return {
    transferAttorneyFee,
    postagesAndPetties,
    deedsOfficeFees,
    electronicGenerationFee,
    fica,
    deedsOfficeSearches,
    ratesClearanceFees,
    transferDuty,
    total
  };
}