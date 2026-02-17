import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { formatZAR } from '../lib/money';
import { storage } from './firebase';

/* ─── label helpers ─── */

const LABEL_MAP: Record<string, string> = {
  purchasePrice: 'Purchase Price',
  bondAmount: 'Bond Amount',
  price: 'Purchase Price',
  amount: 'Bond Amount',
  principal: 'Bond Amount',
  rate: 'Interest Rate',
  interestRate: 'Interest Rate',
  years: 'Loan Term',
  term: 'Loan Term',
  transferAttorneyFees: 'Transfer Attorney Fees (incl. VAT)',
  bondAttorneyFee: 'Bond Attorney Fee (incl. VAT)',
  postagesAndPetties: 'Postages & Petties',
  deedsOfficeFees: 'Deeds Office Fees',
  electronicGenerationFee: 'Electronic Generation Fee',
  electronicInstructionFee: 'Electronic Instruction Fee',
  fica: 'FICA',
  deedsOfficeSearches: 'Deeds Office Searches',
  ratesClearanceFees: 'Rates Clearance Fees',
  transferDuty: 'Transfer Duty',
  totalTransferCosts: 'Total Transfer Costs',
  totalBondCosts: 'Total Bond Costs',
  totalInterest: 'Total Interest',
  totalLoanRepayment: 'Total Loan Repayment',
  monthlyRepayment: 'Monthly Repayment',
  pmt: 'Monthly Repayment',
  total: 'Grand Total',
  interest: 'Total Interest Payable',
  atty: 'Attorney Fees (incl. VAT)',
  duty: 'Transfer Duty',
};

function friendlyLabel(key: string): string {
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  // fallback: camelCase → Title Case
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

function formatValue(key: string, value: any): string {
  if (typeof value === 'number') {
    const lk = key.toLowerCase();
    if (lk.includes('rate')) return `${value}%`;
    if (lk === 'years') return `${value} years`;
    return formatZAR(value);
  }
  return String(value ?? '');
}

/* ─── detect which items are "totals" so we can style them differently ─── */
const TOTAL_KEYS = new Set([
  'totalTransferCosts', 'totalBondCosts', 'totalLoanRepayment',
  'total', 'monthlyRepayment', 'pmt',
]);

/* ─── HTML builder ─── */

const generateHTML = (title: string, inputs: Record<string, any>, results: Record<string, any>) => {
  // Build input rows
  const inputRows = Object.entries(inputs)
    .map(([key, value]) => `
      <tr>
        <td class="cell label">${friendlyLabel(key)}</td>
        <td class="cell value highlight">${formatValue(key, value)}</td>
      </tr>
    `).join('');

  // Separate totals from line‑items
  const lineItems = Object.entries(results).filter(([k]) => !TOTAL_KEYS.has(k));
  const totals = Object.entries(results).filter(([k]) => TOTAL_KEYS.has(k));

  const lineItemRows = lineItems
    .map(([key, value]) => `
      <tr>
        <td class="cell label">${friendlyLabel(key)}</td>
        <td class="cell value">${formatValue(key, value)}</td>
      </tr>
    `).join('');

  const totalRows = totals
    .map(([key, value]) => `
      <tr class="total-row">
        <td class="cell label total-label">${friendlyLabel(key)}</td>
        <td class="cell value total-value">${formatValue(key, value)}</td>
      </tr>
    `).join('');

  const dateStr = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  @page { margin: 20mm 15mm; size: A4 portrait; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #222;
    font-size: 14px;
    line-height: 1.6;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── header ── */
  .header {
    background-color: #0A5C3B;
    color: white;
    padding: 28px 24px;
    text-align: center;
    border-radius: 0 0 12px 12px;
    margin-bottom: 24px;
  }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 2px; }
  .sub-brand { font-size: 12px; opacity: 0.85; margin-bottom: 10px; }
  .doc-title { font-size: 18px; font-weight: 600; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; }

  /* ── sections ── */
  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #0A5C3B;
    border-bottom: 2px solid #0A5C3B;
    padding-bottom: 6px;
    margin-bottom: 12px;
  }

  /* ── table ── */
  table { width: 100%; border-collapse: collapse; }
  .cell { padding: 10px 12px; border-bottom: 1px solid #e8e8e8; }
  .label { color: #555; width: 58%; text-align: left; }
  .value { font-weight: 700; color: #222; width: 42%; text-align: right; font-size: 15px; }
  .highlight { color: #0A5C3B; font-size: 16px; }

  /* totals */
  .total-row { background-color: #f0f8f4; }
  .total-label { font-weight: 700; color: #0A5C3B; font-size: 15px; }
  .total-value { font-weight: 800; color: #0A5C3B; font-size: 17px; }

  /* ── footer ── */
  .footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #ddd;
    text-align: center;
    color: #999;
    font-size: 10px;
    line-height: 1.5;
  }
  .footer strong { color: #777; }
  .date { margin-top: 6px; font-style: italic; }
</style>
</head>
<body>

  <div class="header">
    <div class="brand">Pather & Pather Attorneys</div>
    <div class="sub-brand">Inc. Radhakrishan & Naidu &bull; Conveyancing &amp; Property Law</div>
    <div class="doc-title">${title}</div>
  </div>

  <div class="section">
    <div class="section-title">Your Inputs</div>
    <table>${inputRows}</table>
  </div>

  <div class="section">
    <div class="section-title">Cost Breakdown</div>
    <table>
      ${lineItemRows}
      ${totalRows}
    </table>
  </div>

  <div class="footer">
    <p><strong>Disclaimer:</strong> All values are quotation estimates based on current rates and are subject to change. Although every effort has been made to ensure accuracy, Pather & Pather Attorneys accepts no liability for any loss or damage arising from the use of these calculations.</p>
    <p class="date">Generated on ${dateStr}</p>
  </div>

</body>
</html>`;
};

/* ─── PDF dimensions (A4 in points: 595 × 842) ─── */
const PDF_WIDTH = 595;
const PDF_HEIGHT = 842;

export const generateAndSharePDF = async (title: string, inputs: any, results: any) => {
  try {
    const html = generateHTML(title, inputs, results);
    const { uri } = await printToFileAsync({
      html,
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
    });

    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(uri, {
      UTI: 'com.adobe.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Share ${title}`,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generates a PDF and uploads it to Firebase Storage.
 * Returns the download URL of the uploaded file.
 */
export const generateAndSavePDF = async (
  title: string,
  inputs: any,
  results: any,
  userId: string,
): Promise<string> => {
  try {
    const html = generateHTML(title, inputs, results);
    const { uri } = await printToFileAsync({
      html,
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
    });

    const response = await fetch(uri);
    const blob = await response.blob();

    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${Date.now()}_${sanitizedTitle}.pdf`;
    const storageRef = ref(storage, `pdfs/${userId}/${filename}`);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error saving PDF to Firebase:', error);
    throw error;
  }
};
