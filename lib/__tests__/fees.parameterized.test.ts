import feesBondConfig from '../../config/fees.bond.json';
import { tieredFee } from '../fees';

describe('Bond Fee Calculation - Parameterized Tests', () => {
  /**
   * Data-driven tests using test.each()
   */
  describe.each([
    // [bondAmount, expectedFee, description]
    [100000, 900, 'R100K bond'],
    [500000, 4500, 'R500K bond'],
    [1000000, 9000, 'R1M bond'],
    [1500000, 13500, 'R1.5M bond'],
    [2000000, 18000, 'R2M bond (boundary)'],
    [2500000, 20000, 'R2.5M bond (second tier)'],
    [5000000, 40000, 'R5M bond'],
    [10000000, 80000, 'R10M bond'],
  ])('Tiered fee calculation', (bondAmount, expectedFee, description) => {
    test(`${description} = R${expectedFee.toLocaleString()}`, () => {
      const fee = tieredFee(bondAmount, feesBondConfig.tiers);
      expect(fee).toBe(expectedFee);
    });
  });

  describe.each([
    // [bondAmount, expectedDeedsFee, description]
    [500000, 1646, 'up to R2M'],
    [2000000, 1646, 'at R2M boundary'],
    [3000000, 2281, 'between R2M and R4M'],
    [4000000, 2281, 'at R4M boundary'],
    [5000000, 2800, 'above R4M'],
    [10000000, 2800, 'large bond'],
  ])('Deeds office fee bands', (bondAmount, expectedDeedsFee, description) => {
    test(`${description} pays R${expectedDeedsFee}`, () => {
      const deedsFee = feesBondConfig.deedsOfficeByBond.find(
        b => !b.max || bondAmount <= b.max
      )?.fee ?? 0;
      
      expect(deedsFee).toBe(expectedDeedsFee);
    });
  });

  describe.each([
    // [exVatFee, expectedIncVat]
    [9000, 10350, 'R9K fee'],
    [18000, 20700, 'R18K fee'],
    [45870, 52751, 'R45,870 fee'], // Note: rounds up
    [56121.74, 64540, 'R56,121.74 fee'],
  ])('VAT application', (exVatFee, expectedIncVat, description) => {
    test(`${description} with 15% VAT = R${expectedIncVat.toLocaleString()}`, () => {
      const incVat = Math.round(exVatFee * 1.15);
      expect(incVat).toBeCloseTo(expectedIncVat, 0);
    });
  });
});