import feesBondConfig from '../../config/fees.bond.json';
import { fixedBandFee, tieredFee } from '../fees';

describe('Bond Fee Calculation - Snapshots', () => {
  /**
   * Snapshot tests capture the entire calculation output
   * If logic changes, snapshots will fail and need updating
   */
  function calculateBondSnapshot(bondAmount: number) {
    const cfg = feesBondConfig;
    const exVat = fixedBandFee(bondAmount, cfg.fixedBands) ?? tieredFee(bondAmount, cfg.tiers);
    const atty = Math.round(exVat * (1 + cfg.vatRate));
    const deedsFee = cfg.deedsOfficeByBond.find(b => !b.max || bondAmount <= b.max)?.fee ?? 0;
    const d = cfg.disbursements;
    
    return {
      input: { bondAmount },
      output: {
        attorneyFeeExVat: exVat,
        attorneyFeeIncVat: atty,
        deedsOfficeFee: deedsFee,
        disbursements: {
          postage: d.postage,
          electronicGen: d.electronicGen,
          electronicInstr: d.electronicInstr,
          deedsSearch: d.deedsSearch,
        },
        total: atty + d.postage + d.deedsSearch + d.electronicGen + d.electronicInstr + deedsFee,
      },
      config: {
        vatRate: cfg.vatRate,
        tiersUsed: cfg.tiers,
        fixedBandsUsed: cfg.fixedBands,
      }
    };
  }

  test('R1,000,000 bond calculation snapshot', () => {
    const result = calculateBondSnapshot(1000000);
    expect(result).toMatchSnapshot();
  });

  test('R2,000,000 bond calculation snapshot', () => {
    const result = calculateBondSnapshot(2000000);
    expect(result).toMatchSnapshot();
  });

  test('R4,000,000 bond calculation snapshot', () => {
    const result = calculateBondSnapshot(4000000);
    expect(result).toMatchSnapshot();
  });

  test('R10,000,000 bond calculation snapshot', () => {
    const result = calculateBondSnapshot(10000000);
    expect(result).toMatchSnapshot();
  });

  test('multiple bond amounts snapshot', () => {
    const amounts = [500000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000];
    const results = amounts.map(amount => calculateBondSnapshot(amount));
    
    expect(results).toMatchSnapshot();
  });
});