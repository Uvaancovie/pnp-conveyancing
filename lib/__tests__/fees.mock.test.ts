import { tieredFee, fixedBandFee } from '../fees';

// Mock config module
jest.mock('../../config/fees.bond.json', () => ({
  tiers: [
    { max: 2000000, rate: 0.009 },
    { rate: 0.008 }
  ],
  fixedBands: [
    { max: 3000000, feeExVat: 45870 },
    { max: 4000000, feeExVat: 56121.74 }
  ],
  deedsOfficeByBond: [
    { max: 2000000, fee: 1646 },
    { max: 4000000, fee: 2281 },
    { fee: 2800 }
  ],
  disbursements: {
    postage: 1610,
    electronicGen: 575,
    electronicInstr: 115,
    deedsSearch: 345
  },
  vatRate: 0.15
}));

describe('Bond Fee Calculation - Mocked Config', () => {
  test('uses mocked config for calculations', () => {
    const feesBondConfig = require('../../config/fees.bond.json');
    const fee = tieredFee(1000000, feesBondConfig.tiers);
    
    expect(fee).toBe(9000);
  });

  test('can override config for testing', () => {
    const customTiers = [
      { max: 1000000, rate: 0.01 }, // Higher rate for testing
      { rate: 0.015 }
    ];
    
    const fee = tieredFee(500000, customTiers);
    expect(fee).toBe(5000); // 500K * 0.01
  });
});