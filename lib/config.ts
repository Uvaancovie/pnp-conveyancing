import dutyLocal from '../config/duty.za.json';
import feesTransferLocal from '../config/fees.transfer.json';
import feesBondLocal from '../config/fees.bond.json';

const CDN = process.env.EXPO_PUBLIC_CONFIG_BASE; // optional Supabase Storage public URL
async function getJSON<T>(path: string, fallback: T): Promise<T> {
  if (!CDN) return fallback;
  try { const res = await fetch(`${CDN}/${path}`, { cache: 'no-store' }); if (!res.ok) return fallback; return await res.json(); }
  catch { return fallback; }
}
export async function loadConfig() {
  const [duty, feesTransfer, feesBond] = await Promise.all([
    getJSON('duty.za.json', dutyLocal),
    getJSON('fees.transfer.json', feesTransferLocal),
    getJSON('fees.bond.json', feesBondLocal),
  ]);
  return { duty, feesTransfer, feesBond };
}