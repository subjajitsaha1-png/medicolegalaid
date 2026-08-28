import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { syncSessionToStore, pathForRole } from "@/lib/auth";
import { Shield, Users, FileText, UserCog, Scale } from "lucide-react";
import AccountMenu, { ROLE_META } from "@/components/AccountMenu";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

type Role = "admin" | "staff" | "expert" | "legal" | "patient";

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}
interface RoleRow { user_id: string; role: Role; }

function AdminRoute() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [caseCount, setCaseCount] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const loadData = async () => {
    const [{ data: p }, { data: r }, { count }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("cases").select("*", { count: "exact", head: true }),
    ]);
    setProfiles((p as ProfileRow[]) || []);
    setRoles((r as RoleRow[]) || []);
    setCaseCount(count || 0);
  };

  useEffect(() => {
    syncSessionToStore().then((role) => {
      if (!role) return navigate({ to: "/" });
      if (role !== "admin") return navigate({ to: pathForRole(role) as any });
      setReady(true);
      loadData();
    });
  }, [navigate]);

  const updateRole = async (userId: string, newRole: Role) => {
    setBusy(userId);
    try {
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delErr) throw delErr;
      const { error: insErr } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      if (insErr) throw insErr;
      await loadData();
      toast.success(`Role updated to ${ROLE_META[newRole].label}`);
    } catch (err) {
      toast.error("Could not update role", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setBusy(null);
    }
  };

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-navy-700 font-body">Loading admin…</div>;
  }

  const roleOf = (uid: string): Role => {
    const r = roles.find((x) => x.user_id === uid);
    return (r?.role as Role) || "patient";
  };

  const stats: { icon: React.ReactNode; label: string; value: number; to?: string }[] = [
    { icon: <Users className="w-5 h-5" />, label: "Users", value: profiles.length },
    { icon: <UserCog className="w-5 h-5" />, label: "Roles Assigned", value: roles.length },
    { icon: <FileText className="w-5 h-5" />, label: "Cases", value: caseCount, to: "/staff" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      {/* Header */}
      <div className="relative bg-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full seal-badge flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-gold-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold uppercase tracking-widest mb-1">
                  <Scale className="w-3.5 h-3.5" /> Admin Console
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">Platform Administration</h1>
                <p className="text-sm text-white/60 mt-1">Manage users, roles, and platform activity.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/staff" className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors">
                <FileText className="w-4 h-4" /> Manage Cases
              </Link>
              <AccountMenu onSignedOut={() => navigate({ to: "/" })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
            {stats.map((s) => {
              const Tile = (
                <div className={`bg-white/10 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm ${s.to ? 'hover:bg-white/15 transition-colors cursor-pointer' : ''}`}>
                  <div className="text-gold-400 flex items-center gap-2 text-xs">{s.icon}<span className="text-white/70">{s.label}</span></div>
                  <div className="text-2xl sm:text-3xl font-display font-bold mt-1">{s.value}</div>
                </div>
              );
              return s.to ? <Link key={s.label} to={s.to}>{Tile}</Link> : <div key={s.label}>{Tile}</div>;
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-navy-600" />
            <h2 className="font-display font-semibold text-navy-800">Users &amp; Roles</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {profiles.map((p) => {
              const cur = roleOf(p.id);
              const meta = ROLE_META[cur];
              return (
                <div key={p.id} className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy-800 truncate">{p.full_name || p.email}</div>
                    <div className="text-xs text-gray-400 truncate">{p.email}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-fit glow-badge ${meta.badgeClass}`}>{meta.label}</span>
                  <select
                    disabled={busy === p.id}
                    value={cur}
                    onChange={(e) => updateRole(p.id, e.target.value as Role)}
                    className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:border-gold-400"
                  >
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                    <option value="legal">legal</option>
                    <option value="expert">expert</option>
                    <option value="patient">patient</option>
                  </select>
                </div>
              );
            })}
            {profiles.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No users yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
