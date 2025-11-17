// Test file to verify calculations with new config structure
const fs = require('fs');

// Load configurations
const dutyConfig = JSON.parse(fs.readFileSync('./config/duty.za.json', 'utf8'));
const transferConfig = JSON.parse(fs.readFileSync('./config/fees.transfer.json', 'utf8'));
const bondConfig = JSON.parse(fs.readFileSync('./config/fees.bond.json', 'utf8'));

function calcTransferDuty(propertyValue, acquisitionDate) {
  // Default to today if no date provided
  const dateToUse = acquisitionDate || new Date();
  
  // Find the applicable schedule based on effectiveFrom date
  const applicableSchedule = dutyConfig.schedules
    .filter(s => new Date(s.effectiveFrom) <= dateToUse)
    .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())[0];
  
  if (!applicableSchedule) {
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

function calcTransferCosts(propertyValue) {
  // Calculate attorney fee using LSSA/LPC sliding scale + VAT
  let attorneyFeeExVat = 0;
  for (const band of transferConfig.attorneyFeeBands) {
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

function calcBondCosts(bondAmount) {
  // Calculate attorney fee using LSSA/LPC sliding scale + VAT
  let attorneyFeeExVat = 0;
  for (const band of bondConfig.attorneyFeeBands) {
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

function monthlyRepayment(principal, annualRate, years) {
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

// Test Transfer @ 2,000,000
const transfer2M = calcTransferCosts(2_000_000);
console.log('=== TRANSFER @ R2,000,000 ===');
console.log('Transfer Attorney Fees (incl. VAT): R', transfer2M.transferAttorneyFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Postages & Petties: R', transfer2M.postagesAndPetties.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Fees: R', transfer2M.deedsOfficeFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Generation Fee: R', transfer2M.electronicGenerationFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('FICA: R', transfer2M.fica.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Searches: R', transfer2M.deedsOfficeSearches.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Rates Clearance Fees: R', transfer2M.ratesClearanceFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Transfer Duty: R', transfer2M.transferDuty.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('TOTAL: R', transfer2M.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('');

// Test Transfer @ 4,000,000
const transfer4M = calcTransferCosts(4_000_000);
console.log('=== TRANSFER @ R4,000,000 ===');
console.log('Transfer Attorney Fees (incl. VAT): R', transfer4M.transferAttorneyFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Postages & Petties: R', transfer4M.postagesAndPetties.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Fees: R', transfer4M.deedsOfficeFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Generation Fee: R', transfer4M.electronicGenerationFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('FICA: R', transfer4M.fica.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Searches: R', transfer4M.deedsOfficeSearches.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Rates Clearance Fees: R', transfer4M.ratesClearanceFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Transfer Duty: R', transfer4M.transferDuty.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('TOTAL: R', transfer4M.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Expected: R 289,177.50');
console.log('');

// Test Transfer @ 5,000,000
const transfer5M = calcTransferCosts(5_000_000);
console.log('=== TRANSFER @ R5,000,000 ===');
console.log('Transfer Attorney Fees (incl. VAT): R', transfer5M.transferAttorneyFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Postages & Petties: R', transfer5M.postagesAndPetties.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Fees: R', transfer5M.deedsOfficeFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Generation Fee: R', transfer5M.electronicGenerationFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('FICA: R', transfer5M.fica.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Searches: R', transfer5M.deedsOfficeSearches.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Rates Clearance Fees: R', transfer5M.ratesClearanceFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Transfer Duty: R', transfer5M.transferDuty.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('TOTAL: R', transfer5M.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('');

// Test Bond @ 4,000,000
const bond4M = calcBondCosts(4_000_000);
console.log('=== BOND @ R4,000,000 ===');
console.log('Bond Attorney Fee (incl. VAT): R', bond4M.bondAttorneyFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Postages & Petties: R', bond4M.postagesAndPetties.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Fees: R', bond4M.deedsOfficeFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Generation Fee: R', bond4M.electronicGenerationFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Instruction Fee: R', bond4M.electronicInstructionFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Searches: R', bond4M.deedsOfficeSearches.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('TOTAL: R', bond4M.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Expected: R 69,464.00');
console.log('');

// Test Bond @ 5,000,000
const bond5M = calcBondCosts(5_000_000);
console.log('=== BOND @ R5,000,000 ===');
console.log('Bond Attorney Fee (incl. VAT): R', bond5M.bondAttorneyFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Postages & Petties: R', bond5M.postagesAndPetties.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Fees: R', bond5M.deedsOfficeFees.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Generation Fee: R', bond5M.electronicGenerationFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Electronic Instruction Fee: R', bond5M.electronicInstructionFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Deeds Office Searches: R', bond5M.deedsOfficeSearches.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('TOTAL: R', bond5M.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('');

// Test Repayment R6,000,000 @ 10.5% for 20 years
const repay = monthlyRepayment(6_000_000, 10.5, 20);
console.log('=== REPAYMENT R6,000,000 @ 10.5% for 20 years ===');
console.log('Monthly Payment: R', repay.pmt.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Total Interest: R', repay.interest.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Total Amount: R', repay.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }));
console.log('Expected Monthly: R 59,902.79');