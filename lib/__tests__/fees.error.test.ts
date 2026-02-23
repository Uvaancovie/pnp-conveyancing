import { tieredFee } from '../fees';

describe('Bond Fee Calculation - Error Handling', () => {
  describe('Invalid inputs', () => {
    test('handles null amount', () => {
      expect(() => tieredFee(null as any, [])).not.toThrow();
    });

    test('handles undefined amount', () => {
      expect(() => tieredFee(undefined as any, [])).not.toThrow();
    });

    test('handles NaN amount', () => {
      const fee = tieredFee(NaN, [{ rate: 0.009 }]);
      expect(fee).toBe(0);
    });

    test('handles Infinity', () => {
      const fee = tieredFee(Infinity, [{ rate: 0.009 }]);
      expect(isFinite(fee)).toBe(true);
    });

    test('handles string input (should fail TypeScript)', () => {
      // @ts-expect-error Testing runtime behavior
      const fee = tieredFee('1000000', [{ rate: 0.009 }]);
      expect(typeof fee).toBe('number');
    });
  });

  describe('Invalid config', () => {
    test('handles empty tiers array', () => {
      const fee = tieredFee(1000000, []);
      expect(fee).toBe(0);
    });

    test('handles missing rate in tier', () => {
      // @ts-expect-error Testing runtime behavior
      const fee = tieredFee(1000000, [{}]);
      expect(fee).toBeGreaterThanOrEqual(0);
    });

    test('handles negative rate', () => {
      const fee = tieredFee(1000000, [{ rate: -0.009 }]);
      // Should handle gracefully
      expect(typeof fee).toBe('number');
    });
  });

  describe('Boundary conditions', () => {
    test('handles very small amounts (R1)', () => {
      const fee = tieredFee(1, [{ rate: 0.009 }]);
      expect(fee).toBeGreaterThanOrEqual(0);
    });

    test('handles maximum safe integer', () => {
      const fee = tieredFee(Number.MAX_SAFE_INTEGER, [{ rate: 0.009 }]);
      expect(isFinite(fee)).toBe(true);
    });

    test('handles amounts with many decimal places', () => {
      const fee = tieredFee(1234567.89123456, [{ rate: 0.009 }]);
      expect(Number.isInteger(fee)).toBe(true);
    });
  });
});