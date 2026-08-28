import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Converts a rupee amount to a "X.XL" (Lakhs) display string. */
export function formatLakhs(rupees: number): string {
  return `${(rupees / 100000).toFixed(1)}L`;
}

/** Converts a value entered in thousands of rupees (as used by the compensation-demand
 * field, e.g. "1500" meaning ₹15,00,000) into whole rupees. */
export function thousandsToRupees(valueInThousands: string | number): number {
  const n = typeof valueInThousands === 'string' ? parseInt(valueInThousands, 10) : valueInThousands;
  return (Number.isFinite(n) ? n : 0) * 1000;
}

/** Determines the commission tier for a given rupee amount, per COPRA 2019
 * pecuniary jurisdiction (District ≤50L, State ≤2Cr, National above). */
export function commissionForAmount(rupees: number): 'district' | 'state' | 'national' {
  if (rupees > 20000000) return 'national';
  if (rupees > 5000000) return 'state';
  return 'district';
}

/** Initials (up to 2 letters) from a full name, e.g. "Priya Sharma" -> "PS". */
export function getInitials(name?: string | null): string {
  return name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '';
}

/** Estimates the Commission filing fee for a given rupee claim amount, using the
 * bracket tables in COMMISSION_RULES. Returns 0 for BPL card holders per COPRA
 * Section 17A (zero filing fee). This is an estimate for public awareness —
 * always confirm the exact fee with the Commission at filing time. */
export function estimateFilingFee(rupees: number, bplCard: boolean): number {
  if (bplCard) return 0;
  const lakh = 100000;
  const crore = 10000000;
  if (rupees <= 5 * lakh) return 200;
  if (rupees <= 10 * lakh) return 400;
  if (rupees <= 20 * lakh) return 500;
  if (rupees <= 50 * lakh) return 2000;
  if (rupees <= crore) return 4000;
  if (rupees <= 2 * crore) return 5000;
  if (rupees <= 5 * crore) return 7500;
  if (rupees <= 10 * crore) return 10000;
  return 15000;
}
