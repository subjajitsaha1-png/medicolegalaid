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
