import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { syncSessionToStore, signOut, pathForRole } from "@/lib/auth";
import { LogOut, Shield, Users, FileText, UserCog } from "lucide-react";

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
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    await loadData();
    setBusy(null);
  };

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-navy-700">Loading admin…</div>;
  }

  const roleOf = (uid: string): Role => {
    const r = roles.find((x) => x.user_id === uid);
    return (r?.role as Role) || "patient";
  };

  const stats = [
    { icon: <Users className="w-5 h-5" />, label: "Users", value: profiles.length },
    { icon: <UserCog className="w-5 h-5" />, label: "Roles Assigned", value: roles.length },
    { icon: <FileText className="w-5 h-5" />, label: "Cases", value: caseCount },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <button
        onClick={async () => { await signOut(); navigate({ to: "/" }); }}
        className="fixed top-3 right-3 z-50 bg-white/90 backdrop-blur border border-gray-200 shadow rounded-full px-3 py-1.5 text-xs font-semibold text-navy-700 flex items-center gap-1.5 hover:bg-white"
      >
        <LogOut className="w-3.5 h-3.5" /> Sign out
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" /> Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Platform Administration</h1>
          <p className="text-sm text-slate-600 mt-1">Manage users, roles and platform activity.</p>
        </header>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-slate-500 flex items-center gap-2 text-xs">{s.icon}<span>{s.label}</span></div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Users & Roles</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {profiles.map((p) => {
              const cur = roleOf(p.id);
              return (
                <div key={p.id} className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{p.full_name || p.email}</div>
                    <div className="text-xs text-slate-500 truncate">{p.email}</div>
                  </div>
                  <select
                    disabled={busy === p.id}
                    value={cur}
                    onChange={(e) => updateRole(p.id, e.target.value as Role)}
                    className="text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
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
              <div className="px-6 py-8 text-center text-sm text-slate-500">No users yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}