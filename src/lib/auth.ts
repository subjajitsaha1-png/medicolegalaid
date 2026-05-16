import { supabase } from '@/integrations/supabase/client';
import { useStore, type UserRole } from './store';

const ROLE_TO_PATH: Record<UserRole, string> = {
  patient: '/patient',
  staff: '/staff',
  expert: '/staff',
  legal: '/staff',
};

export function pathForRole(role: UserRole) {
  return ROLE_TO_PATH[role] ?? '/patient';
}

export async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  if (!data || data.length === 0) return 'patient';
  const priority: UserRole[] = ['admin' as UserRole, 'staff', 'legal', 'expert', 'patient'];
  for (const p of priority) {
    if (data.find((r: { role: string }) => r.role === p)) {
      // admin maps to staff dashboard in our UI
      return (p === ('admin' as UserRole) ? 'staff' : p) as UserRole;
    }
  }
  return 'patient';
}

export async function syncSessionToStore(): Promise<UserRole | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    useStore.getState().logout();
    return null;
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, bpl_card, annual_income')
    .eq('id', session.user.id)
    .maybeSingle();
  const role = await fetchUserRole(session.user.id);
  useStore.setState({
    user: {
      id: session.user.id,
      name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
      email: profile?.email || session.user.email || '',
      role,
      bplCard: profile?.bpl_card ?? false,
      annualIncome: Number(profile?.annual_income ?? 0),
    },
  });
  return role;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const redirectUrl = `${window.location.origin}/`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl, data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  useStore.getState().logout();
}