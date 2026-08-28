import { supabase } from '@/integrations/supabase/client';
import type { MedicalCase } from './store';

/**
 * Persistence layer for cases. The `cases` table stores the full case object in a
 * `data` jsonb column, with `id` + `patient_id` promoted as columns so RLS works.
 */

export async function fetchCases(): Promise<MedicalCase[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('id, patient_id, data')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[cases] fetch failed', error);
    throw error;
  }
  return (data ?? []).map((row) => ({
    ...(row.data as unknown as MedicalCase),
    id: row.id,
    patientId: row.patient_id,
  }));
}

export async function saveCase(c: MedicalCase): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .upsert(
      {
        id: c.id,
        patient_id: c.patientId,
        data: c as unknown as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
  if (error) {
    console.error('[cases] save failed', error);
    throw error;
  }
}

/** Generates a unique human-readable case id, e.g. ML-2026-0413. */
export function newCaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ML-${year}-${rand}`;
}
