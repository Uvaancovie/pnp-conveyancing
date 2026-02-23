import dutyConfig from '../config/duty.za.json';
import { calcTransferDuty, type Bracket } from '../lib/duty';

describe('calcTransferDuty', () => {
  it('returns 0 for non-positive prices', () => {
    const brackets: Bracket[] = [{ upTo: 1000, base: 0, rate: 0, threshold: 0 }];
    expect(calcTransferDuty(0, brackets)).toBe(0);
    expect(calcTransferDuty(-500, brackets)).toBe(0);
  });

  it('applies threshold and base for the matching bracket', () => {
    const brackets: Bracket[] = [
      { upTo: 1000, base: 0, rate: 0, threshold: 0 },
      { upTo: 2000, base: 10, rate: 0.1, threshold: 1000 }
    ];
    expect(calcTransferDuty(1500, brackets)).toBe(60);
  });

  it('uses the open-ended bracket when price exceeds all upper bounds', () => {
    const brackets: Bracket[] = [
      { upTo: 1000, base: 0, rate: 0, threshold: 0 },
      { base: 50, rate: 0.2, threshold: 1000 }
    ];
    expect(calcTransferDuty(1500, brackets)).toBe(150);
  });

  it('rounds to the nearest whole rand', () => {
    const brackets: Bracket[] = [{ rate: 0.1, threshold: 0 }];
    expect(calcTransferDuty(5, brackets)).toBe(1);
  });

  it('matches the current config brackets for a known value', () => {
    const brackets = (dutyConfig as { brackets: Bracket[] }).brackets;
    expect(calcTransferDuty(2_000_000, brackets)).toBe(25_650);
  });
});
