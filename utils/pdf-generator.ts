import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { formatZAR } from '../lib/money';
import { storage } from './firebase';

/* ─── re-entry guard for iOS share sheet ─── */
let _isGeneratingPDF = false;

/* ─── PnP logo as base64 PNG (embedded for cross-platform compatibility) ─── */
const PNP_LOGO_BASE64 = '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';

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
  totalTransferCosts: 'Total Transfer Costs (incl. VAT)',
  totalBondCosts: 'Total Bond Costs (incl. VAT)',
  totalInterest: 'Total Interest Payable',
  totalLoanRepayment: 'Total Loan Repayment',
  monthlyRepayment: 'Monthly Repayment',
  pmt: 'Monthly Repayment',
  total: 'Grand Total',
  interest: 'Total Interest Payable',
  atty: 'Attorney Fees (incl. VAT)',
  duty: 'Transfer Duty',
};

/* ─── keys that represent the primary input amount (shown prominently at top) ─── */
const PRIMARY_INPUT_KEYS = new Set([
  'purchasePrice', 'bondAmount', 'price', 'amount', 'principal',
]);

function friendlyLabel(key: string): string {
  if (LABEL_MAP[key]) return LABEL_MAP[key];
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
  // Find primary input (purchase price / bond amount) for prominent display
  const primaryEntry = Object.entries(inputs).find(([k]) => PRIMARY_INPUT_KEYS.has(k));
  const secondaryInputs = Object.entries(inputs).filter(([k]) => !PRIMARY_INPUT_KEYS.has(k));

  // Build secondary input detail line (e.g. "Interest Rate: 10.5% · Loan Term: 20 years")
  const secondaryLine = secondaryInputs
    .map(([key, value]) => `${friendlyLabel(key)}: ${formatValue(key, value)}`)
    .join(' &nbsp;&bull;&nbsp; ');

  // Separate totals from line-items
  const lineItems = Object.entries(results).filter(([k]) => !TOTAL_KEYS.has(k));
  const totals = Object.entries(results).filter(([k]) => TOTAL_KEYS.has(k));

  // Build line-item rows with alternating stripes
  const lineItemRows = lineItems
    .map(([key, value], idx) => `
      <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td class="cell label">${friendlyLabel(key)}</td>
        <td class="cell value">${formatValue(key, value)}</td>
      </tr>
    `).join('');

  // Build total rows
  const totalRows = totals
    .map(([key, value], idx) => `
      <tr class="total-row ${idx === totals.length - 1 ? 'grand-total-row' : ''}">
        <td class="cell label total-label">${friendlyLabel(key)}</td>
        <td class="cell value total-value">${formatValue(key, value)}</td>
      </tr>
    `).join('');

  const dateStr = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const refNo = `PNP-${Date.now().toString(36).toUpperCase()}`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  @page { margin: 18mm 14mm; size: A4 portrait; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #333;
    font-size: 13px;
    line-height: 1.5;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── letterhead ── */
  .letterhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 16px 0;
    border-bottom: 3px solid #0A5C3B;
    margin-bottom: 22px;
  }
  .letterhead-logo img {
    height: 42px;
    width: auto;
  }
  .letterhead-info {
    text-align: right;
  }
  .firm-name {
    font-size: 20px;
    font-weight: 800;
    color: #0A5C3B;
    letter-spacing: 0.3px;
    line-height: 1.2;
  }
  .firm-sub {
    font-size: 10px;
    color: #666;
    margin-top: 2px;
  }
  .firm-contact {
    font-size: 9px;
    color: #999;
    margin-top: 4px;
  }

  /* ── document title + primary amount ── */
  .doc-header {
    text-align: center;
    margin-bottom: 24px;
    padding: 20px 16px;
    background: linear-gradient(135deg, #f7fbf9 0%, #eef6f1 100%);
    border: 1px solid #d4e8dc;
    border-radius: 8px;
  }
  .doc-title {
    font-size: 16px;
    font-weight: 700;
    color: #0A5C3B;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
  }
  .doc-ref {
    font-size: 9px;
    color: #999;
    margin-bottom: 12px;
  }
  .primary-amount {
    font-size: 32px;
    font-weight: 800;
    color: #0A5C3B;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .primary-label {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .secondary-details {
    font-size: 11px;
    color: #777;
    margin-top: 10px;
  }

  /* ── section titles ── */
  .section { margin-bottom: 24px; }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #0A5C3B;
    padding-bottom: 6px;
    margin-bottom: 0;
  }

  /* ── accounting table ── */
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ccc;
  }
  .table-header {
    background-color: #f2f2f2;
    border-bottom: 2px solid #999;
  }
  .table-header th {
    padding: 8px 14px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #555;
  }
  .table-header th:first-child { text-align: left; }
  .table-header th:last-child { text-align: right; }

  .cell {
    padding: 9px 14px;
    border-bottom: 1px solid #e5e5e5;
    font-size: 13px;
  }
  .label {
    color: #444;
    width: 60%;
    text-align: left;
  }
  .value {
    font-weight: 600;
    color: #222;
    width: 40%;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-family: 'SF Mono', 'Menlo', 'Consolas', 'Courier New', monospace;
    font-size: 13px;
  }

  /* alternating stripes */
  .row-even { background-color: #fff; }
  .row-odd { background-color: #fafafa; }

  /* double rule before totals (accounting convention) */
  .total-row:first-child td {
    border-top: 3px double #0A5C3B;
  }
  .total-row {
    background-color: #f0f8f4;
  }
  .total-label {
    font-weight: 700;
    color: #0A5C3B;
    font-size: 13px;
  }
  .total-value {
    font-weight: 800;
    color: #0A5C3B;
    font-size: 14px;
  }
  .grand-total-row {
    background-color: #e2f0e8;
  }
  .grand-total-row td {
    border-bottom: 3px double #0A5C3B;
  }
  .grand-total-row .total-label { font-size: 14px; }
  .grand-total-row .total-value { font-size: 16px; }

  /* ── footer ── */
  .footer {
    margin-top: 36px;
    padding-top: 14px;
    border-top: 1px solid #ddd;
    text-align: center;
    color: #aaa;
    font-size: 9px;
    line-height: 1.6;
  }
  .footer strong { color: #888; }
  .footer-firm {
    font-size: 10px;
    color: #777;
    margin-bottom: 6px;
    font-weight: 600;
  }
  .footer-date {
    margin-top: 6px;
    font-style: italic;
  }
</style>
</head>
<body>

  <!-- Letterhead -->
  <div class="letterhead">
    <div class="letterhead-logo">
      <img src="data:image/png;base64,${PNP_LOGO_BASE64}" alt="Pather &amp; Pather"/>
    </div>
    <div class="letterhead-info">
      <div class="firm-name">Pather &amp; Pather Attorneys</div>
      <div class="firm-sub">Inc. Radhakrishan &amp; Naidu &bull; Conveyancing &amp; Property Law</div>
      <div class="firm-contact">Umhlanga, South Africa &nbsp;|&nbsp; +27 84 486 0186</div>
    </div>
  </div>

  <!-- Document Title + Primary Amount -->
  <div class="doc-header">
    <div class="doc-title">${title}</div>
    <div class="doc-ref">Ref: ${refNo} &nbsp;&bull;&nbsp; ${dateStr}</div>
    ${primaryEntry ? `
      <div class="primary-label">${friendlyLabel(primaryEntry[0])}</div>
      <div class="primary-amount">${formatValue(primaryEntry[0], primaryEntry[1])}</div>
    ` : ''}
    ${secondaryLine ? `<div class="secondary-details">${secondaryLine}</div>` : ''}
  </div>

  <!-- Cost Breakdown Table -->
  <div class="section">
    <div class="section-title">Cost Breakdown</div>
    <table>
      <thead>
        <tr class="table-header">
          <th>Description</th>
          <th>Amount (ZAR)</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemRows}
      </tbody>
      <tfoot>
        ${totalRows}
      </tfoot>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-firm">Pather &amp; Pather Attorneys &nbsp;&bull;&nbsp; Umhlanga, South Africa</div>
    <p><strong>Disclaimer:</strong> All values are quotation estimates based on current rates and are subject to change. Although every effort has been made to ensure accuracy, Pather &amp; Pather Attorneys accepts no liability for any loss or damage arising from the use of these calculations.</p>
    <p class="footer-date">Generated on ${dateStr}</p>
  </div>

</body>
</html>`;
};

/* ─── PDF dimensions (A4 in points: 595 × 842) ─── */
const PDF_WIDTH = 595;
const PDF_HEIGHT = 842;

export const generateAndSharePDF = async (title: string, inputs: any, results: any) => {
  // Prevent double-tap: if a PDF is already being generated/shared, bail out
  if (_isGeneratingPDF) {
    console.log('PDF generation already in progress, ignoring duplicate tap');
    return;
  }

  _isGeneratingPDF = true;
  try {
    const html = generateHTML(title, inputs, results);

    // On iOS, useMarkupFormatter: true bypasses the print dialog and generates a file directly
    const printOptions: any = {
      html,
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
    };
    if (Platform.OS === 'ios') {
      printOptions.useMarkupFormatter = true;
    }

    const { uri } = await printToFileAsync(printOptions);

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
  } finally {
    _isGeneratingPDF = false;
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

    // On iOS, useMarkupFormatter: true bypasses the print dialog
    const printOptions: any = {
      html,
      width: PDF_WIDTH,
      height: PDF_HEIGHT,
    };
    if (Platform.OS === 'ios') {
      printOptions.useMarkupFormatter = true;
    }

    const { uri } = await printToFileAsync(printOptions);

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

