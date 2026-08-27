import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User, Phone, Mail, X, Check, Loader2 } from 'lucide-react';
import { useStore, type UserRole } from '../lib/store';
import { signOut } from '../lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { getInitials } from '../lib/utils';

export const ROLE_META: Record<UserRole, { label: string; badgeClass: string; description: string }> = {
  admin: { label: 'Administrator', badgeClass: 'bg-burgundy-100 text-burgundy-700 border-burgundy-200', description: 'Full platform access — manage users, roles, and all cases' },
  staff: { label: 'Staff', badgeClass: 'bg-navy-100 text-navy-700 border-navy-200', description: 'Manage cases, negotiations, and case status' },
  legal: { label: 'Legal Tracker', badgeClass: 'bg-gold-100 text-gold-800 border-gold-200', description: 'Track commission filings and manage negotiations' },
  expert: { label: 'Expert Reviewer', badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200', description: 'Review case evidence and submit medical/legal verdicts' },
  patient: { label: 'Patient', badgeClass: 'bg-teal-100 text-teal-700 border-teal-200', description: 'File and track your grievance' },
};

interface AccountMenuProps {
  onSignedOut: () => void;
  avatarClassName?: string;
}

export default function AccountMenu({ onSignedOut, avatarClassName }: AccountMenuProps) {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadedPhone, setLoadedPhone] = useState(false);

  const roleMeta = ROLE_META[user?.role || 'patient'];

  const openMenu = async () => {
    setOpen(true);
    setSaved(false);
    if (!loadedPhone && user?.id) {
      const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).maybeSingle();
      setPhone(data?.phone || '');
      setLoadedPhone(true);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ full_name: name.trim(), phone: phone.trim() }).eq('id', user.id);
      useStore.setState({ user: { ...user, name: name.trim() } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onSignedOut();
  };

  return (
    <>
      <button
        onClick={openMenu}
        className={avatarClassName || 'w-9 h-9 rounded-full bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center font-bold text-sm border border-white/10 text-white'}
      >
        {getInitials(user?.name)}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[201] shadow-2xl overflow-y-auto"
            >
              <div className="bg-hero relative text-white p-6 overflow-hidden">
                <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
                <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full seal-badge flex items-center justify-center font-display font-bold text-lg text-gold-300 mb-3">
                    {getInitials(user?.name)}
                  </div>
                  <div className="font-display font-bold text-xl">{user?.name}</div>
                  <div className="text-white/60 text-sm">{user?.email}</div>
                  <span className={`inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full border glow-badge ${roleMeta.badgeClass}`}>
                    {roleMeta.label}
                  </span>
                  <p className="text-white/50 text-xs mt-2 leading-relaxed">{roleMeta.description}</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    <Settings className="w-3.5 h-3.5" /> Profile Settings
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
                      <input value={user?.email || ''} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
                    </div>
                  </div>
                  <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                    {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-burgundy-700 bg-burgundy-50 hover:bg-burgundy-100 rounded-xl py-3 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
