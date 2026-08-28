import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import StaffDashboard from "@/components/StaffDashboard";
import { syncSessionToStore, pathForRole } from "@/lib/auth";

export const Route = createFileRoute("/staff")({
  component: StaffRoute,
});

function StaffRoute() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    syncSessionToStore().then((role) => {
      if (!role) navigate({ to: "/" });
      else if (role === "patient") navigate({ to: pathForRole(role) as any });
      else setReady(true);
    });
  }, [navigate]);
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-navy-700">Loading…</div>;
  return <StaffDashboard onSignedOut={() => navigate({ to: "/" })} />;
}
