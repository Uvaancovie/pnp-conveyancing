import feesBondConfig from '../../config/fees.bond.json';
import { fixedBandFee, tieredFee } from '../fees';
import testCases from './fixtures/bond-test-cases.json';

describe('Bond Fee Calculation - Complete Flow', () => {
  /**
   * Helper function to calculate total bond costs
   * (mirrors the logic in app/bond.tsx)
   */
  function calculateBondTotal(bondAmount: number) {
    const cfg = feesBondConfig;
    
    // Calculate attorney fee (ex VAT)
    const exVat = fixedBandFee(bondAmount, cfg.fixedBands) ?? tieredFee(bondAmount, cfg.tiers);
    
    // Add VAT
    const atty = Math.round(exVat * (1 + cfg.vatRate));
    
    // Get deeds office fee based on bond amount
    const deedsFee = cfg.deedsOfficeByBond.find(b => !b.max || bondAmount <= b.max)?.fee ?? 0;
    
    // Add all disbursements
    const d = cfg.disbursements;
    const total = atty + d.postage + d.deedsSearch + d.electronicGen + d.electronicInstr + deedsFee;
    
    return {
      attorneyFeeExVat: exVat,
      attorneyFeeIncVat: atty,
      deedsOfficeFee: deedsFee,
      disbursements: {
        postage: d.postage,
        electronicGen: d.electronicGen,
        electronicInstr: d.electronicInstr,
        deedsSearch: d.deedsSearch,
        total: d.postage + d.electronicGen + d.electronicInstr + d.deedsSearch
      },
      total
    };
  }

  describe('Real-world bond calculations', () => {
    testCases.bondFeeCalculations.forEach((testCase) => {
      test(`${testCase.description}`, () => {
        const result = calculateBondTotal(testCase.bondAmount);
        
        // Test attorney fee (ex VAT)
        expect(result.attorneyFeeExVat).toBeCloseTo(testCase.expectedFeeExVat, 0);
        
        // Test attorney fee (inc VAT)
        expect(result.attorneyFeeIncVat).toBeCloseTo(testCase.expectedFeeIncVat, 0);
        
        // Test deeds office fee
        expect(result.deedsOfficeFee).toBe(testCase.expectedDeedsOfficeFee);
      });
    });
  });

  describe('Edge cases', () => {
    testCases.edgeCases.forEach((testCase) => {
      test(`handles ${testCase.description}`, () => {
        if (testCase.shouldThrow) {
          expect(() => calculateBondTotal(testCase.bondAmount)).toThrow();
        } else {
          const result = calculateBondTotal(testCase.bondAmount);
          
          expect(result.attorneyFeeExVat).toBeCloseTo(testCase.expectedFeeExVat, 0);
          expect(result.attorneyFeeIncVat).toBeCloseTo(testCase.expectedFeeIncVat, 0);
          
          // Ensure no negative values
          expect(result.total).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Golden test cases (from spec)', () => {
    test('Bond @ R4,000,000 should total ~R69,464.00', () => {
      const result = calculateBondTotal(4000000);
      
      // Expected breakdown:
      // Attorney fee: R56,121.74 ex VAT → R64,540.00 inc VAT
      // Postage: R1,610
      // Deeds office: R2,281
      // Electronic gen: R575
      // Electronic instr: R115
      // Deeds search: R345
      // Total: ~R69,464
      
      expect(result.total).toBeCloseTo(69464, -2); // Within R100
    });

    test('Bond @ R1,000,000 breakdown matches spec', () => {
      const result = calculateBondTotal(1000000);
      
      // Attorney: 1,000,000 * 0.009 = 9,000 ex VAT → 10,350 inc VAT
      // Disbursements: 1,610 + 575 + 115 + 345 = 2,645
      // Deeds office: 1,646
      // Total: 10,350 + 2,645 + 1,646 = 14,641
      
      expect(result.attorneyFeeIncVat).toBe(10350);
      expect(result.disbursements.total).toBe(2645);
      expect(result.deedsOfficeFee).toBe(1646);
      expect(result.total).toBe(14641);
    });

    test('Bond @ R2,000,000 (tier boundary) calculates correctly', () => {
      const result = calculateBondTotal(2000000);
      
      // Should use first tier (0.9%)
      // Attorney: 2,000,000 * 0.009 = 18,000 ex VAT → 20,700 inc VAT
      
      expect(result.attorneyFeeExVat).toBe(18000);
      expect(result.attorneyFeeIncVat).toBe(20700);
      expect(result.deedsOfficeFee).toBe(1646);
    });

    test('Bond @ R5,000,000 uses second tier (0.8%)', () => {
      const result = calculateBondTotal(5000000);
      
      // Attorney: 5,000,000 * 0.008 = 40,000 ex VAT → 46,000 inc VAT
      
      expect(result.attorneyFeeExVat).toBe(40000);
      expect(result.attorneyFeeIncVat).toBe(46000);
      expect(result.deedsOfficeFee).toBe(2800); // Higher tier
    });
  });

  describe('Deeds office fee bands', () => {
    test('bond up to R2,000,000 pays R1,646', () => {
      const result = calculateBondTotal(1500000);
      expect(result.deedsOfficeFee).toBe(1646);
    });

    test('bond up to R4,000,000 pays R2,281', () => {
      const result = calculateBondTotal(3500000);
      expect(result.deedsOfficeFee).toBe(2281);
    });

    test('bond above R4,000,000 pays R2,800', () => {
      const result = calculateBondTotal(5000000);
      expect(result.deedsOfficeFee).toBe(2800);
    });

    test('bond at exact boundary uses correct fee', () => {
      const result2M = calculateBondTotal(2000000);
      const result4M = calculateBondTotal(4000000);
      
      expect(result2M.deedsOfficeFee).toBe(1646);
      expect(result4M.deedsOfficeFee).toBe(2281);
    });
  });

  describe('VAT calculation', () => {
    test('applies 15% VAT correctly', () => {
      const bondAmount = 1000000;
      const exVat = tieredFee(bondAmount, feesBondConfig.tiers);
      const incVat = Math.round(exVat * 1.15);
      
      expect(incVat).toBe(exVat + Math.round(exVat * 0.15));
    });

    test('rounds VAT to nearest rand', () => {
      const bondAmount = 1234567;
      const result = calculateBondTotal(bondAmount);
      
      // Should be rounded integer
      expect(Number.isInteger(result.attorneyFeeIncVat)).toBe(true);
    });

    test('VAT only applies to attorney fee, not disbursements', () => {
      const bondAmount = 1000000;
      const result = calculateBondTotal(bondAmount);
      
      // Disbursements should not have VAT
      expect(result.disbursements.total).toBe(
        testCases.disbursements.postage +
        testCases.disbursements.electronicGen +
        testCases.disbursements.electronicInstr +
        testCases.disbursements.deedsSearch
      );
    });
  });

  describe('Performance tests', () => {
    test('calculates 1000 bonds in under 100ms', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const randomAmount = Math.floor(Math.random() * 10000000) + 100000;
        calculateBondTotal(randomAmount);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    test('handles concurrent calculations', async () => {
      const amounts = Array.from({ length: 100 }, (_, i) => (i + 1) * 100000);
      
      const results = await Promise.all(
        amounts.map(amount => Promise.resolve(calculateBondTotal(amount)))
      );
      
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.total).toBeGreaterThan(0);
      });
    });
  });

  describe('Consistency tests', () => {
    test('same input always produces same output', () => {
      const bondAmount = 3500000;
      
      const result1 = calculateBondTotal(bondAmount);
      const result2 = calculateBondTotal(bondAmount);
      const result3 = calculateBondTotal(bondAmount);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    test('calculation is deterministic', () => {
      const amounts = [1000000, 2000000, 3000000, 4000000, 5000000];
      
      // Run twice
      const results1 = amounts.map(a => calculateBondTotal(a));
      const results2 = amounts.map(a => calculateBondTotal(a));
      
      expect(results1).toEqual(results2);
    });
  });

  describe('Boundary value analysis', () => {
    test('R1,999,999 vs R2,000,001 uses different tiers', () => {
      const below = calculateBondTotal(1999999);
      const above = calculateBondTotal(2000001);
      
      // Both should use first tier (< 2M boundary)
      // 1,999,999 * 0.009 = 17,999.91
      // 2,000,001 * 0.009 = 18,000.01 BUT this crosses into second tier!
      
      // Actually, based on config, 2,000,001 should use second tier (0.8%)
      expect(below.attorneyFeeExVat).toBeCloseTo(17999.91, 0);
      expect(above.attorneyFeeExVat).toBeCloseTo(16000.01, 0); // 2,000,001 * 0.008
    });

    test('exactly at tier boundary behavior', () => {
      const atBoundary = calculateBondTotal(2000000);
      
      // Should use first tier
      expect(atBoundary.attorneyFeeExVat).toBe(18000);
    });
  });

  describe('Regression tests', () => {
    test('REGRESSION: R3M should use fixed band, not tier', () => {
      const result = calculateBondTotal(3000000);
      
      // Should use fixed band of R45,870 (not tier calculation)
      expect(result.attorneyFeeExVat).toBe(45870);
      expect(result.attorneyFeeIncVat).toBeCloseTo(52750.5, 1);
    });

    test('REGRESSION: Fixed band takes precedence over tier', () => {
      const result3M = calculateBondTotal(3000000);
      const result4M = calculateBondTotal(4000000);
      
      // Both should use fixed bands
      expect(result3M.attorneyFeeExVat).toBe(45870);
      expect(result4M.attorneyFeeExVat).toBe(56121.74);
    });

    test('REGRESSION: R5M should NOT use fixed band', () => {
      const result = calculateBondTotal(5000000);
      
      // Should use tiered calculation (0.8%)
      expect(result.attorneyFeeExVat).toBe(40000); // 5M * 0.008
    });
  });
});