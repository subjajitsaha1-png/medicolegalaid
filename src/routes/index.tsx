import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";
import type { UserRole } from "@/lib/store";
import { pathForRole } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const handleLogin = (role: UserRole) => {
    navigate({ to: pathForRole(role) as any });
  };
  return <LandingPage onLogin={handleLogin} />;
}
