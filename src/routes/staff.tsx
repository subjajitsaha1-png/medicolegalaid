import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StaffDashboard from "@/components/StaffDashboard";
import { syncSessionToStore, signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/staff")({
  component: StaffRoute,
});

function StaffRoute() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    syncSessionToStore().then((role) => {
      if (!role) navigate({ to: "/" });
      else if (role === "patient") navigate({ to: "/patient" });
      else setReady(true);
    });
  }, [navigate]);
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-navy-700">Loading…</div>;
  return (
    <>
      <button
        onClick={async () => { await signOut(); navigate({ to: "/" }); }}
        className="fixed top-3 right-3 z-50 bg-white/90 backdrop-blur border border-gray-200 shadow rounded-full px-3 py-1.5 text-xs font-semibold text-navy-700 flex items-center gap-1.5 hover:bg-white"
      >
        <LogOut className="w-3.5 h-3.5" /> Sign out
      </button>
      <StaffDashboard />
    </>
  );
}
